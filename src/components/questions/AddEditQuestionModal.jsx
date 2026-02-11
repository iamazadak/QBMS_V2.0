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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileText, CheckCircle2, AlertCircle, Sparkles, X } from "lucide-react";

import { Program, Course, Subject, Competency, Question, Option } from "@/entities/all";
import { useToast } from "@/components/ui/use-toast";

export default function AddEditQuestionModal({
  isOpen,
  onClose,
  question = null,
  onSave,
  isViewMode = false
}) {
  const { toast } = useToast();

  const programEntity = new Program();
  const courseEntity = new Course();
  const subjectEntity = new Subject();
  const competencyEntity = new Competency();
  const questionEntity = new Question();
  const optionEntity = new Option();

  // --- State ---
  const [formData, setFormData] = useState({
    question_text: "",
    subject_id: "",
    level: "medium",
    positive_marks: 1,
    explanation: "",
    year: "",
    program_id: "",
    course_id: "",
    competency_id: ""
  });

  const [options, setOptions] = useState([
    { option_label: "A", option_text: "", is_correct: false },
    { option_label: "B", option_text: "", is_correct: false },
    { option_label: "C", option_text: "", is_correct: false },
    { option_label: "D", option_text: "", is_correct: false }
  ]);

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [allYears, setAllYears] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // --- Initializers ---
  const resetForm = useCallback(() => {
    setFormData({
      question_text: "",
      subject_id: "",
      level: "medium",
      positive_marks: 1,
      explanation: "",
      year: "",
      program_id: "",
      course_id: "",
      competency_id: ""
    });
    setOptions([
      { option_label: "A", option_text: "", is_correct: false },
      { option_label: "B", option_text: "", is_correct: false },
      { option_label: "C", option_text: "", is_correct: false },
      { option_label: "D", option_text: "", is_correct: false }
    ]);
    setTags([]);
    setTagInput("");
    setCorrectAnswer("A");
    setErrors({});
  }, []);

  const populateEditData = useCallback(() => {
    if (!question) return;

    console.log("Populating edit data for question:", question.id);
    const yearValue = question.subject?.year || question.year || "";

    setFormData({
      question_text: question.question_text || "",
      subject_id: question.subject_id || "",
      level: question.level || "medium",
      positive_marks: question.positive_marks || 1,
      explanation: question.solution_explanation || question.explanation || "",
      year: String(yearValue),
      program_id: question.program?.id || question.program_id || "",
      course_id: question.course?.id || question.course_id || "",
      competency_id: question.competency?.id || question.competency_id || ""
    });

    setTags(question.tags?.map(t => t.name) || []);

    if (question.options && question.options.length > 0) {
      // Sort options by label to ensure consistent A, B, C, D order
      const sortedOptions = [...question.options].sort((a, b) =>
        (a.option_label || "").localeCompare(b.option_label || "")
      );
      setOptions(sortedOptions);
      const correct = sortedOptions.find(opt => opt.is_correct);
      if (correct) {
        setCorrectAnswer(correct.option_label);
      }
    }
  }, [question]);

  // --- Data Loading ---
  const loadData = async () => {
    try {
      const [pData, cData, sData, cpData] = await Promise.all([
        programEntity.list(),
        courseEntity.list(),
        subjectEntity.list(),
        competencyEntity.list()
      ]);
      setPrograms(pData || []);
      setCourses(cData || []);
      setSubjects(sData || []);
      setCompetencies(cpData || []);

      // Extract unique years
      const uniqueYears = [...new Set(sData.map(s => String(s.year)).filter(Boolean))];
      if (uniqueYears.length === 0) {
        uniqueYears.push(String(new Date().getFullYear()));
      }
      setAllYears(uniqueYears.sort((a, b) => b - a));

    } catch (error) {
      console.error("Error loading modal data:", error);
      toast({ variant: "destructive", description: "Failed to load categorization data." });
    }
  };

  useEffect(() => {
    if (isOpen) {
      console.log("AddEditQuestionModal Opened. Mode:", question ? "Edit" : "Create");
      loadData();
      if (question) {
        populateEditData();
      } else {
        resetForm();
      }
    }
  }, [isOpen, question, populateEditData, resetForm]);

  // --- Handlers ---
  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagName) => {
    setTags(tags.filter(t => t !== tagName));
  };

  const handleOptionChange = (index, text) => {
    const newOptions = [...options];
    newOptions[index].option_text = text;
    setOptions(newOptions);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.question_text.trim()) newErrors.question_text = "Required";
    if (!formData.program_id) newErrors.program_id = "Required";
    if (!formData.course_id) newErrors.course_id = "Required";
    if (!formData.subject_id) newErrors.subject_id = "Required";
    if (!formData.year) newErrors.year = "Required";
    if (options.some(opt => !opt.option_text.trim())) newErrors.options = "All options required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({ variant: "destructive", description: "Please fill in all required fields" });
      return;
    }

    setIsLoading(true);
    console.log("Saving question...");

    try {
      // 1. Prepare data for the 'questions' table
      const { year, program_id, course_id, explanation, ...baseData } = formData;
      const dbData = {
        ...baseData,
        solution_explanation: explanation,
        positive_marks: parseFloat(baseData.positive_marks) || 1
      };

      let questionId = question?.id;

      if (question) {
        await questionEntity.update(questionId, dbData);
      } else {
        const newQuestion = await questionEntity.create(dbData);
        questionId = newQuestion.id;
      }

      // 1b. Sync Tags
      await questionEntity.syncTags(questionId, tags);

      // 2. Handle Options
      const updatedOptions = options.map(opt => ({
        ...opt,
        question_id: questionId,
        is_correct: opt.option_label === correctAnswer
      }));

      if (question) {
        // Update existing options
        for (const opt of updatedOptions) {
          if (opt.id) {
            await optionEntity.update(opt.id, {
              option_text: opt.option_text,
              is_correct: opt.is_correct
            });
          } else {
            await optionEntity.create(opt);
          }
        }
      } else {
        // Create new options
        for (const opt of updatedOptions) {
          const { id, ...newOpt } = opt;
          await optionEntity.create(newOpt);
        }
      }

      console.log("Question saved successfully!");
      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving question:", error);
      toast({
        variant: "destructive",
        description: `Error: ${error.message || "Failed to save question"}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Computed ---
  const filteredCourses = courses.filter(c => !formData.program_id || c.program_id === formData.program_id);
  const filteredSubjects = subjects.filter(s => !formData.course_id || s.course_id === formData.course_id);
  const filteredCompetencies = competencies.filter(c => !formData.subject_id || c.subject_id === formData.subject_id);

  console.log("AddEditQuestionModal Render - isOpen:", isOpen);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white border-none shadow-2xl z-[5001]">
        {/* Transparent high z-index overlay logic is handled by Radix Dialog */}

        {/* Header */}
        <DialogHeader className="px-6 py-4 bg-slate-900 text-white flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                {question ? "Edit Question" : "Add New Question"}
              </DialogTitle>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-0.5">
                Questions Bank Management
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl">
            <X className="w-5 h-5" />
          </Button>
        </DialogHeader>

        {/* Form Body */}
        <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto bg-slate-50/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Column: Question Details */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                  <h3 className="font-bold text-slate-800">Content</h3>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question_text" className="text-xs font-bold text-slate-500 uppercase">Question Text *</Label>
                    <Textarea
                      id="question_text"
                      placeholder="Enter the question text here..."
                      value={formData.question_text}
                      onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
                      className={`min-h-[120px] resize-none focus:ring-2 focus:ring-indigo-100 ${errors.question_text ? "border-red-500" : "border-slate-200"}`}
                      disabled={isViewMode}
                    />
                    {errors.question_text && <span className="text-red-500 text-[10px] uppercase font-bold flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.question_text}</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase">Difficulty *</Label>
                      <Select
                        value={formData.level}
                        onValueChange={(v) => setFormData(p => ({ ...p, level: v }))}
                        disabled={isViewMode}
                      >
                        <SelectTrigger className="bg-slate-50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white z-[6000]">
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase">Marks *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.positive_marks}
                        onChange={(e) => setFormData(p => ({ ...p, positive_marks: e.target.value }))}
                        className="bg-slate-50"
                        disabled={isViewMode}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                  <h3 className="font-bold text-slate-800">Answers</h3>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <RadioGroup value={correctAnswer} onValueChange={setCorrectAnswer} disabled={isViewMode}>
                    {options.map((opt, idx) => (
                      <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${correctAnswer === opt.option_label ? "border-emerald-500 bg-emerald-50/50" : "border-slate-100 hover:border-slate-200"}`}>
                        <RadioGroupItem value={opt.option_label} id={`opt-${idx}`} className="border-slate-300 text-emerald-600" />
                        <span className="font-bold text-slate-400 w-4">{opt.option_label}</span>
                        <Input
                          placeholder={`Option ${opt.option_label}...`}
                          value={opt.option_text}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          className="border-none bg-transparent shadow-none focus-visible:ring-0 p-0 h-auto text-sm"
                          disabled={isViewMode}
                        />
                        {correctAnswer === opt.option_label && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.options && <span className="text-red-500 text-[10px] uppercase font-bold block mt-2">{errors.options}</span>}
                </div>
              </div>
            </div>

            {/* Right Column: Categorization & Explanation */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                  <h3 className="font-bold text-slate-800">Categorization</h3>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase">Program *</Label>
                    <Select
                      value={formData.program_id}
                      onValueChange={(v) => setFormData(p => ({ ...p, program_id: v, course_id: "", subject_id: "" }))}
                      disabled={isViewMode}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Program" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-[6000]">
                        {programs.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase">Course *</Label>
                    <Select
                      value={formData.course_id}
                      onValueChange={(v) => setFormData(p => ({ ...p, course_id: v, subject_id: "" }))}
                      disabled={isViewMode || !formData.program_id}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={!formData.program_id ? "Select Program first" : "Select Course"} />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-[6000]">
                        {filteredCourses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase">Subject *</Label>
                    <Select
                      value={formData.subject_id}
                      onValueChange={(v) => setFormData(p => ({ ...p, subject_id: v, competency_id: "" }))}
                      disabled={isViewMode || !formData.course_id}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={!formData.course_id ? "Select Course first" : "Select Subject"} />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-[6000]">
                        {filteredSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase">Competency</Label>
                    <Select
                      value={formData.competency_id}
                      onValueChange={(v) => setFormData(p => ({ ...p, competency_id: v }))}
                      disabled={isViewMode || !formData.subject_id}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={!formData.subject_id ? "Select Subject first" : "Select Competency"} />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-[6000]">
                        {filteredCompetencies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase">Year *</Label>
                    <Select
                      value={formData.year}
                      onValueChange={(v) => setFormData(p => ({ ...p, year: v }))}
                      disabled={isViewMode}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-[6000]">
                        {allYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    Explanation <Sparkles className="w-4 h-4 text-indigo-500" />
                  </h3>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <Textarea
                    placeholder="Provide a detailed explanation for the correct answer..."
                    value={formData.explanation}
                    onChange={(e) => setFormData(p => ({ ...p, explanation: e.target.value }))}
                    className="min-h-[100px] resize-none border-slate-100 bg-slate-50/50 focus:bg-white"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              {/* Tags Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-slate-400 rounded-full"></div>
                  <h3 className="font-bold text-slate-800">Tags & Competencies</h3>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Add Tags (Press Enter)</Label>
                    <Input
                      placeholder="e.g. Algebra, NEET 2025, Competency-A..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="bg-slate-50 border-slate-200 h-10 focus:ring-2 focus:ring-slate-100"
                      disabled={isViewMode}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">No tags added yet.</p>
                    ) : (
                      tags.map(tag => (
                        <Badge
                          key={tag}
                          className="bg-teal-500 hover:bg-teal-600 text-white flex items-center gap-1.5 py-1 px-3 rounded-full text-xs transition-all animate-in zoom-in-95"
                        >
                          {tag}
                          {!isViewMode && (
                            <X
                              className="w-3 h-3 cursor-pointer hover:text-rose-400 transition-colors"
                              onClick={() => handleRemoveTag(tag)}
                            />
                          )}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-[10px] text-slate-400 font-bold uppercase hidden md:block">Fields marked with * are mandatory</p>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button variant="ghost" onClick={onClose} disabled={isLoading} className="flex-1 md:flex-none">
              Cancel
            </Button>
            {!isViewMode && (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                variant="primary"
                className="flex-1 md:flex-none min-w-[140px]"
              >
                {isLoading ? "Saving..." : question ? "Update Question" : "Create Question"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}