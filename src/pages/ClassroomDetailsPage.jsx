import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Users,
  BookOpen,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  FileText,
  TrendingUp,
  Award,
  Clock
} from "lucide-react";
import { Classroom, ClassroomCandidate, ClassroomTest, Candidate, Exam, AttemptedTest, Program, Course } from "@/entities/all";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";


export default function ClassroomDetailsPage() {
  const [classroom, setClassroom] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignedTests, setAssignedTests] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTests: 0,
    avgScore: 0,
    completedAttempts: 0
  });
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    loadClassroomDetails();
  }, []);


  const loadClassroomDetails = async () => {
    setIsLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const classroomId = urlParams.get('id');


      if (!classroomId) {
        alert("No classroom ID provided");
        return;
      }


      // Load classroom
      const classroomData = await Classroom.get(classroomId);

      // Load program and course
      let program = null;
      let course = null;
      try {
        if (classroomData.program_id) {
          program = await Program.get(classroomData.program_id);
        }
        if (classroomData.course_id) {
          course = await Course.get(classroomData.course_id);
        }
      } catch (error) {
        console.warn("Error loading program/course:", error);
      }


      setClassroom({ ...classroomData, program, course });


      // Load students in classroom
      const classroomCandidates = await ClassroomCandidate.filter({ classroom_id: classroomId });
      const studentsData = await Promise.all(
        classroomCandidates.map(async (cc) => {
          try {
            const candidate = await Candidate.get(cc.candidate_id);

            // Get test attempts for this student
            const attempts = await AttemptedTest.filter({ user_email: candidate.email });
            const avgScore = attempts.length > 0
              ? attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length
              : 0;


            return {
              ...candidate,
              enrollment_date: cc.enrollment_date,
              testsAttempted: attempts.length,
              avgScore: avgScore.toFixed(1)
            };
          } catch (error) {
            return null;
          }
        })
      );


      setStudents(studentsData.filter(s => s !== null));


      // Load assigned tests
      const classroomTests = await ClassroomTest.filter({ classroom_id: classroomId });
      const testsData = await Promise.all(
        classroomTests.map(async (ct) => {
          try {
            const exam = await Exam.get(ct.exam_id);

            // Count attempts for this test
            let attempts = 0;
            for (const student of studentsData.filter(s => s !== null)) {
              const studentAttempts = await AttemptedTest.filter({
                exam_id: exam.id,
                user_email: student.email
              });
              attempts += studentAttempts.length;
            }


            return {
              ...exam,
              assigned_date: ct.assigned_date,
              due_date: ct.due_date,
              attempts
            };
          } catch (error) {
            return null;
          }
        })
      );


      setAssignedTests(testsData.filter(t => t !== null));


      // Calculate stats
      const allAttempts = [];
      for (const student of studentsData.filter(s => s !== null)) {
        const attempts = await AttemptedTest.filter({ user_email: student.email });
        allAttempts.push(...attempts);
      }


      const avgScore = allAttempts.length > 0
        ? allAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / allAttempts.length
        : 0;


      setStats({
        totalStudents: studentsData.filter(s => s !== null).length,
        totalTests: testsData.filter(t => t !== null).length,
        avgScore: avgScore.toFixed(1),
        completedAttempts: allAttempts.filter(a => a.status === 'completed').length
      });


    } catch (error) {
      console.error("Error loading classroom details:", error);
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="text-slate-600 ml-4">Loading classroom details...</p>
        </div>
      </div>
    );
  }


  if (!classroom) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-600">Classroom not found</p>
            <Button asChild className="mt-4">
              <Link to={createPageUrl("Classrooms")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Classrooms
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4">
          <Link to={createPageUrl("Classrooms")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Classrooms
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{classroom.name}</h1>
            <div className="flex gap-3 mt-3">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {classroom.program?.name}
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                {classroom.course?.name}
              </Badge>
              <Badge variant="secondary" className={classroom.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {classroom.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>
      </div>


      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Students</p>
                <p className="text-3xl font-bold mt-2">{stats.totalStudents}</p>
              </div>
              <Users className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>


        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Assigned Tests</p>
                <p className="text-3xl font-bold mt-2">{stats.totalTests}</p>
              </div>
              <FileText className="w-10 h-10 text-green-200" />
            </div>
          </CardContent>
        </Card>


        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Avg. Score</p>
                <p className="text-3xl font-bold mt-2">{stats.avgScore}%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>


        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Completed Tests</p>
                <p className="text-3xl font-bold mt-2">{stats.completedAttempts}</p>
              </div>
              <Award className="w-10 h-10 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Classroom Info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Classroom Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-600">Teacher Name</p>
            <p className="font-medium text-slate-900">{classroom.teacher_name}</p>
          </div>
          {classroom.teacher_email && (
            <div>
              <p className="text-sm text-slate-600">Teacher Email</p>
              <p className="font-medium text-slate-900">{classroom.teacher_email}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-slate-600">Created Date</p>
            <p className="font-medium text-slate-900">
              {format(new Date(classroom.created_date), "MMM d, yyyy")}
            </p>
          </div>
          {classroom.description && (
            <div className="md:col-span-2">
              <p className="text-sm text-slate-600">Description</p>
              <p className="font-medium text-slate-900">{classroom.description}</p>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Students List */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Students ({students.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>No students enrolled yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Tests Attempted</TableHead>
                    <TableHead>Avg. Score</TableHead>
                    <TableHead>Enrollment Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.phone || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{student.testsAttempted}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {student.avgScore}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {student.enrollment_date ? format(new Date(student.enrollment_date), "MMM d, yyyy") : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Assigned Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Assigned Tests ({assignedTests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignedTests.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <BookOpen className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>No tests assigned yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedTests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">{test.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {test.exam_type?.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{test.total_questions}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {test.duration_minutes} min
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {test.attempts}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {test.assigned_date ? format(new Date(test.assigned_date), "MMM d, yyyy") : "—"}
                      </TableCell>
                      <TableCell>
                        {test.due_date ? format(new Date(test.due_date), "MMM d, yyyy") : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
