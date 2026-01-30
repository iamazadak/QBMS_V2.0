
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { QuestionPaper, Subject, Course, Program } from '@/entities/all';
import QuestionPaperTable from '../components/papertemplates/QuestionPaperTable';
import CreatedQuestionPaperSearchFilter from '../components/papertemplates/CreatedQuestionPaperSearchFilter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Filter,
  CheckCircle2,
  Clock,
  BookOpen
} from 'lucide-react';

const questionPaperEntity = new QuestionPaper();
const subjectEntity = new Subject();
const courseEntity = new Course();
const programEntity = new Program();

const CreatedQuestionPapersPage = () => {
  const { toast } = useToast();
  const [questionPapers, setQuestionPapers] = useState([]);
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [papersPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
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

  const filteredQuestionPapers = useMemo(() => {
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

    return filtered;
  }, [questionPapers, filters]);

  const paginatedQuestionPapers = useMemo(() => {
    const indexOfLastPaper = currentPage * papersPerPage;
    const indexOfFirstPaper = indexOfLastPaper - papersPerPage;
    return filteredQuestionPapers.slice(indexOfFirstPaper, indexOfLastPaper);
  }, [filteredQuestionPapers, currentPage, papersPerPage]);

  const totalPages = Math.ceil(filteredQuestionPapers.length / papersPerPage);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question paper?")) return;
    try {
      await questionPaperEntity.delete(id);
      loadQuestionPapers();
      toast({ description: "Question paper deleted successfully." });
    } catch (error) {
      toast({ variant: "destructive", description: "Failed to delete question paper." });
    }
  };

  const stats = useMemo(() => ({
    total: questionPapers.length,
    recent: questionPapers.filter(p => {
      const createdDate = new Date(p.created_at);
      const now = new Date();
      const diffDays = Math.ceil(Math.abs(now - createdDate) / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length
  }), [questionPapers]);

  return (
    <div className="max-w-[1600px] mx-auto p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-indigo-700" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Created Question Papers</h1>
          </div>
          <p className="text-slate-500 font-medium text-lg">Manage and download your generated question papers</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="bg-white rounded-3xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden group">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-indigo-50 rounded-2xl group-hover:bg-indigo-600 transition-colors duration-300">
                  <FileText className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Storage</span>
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900">{stats.total}</p>
                <p className="text-slate-500 text-sm font-semibold mt-1">Total PDFs Created</p>
              </div>
            </div>
            <div className="h-1.5 w-full bg-indigo-600"></div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden group">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-50 rounded-2xl group-hover:bg-emerald-600 transition-colors duration-300">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">New</span>
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900">{stats.recent}</p>
                <p className="text-slate-500 text-sm font-semibold mt-1">Created this week</p>
              </div>
            </div>
            <div className="h-1.5 w-full bg-emerald-600"></div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm mb-8">
        <CreatedQuestionPaperSearchFilter onFiltersChange={setFilters} activeFilters={filters} filterData={filterData} />
      </div>

      {/* Table Section */}
      <Card className="bg-white border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden">
        <CardContent className="p-0">
          <QuestionPaperTable
            questionPapers={paginatedQuestionPapers}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Pagination Section */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4 bg-white p-4 rounded-2xl border border-slate-100">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Showing <span className="text-slate-900">{Math.min(filteredQuestionPapers.length, (currentPage - 1) * papersPerPage + 1)}</span> to <span className="text-slate-900">{Math.min(filteredQuestionPapers.length, currentPage * papersPerPage)}</span> of <span className="text-slate-900">{filteredQuestionPapers.length}</span> papers
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="rounded-xl border-slate-100 hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center gap-1 mx-2">
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg p-0 font-bold ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-400 hover:text-slate-900'}`}
                >
                  {i + 1}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="rounded-xl border-slate-100 hover:bg-slate-50 disabled:opacity-30"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatedQuestionPapersPage;
