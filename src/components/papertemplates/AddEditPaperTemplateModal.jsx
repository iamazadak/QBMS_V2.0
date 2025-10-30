
import React, { useState, useEffect, useCallback } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Subject, Course, Program } from "@/entities/all";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const subjectEntity = new Subject();
const courseEntity = new Course();
const programEntity = new Program();

export default function AddEditPaperTemplateModal({
  isOpen,
  onClose,
  template = null,
  onSave,
}) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    institution_name: "",
    program_name: "",
    subject_name: "",
    subject_code: "",
    exam_type: "Theory",
    year: "",
    semester: "",
    full_marks: 50,
    time_duration: "3 hours",
    general_instructions: "All questions are compulsory",
    bilingual: false,
    footer_text: "All dimensions are in mm.",
    access_control: "Admin",
    subject_id: "",
    course_id: "",
    program_id: "",
  });

  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [isGeneralSettingsOpen, setIsGeneralSettingsOpen] = useState(false);

  const loadFilterData = useCallback(async () => {
    try {
      const [subjectsData, coursesData, programsData] = await Promise.all([
        subjectEntity.list(),
        courseEntity.list(),
        programEntity.list(),
      ]);
      setSubjects(subjectsData);
      setCourses(coursesData);
      setPrograms(programsData);
    } catch (error) {
      toast({ variant: "destructive", description: "Failed to load filter data." });
    }
  }, [toast]);

  useEffect(() => {
    if (isOpen) {
      loadFilterData();
      if (template) {
        setFormData({
          title: template.title || "",
          institution_name: template.institution_name || "",
          program_name: template.program_name || "",
          subject_name: template.subject_name || "",
          subject_code: template.subject_code || "",
          exam_type: template.exam_type || "Theory",
          year: template.year || "",
          semester: template.semester || "",
          full_marks: template.full_marks || 50,
          time_duration: template.time_duration || "3 hours",
          general_instructions: template.general_instructions || "All questions are compulsory",
          bilingual: template.bilingual || false,
          footer_text: template.footer_text || "All dimensions are in mm.",
          access_control: template.access_control || "Admin",
          subject_id: template.subject_id || "",
          course_id: template.course_id || "",
          program_id: template.program_id || "",
        });
        setSections(template.sections || []);
      } else {
        setFormData({
          title: "",
          institution_name: "",
          program_name: "",
          subject_name: "",
          subject_code: "",
          exam_type: "Theory",
          year: "",
          semester: "",
          full_marks: 50,
          time_duration: "3 hours",
          general_instructions: "All questions are compulsory",
          bilingual: false,
          footer_text: "All dimensions are in mm.",
          access_control: "Admin",
          subject_id: "",
          course_id: "",
          program_id: "",
        });
        setSections([]);
      }
      setErrors({});
    }
  }, [isOpen, template, loadFilterData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Required";
    if (!formData.exam_type) newErrors.exam_type = "Required";
    
    const sectionErrors = [];
    sections.forEach((section, index) => {
      const error = {};
      if (!section.name) error.name = "Required";
      if (!section.type) error.type = "Required";
      if (!section.num_questions) error.num_questions = "Required";
      if (!section.total_marks) error.total_marks = "Required";
      if (Object.keys(error).length > 0) {
        sectionErrors[index] = error;
      }
    });

    if (sectionErrors.length > 0) {
      newErrors.sections = sectionErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSection = () => {
    if (sections.length < 3) {
      setSections([...sections, { name: "", type: "Multiple Choice Questions", num_questions: 10, total_marks: 10, marks_per_question: "1", choice_enabled: false, choice_x: 5, choice_y: 10 }]);
    } else {
      toast({ variant: "destructive", description: "You can add a maximum of 3 sections." });
    }
  };

  const handleRemoveSection = (index) => {
    const newSections = [...sections];
    newSections.splice(index, 1);
    setSections(newSections);
  };

  const handleSectionChange = (index, field, value) => {
    const newSections = [...sections];
    newSections[index][field] = value;
    setSections(newSections);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({ variant: "destructive", description: "Please fill in all required fields" });
      return;
    }

    setIsLoading(true);

    try {
      const templateData = { ...formData, sections };
      onSave(templateData);
      onClose();
    } catch (error) {
      console.error("Error saving template:", error);
      toast({ variant: "destructive", description: "Error saving template. Please try again." });
    }
    finally {
      setIsLoading(false);
    }
  };

  const calculateTotalTemplateMarks = () => {
    return sections.reduce((total, section) => total + (section.total_marks || 0), 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-b from-gray-50 to-white rounded-2xl shadow-xl p-8">
        <DialogHeader className="border-b border-gray-200 pb-4 mb-6">
          <DialogTitle className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-7 h-7 text-blue-500" />
            {template ? "Edit Paper Template" : "Add New Paper Template"}
          </DialogTitle>
          <DialogDescription>
            Define the structure and details for your exam paper templates.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-3 space-y-6 flex flex-col">
            <Collapsible
              open={isGeneralSettingsOpen}
              onOpenChange={setIsGeneralSettingsOpen}
              className="space-y-4 pt-6 border-t border-gray-200"
            >
              <CollapsibleTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                >
                  <Label className="text-lg font-semibold text-gray-700">General Template Settings</Label>
                  {isGeneralSettingsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </motion.div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <Card className="border-none bg-white shadow-lg rounded-2xl overflow-hidden">
                    <CardHeader className="bg-blue-50 p-3">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        Template Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="title" className="mb-2 block">Exam Title*</Label>
                          <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={errors.title ? 'border-red-500' : ''} />
                        </div>
                        <div>
                          <Label htmlFor="institution_name" className="mb-2 block">Institution/Program Name</Label>
                          <Input id="institution_name" value={formData.institution_name} onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })} />
                        </div>
                        <div>
                          <Label htmlFor="program_id" className="mb-2 block">Program</Label>
                          <Select value={formData.program_id} onValueChange={(value) => setFormData({ ...formData, program_id: value })}>
                            <SelectTrigger><SelectValue placeholder="Select Program" /></SelectTrigger>
                            <SelectContent>
                              {programs.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="course_id" className="mb-2 block">Course</Label>
                          <Select value={formData.course_id} onValueChange={(value) => setFormData({ ...formData, course_id: value })}>
                            <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
                            <SelectContent>
                              {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="subject_id" className="mb-2 block">Subject</Label>
                          <Select value={formData.subject_id} onValueChange={(value) => setFormData({ ...formData, subject_id: value })}>
                            <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                            <SelectContent>
                              {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="subject_code" className="mb-2 block">Subject Code</Label>
                          <Input id="subject_code" value={formData.subject_code} onChange={(e) => setFormData({ ...formData, subject_code: e.target.value })} />
                        </div>
                        <div>
                          <Label className="mb-2 block">Exam Type*</Label>
                          <Select value={formData.exam_type} onValueChange={(value) => setFormData({ ...formData, exam_type: value })}>
                            <SelectTrigger className={errors.exam_type ? 'border-red-500' : ''}><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Theory">Theory</SelectItem>
                              <SelectItem value="Practical">Practical</SelectItem>
                              <SelectItem value="Drawing">Drawing</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="year" className="mb-2 block">Year/Semester</Label>
                          <Input id="year" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} />
                        </div>
                        <div>
                          <Label htmlFor="full_marks" className="mb-2 block">Full Marks</Label>
                          <Input id="full_marks" type="number" value={formData.full_marks} onChange={(e) => setFormData({ ...formData, full_marks: parseInt(e.target.value) })} />
                        </div>
                        <div>
                          <Label htmlFor="time_duration" className="mb-2 block">Time Duration</Label>
                          <Input id="time_duration" value={formData.time_duration} onChange={(e) => setFormData({ ...formData, time_duration: e.target.value })} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none bg-white shadow-lg rounded-2xl overflow-hidden">
                    <CardHeader className="bg-blue-50 p-3">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        Instructions & Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-6">
                      <div>
                        <Label htmlFor="general_instructions" className="mb-2 block">General Instructions</Label>
                        <Textarea id="general_instructions" value={formData.general_instructions} onChange={(e) => setFormData({ ...formData, general_instructions: e.target.value })} />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="bilingual" checked={formData.bilingual} onCheckedChange={(checked) => setFormData({ ...formData, bilingual: checked })} />
                        <Label htmlFor="bilingual">Bilingual Support (English/Hindi)</Label>
                      </div>
                      <div>
                        <Label htmlFor="footer_text" className="mb-2 block">Footer Text</Label>
                        <Input id="footer_text" value={formData.footer_text} onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })} />
                      </div>
                      <div>
                        <Label className="mb-2 block">Access Control</Label>
                        <Select value={formData.access_control} onValueChange={(value) => setFormData({ ...formData, access_control: value })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Instructor">Instructor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </CollapsibleContent>
            </Collapsible>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Sections</h3>
              <div className="space-y-6">
                {sections.map((section, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-white">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold">Section {index + 1}</h4>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveSection(index)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label className="mb-2 block">Name*</Label>
                        <Input value={section.name} onChange={(e) => handleSectionChange(index, "name", e.target.value)} className={errors.sections?.[index]?.name ? 'border-red-500' : ''} />
                      </div>
                      <div>
                        <Label className="mb-2 block">Type*</Label>
                        <Select value={section.type} onValueChange={(value) => handleSectionChange(index, "type", value)}>
                          <SelectTrigger className={errors.sections?.[index]?.type ? 'border-red-500' : ''}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Multiple Choice Questions">Multiple Choice Questions</SelectItem>
                            <SelectItem value="Descriptive Questions">Descriptive Questions</SelectItem>
                            <SelectItem value="Practical Tasks">Practical Tasks</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="mb-2 block">No. of Questions*</Label>
                        <Input type="number" value={section.num_questions} onChange={(e) => handleSectionChange(index, "num_questions", parseInt(e.target.value))} className={errors.sections?.[index]?.num_questions ? 'border-red-500' : ''} />
                      </div>
                      <div>
                        <Label className="mb-2 block">Total Marks*</Label>
                        <Input type="number" value={section.total_marks} onChange={(e) => handleSectionChange(index, "total_marks", parseInt(e.target.value))} className={errors.sections?.[index]?.total_marks ? 'border-red-500' : ''} />
                      </div>
                      <div>
                        <Label className="mb-2 block">Marks per Question</Label>
                        <Input value={section.marks_per_question} onChange={(e) => handleSectionChange(index, "marks_per_question", e.target.value)} />
                      </div>
                      <div className="flex items-center justify-end pt-6 space-x-2">
                        <Checkbox id="bilingual" checked={section.choice_enabled} onCheckedChange={(checked) => handleSectionChange(index, "choice_enabled", checked)} />
                        <Label htmlFor="bilingual">Answer Any X out of Y</Label>
                      </div>
                      {section.choice_enabled && (
                        <div className="col-span-3 grid grid-cols-2 gap-4">
                          <div>
                            <Label className="mb-2 block">X</Label>
                            <Input type="number" value={section.choice_x} onChange={(e) => handleSectionChange(index, "choice_x", parseInt(e.target.value))} />
                          </div>
                          <div>
                            <Label className="mb-2 block">Y</Label>
                            <Input type="number" value={section.choice_y} onChange={(e) => handleSectionChange(index, "choice_y", parseInt(e.target.value))} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="mt-6" onClick={handleAddSection}>
                <Plus className="w-4 h-4 mr-2" />
                Add Section
              </Button>
            </div>
          </div>

          {/* Right Column - Template Summary */}
          <div className="lg:col-span-2 space-y-6 flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-none bg-white shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-blue-50 p-3">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Template Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-3 bg-blue-50 rounded-xl shadow-sm"
                    >
                      <p className="text-2xl font-bold text-blue-600">{sections.length}</p>
                      <p className="text-xs text-blue-700">Sections</p>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-3 bg-blue-50 rounded-xl shadow-sm"
                    >
                      <p className="text-2xl font-bold text-blue-600">{calculateTotalTemplateMarks()}</p>
                      <p className="text-xs text-blue-700">Total Marks</p>
                    </motion.div>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span>{formData.exam_type} Exam</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span>{formData.year} {formData.semester}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
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
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {isLoading ? "Saving..." : template ? "Update Template" : "Add Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
