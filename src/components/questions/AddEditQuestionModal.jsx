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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { FileText, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

import { Program, Course, Subject, Question, Option } from "@/entities/all";
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
  const questionEntity = new Question();
  const optionEntity = new Option();

  const [formData, setFormData] = useState({
    question_text: "",
    subject_id: "",
    level: "medium",
    positive_marks: 1,
    explanation: "",
    year: "",
    program_id: "",
    course_id: ""
  });

  const [options, setOptions] = useState([
    { option_label: "A", option_text: "", is_correct: false },
    { option_label: "B", option_text: "", is_correct: false },
    { option_label: "C", option_text: "", is_correct: false },
    { option_label: "D", option_text: "", is_correct: false }
  ]);

  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [allYears, setAllYears] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const loadPrograms = async () => {
    const data = await programEntity.list();
    setPrograms(data);
  };

  const loadCourses = async () => {
    const data = await courseEntity.list();
    setCourses(data);
  };

  const loadSubjects = async () => {
    const data = await subjectEntity.list();
    setSubjects(data);
  };

  const loadAllYears = async () => {
    try {
      const data = await subjectEntity.getUniqueValues('year');
      let years = data ? data.map(String) : [];

      if (question && (question.year || question.subject?.year)) {
        const questionYear = String(question.subject?.year || question.year);
        if (!years.includes(questionYear)) {
          years.push(questionYear);
        }
      }

      years = years.sort((a, b) => b.localeCompare(a));

      if (!years.length) {
        years = [String(new Date().getFullYear())];
      }

      setAllYears(years);
    } catch (error) {
      console.error("Error loading years:", error);
      const defaultYear = question && (question.year || question.subject?.year)
        ? String(question.subject?.year || question.year)
        : String(new Date().getFullYear());
      setAllYears([defaultYear]);
    }
  };

  const resetForm = () => {
    setFormData({
      question_text: "",
      subject_id: "",
      level: "medium",
      positive_marks: 1,
      explanation: "",
      year: "",
      program_id: "",
      course_id: ""
    });

    setOptions([
      { option_label: "A", option_text: "", is_correct: false },
      { option_label: "B", option_text: "", is_correct: false },
      { option_label: "C", option_text: "", is_correct: false },
      { option_label: "D", option_text: "", is_correct: false }
    ]);

    setCorrectAnswer("A");
    setErrors({});
  };

  const populateEditData = useCallback(() => {
    if (question) {
      const yearValue = question.subject?.year || question.year || "";
      setFormData({
        question_text: question.question_text || "",
        subject_id: question.subject_id || "",
        level: question.level || "medium",
        positive_marks: question.positive_marks || 1,
        explanation: question.explanation || "",
        year: String(yearValue),
        program_id: question.program_id || "",
        course_id: question.course_id || ""
      });

      if (question.options && question.options.length > 0) {
        setOptions(question.options);
        const correct = question.options.find(opt => opt.is_correct);
        if (correct) {
          setCorrectAnswer(correct.option_label);
        }
      }
    }
  }, [question]);

  useEffect(() => {
    if (isOpen) {
      loadPrograms();
      loadCourses();
      loadSubjects();
      loadAllYears();
      if (question) {
        populateEditData();
      } else {
        resetForm();
      }
    }
  }, [isOpen, question, populateEditData]);

  const handleOptionChange = (index, text) => {
    const newOptions = [...options];
    newOptions[index].option_text = text;
    setOptions(newOptions);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.question_text) newErrors.question_text = "Required";
    if (!formData.subject_id) newErrors.subject_id = "Required";
    if (!formData.program_id) newErrors.program_id = "Required";
    if (!formData.course_id) newErrors.course_id = "Required";
    if (!formData.year) newErrors.year = "Required";
    if (!formData.level) newErrors.level = "Required";
    if (!formData.positive_marks) newErrors.positive_marks = "Required";
    if (!options.every(opt => opt.option_text)) newErrors.options = "All options required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({ variant: "destructive", description: "Please fill in all required fields" });
      return;
    }

    setIsLoading(true);

    try {
      const updatedOptions = options.map(opt => ({
        ...opt,
        is_correct: opt.option_label === correctAnswer
      }));

      if (question) {
        await questionEntity.update(question.id, formData);

        const existingOptionIds = new Set(question.options.map(o => o.id));
        const currentOptionIds = new Set(updatedOptions.map(o => o.id).filter(Boolean));

        for (const existingOption of question.options) {
          if (!currentOptionIds.has(existingOption.id)) {
            await optionEntity.delete(existingOption.id);
          }
        }

        for (const option of updatedOptions) {
          if (option.id && existingOptionIds.has(option.id)) {
            await optionEntity.update(option.id, {
              option_text: option.option_text,
              is_correct: option.is_correct,
              question_id: question.id
            });
          } else {
            await optionEntity.create({
              ...option,
              question_id: question.id
            });
          }
        }
      } else {
        const newQuestion = await questionEntity.create(formData);
        for (const option of updatedOptions) {
          await optionEntity.create({
            ...option,
            question_id: newQuestion.id
          });
        }
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving question:", error);
      toast({ variant: "destructive", description: "Error saving question. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-6xl p-0 gap-0 bg-white rounded-xl overflow-hidden shadow-2xl border-0">

        {/* Header */}
        <DialogHeader className="px-6 py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <FileText className="w-5 h-5 text-indigo-50" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-white tracking-tight">
                {question ? "Edit Question" : "Create New Question"}
              </DialogTitle>
              <p className="text-indigo-100/70 text-xs font-medium">Step 1 of 1: Enter Details</p>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="px-8 py-6 max-h-[75vh] overflow-y-auto custom-scrollbar bg-slate-50/50">
          <div className="space-y-8">

            {/* Question Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold ring-4 ring-indigo-50">1</span>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Question Details</h3>
              </div>

              <div className="grid grid-cols-1 gap-6 bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm">
                <div className="space-y-2">
                  <Label htmlFor="question_text" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Question Text <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="question_text"
                    placeholder="Type your question here..."
                    value={formData.question_text}
                    onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                    className={`min-h-[120px] text-base resize-none bg-slate-50 border-slate-200 focus:bg-white transition-all duration-200 ${errors.question_text ? 'border-red-500 focus:ring-red-200' : 'focus:border-indigo-500 focus:ring-indigo-100'}`}
                    disabled={isViewMode}
                  />
                  {errors.question_text && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />Required</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Difficulty Level <span className="text-red-500">*</span></Label>
                    <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })} disabled={isViewMode}>
                      <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:ring-indigo-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-[9999] shadow-xl border-slate-200">
                        <SelectItem value="easy" className="text-green-600 font-medium">Easy</SelectItem>
                        <SelectItem value="medium" className="text-amber-600 font-medium">Medium</SelectItem>
                        <SelectItem value="hard" className="text-red-600 font-medium">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Marks <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={formData.positive_marks}
                        onChange={(e) => setFormData({ ...formData, positive_marks: parseFloat(e.target.value) })}
                        className="h-11 pl-4 bg-slate-50 border-slate-200 focus:ring-indigo-100 focus:bg-white transition-all"
                        disabled={isViewMode}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">pts</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Options Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold ring-4 ring-indigo-50">2</span>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Answer Options</h3>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm space-y-4">
                <RadioGroup value={correctAnswer} onValueChange={setCorrectAnswer} className="space-y-3">
                  {options.map((option, index) => (
                    <div
                      key={index}
                      className={`group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${correctAnswer === option.option_label
                        ? 'border-indigo-500 bg-indigo-50/30 ring-1 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-teal-200 hover:bg-slate-50'
                        }`}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 text-sm font-bold transition-colors ${correctAnswer === option.option_label ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-teal-600 group-hover:shadow-sm'
                        }`}>
                        {option.option_label}
                      </div>

                      <Input
                        placeholder={`Type answer for Option ${option.option_label}`}
                        value={option.option_text}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="h-10 border-0 bg-transparent focus-visible:ring-0 px-2 shadow-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
                        disabled={isViewMode}
                      />

                      <div className="flex items-center shrink-0">
                        <RadioGroupItem value={option.option_label} id={`option-${index}`} className="sr-only" disabled={isViewMode} />
                        <Label
                          htmlFor={`option-${index}`}
                          className={`cursor-pointer px-3 py-1.5 rounded-md text-xs font-semibold transition-all select-none ${correctAnswer === option.option_label
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                            }`}
                        >
                          {correctAnswer === option.option_label ? (
                            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Correct Answer</span>
                          ) : (
                            "Mark Correct"
                          )}
                        </Label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>

                {errors.options && <p className="text-red-500 text-center text-xs py-2 bg-red-50 rounded-lg">{errors.options}</p>}

                {/* Explanation */}
                <div className="pt-4 border-t border-slate-100 mt-4">
                  <Label htmlFor="explanation" className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Explanation (Optional)
                  </Label>
                  <Textarea
                    id="explanation"
                    placeholder="Explain why the correct answer is correct..."
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    className="min-h-[100px] bg-amber-50/30 border-amber-100 focus:bg-white focus:border-amber-300 focus:ring-amber-100 text-sm"
                    disabled={isViewMode}
                  />
                </div>
              </div>
            </div>

            {/* Categorization Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold ring-4 ring-indigo-50">3</span>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Categorization</h3>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Program <span className="text-red-500">*</span></Label>
                  <Select value={formData.program_id} onValueChange={(value) => setFormData({ ...formData, program_id: value })} disabled={isViewMode}>
                    <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:ring-indigo-100">
                      <SelectValue placeholder="Select Program" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-[9999] shadow-xl border-slate-200">
                      {programs.map((program) => (
                        <SelectItem key={program.id} value={program.id}>{program.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Course <span className="text-red-500">*</span></Label>
                  <Select value={formData.course_id} onValueChange={(value) => setFormData({ ...formData, course_id: value })} disabled={isViewMode}>
                    <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:ring-indigo-100">
                      <SelectValue placeholder="Select Course" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-[9999] shadow-xl border-slate-200">
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject <span className="text-red-500">*</span></Label>
                  <Select value={formData.subject_id} onValueChange={(value) => setFormData({ ...formData, subject_id: value })} disabled={isViewMode}>
                    <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:ring-indigo-100">
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-[9999] shadow-xl border-slate-200">
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Year <span className="text-red-500">*</span></Label>
                  {isViewMode ? (
                    <div className="h-11 flex items-center px-4 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700">
                      {formData.year || "Not specified"}
                    </div>
                  ) : (
                    <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })} disabled={isViewMode}>
                      <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:ring-indigo-100">
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] bg-white z-[9999] shadow-xl border-slate-200">
                        {allYears.length > 0 ? (
                          allYears.map((year) => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>No years available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
          <Button type="button" variant="outline" onClick={onClose} className="h-10 px-6 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors">
            {isViewMode ? "Close" : "Cancel"}
          </Button>
          {!isViewMode && (
            <Button type="button" onClick={handleSubmit} disabled={isLoading} className="h-10 px-6 bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-200 transition-all hover:scale-105">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Saving...
                </span>
              ) : (
                question ? "Update Question" : "Create Question"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}