import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Clock, FileText, CheckCircle, Mail, MessageSquare, Phone } from "lucide-react";
import { Exam, Program, Course, Subject, ClassroomTest, ClassroomCandidate, Candidate } from "@/entities/all";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { SendEmail } from "@/integrations/Core";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";


export default function AssignTestModal({ isOpen, onClose, selectedClassrooms, onAssign }) {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [selectedExam, setSelectedExam] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationMethods, setNotificationMethods] = useState({
    email: true,
    sms: false,
    whatsapp: false
  });


  const applyFilters = useCallback(() => {
    let filtered = [...exams];


    if (searchTerm) {
      filtered = filtered.filter(exam =>
        exam.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }


    if (programFilter !== "all") {
      filtered = filtered.filter(exam => exam.program?.id === programFilter);
    }


    if (courseFilter !== "all") {
      filtered = filtered.filter(exam => exam.course?.id === courseFilter);
    }


    if (subjectFilter !== "all") {
      filtered = filtered.filter(exam => exam.subject?.id === subjectFilter);
    }


    setFilteredExams(filtered);
  }, [exams, searchTerm, programFilter, courseFilter, subjectFilter]);


  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);


  useEffect(() => {
    applyFilters();
  }, [applyFilters]);


  const loadData = async () => {
    try {
      const [examsData, programsData, coursesData, subjectsData] = await Promise.all([
        Exam.list("-created_date"),
        Program.list(),
        Course.list(),
        Subject.list()
      ]);


      setExams(examsData);
      setPrograms(programsData);
      setCourses(coursesData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };


  const handleAssign = async () => {
    if (!selectedExam) {
      alert("Please select a test to assign");
      return;
    }


    setIsLoading(true);
    try {
      let totalStudentsNotified = 0;


      // Create ClassroomTest records and notify students for each selected classroom
      for (const classroom of selectedClassrooms) {
        // Create classroom test assignment
        await ClassroomTest.create({
          classroom_id: classroom.id,
          exam_id: selectedExam.id,
          assigned_date: new Date().toISOString(),
          due_date: dueDate ? dueDate.toISOString() : null,
          is_active: true
        });


        // Get all candidates in this classroom
        const classroomCandidates = await ClassroomCandidate.filter({
          classroom_id: classroom.id,
          status: 'active'
        });


        // Send notifications to each candidate
        for (const classroomCandidate of classroomCandidates) {
          try {
            const candidate = await Candidate.get(classroomCandidate.candidate_id);

            // Send email notification
            if (notificationMethods.email && candidate.email) {
              try {
                await SendEmail({
                  to: candidate.email,
                  subject: `New Test Assigned: ${selectedExam.title}`,
                  body: `
Dear ${candidate.name},

A new test has been assigned to your classroom "${classroom.name}".

Test Details:
- Title: ${selectedExam.title}
- Description: ${selectedExam.description || 'N/A'}
- Total Questions: ${selectedExam.total_questions}
- Duration: ${selectedExam.duration_minutes} minutes
- Total Marks: ${selectedExam.total_marks}
${dueDate ? `- Due Date: ${format(dueDate, 'PPP')}` : ''}


${selectedExam.respondent_link ? `Click here to attempt the test: ${selectedExam.respondent_link}` : 'Test link will be provided soon.'}

Please complete the test before the due date.


Best regards,
Lernern Team
                  `.trim()
                });

                totalStudentsNotified++;
              } catch (emailError) {
                console.error(`Failed to send email to ${candidate.email}:`, emailError);
              }
            }


            // SMS and WhatsApp notifications would require backend functions
            if ((notificationMethods.sms || notificationMethods.whatsapp) && candidate.phone) {
              console.log(`SMS/WhatsApp notification would be sent to ${candidate.phone}`);
              console.log(`Message: Test "${selectedExam.title}" assigned. Link: ${selectedExam.respondent_link || 'Coming soon'}`);
            }
          } catch (error) {
            console.error(`Error processing candidate ${classroomCandidate.candidate_id}:`, error);
          }
        }
      }


      alert(`Test assigned successfully to ${selectedClassrooms.length} classroom(s) and ${totalStudentsNotified} student(s) notified via email!`);
      onAssign();
    } catch (error) {
      console.error("Error assigning test:", error);
      alert("Error assigning test. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  const getExamTypeColor = (type) => {
    const colors = {
      practice: "bg-blue-100 text-blue-800",
      mock_test: "bg-purple-100 text-purple-800",
      previous_year: "bg-orange-100 text-orange-800",
      live_test: "bg-red-100 text-red-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Test to Classrooms</DialogTitle>
          <p className="text-sm text-slate-600 mt-1">
            Assigning to {selectedClassrooms.length} classroom{selectedClassrooms.length !== 1 ? 's' : ''}
          </p>
        </DialogHeader>


        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-teal-600" />
          <AlertDescription className="text-blue-800">
            <strong>Note:</strong> Email notifications will be sent automatically to all students in the selected classrooms.
            For SMS and WhatsApp notifications, enable backend functions in Dashboard → Settings.
          </AlertDescription>
        </Alert>


        <div className="space-y-4">
          {/* Selected Classrooms */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-2">Selected Classrooms:</h3>
            <div className="flex flex-wrap gap-2">
              {selectedClassrooms.map(classroom => (
                <Badge key={classroom.id} variant="secondary" className="bg-blue-100 text-blue-800">
                  {classroom.name}
                </Badge>
              ))}
            </div>
          </div>


          {/* Notification Methods */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-3">Notification Methods:</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email"
                  checked={notificationMethods.email}
                  onCheckedChange={(checked) => setNotificationMethods({ ...notificationMethods, email: checked })}
                />
                <Mail className="w-4 h-4 text-slate-500" />
                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email (Available now)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sms"
                  checked={notificationMethods.sms}
                  onCheckedChange={(checked) => setNotificationMethods({ ...notificationMethods, sms: checked })}
                />
                <Phone className="w-4 h-4 text-slate-500" />
                <label htmlFor="sms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  SMS (Requires backend functions)s
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="whatsapp"
                  checked={notificationMethods.whatsapp}
                  onCheckedChange={(checked) => setNotificationMethods({ ...notificationMethods, whatsapp: checked })}
                />
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <label htmlFor="whatsapp" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  WhatsApp (Requires backend functions)
                </label>
              </div>
            </div>
          </div>


          {/* Due Date Selection */}
          <div>
            <Label>Due Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, 'PPP') : 'Select due date...'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>


          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {programs.map(program => (
                  <SelectItem key={program.id} value={program.id}>{program.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>


          {/* Tests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-1">
            {filteredExams.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500">No tests found</p>
              </div>
            ) : (
              filteredExams.map(exam => (
                <Card
                  key={exam.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${selectedExam?.id === exam.id ? 'ring-2 ring-teal-500 bg-teal-50' : ''
                    }`}
                  onClick={() => setSelectedExam(exam)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary" className={getExamTypeColor(exam.exam_type)}>
                        {exam.exam_type?.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {selectedExam?.id === exam.id && (
                        <CheckCircle className="w-5 h-5 text-teal-600" />
                      )}
                    </div>

                    <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">
                      {exam.title}
                    </h3>

                    {exam.description && (
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {exam.description}
                      </p>
                    )}

                    <div className="space-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>{exam.total_questions} Questions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{exam.duration_minutes} Minutes</span>
                      </div>
                      {exam.respondent_link && (
                        <div className="text-green-600 font-medium mt-1">
                          ✓ Test link available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>


        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAssign}
            disabled={!selectedExam || isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? "Assigning & Notifying..." : "Assign Test & Notify Students"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
