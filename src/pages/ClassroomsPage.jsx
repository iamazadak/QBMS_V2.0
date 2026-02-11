import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Search, Edit2, Trash2, BookOpen, Eye, UserPlus, GraduationCap, CheckCircle, Clock } from "lucide-react";
import { Classroom, ClassroomCandidate, Program, Course } from "@/entities/all";
import { format } from "date-fns";
import AddClassroomModal from "@/components/classrooms/AddClassroomModal";
import AssignTestModal from "@/components/classrooms/AssignTestModal";
import ManageCandidatesModal from "@/components/classrooms/ManageCandidatesModal";
import KpiCard from "@/components/shared/KpiCard";
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
      <div className="p-6">
        <Card>
          <CardContent className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <p className="text-slate-600 ml-4">Loading classrooms...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">GOORU Classrooms</h1>
          <p className="text-slate-600 mt-2">Manage classrooms and assign tests</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {selectedClassrooms.length > 0 && (
            <Button onClick={handleAssignTest} variant="secondary">
              <BookOpen className="w-4 h-4 mr-2" />
              Assign Test ({selectedClassrooms.length})
            </Button>
          )}
          <Button onClick={() => setShowAddModal(true)} variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Create Classroom
          </Button>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-2 mb-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{classrooms.length}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Total Cohorts</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{classrooms.filter((c) => c.is_active).length}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Live Now</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">
              {classrooms.reduce((sum, c) => sum + (c.candidateCount || 0), 0)}
            </p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Total Students</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 py-3 min-w-max">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{programs.length}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Programs</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search by classroom or teacher name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <div className="flex gap-2">
          <Select value={programFilter} onValueChange={setProgramFilter}>
            <SelectTrigger className="w-[180px] bg-white">
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
            <SelectTrigger className="w-[180px] bg-white">
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
                          variant="primary"
                          className="mt-4"
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
                            className="h-8 w-8 rounded-xl"
                            onClick={() => handleManageCandidates(classroom)}
                            title="Manage Students"
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-xl"
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
                            className="h-8 w-8 rounded-xl"
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
                            className="h-8 w-8 rounded-xl text-red-500 hover:text-red-700"
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