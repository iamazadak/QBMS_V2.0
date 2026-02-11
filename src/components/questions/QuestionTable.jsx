import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit2,
  Trash2,
  MoreHorizontal,
  FileText,
  Eye,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Info,
  Layers,
  BookOpen
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const levelColors = {
  easy: "bg-emerald-50 text-emerald-700 border-emerald-100",
  medium: "bg-amber-50 text-amber-700 border-amber-100",
  hard: "bg-rose-50 text-rose-700 border-rose-100",
};

export default function QuestionTable({
  questions = [],
  selectedQuestions = [],
  onSelectionChange,
  onEditQuestion,
  onDeleteQuestions,
  isLoading = false,
}) {
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());

  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedQuestions(newExpanded);
  };

  const handleSelectQuestion = (questionId, checked) => {
    if (checked) {
      onSelectionChange([...selectedQuestions, questionId]);
    } else {
      onSelectionChange(selectedQuestions.filter((id) => id !== questionId));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">No questions found</h3>
        <p className="text-slate-500 mt-2 max-w-sm mx-auto">
          Try adjusting your filters or add a new question to your bank.
        </p>
        <Button onClick={() => onEditQuestion(null)} className="mt-6 bg-indigo-600 hover:bg-indigo-700">
          Add First Question
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {questions.map((question, index) => {
        const isExpanded = expandedQuestions.has(question.id);
        const correctAnswer = question.options?.find(opt => opt.is_correct);

        return (
          <div
            key={question.id}
            className={`group bg-white rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md ${selectedQuestions.includes(question.id) ? 'border-indigo-500 ring-1 ring-indigo-50' : 'border-slate-200'
              }`}
          >
            {/* Card Header: Metadata & Selection */}
            <div className="p-5 md:p-6 border-b border-slate-50 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <Checkbox
                  checked={selectedQuestions.includes(question.id)}
                  onCheckedChange={(checked) => handleSelectQuestion(question.id, checked)}
                  className="mt-1.5"
                />
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      Question {index + 1}
                    </span>
                  </div>
                  <p className="text-slate-800 font-semibold text-lg leading-relaxed">
                    {question.question_text}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => onEditQuestion(question)} className="cursor-pointer">
                      <Edit2 className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteQuestions([question.id])}
                      className="cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Options Preview (Vertical List) */}
            <div className="px-6 pb-2 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {question.options?.map((option) => (
                  <div
                    key={option.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isExpanded && option.is_correct
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-slate-50/30 border-slate-100 text-slate-600'
                      }`}
                  >
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold leading-none ${isExpanded && option.is_correct ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                      {option.option_label}
                    </span>
                    <span className="text-sm font-medium">{option.option_text}</span>
                    {isExpanded && option.is_correct && <CheckCircle2 className="w-4 h-4 ml-auto text-emerald-500" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Solution/Explanation (Collapsible) */}
            {isExpanded && (
              <div className="px-6 pb-6 pt-4 animate-in slide-in-from-top-4 duration-300">
                <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100 flex gap-4">
                  <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-indigo-100">
                    <Info className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600">Detailed Solution</h4>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {question.solution_explanation || question.explanation || "No explanation provided for this question."}
                    </p>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-indigo-100/50">
                      <span className="text-[10px] font-bold text-slate-400">Correct Option:</span>
                      <Badge variant="secondary" className="bg-emerald-500 text-white border-transparent">
                        Option {correctAnswer?.option_label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="px-5 py-4 bg-slate-50/50 rounded-b-2xl border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className={`${levelColors[question.level]} capitalize border shadow-none text-[10px] h-5 px-1.5`}>
                  {question.level}
                </Badge>
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <BookOpen className="w-3 h-3 text-slate-400" />
                  {question.subject?.name || 'General'}
                </div>
                {question.competency && (
                  <>
                    <div className="w-1 h-1 bg-slate-300 rounded-full" />
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                      <CheckCircle2 className="w-3 h-3" />
                      {question.competency.name}
                    </div>
                  </>
                )}
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                  <Layers className="w-3 h-3" />
                  {question.course?.name || 'N/A'}
                </div>
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <span className="text-xs font-bold text-indigo-500">+{question.positive_marks} Marks</span>
                {/* Display Tags in Footer */}
                {question.tags && question.tags.length > 0 && (
                  <>
                    <div className="w-1 h-1 bg-slate-300 rounded-full" />
                    <div className="flex flex-wrap gap-1.5">
                      {question.tags.map(tag => (
                        <span key={tag.id} className="text-[9px] bg-teal-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpand(question.id)}
                className={`text-xs font-bold transition-all ${isExpanded ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'}`}
              >
                {isExpanded ? (
                  <>Hide Solution <ChevronUp className="ml-1 w-4 h-4" /></>
                ) : (
                  <>View Solution <ChevronDown className="ml-1 w-4 h-4" /></>
                )}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}