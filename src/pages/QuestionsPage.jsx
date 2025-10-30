import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload, Trash2, FileText, Trophy } from "lucide-react";
import { Question, Option, Subject, Course, Program } from "@/entities/all";
import { useToast } from "@/components/ui/use-toast";


import SearchFilter from "../components/questions/SearchFilter";
import QuestionTable from "../components/questions/QuestionTable";
import AddEditQuestionModal from "../components/questions/AddEditQuestionModal";
import CreateQuizModal from "../components/questions/CreateQuizModal";
import BulkUploadModal from "../components/questions/BulkUploadModal";


export default function QuestionsPage() {
  const { toast } = useToast();

  const questionEntity = new Question();
  const optionEntity = new Option();
  const subjectEntity = new Subject();
  const courseEntity = new Course();
  const programEntity = new Program();

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
  const [questionsPerPage] = useState(10); // You can adjust this value
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

    if (filters.course) {
      filtered = filtered.filter(q => String(q.course?.id) === filters.course);
    }

    if (filters.program) {
      filtered = filtered.filter(q => String(q.program?.id) === filters.program);
    }

    if (filters.year) {
      filtered = filtered.filter(q => q.subject?.year?.toString() === filters.year);
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
    // Explicitly close all modals on mount to prevent continuous visibility issues
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
      const questionsData = await questionEntity.list("created_at", false);
     
      // Load related data for each question with proper error handling
      const questionsWithDetails = await Promise.all(
        questionsData.map(async (question) => {
          try {
            // Load options for this question
            const options = await optionEntity.filter({ question_id: question.id });
            console.log(`Options for question ${question.id}:`, options);
           
            // Load subject with error handling
            let subject = null;
            let course = null;
            let program = null;
           
            if (question.subject_id) {
              try {
                subject = await subjectEntity.get(question.subject_id);
               
                // Load course if subject exists
                if (subject && subject.course_id) {
                  try {
                    course = await courseEntity.get(subject.course_id);
                   
                    // Load program if course exists
                    if (course && course.program_id) {
                      try {
                        program = await programEntity.get(course.program_id);
                      } catch (error) {
                        console.warn(`Program not found for course ${course.id}:`, error);
                      }
                    }
                  } catch (error) {
                    console.warn(`Course not found for subject ${subject.id}:`, error);
                  }
                }
              } catch (error) {
                console.warn(`Subject not found for question ${question.id}:`, error);
              }
            }
           
            return {
              ...question,
              options: options || [],
              subject,
              course,
              program
            };
          } catch (error) {
            console.error(`Error loading details for question ${question.id}:`, error);
            console.log("Question options for debugging:", question.options);
            console.log("Is correct option found:", question.options?.find(opt => opt.is_correct));
            return {
              ...question,
              options: [],
              subject: null,
              course: null,
              program: null
            };
          }
        })
      );
     
      setQuestions(questionsWithDetails);
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
      // Delete options first, then questions
      for (const questionId of idsToDelete) {
        const options = await optionEntity.filter({ question_id: questionId });
        for (const option of options) {
          await optionEntity.delete(option.id);
        }
        await questionEntity.delete(questionId);
      }

      setSelectedQuestions([]);
      loadQuestions();
    } catch (error) {
      console.error("Error deleting questions:", error);
      toast({ variant: "destructive", description: "Error deleting questions. Please try again." });
    }
  };


  const handleCreateQuiz = () => {
    if (selectedQuestions.length === 0) {
      toast({ variant: "destructive", description: "Please select some questions first" });
      return;
    }
   
    const selectedQuestionObjects = filteredQuestions.filter(q =>
      selectedQuestions.includes(q.id)
    );
   
    setShowCreateQuizModal(true);
  };


  const handleQuizCreated = () => {
    setSelectedQuestions([]);
    toast({ description: "Quiz created successfully! Check the Live Tests section to see your quiz." });
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
      'explanation': q.explanation || '',
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
    return filteredQuestions.filter(q => selectedQuestions.includes(q.id));
  };


  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Question Bank</h1>
          <p className="text-slate-600 mt-2">Manage your educational questions and answers</p>
        </div>
       
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleExportCSV} disabled={filteredQuestions.length === 0} className="text-sm px-6 rounded-lg justify-center hover:bg-emerald-500 hover:text-white hover:scale-105 transition-transform">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => setShowBulkUploadModal(true)} className="text-sm px-6 rounded-lg justify-center hover:bg-emerald-500 hover:text-white hover:scale-105 transition-transform">
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>
          {selectedQuestions.length > 0 && (
            <>
                            <Button 
                              onClick={handleCreateQuiz} 
                              variant="default"
                              className="text-sm px-6 rounded-lg justify-center hover:bg-emerald-500 hover:text-white hover:scale-105 transition-transform"
                            >
                              <Trophy className="w-4 h-4 mr-2" />
                              Create Quiz ({selectedQuestions.length})
                            </Button>              <Button variant="destructive" onClick={() => handleDeleteSelected()} className="text-sm px-6 rounded-lg justify-center hover:bg-emerald-500 hover:text-white hover:scale-105 transition-transform">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedQuestions.length})
              </Button>
            </>
          )}
          <Button onClick={() => setShowAddModal(true)} variant="default" className="text-sm px-6 rounded-lg justify-center hover:bg-emerald-500 hover:text-white hover:scale-105 transition-transform">
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Questions</p>
              <p className="text-2xl font-bold">{questions.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-200" />
          </div>
        </div>
       
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Easy Questions</p>
              <p className="text-2xl font-bold">{questions.filter(q => q.level === 'easy').length}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">E</span>
            </div>
          </div>
        </div>
       
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Medium Questions</p>
              <p className="text-2xl font-bold">{questions.filter(q => q.level === 'medium').length}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-yellow-200 flex items-center justify-center">
              <span className="text-yellow-600 font-bold text-sm">M</span>
            </div>
          </div>
        </div>
       
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Hard Questions</p>
              <p className="text-2xl font-bold">{questions.filter(q => q.level === 'hard').length}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center">
              <span className="text-red-600 font-bold text-sm">H</span>
            </div>
          </div>
        </div>
      </div>


      {/* Search and Filters */}
      <SearchFilter onFiltersChange={setFilters} activeFilters={filters} />


      {/* Question Table */}
      <QuestionTable
        questions={paginatedQuestions}
        selectedQuestions={selectedQuestions}
        onSelectionChange={setSelectedQuestions}
        onEditQuestion={setEditingQuestion}
        onDeleteQuestions={handleDeleteSelected}
        isLoading={isLoading}
      />

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-8">
        <div className="text-sm text-slate-600">
          Showing {Math.min(totalQuestions, (currentPage - 1) * questionsPerPage + 1)}-{Math.min(totalQuestions, currentPage * questionsPerPage)} of {totalQuestions} questions
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {[...Array(Math.ceil(totalQuestions / questionsPerPage))].map((_, i) => (
            <Button
              key={i + 1}
              variant={currentPage === i + 1 ? "default" : "outline"}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="outline"
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
          setShowAddModal(false);
          setEditingQuestion(null);
        }}
        question={editingQuestion}
        onSave={() => {
          loadQuestions();
          setShowAddModal(false);
          setEditingQuestion(null);
          toast({ description: "Question saved successfully." });
        }}
      />


      {/* Create Quiz Modal */}
      <CreateQuizModal
        isOpen={showCreateQuizModal}
        onClose={() => setShowCreateQuizModal(false)}
        selectedQuestions={getSelectedQuestionObjects()}
        onQuizCreated={handleQuizCreated}
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