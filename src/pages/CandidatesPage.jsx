import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Search, Download, Filter, Eye, Edit2, Trash2, UserPlus, CalendarIcon } from "lucide-react";
import { Candidate, Program, Course, Classroom } from "@/entities/all";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AddCandidateModal from "@/components/candidates/AddCandidateModal";

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    student_id: "",
    program_id: "",
    course_id: "",
    enrollment_date: null,
    status: "active",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [candidatesData, programsData, coursesData, classroomsData] = await Promise.all([
        Candidate.list("-created_date"),
        Program.list(),
        Course.list(),
        Classroom.list()
      ]);

      const candidatesWithDetails = await Promise.all(
        candidatesData.map(async (candidate) => {
          let program = null;
          let course = null;
          let classroom = null;

          try {
            if (candidate.program_id) {
              program = await Program.get(candidate.program_id);
            }
            if (candidate.course_id) {
              course = await Course.get(candidate.course_id);
            }
            if (candidate.classroom_id) {
              classroom = await Classroom.get(candidate.classroom_id);
            }
          } catch (error) {
            console.warn("Error loading candidate details:", error);
          }

          return {
            ...candidate,
            program,
            course,
            classroom
          };
        })
      );

      setCandidates(candidatesWithDetails);
      setPrograms(programsData);
      setCourses(coursesData);
      setClassrooms(classroomsData);
    } catch (error) {
      console.error("Error loading candidates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...candidates];

    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(candidate => candidate.status === statusFilter);
    }

    if (programFilter !== "all") {
      filtered = filtered.filter(candidate => candidate.program_id === programFilter);
    }

    setFilteredCandidates(filtered);
  }, [candidates, searchTerm, statusFilter, programFilter]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleDeleteCandidate = async (candidateId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this candidate?");
    if (!confirmDelete) return;

    try {
      await Candidate.delete(candidateId);
      loadData();
    } catch (error) {
      console.error("Error deleting candidate:", error);
      alert("Error deleting candidate. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      graduated: "bg-blue-100 text-blue-800",
      dropped: "bg-red-100 text-red-800",
      suspended: "bg-yellow-100 text-yellow-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const exportToCSV = () => {
    if (filteredCandidates.length === 0) {
      alert("No candidates to export");
      return;
    }

    const csvData = filteredCandidates.map(candidate => ({
      'Name': candidate.name,
      'Email': candidate.email,
      'Phone': candidate.phone || '',
      'Student ID': candidate.student_id || '',
      'Program': candidate.program?.name || '',
      'Course': candidate.course?.name || '',
      'Classroom': candidate.classroom?.name || '',
      'GOORU ID': candidate.gooru_id || '',
      'Enrollment Date': candidate.enrollment_date ? format(new Date(candidate.enrollment_date), 'yyyy-MM-dd') : '',
      'Status': candidate.status
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'candidates.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleAddEditCandidate = async () => {
    try {
      if (editingCandidate) {
        await Candidate.update(editingCandidate.id, formData);
      } else {
        await Candidate.create(formData);
      }
      setShowAddModal(false);
      setEditingCandidate(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        student_id: "",
        program_id: "",
        course_id: "",
        classroom_id: "",
        gooru_id: "",
        enrollment_date: null,
        status: "active",
      });
      loadData();
    } catch (error) {
      console.error("Error saving candidate:", error);
      alert("Error saving candidate. Please try again.");
    }
  };

  const handleEditCandidate = (candidate) => {
    setEditingCandidate(candidate);
    setFormData({
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone || "",
      student_id: candidate.student_id || "",
      program_id: candidate.program_id || "",
      course_id: candidate.course_id || "",
      classroom_id: candidate.classroom_id || "",
      gooru_id: candidate.gooru_id || "",
      enrollment_date: candidate.enrollment_date ? new Date(candidate.enrollment_date) : null,
      status: candidate.status || "active",
    });
    setShowAddModal(true);
  };

  const handleViewCandidate = (candidate) => {
    // Implement view functionality (e.g., show detailed view in a modal)
    alert(`Viewing details for ${candidate.name}`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Candidates Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="graduated">Graduated</SelectItem>
                <SelectItem value="dropped">Dropped</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {programs.map(program => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Candidate
            </Button>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Classroom</TableHead>
                  <TableHead>GOORU ID</TableHead>
                  <TableHead>Enrollment Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.map(candidate => (
                  <TableRow key={candidate.id}>
                    <TableCell>{candidate.name}</TableCell>
                    <TableCell>{candidate.email}</TableCell>
                    <TableCell>{candidate.program?.name || '-'}</TableCell>
                    <TableCell>{candidate.course?.name || '-'}</TableCell>
                    <TableCell>{candidate.classroom?.name || '-'}</TableCell>
                    <TableCell>{candidate.gooru_id || '-'}</TableCell>
                    <TableCell>
                      {candidate.enrollment_date
                        ? format(new Date(candidate.enrollment_date), 'yyyy-MM-dd')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(candidate.status)}>
                        {candidate.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewCandidate(candidate)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCandidate(candidate)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCandidate(candidate.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCandidate ? 'Edit Candidate' : 'Add New Candidate'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="student_id" className="text-right">Student ID</Label>
              <Input
                id="student_id"
                name="student_id"
                value={formData.student_id}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="program_id" className="text-right">Program</Label>
              <Select
                name="program_id"
                value={formData.program_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, program_id: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map(program => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="course_id" className="text-right">Course</Label>
              <Select
                name="course_id"
                value={formData.course_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, course_id: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="enrollment_date" className="text-right">Enrollment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="col-span-3 justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.enrollment_date ? format(formData.enrollment_date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.enrollment_date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, enrollment_date: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Select
                name="status"
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                  <SelectItem value="dropped">Dropped</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEditCandidate}>
              {editingCandidate ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}