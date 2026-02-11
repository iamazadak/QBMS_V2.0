import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload, Trash2, FileText, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Question, Option } from "@/entities/all";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";

import SearchFilter from "../components/questions/SearchFilter";
import QuestionTable from "../components/questions/QuestionTable";
import MobileQuestionCard from "../components/questions/MobileQuestionCard";
import AddEditQuestionModal from "../components/questions/AddEditQuestionModal";
import CreateAssessmentModal from "../components/questions/CreateQuizModal";
import BulkUploadModal from "../components/questions/BulkUploadModal";
import KpiCard from "@/components/shared/KpiCard";


export default function QuestionsPage() {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const questionEntity = new Question();
  const optionEntity = new Option();

  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [paginatedQuestions, setPaginatedQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(10);
  const [totalQuestions, setTotalQuestions] = useState(0);


  const applyFilters = useCallback(() => {
    let filtered = [...questions];

    if (filters.search) {
      filtered = filtered.filter(q =>
        q.question_text?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.level) {
      filtered = filtered.filter(q => q.level === filters.level);
    }

    if (filters.subject) {
      filtered = filtered.filter(q => String(q.subject_id) === filters.subject);
    }

    if (filters.competency) {
      filtered = filtered.filter(q => String(q.competency_id) === filters.competency);
    }

    if (filters.course) {
      filtered = filtered.filter(q => String(q.course?.id) === filters.course);
    }

    if (filters.program) {
      filtered = filtered.filter(q => String(q.program?.id) === filters.program);
    }

    if (filters.year) {
      filtered = filtered.filter(q => q.subject?.year?.toString() === filters.year);
    }

    if (filters.tag) {
      filtered = filtered.filter(q =>
        q.tags?.some(tag => tag.name?.toLowerCase().includes(filters.tag.toLowerCase()))
      );
    }

    setFilteredQuestions(filtered);
    setTotalQuestions(filtered.length);

    const indexOfLastQuestion = currentPage * questionsPerPage;
    const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
    const currentQuestions = filtered.slice(indexOfFirstQuestion, indexOfLastQuestion);
    setPaginatedQuestions(currentQuestions);
  }, [questions, filters, currentPage, questionsPerPage]);


  useEffect(() => {
    loadQuestions();
    setShowAddModal(false);
    setShowCreateQuizModal(false);
    setShowBulkUploadModal(false);
    setEditingQuestion(null);
  }, []);


  useEffect(() => {
    applyFilters();
  }, [applyFilters]);


  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      // Optimized fetching: Single query with all relations
      // Eliminates the N+1 problem from the previous implementation
      const questionsWithDetails = await questionEntity.listWithDetails("created_at", false);
      setQuestions(questionsWithDetails || []);

    } catch (error) {
      console.error("Error loading questions:", error);
      toast({ variant: "destructive", description: "Failed to load questions." });
    } finally {
      setIsLoading(false);
    }
  };


  const handleDeleteSelected = async (questionIds) => {
    const idsToDelete = questionIds && questionIds.length > 0 ? questionIds : selectedQuestions;
    if (idsToDelete.length === 0) return;

    const confirmDelete = window.confirm(`Are you sure you want to delete ${idsToDelete.length} question(s)?`);
    if (!confirmDelete) return;

    try {
      for (const questionId of idsToDelete) {
        // Cascade delete options first
        const options = await optionEntity.filter({ question_id: questionId });
        for (const option of options) {
          await optionEntity.delete(option.id);
        }
        await questionEntity.delete(questionId);
      }

      setSelectedQuestions([]);
      loadQuestions();
      toast({ description: "Questions deleted successfully." });
    } catch (error) {
      console.error("Error deleting questions:", error);
      toast({ variant: "destructive", description: "Error deleting questions. Please try again." });
    }
  };

  const handleSelectQuestion = (questionId, checked) => {
    if (checked) {
      setSelectedQuestions(prev => [...prev, questionId]);
    } else {
      setSelectedQuestions(prev => prev.filter(id => id !== questionId));
    }
  };

  const handleCreateQuiz = () => {
    if (selectedQuestions.length === 0) {
      toast({ variant: "destructive", description: "Please select some questions first" });
      return;
    }
    setShowCreateQuizModal(true);
  };


  const handleQuizCreated = () => {
    setSelectedQuestions([]);
    toast({ description: "Assessment created successfully! Check the Active Assessments section to see your assessment." });
  };


  const handleExportCSV = () => {
    if (filteredQuestions.length === 0) {
      toast({ variant: "destructive", description: "No questions to export" });
      return;
    }

    const csvData = filteredQuestions.map(q => ({
      'program_name': q.program?.name || '',
      'course_name': q.course?.name || '',
      'subject_name': q.subject?.name || '',
      'subject_year': q.subject?.year || '',
      'question_text': q.question_text,
      'level': q.level || '',
      'positive_marks': q.positive_marks || 1,
      'explanation': q.solution_explanation || q.explanation || '',
      'option_a_text': q.options?.find(opt => opt.option_label === 'A')?.option_text || '',
      'option_b_text': q.options?.find(opt => opt.option_label === 'B')?.option_text || '',
      'option_c_text': q.options?.find(opt => opt.option_label === 'C')?.option_text || '',
      'option_d_text': q.options?.find(opt => opt.option_label === 'D')?.option_text || '',
      'correct_option_label': q.options?.find(opt => opt.is_correct)?.option_label || '',
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'questions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const getSelectedQuestionObjects = () => {
    // Robust mapping from IDs to full objects using the master questions list
    // Handles string/number ID mismatches and works regardless of current filters/pagination
    return questions.filter(q =>
      selectedQuestions.some(id => String(id) === String(q.id))
    );
  };

  const handleEditQuestion = (question) => {
    if (question === null) {
      setShowAddModal(true);
    } else {
      setEditingQuestion(question);
    }
  };


  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1>Question Bank</h1>
          <p className="text-description">Manage your educational assessment items and resources</p>
        </div>

        <div className="flex flex-wrap gap-2 md:gap-3 w-full lg:w-auto">
          {/* Mobile Actions Group */}
          <div className="grid grid-cols-2 gap-2 w-full md:flex md:w-auto">
            <Button variant="outline" onClick={handleExportCSV} disabled={filteredQuestions.length === 0} className="w-full md:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={() => setShowBulkUploadModal(true)} className="w-full md:w-auto">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full md:w-auto">
            {selectedQuestions.length > 0 && (
              <>
                <Button
                  onClick={handleCreateQuiz}
                  variant="primary"
                  className="flex-1 md:flex-none"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Assessment ({selectedQuestions.length})
                </Button>
                <Button variant="destructive" onClick={() => handleDeleteSelected()} className="flex-1 md:flex-none">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete ({selectedQuestions.length})
                </Button>
              </>
            )}
            <Button onClick={() => handleEditQuestion(null)} variant="secondary" className="flex-1 md:flex-none">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>
      </div>


      {/* Stats Ribbon */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-2 mb-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{questions.length}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Total Questions</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center w-[44px] h-[44px]">
            <span className="font-black text-lg">E</span>
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{questions.filter(q => q.level === 'easy').length}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Easy Level</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center w-[44px] h-[44px]">
            <span className="font-black text-lg">M</span>
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{questions.filter(q => q.level === 'medium').length}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Medium Level</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 py-3 min-w-max">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center w-[44px] h-[44px]">
            <span className="font-black text-lg">H</span>
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{questions.filter(q => q.level === 'hard').length}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Hard Level</p>
          </div>
        </div>
      </div>


      {/* Search and Filters */}
      <SearchFilter onFiltersChange={setFilters} activeFilters={filters} />


      {/* Data Display - Conditional Render based on Mobile/Desktop */}
      <div className="mt-8 pb-10">
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-44 w-full bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : isMobile ? (
          <div className="space-y-4">
            {paginatedQuestions.length === 0 ? (
              <div className="text-center py-10 text-slate-500">No questions found.</div>
            ) : (
              paginatedQuestions.map(question => (
                <MobileQuestionCard
                  key={question.id}
                  question={question}
                  isSelected={selectedQuestions.includes(question.id)}
                  onSelect={handleSelectQuestion}
                  onEdit={handleEditQuestion}
                  onDelete={handleDeleteSelected}
                />
              ))
            )}
          </div>
        ) : (
          <QuestionTable
            questions={paginatedQuestions}
            selectedQuestions={selectedQuestions}
            onSelectionChange={setSelectedQuestions}
            onEditQuestion={handleEditQuestion}
            onDeleteQuestions={handleDeleteSelected}
            isLoading={false}
          />
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-4">
        <div className="text-xs md:text-sm text-slate-600">
          Showing {Math.min(totalQuestions, (currentPage - 1) * questionsPerPage + 1)}-{Math.min(totalQuestions, currentPage * questionsPerPage)} of {totalQuestions} questions
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm font-medium px-2">Page {currentPage}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalQuestions / questionsPerPage), prev + 1))}
            disabled={currentPage === Math.ceil(totalQuestions / questionsPerPage)}
          >
            Next
          </Button>
        </div>
      </div>


      {/* Add/Edit Question Modal */}
      <AddEditQuestionModal
        isOpen={showAddModal || editingQuestion !== null}
        onClose={() => {
          console.log("Closing AddEditQuestionModal");
          setShowAddModal(false);
          setEditingQuestion(null);
        }}
        question={editingQuestion}
        onSave={() => {
          console.log("Saving from AddEditQuestionModal");
          loadQuestions();
          setShowAddModal(false);
          setEditingQuestion(null);
          toast({ description: "Question saved successfully." });
        }}
      />


      {/* Create Assessment Modal */}
      <CreateAssessmentModal
        isOpen={showCreateQuizModal}
        onClose={() => setShowCreateQuizModal(false)}
        selectedQuestions={getSelectedQuestionObjects()}
        onAssessmentCreated={handleQuizCreated}
      />


      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        onUploadComplete={() => {
          loadQuestions();
          setShowBulkUploadModal(false);
        }}
      />
    </div>
  );
}