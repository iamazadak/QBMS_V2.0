import axios from 'axios';
import { supabase } from "@/lib/supabase";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, Trophy, FileText, CheckCircle, Globe, ChevronDown, ChevronUp } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Exam, ExamQuestion, ExamSection, Program, Course, Subject } from "@/entities/all";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function CreateQuizModal({
  isOpen,
  onClose,
  selectedQuestions = [],
  onQuizCreated,
  courseId
}) {
  const { toast } = useToast();

  const examEntity = new Exam();
  const examQuestionEntity = new ExamQuestion();
  const examSectionEntity = new ExamSection();
  const programEntity = new Program();
  const courseEntity = new Course();
  const subjectEntity = new Subject();

  const [formData, setFormData] = useState({
    title: "",
    duration_minutes: 60,
    type: "Weekly Assessment",
    scheduled_date: null,
    is_published: true,
    generateGoogleForm: false,
    formDescription: "",
    videoUrl: "https://www.youtube.com/watch?v=0JQMS6QmZn8",
    imageUrl: "https://upload.wikimedia.org/wikipedia/en/5/51/Iwo_jima_flag_raising.jpg",
    limitToOneResponse: true,
    showProgressBar: true,
    program_id: "",
    course_id: "",
    subject_id: "",
    year: ""
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleFormSectionOpen, setIsGoogleFormSectionOpen] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [allYears, setAllYears] = useState([]);

  const calculateTotalMarks = () => {
    return selectedQuestions.reduce((total, question) => total + (question.positive_marks || 1), 0);
  };

  const loadPrograms = async () => {
    console.log("Loading programs...");
    try {
      const data = await programEntity.list();
      console.log("Programs loaded:", data);
      setPrograms(data || []);
    } catch (error) {
      console.error("Error loading programs:", error);
      toast({ variant: "destructive", description: `Error loading programs: ${error.message}` });
    }
  };

  const loadCourses = async (programId) => {
    console.log("Loading courses for programId:", programId);
    try {
      const data = programId
        ? await courseEntity.filter({ program_id: programId })
        : await courseEntity.list();
      console.log("Courses loaded:", data);
      setCourses(data || []);
    } catch (error) {
      console.error("Error loading courses:", error);
      toast({ variant: "destructive", description: `Error loading courses: ${error.message}` });
    }
  };

  const loadSubjects = async (courseId) => {
    console.log("Loading subjects for courseId:", courseId);
    try {
      const data = courseId
        ? await subjectEntity.filter({ course_id: courseId })
        : await subjectEntity.list();
      console.log("Subjects loaded:", data);
      setSubjects(data || []);
    } catch (error) {
      console.error("Error loading subjects:", error);
      toast({ variant: "destructive", description: `Error loading subjects: ${error.message}` });
    }
  };

  const loadAllYears = async () => {
    console.log("Loading all years...");
    try {
      const { data, error } = await supabase.from('subjects').select('year');
      if (error) {
        console.error("Error loading years:", error);
        toast({ variant: "destructive", description: `Error loading years: ${error.message}` });
        setAllYears([]);
        return;
      }
      const years = [...new Set(data.map(item => item.year))].filter(Boolean).sort((a, b) => a - b);
      console.log("Years loaded:", years);
      setAllYears(years);
    } catch (error) {
      console.error("Error in loadAllYears:", error);
      toast({ variant: "destructive", description: `Error loading years: ${error.message}` });
      setAllYears([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPrograms();
      loadAllYears();
      if (courseId) {
        setFormData(prev => ({ ...prev, course_id: courseId }));
        loadSubjects(courseId);
      }
      if (selectedQuestions && selectedQuestions.length > 0) {
        const firstQuestion = selectedQuestions[0];
        const commonProgramId = selectedQuestions.every(q => q.program?.id === firstQuestion.program?.id)
          ? firstQuestion.program?.id
          : "";
        const commonCourseId = selectedQuestions.every(q => q.course?.id === firstQuestion.course?.id)
          ? firstQuestion.course?.id
          : courseId || "";
        const commonSubjectId = selectedQuestions.every(q => q.subject?.id === firstQuestion.subject?.id)
          ? firstQuestion.subject?.id
          : "";
        const commonYear = selectedQuestions.every(q => q.subject?.year === firstQuestion.subject?.year)
          ? firstQuestion.subject?.year
          : "";

        setFormData(prev => ({
          ...prev,
          program_id: commonProgramId,
          course_id: courseId || commonCourseId,
          subject_id: commonSubjectId,
          year: commonYear
        }));

        if (commonProgramId) loadCourses(commonProgramId);
        if (commonCourseId && !courseId) loadSubjects(commonCourseId);
      } else {
        setFormData(prev => ({
          ...prev,
          program_id: "",
          course_id: courseId || "",
          subject_id: "",
          year: ""
        }));
        setCourses([]);
        setSubjects([]);
      }
    }
  }, [isOpen, selectedQuestions, courseId]);

  useEffect(() => {
    if (formData.program_id) {
      loadCourses(formData.program_id);
      setFormData(prev => ({ ...prev, course_id: courseId || "", subject_id: "", year: "" }));
    }
  }, [formData.program_id, courseId]);

  useEffect(() => {
    if (formData.course_id) {
      loadSubjects(formData.course_id);
      setFormData(prev => ({ ...prev, subject_id: "", year: "" }));
    }
  }, [formData.course_id]);

  useEffect(() => {
    if (formData.scheduled_date) {
      setIsCalendarOpen(false);
    }
  }, [formData.scheduled_date]);

  const handleSubmit = async () => {
    if (isLoading) return;

    if (!formData.title) {
      toast({ 
        variant: "destructive", 
        description: "Quiz Title is required",
        className: "bg-red-100 text-red-800 border-red-300"
      });
      return;
    }
    if (formData.duration_minutes < 5) {
      toast({ 
        variant: "destructive", 
        description: "Duration must be at least 5 minutes",
        className: "bg-red-100 text-red-800 border-red-300"
      });
      return;
    }
    if (selectedQuestions.length < 10) {
      toast({ 
        variant: "destructive", 
        description: "At least 10 quiz questions are required",
        className: "bg-red-100 text-red-800 border-red-300"
      });
      return;
    }

    if (!formData.course_id) {
      toast({ 
        variant: "destructive", 
        description: "Course is required",
        className: "bg-red-100 text-red-800 border-red-300"
      });
      return;
    }
    if (formData.type === "Weekly Assessment") {
      if (!formData.program_id) {
        toast({ 
          variant: "destructive", 
          description: "Program is required for Weekly Assessment",
          className: "bg-red-100 text-red-800 border-red-300"
        });
        return;
      }
      if (!formData.subject_id) {
        toast({ 
          variant: "destructive", 
          description: "Subject is required for Weekly Assessment",
          className: "bg-red-100 text-red-800 border-red-300"
        });
        return;
      }
      if (!formData.year) {
        toast({ 
          variant: "destructive", 
          description: "Year is required for Weekly Assessment",
          className: "bg-red-100 text-red-800 border-red-300"
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }
      const creatorId = user.id;

      const examData = {
        course_id: formData.course_id,
        title: formData.title,
        type: formData.type,
        // scheduled_date: formData.scheduled_date,
        is_published: formData.is_published,
        creator_id: creatorId
      };

      const newExam = await examEntity.create(examData);

      const sectionData = {
        exam_id: newExam.id,
        name: "Quiz Section",
        duration_minutes: formData.duration_minutes,
        section_order: 1
      };
      const newSection = await examSectionEntity.create(sectionData);

      for (let i = 0; i < selectedQuestions.length; i++) {
        const question = selectedQuestions[i];
        await examQuestionEntity.create({
          exam_id: newExam.id,
          section_id: newSection.id,
          question_id: question.id
        });
      }

      if (formData.generateGoogleForm) {
        const googleFormData = {
          formTitle: formData.title,
          formDescription: formData.formDescription 
            ? `${formData.formDescription}\n\nThis quiz should be completed in ${formData.duration_minutes} minutes.` 
            : `Complete Section 1 with your details. In Section 2, review the video lecture and image below before answering the quiz. This quiz should be completed in ${formData.duration_minutes} minutes.`,
          limitToOneResponse: formData.limitToOneResponse,
          showProgressBar: formData.showProgressBar,
          theme: {
            primaryColor: "#1a73e8",
            backgroundColor: "#f1f3f4",
            fontFamily: "Roboto"
          },
          questions: [
            {
              questionType: "section",
              sectionTitle: "Section 1: User Information"
            },
            {
              questionText: "Your Full Name",
              questionType: "short_answer",
              isRequired: true
            },
            {
              questionText: "Phone Number",
              questionType: "short_answer",
              isRequired: true,
              validation: {
                type: "regex",
                regex: "\\+?\\d{10,15}",
                errorMessage: "Enter a valid phone number (10-15 digits, optional +)"
              }
            },
            {
              questionText: "Industry Name",
              questionType: "short_answer",
              isRequired: true
            },
            {
              questionType: "section",
              sectionTitle: `Section 2: ${formData.title}`,
              sectionDescription: `Review the following video lecture: ${formData.videoUrl} and image: ${formData.imageUrl} before answering the quiz questions.`
            },
            {
              questionText: "I have reviewed the reference video and image.",
              questionType: "checkboxes",
              isRequired: true,
              responseOptions: ["Confirmed"],
              correctAnswer: ["Confirmed"],
              points: 0
            },
            ...selectedQuestions.map((q, index) => ({
              questionText: q.question_text,
              questionType: q.type || "multiple_choice",
              isRequired: true,
              responseOptions: q.options || [],
              correctAnswer: q.correct_answer || "",
              points: q.positive_marks || 1,
              feedback: q.feedback || { correct: "Correct!", incorrect: "Please review the material." },
              validation: q.validation
            }))
          ]
        };

        // Call the Vercel proxy function
        const response = await axios.post('/api/google-form-proxy', googleFormData);
        const result = response.data;

        if (result.status !== 'success') {
          throw new Error(result.message || 'Failed to create Google Form via proxy');
        }

        // Update the exam with the new Google Form links
        if (result.formUrl) {
          await examEntity.update(newExam.id, {
            editor_link: result.formUrl,
            respondent_link: result.publishedUrl || result.formUrl.replace('/edit', '/viewform')
          });
        }

        toast({
          description: (
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" />
              Google Form created: <a href={result.formUrl} target="_blank" className="text-blue-600 hover:underline">View Form</a>
            </div>
          ),
          className: "bg-blue-50 text-blue-800 border-blue-200"
        });
      }

      toast({
        description: (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Quiz created successfully!
          </div>
        ),
        className: "bg-green-50 text-green-800 border-green-200"
      });
      onQuizCreated();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast({ 
        variant: "destructive", 
        description: `Error creating quiz: ${error.message}`,
        className: "bg-red-100 text-red-800 border-red-300"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      duration_minutes: 60,
      type: "Weekly Assessment",
      scheduled_date: null,
      is_published: true,
      generateGoogleForm: false,
      googleAppsScriptUrl: "",
      formDescription: "",
      videoUrl: "https://www.youtube.com/watch?v=0JQMS6QmZn8",
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/5/51/Iwo_jima_flag_raising.jpg",
      limitToOneResponse: true,
      showProgressBar: true,
      program_id: "",
      course_id: courseId || "",
      subject_id: "",
      year: ""
    });
    setCourses([]);
    setSubjects([]);
    setAllYears([]);
  };

  const getQuestionsByDifficulty = () => {
    const difficulties = { easy: 0, medium: 0, hard: 0 };
    selectedQuestions.forEach(q => {
      difficulties[q.level] = (difficulties[q.level] || 0) + 1;
    });
    return difficulties;
  };

  const difficultyStats = getQuestionsByDifficulty();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-b from-gray-50 to-white rounded-2xl shadow-xl p-8">
        <DialogHeader className="border-b border-gray-200 pb-4 mb-6">
          <DialogTitle className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Trophy className="w-7 h-7 text-green-500" />
            Create New Quiz
          </DialogTitle>
          <DialogDescription>
            This modal allows you to create a new quiz. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column - Form and Quiz Summary */}
          <div className="lg:col-span-2 space-y-6 flex flex-col">
            {/* Form */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="title" className="text-sm font-semibold text-gray-700">Quiz Title <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  placeholder="Enter a captivating quiz title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-xl p-3 transition-all duration-300 hover:border-green-300"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="space-y-2"
              >
                <Label className="text-sm font-semibold text-gray-700">Quiz Type <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="border-gray-200 focus:ring-2 focus:ring-green-500 rounded-xl p-3 transition-all duration-300 hover:border-green-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl shadow-lg">
                    <SelectItem value="Weekly Assessment" className="hover:bg-green-50">Weekly Assessment</SelectItem>
                    <SelectItem value="Monthly Assessment" className="hover:bg-green-50">Monthly Assessment</SelectItem>
                    <SelectItem value="Final Mock Assessment" className="hover:bg-green-50">Final Mock Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="space-y-2"
              >
                <Label htmlFor="duration" className="text-sm font-semibold text-gray-700">Duration (minutes) <span className="text-red-500">*</span></Label>
                <Input
                  id="duration"
                  type="number"
                  min="5"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 5 })}
                  className="border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-xl p-3 transition-all duration-300 hover:border-green-300"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="space-y-2"
              >
                <Label className="text-sm font-semibold text-gray-700">Program {formData.type === "Weekly Assessment" && <span className="text-red-500">*</span>}</Label>
                <Select
                  value={formData.program_id}
                  onValueChange={(value) => {
                    setFormData({ ...formData, program_id: value, course_id: courseId || "", subject_id: "", year: "" });
                    loadCourses(value);
                  }}
                >
                  <SelectTrigger className="border-gray-200 focus:ring-2 focus:ring-green-500 rounded-xl p-3 transition-all duration-300 hover:border-green-300">
                    <SelectValue placeholder="Select Program" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl shadow-lg">
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.25 }}
                className="space-y-2"
              >
                <Label className="text-sm font-semibold text-gray-700">Course <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.course_id}
                  onValueChange={(value) => {
                    setFormData({ ...formData, course_id: value, subject_id: "", year: "" });
                    loadSubjects(value);
                  }}
                  disabled={!!courseId}
                >
                  <SelectTrigger className="border-gray-200 focus:ring-2 focus:ring-green-500 rounded-xl p-3 transition-all duration-300 hover:border-green-300">
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl shadow-lg">
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="space-y-2"
              >
                <Label className="text-sm font-semibold text-gray-700">Subject {formData.type === "Weekly Assessment" && <span className="text-red-500">*</span>}</Label>
                <Select
                  value={formData.subject_id}
                  onValueChange={(value) => setFormData({ ...formData, subject_id: value })}
                >
                  <SelectTrigger className="border-gray-200 focus:ring-2 focus:ring-green-500 rounded-xl p-3 transition-all duration-300 hover:border-green-300">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl shadow-lg">
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.35 }}
                className="space-y-2"
              >
                <Label className="text-sm font-semibold text-gray-700">Year {formData.type === "Weekly Assessment" && <span className="text-red-500">*</span>}</Label>
                <Select
                  value={formData.year}
                  onValueChange={(value) => setFormData({ ...formData, year: value })}
                >
                  <SelectTrigger className="border-gray-200 focus:ring-2 focus:ring-green-500 rounded-xl p-3 transition-all duration-300 hover:border-green-300">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl shadow-lg">
                    {allYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="space-y-2"
              >
                <Label className="text-sm font-semibold text-gray-700">Schedule Date (Optional)</Label>
                <Button
                  variant="outline"
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className="w-full justify-start text-left font-normal border-gray-200 hover:bg-gray-100 rounded-xl p-3 transition-all duration-300 hover:border-green-300"
                >
                  <CalendarIcon className="mr-2 h-5 w-5 text-green-500" />
                  {formData.scheduled_date ? format(formData.scheduled_date, "PPP") : <span className="text-gray-400">Select date...</span>}
                </Button>
                {isCalendarOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2"
                  >
                    <Calendar
                      mode="single"
                      value={formData.scheduled_date}
                      onChange={(date) => {
                        setFormData({ ...formData, scheduled_date: date });
                        setIsCalendarOpen(false);
                      }}
                      className="rounded-md border-0 bg-white shadow-lg"
                    />
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Quiz Summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-none bg-white shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-green-50 p-3">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-500" />
                    Quiz Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-3 bg-green-50 rounded-xl shadow-sm"
                    >
                      <p className="text-2xl font-bold text-green-600">{selectedQuestions.length}</p>
                      <p className="text-xs text-green-700">Questions</p>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-3 bg-green-50 rounded-xl shadow-sm"
                    >
                      <p className="text-2xl font-bold text-green-600">{calculateTotalMarks()}</p>
                      <p className="text-xs text-green-700">Total Marks</p>
                    </motion.div>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-700 mb-2">Difficulty Distribution</p>
                    <div className="space-y-2">
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-50 transition-all"
                      >
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 font-medium py-1 px-2 text-xs">Easy</Badge>
                        <span className="text-xs font-medium text-gray-600">{difficultyStats.easy || 0}</span>
                      </motion.div>
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-50 transition-all"
                      >
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 font-medium py-1 px-2 text-xs">Medium</Badge>
                        <span className="text-xs font-medium text-gray-600">{difficultyStats.medium || 0}</span>
                      </motion.div>
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-50 transition-all"
                      >
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 font-medium py-1 px-2 text-xs">Hard</Badge>
                        <span className="text-xs font-medium text-gray-600">{difficultyStats.hard || 0}</span>
                      </motion.div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span>{formData.duration_minutes} minutes duration</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.45 }}
              className="flex items-center space-x-3"
            >
              <Switch
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                className="data-[state=checked]:bg-green-600"
              />
              <Label htmlFor="is_published" className="text-sm font-semibold text-gray-700">Publish immediately</Label>
            </motion.div>

            {/* Google Form Generation Section */}
            <Collapsible
              open={isGoogleFormSectionOpen}
              onOpenChange={setIsGoogleFormSectionOpen}
              className="space-y-4 pt-6 border-t border-gray-200"
            >
              <CollapsibleTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                >
                  <Label className="text-sm font-semibold text-gray-700">Google Form Settings</Label>
                  {isGoogleFormSectionOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </motion.div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <Label htmlFor="generateGoogleForm" className="text-sm font-semibold text-gray-700">Generate Google Form</Label>
                    <Switch
                      id="generateGoogleForm"
                      checked={formData.generateGoogleForm}
                      onCheckedChange={(checked) => setFormData({ ...formData, generateGoogleForm: checked })}
                      className="data-[state=checked]:bg-green-600"
                    />
                  </div>
                  {formData.generateGoogleForm && (
                    <div className="space-y-4">

                      <div className="space-y-2">
                        <Label htmlFor="formDescription" className="text-sm font-semibold text-gray-700">Form Description (Optional)</Label>
                        <Input
                          id="formDescription"
                          placeholder="Enter form description..."
                          value={formData.formDescription}
                          onChange={(e) => setFormData({ ...formData, formDescription: e.target.value })}
                          className="border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-xl p-3 transition-all duration-300 hover:border-green-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="videoUrl" className="text-sm font-semibold text-gray-700">Video URL <span className="text-red-500">*</span></Label>
                        <Input
                          id="videoUrl"
                          placeholder="Enter YouTube video URL"
                          value={formData.videoUrl}
                          onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                          className="border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-xl p-3 transition-all duration-300 hover:border-green-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="imageUrl" className="text-sm font-semibold text-gray-700">Image URL <span className="text-red-500">*</span></Label>
                        <Input
                          id="imageUrl"
                          placeholder="Enter image URL"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          className="border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-xl p-3 transition-all duration-300 hover:border-green-300"
                        />
                      </div>
                      <div className="flex items-center space-x-3">
                        <Switch
                          id="limitToOneResponse"
                          checked={formData.limitToOneResponse}
                          onCheckedChange={(checked) => setFormData({ ...formData, limitToOneResponse: checked })}
                          className="data-[state=checked]:bg-green-600"
                        />
                        <Label htmlFor="limitToOneResponse" className="text-sm font-semibold text-gray-700">Limit to one response per user</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Switch
                          id="showProgressBar"
                          checked={formData.showProgressBar}
                          onCheckedChange={(checked) => setFormData({ ...formData, showProgressBar: checked })}
                          className="data-[state=checked]:bg-green-600"
                        />
                        <Label htmlFor="showProgressBar" className="text-sm font-semibold text-gray-700">Show progress bar</Label>
                      </div>
                    </div>
                  )}
                </motion.div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Right Column - Selected Questions */}
          <div className="lg:col-span-3 space-y-6 flex flex-col">
            {selectedQuestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex-1"
              >
                <Card className="border-none bg-white shadow-lg rounded-2xl overflow-hidden h-full flex flex-col">
                  <CardHeader className="bg-green-50 p-4">
                    <CardTitle className="text-xl font-semibold text-gray-900">Selected Questions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 flex-1 overflow-y-auto">
                    <div className="space-y-3">
                      <AnimatePresence>
                        {selectedQuestions.map((question, index) => (
                          <motion.div
                            key={question.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="p-4 bg-gray-50 rounded-xl shadow-sm hover:bg-green-50 transition-all duration-300 cursor-pointer"
                          >
                            <p className="font-semibold text-gray-800">Q{index + 1} ({question.type || "multiple_choice"}):</p>
                            <p className="text-sm text-gray-600 line-clamp-2">{question.question_text}</p>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-gray-200 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl px-6 py-2 transition-all duration-300"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || selectedQuestions.length < 10}
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {isLoading ? "Creating Quiz..." : "Create Quiz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
