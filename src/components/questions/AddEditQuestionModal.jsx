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
import { FileText } from "lucide-react";

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
    year: "", // Initialize empty, will be set by populateEditData or resetForm
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
      
      // Ensure the question's year is included if editing
      if (question && (question.year || question.subject?.year)) {
        const questionYear = String(question.subject?.year || question.year);
        if (!years.includes(questionYear)) {
          years.push(questionYear);
        }
      }
      
      // Sort years in descending order
      years = years.sort((a, b) => b.localeCompare(a));
      
      if (!years.length) {
        console.warn("No years retrieved, using default year");
        years = [String(new Date().getFullYear())];
      }
      
      setAllYears(years);
    } catch (error) {
      console.error("Error loading years:", error);
      const defaultYear = question && (question.year || question.subject?.year) 
        ? String(question.subject?.year || question.year) 
        : String(new Date().getFullYear());
      setAllYears([defaultYear]);
      toast({ variant: "destructive", description: "Failed to load years. Using default year." });
    }
  };

  const resetForm = () => {
    setFormData({
      question_text: "",
      subject_id: "",
      level: "medium",
      positive_marks: 1,
      explanation: "",
      year: "", // Empty for add mode, user must select
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
        year: String(yearValue), // Use database year
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
      console.log("allYears:", allYears);
      console.log("formData.year:", formData.year);
      console.log("question:", question);
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

      const questionData = {
        ...formData,
        options: updatedOptions
      };

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
      <DialogContent className="w-full max-w-3xl h-auto bg-gray-50 p-4 rounded-lg">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            {question ? "Edit Question" : "Add New Question"}
          </DialogTitle>
        </DialogHeader>

        {isViewMode ? (
          <div className="space-y-4">
            <Card className="w-full p-4 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-base font-semibold text-gray-700 mb-2">Question</h3>
              <p className="text-sm text-gray-800">{formData.question_text}</p>
            </Card>
            <Card className="w-full p-4 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-base font-semibold text-gray-700 mb-2">Options</h3>
              <ul className="space-y-2">
                {options.map((option, index) => (
                  <li key={index} className={`flex items-center gap-2 p-2 border border-gray-200 rounded-md ${option.is_correct ? 'bg-green-100' : ''}`}>
                    <span className="font-medium text-gray-600 text-sm">{option.option_label}:</span>
                    <span className="text-sm text-gray-800">{option.option_text}</span>
                    {option.is_correct && <span className="text-sm font-semibold text-green-700">(Correct Answer)</span>}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="w-full p-4 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-base font-semibold text-gray-700 mb-2">Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Level</p>
                  <p className="text-sm text-gray-800">{formData.level}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Positive Marks</p>
                  <p className="text-sm text-gray-800">{formData.positive_marks}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Year</p>
                  <p className="text-sm text-gray-800">{formData.year || "Not specified"}</p>
                </div>
              </div>
            </Card>
            <Card className="w-full p-4 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-base font-semibold text-gray-700 mb-2">Explanation</h3>
              <p className="text-sm text-gray-800">{formData.explanation || "No explanation available."}</p>
            </Card>
            <Card className="w-full p-4 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-base font-semibold text-gray-700 mb-2">Categorization</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Program</p>
                  <p className="text-sm text-gray-800">{programs.find(p => p.id === formData.program_id)?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Course</p>
                  <p className="text-sm text-gray-800">{courses.find(c => c.id === formData.course_id)?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Subject</p>
                  <p className="text-sm text-gray-800">{subjects.find(s => s.id === formData.subject_id)?.name}</p>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Question Details Card */}
            <Card className="w-full p-4 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-base font-semibold text-gray-700 mb-2">Question Details</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="question_text" className="text-xs font-medium text-gray-600">Question Text*</Label>
                  <Textarea
                    id="question_text"
                    placeholder="Enter your question here..."
                    value={formData.question_text}
                    onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                    className={`mt-1 h-16 w-full text-sm transition-all duration-200 ${errors.question_text ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                    disabled={isViewMode}
                  />
                  {errors.question_text && <p className="text-red-500 text-xs mt-1">{errors.question_text}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Level*</Label>
                    <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })} disabled={isViewMode}>
                      <SelectTrigger className={`h-10 ${errors.level ? 'border-red-500' : 'border-gray-300'}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.level && <p className="text-red-500 text-xs mt-1">{errors.level}</p>}
                  </div>

                  <div>
                    <Label htmlFor="positive_marks" className="text-xs font-medium text-gray-600">Positive Marks*</Label>
                    <Input
                      id="positive_marks"
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={formData.positive_marks}
                      onChange={(e) => setFormData({ ...formData, positive_marks: parseFloat(e.target.value) })}
                      className={`h-8 w-full text-sm ${errors.positive_marks ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                      disabled={isViewMode}
                    />
                    {errors.positive_marks && <p className="text-red-500 text-xs mt-1">{errors.positive_marks}</p>}
                  </div>
                </div>
              </div>
            </Card>

            {/* Answer Options Card */}
            <Card className="w-full p-4 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-base font-semibold text-gray-700 mb-2">Answer Options*</h3>
              <RadioGroup value={correctAnswer} onValueChange={setCorrectAnswer}>
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value={option.option_label} id={`option-${index}`} className="focus:ring-blue-500" disabled={isViewMode} />
                      <Label htmlFor={`option-${index}`} className="font-medium min-w-[20px] text-gray-600 text-sm">
                        {option.option_label}:
                      </Label>
                      <Input
                        placeholder={`Option ${option.option_label}`}
                        value={option.option_text}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className={`flex-1 h-8 text-sm ${errors.options && !option.option_text ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                        disabled={isViewMode}
                      />
                    </div>
                  ))}
                </div>
              </RadioGroup>
              {errors.options && <p className="text-red-500 text-xs mt-1">{errors.options}</p>}
            </Card>

            {/* Explanation Card */}
            <Card className="w-full p-4 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-base font-semibold text-gray-700 mb-2">Explanation (Optional)</h3>
              <div>
                <Label htmlFor="explanation" className="text-xs font-medium text-gray-600">Explanation</Label>
                <Textarea
                  id="explanation"
                  placeholder="Provide an explanation for the correct answer..."
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  className="mt-1 h-16 w-full text-sm border-gray-300 focus:ring-blue-500"
                  disabled={isViewMode}
                />
              </div>
            </Card>

            {/* Categorization Card */}
            <Card className="w-full p-4 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-base font-semibold text-gray-700 mb-2">Categorization</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-gray-600">Program*</Label>
                  <Select value={formData.program_id} onValueChange={(value) => setFormData({ ...formData, program_id: value })} disabled={isViewMode}>
                    <SelectTrigger className={`h-8 w-full text-sm ${errors.program_id ? 'border-red-500' : 'border-gray-300'}`}>
                      <SelectValue placeholder="Select Program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.program_id && <p className="text-red-500 text-xs mt-1">{errors.program_id}</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Course*</Label>
                  <Select value={formData.course_id} onValueChange={(value) => setFormData({ ...formData, course_id: value })} disabled={isViewMode}>
                    <SelectTrigger className={`h-10 ${errors.course_id ? 'border-red-500' : 'border-gray-300'}`}>
                      <SelectValue placeholder="Select Course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.course_id && <p className="text-red-500 text-xs mt-1">{errors.course_id}</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Subject*</Label>
                  <Select value={formData.subject_id} onValueChange={(value) => setFormData({ ...formData, subject_id: value })} disabled={isViewMode}>
                    <SelectTrigger className={`h-10 ${errors.subject_id ? 'border-red-500' : 'border-gray-300'}`}>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.subject_id && <p className="text-red-500 text-xs mt-1">{errors.subject_id}</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Year*</Label>
                  {isViewMode ? (
                    <p className="text-sm text-gray-800 pt-2">{formData.year || "Not specified"}</p>
                  ) : (
                    <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })} disabled={isViewMode}>
                      <SelectTrigger className={`h-10 min-h-[40px] ${errors.year ? 'border-red-500' : 'border-gray-300'}`}>
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] overflow-y-auto">
                        {allYears.length > 0 ? (
                          allYears.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>
                            No years available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
                </div>
              </div>
            </Card>
          </div>
        )}

        <DialogFooter className="flex justify-center space-x-4">
          <Button type="button" variant="outline" onClick={onClose} className="hover:scale-105 transition-transform hover:text-red-600">
            {isViewMode ? "Close" : "Cancel"}
          </Button>
          {!isViewMode && (
            <Button type="button" onClick={handleSubmit} disabled={isLoading} className="hover:scale-105 transition-transform hover:text-green-600">
              {isLoading ? "Saving..." : question ? "Update Question" : "Add Question"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}