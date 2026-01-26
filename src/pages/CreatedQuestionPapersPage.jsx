
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { QuestionPaper, Subject, Course, Program } from '@/entities/all';
import QuestionPaperTable from '../components/papertemplates/QuestionPaperTable';
import CreatedQuestionPaperSearchFilter from '../components/papertemplates/CreatedQuestionPaperSearchFilter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from 'lucide-react';

const questionPaperEntity = new QuestionPaper();
const subjectEntity = new Subject();
const courseEntity = new Course();
const programEntity = new Program();

const CreatedQuestionPapersPage = () => {
  const { toast } = useToast();
  const [questionPapers, setQuestionPapers] = useState([]);
  const [filteredQuestionPapers, setFilteredQuestionPapers] = useState([]);
  const [paginatedQuestionPapers, setPaginatedQuestionPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [papersPerPage] = useState(10);
  const [totalPapers, setTotalPapers] = useState(0);
  const [filterData, setFilterData] = useState({ subjects: [], courses: [], programs: [], years: [] });

  const loadFilterData = useCallback(async () => {
    try {
      const [subjects, courses, programs] = await Promise.all([
        subjectEntity.list(),
        courseEntity.list(),
        programEntity.list(),
      ]);
      const years = [...new Set(subjects.map(s => s.year))].filter(Boolean);
      setFilterData({ subjects, courses, programs, years });
    } catch (error) {
      toast({ variant: "destructive", description: "Failed to load filter data." });
    }
  }, [toast]);

  const applyFilters = useCallback(() => {
    let filtered = [...questionPapers];

    if (filters.search) {
      filtered = filtered.filter(qp =>
        qp.title?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.subject) {
      filtered = filtered.filter(qp => qp.paper_template?.subject?.id === filters.subject);
    }
    if (filters.course) {
      filtered = filtered.filter(qp => qp.paper_template?.course?.id === filters.course);
    }
    if (filters.program) {
      filtered = filtered.filter(qp => qp.paper_template?.program?.id === filters.program);
    }
    if (filters.year) {
      filtered = filtered.filter(qp => qp.paper_template?.year === filters.year);
    }

    setFilteredQuestionPapers(filtered);
    setTotalPapers(filtered.length);

    const indexOfLastPaper = currentPage * papersPerPage;
    const indexOfFirstPaper = indexOfLastPaper - papersPerPage;
    const currentPapers = filtered.slice(indexOfFirstPaper, indexOfLastPaper);
    setPaginatedQuestionPapers(currentPapers);
  }, [questionPapers, filters, currentPage, papersPerPage]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadQuestionPapers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await questionPaperEntity.list();
      setQuestionPapers(data);
    } catch (error) {
      toast({ variant: "destructive", description: "Failed to load question papers." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadQuestionPapers();
    loadFilterData();
  }, [loadQuestionPapers, loadFilterData]);

  const handleDelete = async (id) => {
    try {
      await questionPaperEntity.delete(id);
      loadQuestionPapers();
      toast({ description: "Question paper deleted successfully." });
    } catch (error) {
      toast({ variant: "destructive", description: "Failed to delete question paper." });
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Created Question Papers</h1>
          <p className="text-slate-600 mt-2">View and manage your created question papers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-violet-50 rounded-xl">
                <FileText className="w-6 h-6 text-violet-600" />
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Papers</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{questionPapers.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <CreatedQuestionPaperSearchFilter onFiltersChange={setFilters} activeFilters={filters} filterData={filterData} />

      <QuestionPaperTable
        questionPapers={paginatedQuestionPapers}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <div className="flex justify-between items-center mt-8">
        <div className="text-sm text-slate-600">
          Showing {Math.min(totalPapers, (currentPage - 1) * papersPerPage + 1)}-{Math.min(totalPapers, currentPage * papersPerPage)} of {totalPapers} papers
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {[...Array(Math.ceil(totalPapers / papersPerPage))].map((_, i) => (
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
            onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalPapers / papersPerPage), prev + 1))}
            disabled={currentPage === Math.ceil(totalPapers / papersPerPage)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreatedQuestionPapersPage;
