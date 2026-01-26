import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Shield, Plus, Check, X, Search, Users, Settings, Lock, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Role, Permission } from "@/entities/all";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function RolesPage() {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const isMobile = useIsMobile();
    const [showAddRoleModal, setShowAddRoleModal] = useState(false);
    const [newRoleName, setNewRoleName] = useState("");

    const { toast } = useToast();
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch Roles
            const { data: rolesData, error: rolesError } = await supabase
                .from('roles')
                .select('*')
                .order('name');

            if (rolesError) throw rolesError;

            // 2. Fetch Permissions
            const { data: permissionsData, error: permissionsError } = await supabase
                .from('permissions')
                .select('*')
                .order('category, name');

            if (permissionsError) throw permissionsError;

            // 3. Fetch Role Permissions (Many-to-Many)
            const { data: rolePermissionsData, error: rolePermsError } = await supabase
                .from('role_permissions')
                .select('*');

            if (rolePermsError) throw rolePermsError;

            // 4. Transform data: Add permissions array to each role
            const formattedRoles = rolesData.map(role => {
                const rolePerms = rolePermissionsData
                    .filter(rp => rp.role_id === role.id)
                    .map(rp => rp.permission_id);

                return {
                    ...role,
                    permissions: rolePerms,
                    usersCount: 0 // In future, could fetch count from profiles
                };
            });

            setRoles(formattedRoles);
            setPermissions(permissionsData);
        } catch (error) {
            console.error("Error loading roles data:", error);
            toast({
                title: "Error loading data",
                description: "Failed to load roles and permissions. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddRole = async () => {
        if (!newRoleName.trim()) return;
        setIsUpdating(true);

        try {
            const { data, error } = await supabase
                .from('roles')
                .insert([{ name: newRoleName, description: 'Custom role' }])
                .select()
                .single();

            if (error) throw error;

            setRoles([...roles, { ...data, permissions: [], usersCount: 0 }]);
            setNewRoleName("");
            setShowAddRoleModal(false);

            toast({
                title: "Role Created",
                description: `Successfully created role: ${data.name}`,
            });
        } catch (error) {
            console.error("Error creating role:", error);
            toast({
                title: "Error",
                description: "Failed to create role. It might already exist.",
                variant: "destructive"
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const togglePermission = async (roleId, permissionId) => {
        // Optimistic update
        const role = roles.find(r => r.id === roleId);
        if (!role) return;

        const hasPermission = role.permissions.includes(permissionId);

        // Update UI immediately
        setRoles(roles.map(r => {
            if (r.id !== roleId) return r;
            const newPermissions = hasPermission
                ? r.permissions.filter(p => p !== permissionId)
                : [...r.permissions, permissionId];
            return { ...r, permissions: newPermissions };
        }));

        try {
            if (hasPermission) {
                // Remove permission
                const { error } = await supabase
                    .from('role_permissions')
                    .delete()
                    .match({ role_id: roleId, permission_id: permissionId });
                if (error) throw error;
            } else {
                // Add permission
                const { error } = await supabase
                    .from('role_permissions')
                    .insert([{ role_id: roleId, permission_id: permissionId }]);
                if (error) throw error;
            }
        } catch (error) {
            console.error("Error updating permission:", error);
            toast({
                title: "Update Failed",
                description: "Failed to update permission. Reverting changes.",
                variant: "destructive"
            });
            // Revert on error
            loadData();
        }
    };

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group permissions by category
    const permissionsByCategory = permissions.reduce((acc, perm) => {
        if (!acc[perm.category]) acc[perm.category] = [];
        acc[perm.category].push(perm);
        return acc;
    }, {});

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                    <p className="text-slate-600 ml-4">Loading roles & permissions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div>
                    <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-slate-900`}>Roles & Permissions</h1>
                    <p className={`text-slate-600 mt-2 ${isMobile ? 'text-sm' : ''}`}>Manage user access and system privileges</p>
                </div>

                <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setShowAddRoleModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Role
                </Button>
            </div>

            {/* Search */}
            <div className="mb-6 max-w-md relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                    placeholder="Search roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Roles List (Sidebar on desktop) */}
                <div className="lg:col-span-3 space-y-4">
                    {filteredRoles.map(role => (
                        <Card key={role.id} className="hover:shadow-md transition-shadow cursor-pointer border-slate-200">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded-lg ${role.name === 'Admin' ? 'bg-violet-100 text-violet-700' :
                                            role.name === 'Trainer' ? 'bg-amber-100 text-amber-700' :
                                                'bg-slate-100 text-slate-700'
                                            }`}>
                                            <Shield className="w-4 h-4" />
                                        </div>
                                        <span className="font-semibold text-slate-900">{role.name}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mb-3">{role.description}</p>
                                <div className="flex items-center text-xs text-slate-400">
                                    <Users className="w-3 h-3 mr-1" />
                                    {role.usersCount} users
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Permissions Matrix */}
                <div className="lg:col-span-9">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2">
                                <Lock className="w-5 h-5 text-slate-500" />
                                <CardTitle className="text-lg">Permission Matrix</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* Matrix Header */}
                            <div
                                className="grid border-b border-slate-200 bg-slate-50/80 sticky top-0 z-10"
                                style={{ gridTemplateColumns: `2fr repeat(${filteredRoles.length}, minmax(100px, 1fr))` }}
                            >
                                <div className="p-4 font-semibold text-sm text-slate-500 uppercase tracking-wider">Permission</div>
                                {filteredRoles.map(role => (
                                    <div key={role.id} className="p-4 font-semibold text-sm text-center text-slate-700 flex items-center justify-center gap-2">
                                        {role.name}
                                        {role.name === 'Admin' && <Lock className="w-3 h-3 text-slate-400" />}
                                    </div>
                                ))}
                            </div>

                            {/* Matrix Body - Grouped by Category */}
                            <div className="divide-y divide-slate-100">
                                {Object.entries(permissionsByCategory).map(([category, perms]) => (
                                    <Collapsible key={category} defaultOpen className="group">
                                        <CollapsibleTrigger className="w-full flex items-center gap-2 px-4 py-3 bg-slate-50/40 hover:bg-slate-50 transition-colors text-left font-medium text-slate-700">
                                            <ChevronRight className="w-4 h-4 text-slate-400 transition-transform group-data-[state=open]:rotate-90" />
                                            {category}
                                            <Badge variant="secondary" className="text-xs font-normal text-slate-500 bg-slate-100 ml-2">
                                                {perms.length}
                                            </Badge>
                                        </CollapsibleTrigger>

                                        <CollapsibleContent>
                                            {perms.map(perm => (
                                                <div
                                                    key={perm.id}
                                                    className="grid hover:bg-slate-50/50 transition-colors border-t border-slate-50 first:border-0"
                                                    style={{ gridTemplateColumns: `2fr repeat(${filteredRoles.length}, minmax(100px, 1fr))` }}
                                                >
                                                    <div className="p-4 text-sm font-medium text-slate-700 flex flex-col justify-center">
                                                        {perm.name}
                                                        {perm.description && <span className="text-xs text-slate-400 font-normal mt-0.5">{perm.description}</span>}
                                                    </div>

                                                    {filteredRoles.map(role => {
                                                        const hasPermission = role.permissions.includes(perm.id);
                                                        const isAdmin = role.name === 'Admin';

                                                        return (
                                                            <div key={role.id} className="p-4 flex items-center justify-center border-l border-slate-50">
                                                                <Checkbox
                                                                    checked={hasPermission}
                                                                    onCheckedChange={() => !isAdmin && togglePermission(role.id, perm.id)}
                                                                    disabled={isAdmin}
                                                                    className={isAdmin ? "data-[state=checked]:bg-slate-300 data-[state=checked]:border-slate-300 cursor-not-allowed" : "data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"}
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </CollapsibleContent>
                                    </Collapsible>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Add Role Modal */}
            <Dialog open={showAddRoleModal} onOpenChange={setShowAddRoleModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Role</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Role Name</Label>
                        <Input
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                            placeholder="e.g. Content Moderator"
                            className="mt-2"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddRoleModal(false)}>Cancel</Button>
                        <Button onClick={handleAddRole} className="bg-teal-600 hover:bg-teal-700">Create Role</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
