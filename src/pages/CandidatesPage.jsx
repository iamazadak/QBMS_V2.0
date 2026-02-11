import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Search, Download, Filter, Eye, Edit2, Trash2, UserPlus, CalendarIcon, CheckCircle, Clock, GraduationCap } from "lucide-react";
import { Candidate, Program, Course, Classroom } from "@/entities/all";
import { format } from "date-fns";
import AddCandidateModal from "@/components/candidates/AddCandidateModal";
import KpiCard from "@/components/shared/KpiCard";

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

  const handleAddEditCandidate = () => {
    setShowAddModal(false);
    setEditingCandidate(null);
    loadData();
  };

  const handleEditCandidate = (candidate) => {
    setEditingCandidate(candidate);
    setShowAddModal(true);
  };

  const handleViewCandidate = (candidate) => {
    // Implement view functionality (e.g., show detailed view in a modal)
    alert(`Viewing details for ${candidate.name}`);
  };


  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1>Candidates Management</h1>
          <p className="text-slate-600 mt-1 md:mt-2 text-sm md:text-base">Manage and track your enrolled student information</p>
        </div>

        <div className="flex flex-wrap gap-2 md:gap-3 w-full lg:w-auto">
          <Button variant="outline" onClick={exportToCSV} disabled={filteredCandidates.length === 0} className="flex-1 md:flex-none">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setShowAddModal(true)} variant="primary" className="flex-1 md:flex-none">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Candidate
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
            <p className="text-xl font-black text-slate-900 leading-none">{candidates.length}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Total Students</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{candidates.filter(c => c.status === 'active').length}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Active Now</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{candidates.filter(c => c.status === 'graduated').length}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Graduated</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 py-3 min-w-max">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{candidates.filter(c => c.status === 'inactive').length}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Inactive</p>
          </div>
        </div>
      </div>

      {/* Filters and Table Card */}
      <Card className="border-slate-200/60 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] bg-white">
                  <SelectValue placeholder="Status" />
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
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Program" />
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
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
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
                          size="icon"
                          onClick={() => handleViewCandidate(candidate)}
                          className="rounded-xl"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditCandidate(candidate)}
                          className="rounded-xl"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCandidate(candidate.id)}
                          className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
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

      <AddCandidateModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingCandidate(null);
        }}
        candidate={editingCandidate}
        programs={programs}
        courses={courses}
        onSave={handleAddEditCandidate}
      />
    </div>
  );
}