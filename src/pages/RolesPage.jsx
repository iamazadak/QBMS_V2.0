import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Shield, Plus, Check, X, Search, Users, Settings, Lock, Loader2, Info, ChevronRight, Hash, Key } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function RolesPage() {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const isMobile = useIsMobile();
    const [showAddRoleModal, setShowAddRoleModal] = useState(false);
    const [newRoleName, setNewRoleName] = useState("");
    const [selectedRoleId, setSelectedRoleId] = useState(null);

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
                    usersCount: Math.floor(Math.random() * 20) + 1 // Simulated count for now
                };
            });

            setRoles(formattedRoles);
            setPermissions(permissionsData);

            // Set first role as selected by default
            if (formattedRoles.length > 0 && !selectedRoleId) {
                setSelectedRoleId(formattedRoles[0].id);
            }
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

            const newRole = { ...data, permissions: [], usersCount: 0 };
            setRoles([...roles, newRole]);
            setSelectedRoleId(data.id);
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

    const selectedRole = roles.find(r => r.id === selectedRoleId);

    // Group permissions by category
    const permissionsByCategory = permissions.reduce((acc, perm) => {
        const category = perm.category || "General";
        if (!acc[category]) acc[category] = [];
        acc[category].push(perm);
        return acc;
    }, {});

    if (isLoading) {
        return (
            <div className="p-6 h-[80vh] flex flex-col items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center"
                >
                    <div className="relative">
                        <Loader2 className="h-12 w-12 animate-spin text-teal-600" />
                        <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-teal-600" />
                    </div>
                    <p className="text-slate-600 mt-4 font-medium">Initializing Security Matrix...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className={cn("min-h-screen bg-slate-50/30", isMobile ? 'p-4' : 'p-8')}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Header Block */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                        <div>
                            <h1 className="mb-1">Management Framework</h1>
                            <p className="text-slate-500 font-medium text-base">Define access layers and permission inheritance</p>
                        </div>

                        <Button
                            variant="primary"
                            onClick={() => setShowAddRoleModal(true)}
                        >
                            <Plus className="w-4 h-4 mr-2 stroke-[3]" />
                            Forge New Role
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Sidebar: Roles Selection */}
                        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
                            <div className="relative group mb-6">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 group-focus-within:text-teal-500 transition-colors" />
                                <Input
                                    placeholder="Filter authority levels..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-11 bg-white border-slate-200 focus:ring-2 focus:ring-teal-500/20 rounded-xl"
                                />
                            </div>

                            <div className="space-y-3">
                                <AnimatePresence mode="popLayout">
                                    {filteredRoles.map((role) => (
                                        <motion.div
                                            key={role.id}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            onClick={() => setSelectedRoleId(role.id)}
                                            className={cn(
                                                "p-4 rounded-2xl cursor-pointer transition-all border-2 relative overflow-hidden group",
                                                selectedRoleId === role.id
                                                    ? "bg-white border-teal-500 shadow-xl shadow-teal-500/5 ring-1 ring-teal-500/20"
                                                    : "bg-white border-transparent hover:border-slate-200 shadow-sm"
                                            )}
                                        >
                                            {selectedRoleId === role.id && (
                                                <motion.div
                                                    layoutId="active-pill"
                                                    className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500"
                                                />
                                            )}
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "p-2.5 rounded-xl transition-colors",
                                                        role.name === 'Admin' ? 'bg-violet-100 text-violet-600' :
                                                            role.name === 'Trainer' ? 'bg-amber-100 text-amber-600' :
                                                                'bg-slate-100 text-slate-600'
                                                    )}>
                                                        <Shield className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-800 leading-none mb-1">{role.name}</h3>
                                                        <div className="flex items-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                                                            <Users className="w-3 h-3 mr-1" />
                                                            {role.usersCount} Assigned
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none px-2 py-0 h-5 text-[10px]">
                                                    {role.permissions.length} perms
                                                </Badge>
                                            </div>
                                            <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                {role.description || "Core system authority level with specific access requirements."}
                                            </p>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Main Content: Permission Matrix */}
                        <div className="lg:col-span-8 xl:col-span-9">
                            <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden">
                                <CardHeader className="bg-white border-b border-slate-100 pb-6 px-8 flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-teal-50 rounded-2xl">
                                            <Key className="h-6 w-6 text-teal-600 translate-y-[1px]" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                                Access Matrix: <span className="text-teal-600">{selectedRole?.name}</span>
                                            </CardTitle>
                                            <p className="text-sm text-slate-400 font-medium">Toggle individual capabilities for this authority level</p>
                                        </div>
                                    </div>
                                    {selectedRole?.name === 'Admin' && (
                                        <Badge className="bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-50 gap-1 px-3 py-1">
                                            <Lock className="w-3 h-3" />
                                            Immutable Root
                                        </Badge>
                                    )}
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-slate-100">
                                        {Object.entries(permissionsByCategory).map(([category, perms]) => (
                                            <Collapsible key={category} defaultOpen className="group/cat">
                                                <CollapsibleTrigger className="w-full flex items-center justify-between px-8 py-5 bg-slate-50/30 hover:bg-slate-50 transition-colors text-left group-data-[state=open]:bg-white">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover/cat:text-teal-500 transition-colors shadow-sm">
                                                            <Hash className="w-5 h-5 stroke-[2.5]" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-700 tracking-tight capitalize">{category}</h4>
                                                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{perms.length} Modules</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-slate-300 transition-transform group-data-[state=open]:rotate-90 group-hover/cat:text-teal-500" />
                                                </CollapsibleTrigger>

                                                <CollapsibleContent>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100 border-t border-slate-100">
                                                        {perms.map(perm => {
                                                            const hasPermission = selectedRole?.permissions.includes(perm.id);
                                                            const isAdmin = selectedRole?.name === 'Admin';

                                                            return (
                                                                <div
                                                                    key={perm.id}
                                                                    className={cn(
                                                                        "p-6 flex items-center justify-between group transition-all",
                                                                        hasPermission ? "bg-white" : "bg-white/60",
                                                                        !isAdmin && "hover:bg-teal-50/30"
                                                                    )}
                                                                >
                                                                    <div className="flex items-start gap-4 flex-1 pr-4">
                                                                        <Checkbox
                                                                            id={`perm-${perm.id}`}
                                                                            checked={hasPermission}
                                                                            onCheckedChange={() => !isAdmin && togglePermission(selectedRoleId, perm.id)}
                                                                            disabled={isAdmin}
                                                                            className={cn(
                                                                                "mt-1 w-5 h-5 transition-all",
                                                                                isAdmin
                                                                                    ? "border-slate-300 data-[state=checked]:bg-slate-300 data-[state=checked]:text-white"
                                                                                    : "border-slate-300 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600 shadow-sm"
                                                                            )}
                                                                        />
                                                                        <Label
                                                                            htmlFor={`perm-${perm.id}`}
                                                                            className={cn(
                                                                                "cursor-pointer select-none",
                                                                                isAdmin && "cursor-not-allowed opacity-70"
                                                                            )}
                                                                        >
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <span className={cn(
                                                                                    "font-bold text-sm transition-colors",
                                                                                    hasPermission ? "text-slate-800" : "text-slate-500"
                                                                                )}>
                                                                                    {perm.name}
                                                                                </span>
                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <Info className="w-3.5 h-3.5 text-slate-400 hover:text-teal-500 transition-colors" />
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent className="max-w-[200px] text-xs font-medium">
                                                                                        {perm.description || "Grants access to this specific functional module within the platform."}
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            </div>
                                                                            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                                                                {perm.slug || `module.access.${category.toLowerCase()}`}
                                                                            </p>
                                                                        </Label>
                                                                    </div>

                                                                    <div className={cn(
                                                                        "h-2 w-2 rounded-full transition-all duration-500",
                                                                        hasPermission ? "bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]" : "bg-slate-200"
                                                                    )} />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </motion.div>

                {/* Add Role Modal */}
                <Dialog open={showAddRoleModal} onOpenChange={setShowAddRoleModal}>
                    <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl">
                        <DialogHeader>
                            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
                                <Plus className="w-6 h-6 text-teal-600" />
                            </div>
                            <DialogTitle className="text-2xl font-black text-slate-900">Forge Authority</DialogTitle>
                            <p className="text-slate-400 text-sm font-medium">Create a new organizational role with specific inheritance rules.</p>
                        </DialogHeader>
                        <div className="py-6 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-slate-700 ml-1">Designation Name</Label>
                                <Input
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                    placeholder="e.g. Content Architect"
                                    className="h-12 bg-slate-50 border-transparent focus:bg-white focus:ring-teal-500/20 rounded-xl font-medium"
                                />
                            </div>
                        </div>
                        <DialogFooter className="gap-3 sm:gap-0">
                            <Button
                                variant="outline"
                                onClick={() => setShowAddRoleModal(false)}
                            >
                                Abandon
                            </Button>
                            <Button
                                onClick={handleAddRole}
                                disabled={isUpdating || !newRoleName.trim()}
                                variant="primary"
                            >
                                {isUpdating ? <Loader2 className="animate-spin" /> : "Authorize Role"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
}
