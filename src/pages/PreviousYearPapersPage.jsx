import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Archive, Search, Calendar, FileText, Clock, Users, Download, Eye, Star } from "lucide-react";
import { Exam, Subject, Course, Program } from "@/entities/all";
import { useIsMobile } from "@/hooks/use-mobile";


export default function PreviousYearPapersPage() {
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [paginatedPapers, setPaginatedPapers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // 3x3 grid
  const isMobile = useIsMobile();


  const generateMockPreviousYearPapers = useCallback(() => {
    return [
      {
        id: "pyp_1",
        title: "Computer Science 2023 Final Exam",
        year: 2023,
        subject: "Computer Science",
        course: "B.Tech Computer Science",
        total_questions: 50,
        total_marks: 100,
        duration_minutes: 180,
        difficulty: "medium",
        exam_type: "previous_year",
        attempts: 245,
        average_score: 78.5,
        created_date: "2023-12-15T00:00:00Z"
      },
      {
        id: "pyp_2",
        title: "Mathematics 2022 Semester Exam",
        year: 2022,
        subject: "Mathematics",
        course: "B.Sc Mathematics",
        total_questions: 40,
        total_marks: 80,
        duration_minutes: 120,
        difficulty: "hard",
        exam_type: "previous_year",
        attempts: 189,
        average_score: 65.2,
        created_date: "2022-11-20T00:00:00Z"
      },
      {
        id: "pyp_3",
        title: "Physics 2023 Mid-term",
        year: 2023,
        subject: "Physics",
        course: "B.Sc Physics",
        total_questions: 35,
        total_marks: 70,
        duration_minutes: 150,
        difficulty: "medium",
        exam_type: "previous_year",
        attempts: 156,
        average_score: 72.8,
        created_date: "2023-07-10T00:00:00Z"
      },
      {
        id: "pyp_4",
        title: "Chemistry 2021 Annual Exam",
        year: 2021,
        subject: "Chemistry",
        course: "B.Sc Chemistry",
        total_questions: 45,
        total_marks: 90,
        duration_minutes: 165,
        difficulty: "hard",
        exam_type: "previous_year",
        attempts: 98,
        average_score: 58.9,
        created_date: "2021-12-05T00:00:00Z"
      },
      {
        id: "pyp_5",
        title: "English Literature 2023",
        year: 2023,
        subject: "English",
        course: "BA English Literature",
        total_questions: 30,
        total_marks: 60,
        duration_minutes: 90,
        difficulty: "easy",
        exam_type: "previous_year",
        attempts: 324,
        average_score: 82.1,
        created_date: "2023-05-15T00:00:00Z"
      },
      {
        id: "pyp_6",
        title: "Biology 2022 Practice Paper",
        year: 2022,
        subject: "Biology",
        course: "B.Sc Biology",
        total_questions: 60,
        total_marks: 120,
        duration_minutes: 200,
        difficulty: "medium",
        exam_type: "previous_year",
        attempts: 278,
        average_score: 69.7,
        created_date: "2022-09-30T00:00:00Z"
      }
    ];
  }, []);


  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load exams that are marked as previous year papers
      const exams = await Exam.list("-created_date");
      const previousYearPapers = exams.filter(exam =>
        exam.exam_type === 'previous_year' ||
        exam.title?.toLowerCase().includes('previous year') ||
        exam.title?.toLowerCase().includes('past paper')
      );

      const subjects = await Subject.list();
      setSubjects(subjects);

      // If no specific previous year papers exist, create some mock data for demonstration
      if (previousYearPapers.length === 0) {
        const mockPapers = generateMockPreviousYearPapers();
        setPapers(mockPapers);
      } else {
        setPapers(previousYearPapers);
      }
    } catch (error) {
      console.error("Error loading previous year papers:", error);
      // Fallback to mock data on error
      const mockPapers = generateMockPreviousYearPapers();
      setPapers(mockPapers);
    } finally {
      setIsLoading(false);
    }
  }, [generateMockPreviousYearPapers]);


  const applyFilters = useCallback(() => {
    let filtered = [...papers];


    if (searchTerm) {
      filtered = filtered.filter(paper =>
        paper.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.course?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }


    if (yearFilter !== "all") {
      filtered = filtered.filter(paper => paper.year?.toString() === yearFilter);
    }


    if (subjectFilter !== "all") {
      filtered = filtered.filter(paper =>
        paper.subject?.toLowerCase() === subjectFilter.toLowerCase()
      );
    }


    if (difficultyFilter !== "all") {
      filtered = filtered.filter(paper => paper.difficulty === difficultyFilter);
    }


    setFilteredPapers(filtered);
  }, [papers, searchTerm, yearFilter, subjectFilter, difficultyFilter]);


  useEffect(() => {
    loadData();
  }, [loadData]);


  useEffect(() => {
    applyFilters();
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [applyFilters]);


  // Pagination effect
  useEffect(() => {
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const current = filteredPapers.slice(indexOfFirst, indexOfLast);
    setPaginatedPapers(current);
  }, [filteredPapers, currentPage, itemsPerPage]);


  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      hard: "bg-red-100 text-red-800"
    };
    return colors[difficulty] || "bg-gray-100 text-gray-800";
  };


  const getYearOptions = () => {
    const years = [...new Set(papers.map(paper => paper.year).filter(Boolean))];
    return years.sort((a, b) => b - a);
  };


  const getSubjectOptions = () => {
    const subjects = [...new Set(papers.map(paper => paper.subject).filter(Boolean))];
    return subjects.sort();
  };


  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="text-slate-600 ml-4">Loading previous year papers...</p>
        </div>
      </div>
    );
  }


  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-slate-900`}>Previous Year Papers</h1>
        <p className={`text-slate-600 mt-2 ${isMobile ? 'text-sm' : ''}`}>Practice with authentic exam papers from previous years</p>
      </div>


      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-violet-50 rounded-xl">
                <Archive className="w-6 h-6 text-violet-600" />
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Papers</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{papers.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-emerald-50 rounded-xl">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Years Covered</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{getYearOptions().length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-amber-50 rounded-xl">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Attempts</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{papers.reduce((sum, paper) => sum + (paper.attempts || 0), 0)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-rose-50 rounded-xl">
                <Star className="w-6 h-6 text-rose-600" />
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Avg Score</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {papers.length > 0 ?
                  Math.round(papers.reduce((sum, paper) => sum + (paper.average_score || 0), 0) / papers.length) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search papers by title, subject, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {getYearOptions().map(year => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {getSubjectOptions().map(subject => (
              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>


      {/* Papers Grid */}
      {filteredPapers.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <Archive className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No papers found</h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || yearFilter !== "all" || subjectFilter !== "all" || difficultyFilter !== "all"
                ? "Try adjusting your search filters"
                : "Previous year papers will appear here once added to the system"}
            </p>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Archive className="w-4 h-4 mr-2" />
              Browse All Papers
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
            {paginatedPapers.map((paper) => (
              <Card key={paper.id} className="hover:shadow-lg transition-shadow duration-300 border-slate-200/60">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                        {paper.title}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-teal-600">
                          {paper.year}
                        </Badge>
                        <Badge variant="secondary" className={getDifficultyColor(paper.difficulty)}>
                          {paper.difficulty?.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FileText className="w-4 h-4" />
                      <span>{paper.subject} • {paper.course}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4" />
                      <span>{paper.total_questions} Questions • {paper.duration_minutes ? `${paper.duration_minutes} min` : 'N/A'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="w-4 h-4" />
                      <span>{paper.total_marks} Marks • {paper.attempts || 0} Attempts</span>
                    </div>

                    {paper.average_score && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Star className="w-4 h-4" />
                        <span>Avg Score: {paper.average_score}%</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button className="flex-1 bg-teal-600 hover:bg-teal-700">
                      <FileText className="w-4 h-4 mr-2" />
                      Start Test
                    </Button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <Button variant="ghost" size="sm" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-4">
            <div className="text-sm text-slate-600">
              Showing {Math.min(filteredPapers.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredPapers.length, currentPage * itemsPerPage)} of {filteredPapers.length} papers
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
              <span className="text-sm font-medium px-2">Page {currentPage} of {Math.ceil(filteredPapers.length / itemsPerPage) || 1}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredPapers.length / itemsPerPage), prev + 1))}
                disabled={currentPage === Math.ceil(filteredPapers.length / itemsPerPage) || filteredPapers.length === 0}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}