import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Search, Edit2, Trash2, BookOpen, Eye, UserPlus } from "lucide-react";
import { Classroom, ClassroomCandidate, Program, Course } from "@/entities/all";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast"; // Assuming shadcn/ui toast component

// Mock modal components (to be replaced with actual implementations)
const AddClassroomModal = ({ isOpen, onClose, classroom, programs, courses, onSave }) => {
  const [formData, setFormData] = useState({
    name: classroom?.name || "",
    description: classroom?.description || "",
    program_id: classroom?.program_id || "",
    course_id: classroom?.course_id || "",
    teacher_name: classroom?.teacher_name || "",
    teacher_email: classroom?.teacher_email || "",
    is_active: classroom?.is_active ?? true,
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.teacher_name) {
      toast({ variant: "destructive", description: "Name and Teacher Name are required" });
      return;
    }
    try {
      if (classroom) {
        await Classroom.update(classroom.id, formData);
      } else {
        await Classroom.create(formData);
      }
      onSave();
      toast({ description: `Classroom ${classroom ? "updated" : "created"} successfully` });
    } catch (error) {
      toast({ variant: "destructive", description: "Error saving classroom" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{classroom ? "Edit Classroom" : "Create Classroom"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="program_id" className="text-right">Program</Label>
            <Select
              value={formData.program_id}
              onValueChange={(value) => setFormData({ ...formData, program_id: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select program" />
              </SelectTrigger>
              <SelectContent>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={program.id}>{program.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="course_id" className="text-right">Course</Label>
            <Select
              value={formData.course_id}
              onValueChange={(value) => setFormData({ ...formData, course_id: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="teacher_name" className="text-right">Teacher Name</Label>
            <Input
              id="teacher_name"
              value={formData.teacher_name}
              onChange={(e) => setFormData({ ...formData, teacher_name: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="teacher_email" className="text-right">Teacher Email</Label>
            <Input
              id="teacher_email"
              value={formData.teacher_email}
              onChange={(e) => setFormData({ ...formData, teacher_email: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="is_active" className="text-right">Active</Label>
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{classroom ? "Update" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AssignTestModal = ({ isOpen, onClose, selectedClassrooms, onAssign }) => {
  // Simplified mock implementation
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Test</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Assign test to {selectedClassrooms.length} classroom(s)</p>
          {/* Add test selection logic here */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onAssign}>Assign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ManageCandidatesModal = ({ isOpen, onClose, classroom, onUpdate }) => {
  // Simplified mock implementation
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Candidates for {classroom?.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Manage candidates for classroom {classroom?.id}</p>
          {/* Add candidate selection logic here */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onUpdate}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function ClassroomsPage() {
  const { toast } = useToast();
  const [classrooms, setClassrooms] = useState([]);
  const [filteredClassrooms, setFilteredClassrooms] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignTestModal, setShowAssignTestModal] = useState(false);
  const [showManageCandidatesModal, setShowManageCandidatesModal] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState(null);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [selectedClassrooms, setSelectedClassrooms] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [classroomsData, programsData, coursesData] = await Promise.all([
        Classroom.list("-created_date"),
        Program.list(),
        Course.list(),
      ]);

      const classroomsWithDetails = await Promise.all(
        classroomsData.map(async (classroom) => {
          let program = null;
          let course = null;
          let candidateCount = 0;

          try {
            if (classroom.program_id) {
              program = await Program.get(classroom.program_id);
            }
            if (classroom.course_id) {
              course = await Course.get(classroom.course_id);
            }
            const classroomCandidates = await ClassroomCandidate.filter({ classroom_id: classroom.id });
            candidateCount = classroomCandidates.length;
          } catch (error) {
            console.warn("Error loading classroom details:", error);
          }

          return {
            ...classroom,
            program,
            course,
            candidateCount,
          };
        })
      );

      setClassrooms(classroomsWithDetails);
      setPrograms(programsData);
      setCourses(coursesData);
    } catch (error) {
      console.error("Error loading classrooms:", error);
      toast({ variant: "destructive", description: "Failed to load classrooms" });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = useMemo(() => {
    return () => {
      let filtered = [...classrooms];

      if (searchTerm) {
        filtered = filtered.filter((classroom) =>
          classroom.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          classroom.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (programFilter !== "all") {
        filtered = filtered.filter((classroom) => classroom.program_id === programFilter);
      }

      if (courseFilter !== "all") {
        filtered = filtered.filter((classroom) => classroom.course_id === courseFilter);
      }

      setFilteredClassrooms(filtered);
      // Update selectedClassrooms to remove any that are no longer in filtered results
      setSelectedClassrooms((prev) => prev.filter((id) => filtered.some((c) => c.id === id)));
      setSelectAll(filtered.length > 0 && selectedClassrooms.length === filtered.length);
    };
  }, [classrooms, searchTerm, programFilter, courseFilter, selectedClassrooms]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleDeleteClassroom = async (classroomId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this classroom?");
    if (!confirmDelete) return;

    try {
      const classroomCandidates = await ClassroomCandidate.filter({ classroom_id: classroomId });
      await Promise.all(classroomCandidates.map((cc) => ClassroomCandidate.delete(cc.id)));
      await Classroom.delete(classroomId);
      loadData();
      setSelectedClassrooms((prev) => prev.filter((id) => id !== classroomId));
      toast({ description: "Classroom deleted successfully" });
    } catch (error) {
      console.error("Error deleting classroom:", error);
      toast({ variant: "destructive", description: "Error deleting classroom" });
    }
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedClassrooms(filteredClassrooms.map((c) => c.id));
    } else {
      setSelectedClassrooms([]);
    }
  };

  const handleSelectClassroom = (classroomId, checked) => {
    if (checked) {
      setSelectedClassrooms([...selectedClassrooms, classroomId]);
    } else {
      setSelectedClassrooms(selectedClassrooms.filter((id) => id !== classroomId));
      setSelectAll(false);
    }
  };

  const handleAssignTest = () => {
    if (selectedClassrooms.length === 0) {
      toast({ variant: "destructive", description: "Please select at least one classroom" });
      return;
    }
    setShowAssignTestModal(true);
  };

  const handleManageCandidates = (classroom) => {
    setSelectedClassroom(classroom);
    setShowManageCandidatesModal(true);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardContent className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-slate-600 ml-4">Loading classrooms...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">GOORU Classrooms</h1>
          <p className="text-slate-600 mt-2">Manage classrooms and assign tests</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {selectedClassrooms.length > 0 && (
            <Button onClick={handleAssignTest} className="bg-green-600 hover:bg-green-700">
              <BookOpen className="w-4 h-4 mr-2" />
              Assign Test ({selectedClassrooms.length})
            </Button>
          )}
          <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Classroom
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Classrooms</p>
                <p className="text-2xl font-bold">{classrooms.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Active Classrooms</p>
                <p className="text-2xl font-bold">{classrooms.filter((c) => c.is_active).length}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">A</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Total Students</p>
                <p className="text-2xl font-bold">{classrooms.reduce((sum, c) => sum + (c.candidateCount || 0), 0)}</p>
              </div>
              <Users className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Programs</p>
                <p className="text-2xl font-bold">{programs.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search by classroom or teacher name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={programFilter} onValueChange={setProgramFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Program" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            {programs.map((program) => (
              <SelectItem key={program.id} value={program.id}>{program.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Classrooms Table */}
      <Card className="border-slate-200/60">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
                  </TableHead>
                  <TableHead className="font-semibold">Classroom Name</TableHead>
                  <TableHead className="font-semibold">Program</TableHead>
                  <TableHead className="font-semibold">Course</TableHead>
                  <TableHead className="font-semibold">Teacher</TableHead>
                  <TableHead className="font-semibold">Candidates</TableHead>
                  <TableHead className="font-semibold">Created Date</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClassrooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="text-slate-500">
                        <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <p className="text-lg font-medium">No classrooms found</p>
                        <p className="text-sm mt-2">Create your first classroom to get started.</p>
                        <Button
                          onClick={() => setShowAddModal(true)}
                          className="mt-4 bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Classroom
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClassrooms.map((classroom) => (
                    <TableRow key={classroom.id} className="hover:bg-slate-50/80 transition-colors duration-150">
                      <TableCell>
                        <Checkbox
                          checked={selectedClassrooms.includes(classroom.id)}
                          onCheckedChange={(checked) => handleSelectClassroom(classroom.id, checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <p className="text-slate-900">{classroom.name}</p>
                          {classroom.description && (
                            <p className="text-sm text-slate-500 line-clamp-1">{classroom.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-slate-900">{classroom.program?.name || "Not assigned"}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-slate-900">{classroom.course?.name || "Not assigned"}</p>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="text-slate-900">{classroom.teacher_name}</p>
                          {classroom.teacher_email && (
                            <p className="text-slate-500">{classroom.teacher_email}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {classroom.candidateCount || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-slate-900">
                          {format(new Date(classroom.created_date), "MMM d, yyyy")}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleManageCandidates(classroom)}
                            title="Manage Students"
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            asChild
                            title="View Details"
                          >
                            <Link to={createPageUrl(`ClassroomDetails?id=${classroom.id}`)}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingClassroom(classroom);
                              setShowAddModal(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteClassroom(classroom.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <AddClassroomModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingClassroom(null);
        }}
        classroom={editingClassroom}
        programs={programs}
        courses={courses}
        onSave={() => {
          loadData();
          setShowAddModal(false);
          setEditingClassroom(null);
        }}
      />
      <AssignTestModal
        isOpen={showAssignTestModal}
        onClose={() => setShowAssignTestModal(false)}
        selectedClassrooms={classrooms.filter((c) => selectedClassrooms.includes(c.id))}
        onAssign={() => {
          setShowAssignTestModal(false);
          setSelectedClassrooms([]);
          setSelectAll(false);
          toast({ description: "Tests assigned successfully! Students will receive notifications." });
        }}
      />
      <ManageCandidatesModal
        isOpen={showManageCandidatesModal}
        onClose={() => {
          setShowManageCandidatesModal(false);
          setSelectedClassroom(null);
        }}
        classroom={selectedClassroom}
        onUpdate={() => {
          loadData();
          setShowManageCandidatesModal(false);
          setSelectedClassroom(null);
        }}
      />
    </div>
  );
}