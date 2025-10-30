import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, MoreHorizontal, FileText, Plus, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const levelColors = {
  easy: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  hard: "bg-red-100 text-red-800 border-red-200",
};

export default function QuestionTable({
  questions = [],
  selectedQuestions = [],
  onSelectionChange,
  onEditQuestion,
  onDeleteQuestions,
  isLoading = false,
}) {
  const [selectAll, setSelectAll] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      onSelectionChange(questions.map((q) => q.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectQuestion = (questionId, checked) => {
    if (checked) {
      onSelectionChange([...selectedQuestions, questionId]);
    } else {
      onSelectionChange(selectedQuestions.filter((id) => id !== questionId));
    }
  };

  const toggleExpandQuestion = (questionId) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-x-auto max-h-[60vh] overflow-y-auto">
      {isLoading ? (
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="align-middle text-center p-4">
                <Checkbox disabled />
              </TableHead>
              <TableHead className="align-middle text-left p-4">Question</TableHead>
              <TableHead className="align-middle text-left p-4">Options</TableHead>
              <TableHead className="align-middle text-left p-4">Answer</TableHead>
              <TableHead className="align-middle text-left p-4">Subject</TableHead>
              <TableHead className="align-middle text-left p-4">Level</TableHead>
              <TableHead className="align-middle text-left p-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell className="align-middle grid place-items-center p-4 h-full">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                </TableCell>
                <TableCell className="align-middle">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                </TableCell>
                <TableCell className="align-middle">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                </TableCell>
                <TableCell className="align-middle">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                </TableCell>
                <TableCell className="align-middle">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                </TableCell>
                <TableCell className="align-middle">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                </TableCell>
                <TableCell className="align-middle flex items-center justify-center">
                  <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          <Table className="w-full">
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="align-middle text-center p-4">
                  <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
                </TableHead>
                <TableHead className="align-middle text-left p-4">Question</TableHead>
                <TableHead className="align-middle text-left p-4">Options</TableHead>
                <TableHead className="align-middle text-left p-4">Answer</TableHead>
                <TableHead className="align-middle text-left p-4">Subject</TableHead>
                <TableHead className="align-middle text-left p-4">Level</TableHead>
                <TableHead className="align-middle text-left p-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="text-slate-500 flex flex-col items-center justify-center">
                      <FileText className="w-16 h-16 text-slate-300 mb-4" />
                      <p className="text-lg font-medium">No questions found</p>
                      <p className="text-sm mt-2">
                        Try adjusting your search filters or add some questions to get started.
                      </p>
                      <Button variant="outline" className="mt-4" onClick={() => onEditQuestion(null)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Question
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                questions.map((question, index) => (
                  <React.Fragment key={question.id}>
                    <TableRow
                      className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-slate-100 transition-colors duration-150`}
                    >
                      <TableCell className="align-middle grid place-items-center p-4 h-full">
                        <Checkbox
                          checked={selectedQuestions.includes(question.id)}
                          onCheckedChange={(checked) => handleSelectQuestion(question.id, checked)}
                        />
                      </TableCell>
                      <TableCell className="align-middle">
                        <div>
                          <p className="text-slate-700">{truncateText(question.question_text)}</p>
                          {question.explanation && (
                            <p className="text-sm text-slate-500 mt-1">Explanation available</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-middle">
                        {question.options?.sort((a, b) => a.option_label.localeCompare(b.option_label)).map((option, optIndex) => (
                          <div key={optIndex} className="text-sm text-slate-600">
                            <span>{option.option_label}:</span> {truncateText(option.option_text)}
                          </div>
                        ))}
                      </TableCell>
                      <TableCell className="align-middle">
                        <Badge variant="secondary" className="font-medium bg-blue-100 text-blue-800">
                          {question.options?.find((opt) => opt.is_correct)?.option_text || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-middle">
                        <div className="text-sm">
                          <p className="text-slate-700">{question.subject?.name || "No Subject"}</p>
                          <p className="text-slate-500">{question.course?.name || "No Course"}</p>
                          {question.program && (
                            <p className="text-xs text-slate-400">{question.program.name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-middle">
                        <Badge
                          variant="secondary"
                          className={`${levelColors[question.level] || "bg-gray-100 text-gray-800"} border`}
                        >
                          {question.level?.charAt(0).toUpperCase() + question.level?.slice(1) || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-middle grid place-items-center p-4 h-full">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${expandedQuestion === question.id ? 'text-blue-600' : ''}`}
                            onClick={() => toggleExpandQuestion(question.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onEditQuestion(question)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:bg-red-100"
                            onClick={() => onDeleteQuestions([question.id])}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedQuestion === question.id && (
                      <TableRow>
                        <TableCell colSpan={7} className="p-0">
                          <div className="bg-slate-100 p-4">
                            <h3 className="text-lg font-bold mb-4">Question Details</h3>
                            <div className="space-y-4">
                              <div>
                                <p className="font-semibold text-slate-800">Question:</p>
                                <p className="text-slate-700">{question.question_text}</p>
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800">Explanation:</p>
                                <p className="text-slate-700">{question.explanation || "No explanation available."}</p>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <p className="font-semibold text-slate-800">Level:</p>
                                  <p className="text-slate-700">{question.level}</p>
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-800">Positive Marks:</p>
                                  <p className="text-slate-700">{question.positive_marks}</p>
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-800">Year:</p>
                                  <p className="text-slate-700">{question.subject?.year}</p>
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-800">Program:</p>
                                  <p className="text-slate-700">{question.program?.name}</p>
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-800">Course:</p>
                                  <p className="text-slate-700">{question.course?.name}</p>
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-800">Subject:</p>
                                  <p className="text-slate-700">{question.subject?.name}</p>
                                </div>
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800">Options:</p>
                                <ul className="list-disc list-inside">
                                  {question.options?.map((option) => (
                                    <li key={option.id} className={option.is_correct ? "font-bold text-green-600" : ""}>
                                      {option.option_label}: {option.option_text}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}