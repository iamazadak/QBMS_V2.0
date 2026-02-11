import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Trophy, FileText, Calendar, Search, TrendingUp, Target } from "lucide-react";
import { AttemptedTest, Exam, User } from "@/entities/all";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";


export default function AttemptedTestsPage() {
  const [attemptedTests, setAttemptedTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // 10 items per page
  const isMobile = useIsMobile();


  useEffect(() => {
    loadData();
  }, []);


  const loadData = async () => {
    setIsLoading(true);
    try {
      // Get current user
      const user = await User.me();
      setCurrentUser(user);

      // Load attempted tests for current user
      const attempts = await AttemptedTest.filter({ user_email: user.email });

      // Load exam details for each attempt
      const attemptsWithExams = await Promise.all(
        attempts.map(async (attempt) => {
          try {
            const exam = await Exam.get(attempt.exam_id);
            return {
              ...attempt,
              exam
            };
          } catch (error) {
            console.warn(`Exam not found for attempt ${attempt.id}:`, error);
            return {
              ...attempt,
              exam: null
            };
          }
        })
      );

      setAttemptedTests(attemptsWithExams.filter(a => a.exam !== null));
    } catch (error) {
      console.error("Error loading attempted tests:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const filteredTests = attemptedTests.filter(attempt =>
    attempt.exam?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attempt.exam?.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const paginatedTests = filteredTests.slice(indexOfFirst, indexOfLast);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);


  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };


  const getScoreBadgeColor = (percentage) => {
    if (percentage >= 80) return "bg-green-100 text-green-800";
    if (percentage >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };


  const calculateStats = () => {
    if (attemptedTests.length === 0) return { avgScore: 0, totalTests: 0, bestScore: 0, totalTime: 0 };

    const avgScore = attemptedTests.reduce((sum, test) => sum + (test.percentage || 0), 0) / attemptedTests.length;
    const bestScore = Math.max(...attemptedTests.map(test => test.percentage || 0));
    const totalTime = attemptedTests.reduce((sum, test) => sum + (test.time_taken_minutes || 0), 0);

    return {
      avgScore: Math.round(avgScore),
      totalTests: attemptedTests.length,
      bestScore: Math.round(bestScore),
      totalTime
    };
  };


  const stats = calculateStats();


  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="text-slate-600 ml-4">Loading attempted tests...</p>
        </div>
      </div>
    );
  }


  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Attempted Assessments</h1>
        <p className="text-slate-500 font-medium text-base">Track your assessment performance and academic progress</p>
      </div>


      {/* Stats Ribbon */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-2 mb-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{stats.totalTests}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Total Assessments</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{stats.avgScore}%</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Average Score</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{stats.bestScore}%</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Best Score</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 py-3 min-w-max">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{Math.round(stats.totalTime / 60)}h</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Total Time</p>
          </div>
        </div>
      </div>


      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search attempted assessments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-white border-slate-200 focus:ring-2 focus:ring-teal-500/20 rounded-xl"
          />
        </div>
      </div>


      {/* Tests List */}
      {filteredTests.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No attempted assessments found</h3>
            <p className="text-slate-600 mb-6">Start taking assessments to see your performance history here</p>
            <Button variant="primary">
              <FileText className="w-4 h-4 mr-2" />
              Browse Available Assessments
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedTests.map((attempt) => (
              <Card key={attempt.id} className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {attempt.exam?.title || "Assessment"}
                        </h3>
                        <Badge variant="secondary" className={getScoreBadgeColor(attempt.percentage)}>
                          {attempt.percentage?.toFixed(1)}%
                        </Badge>
                      </div>

                      {attempt.exam?.description && (
                        <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                          {attempt.exam.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4" />
                          <span>{attempt.score}/{attempt.max_score} marks</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{attempt.time_taken_minutes} minutes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(attempt.completed_at || attempt.created_date), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{attempt.exam?.total_questions || 0} questions</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Retake Assessment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-4">
            <div className="text-sm text-slate-600">
              Showing {Math.min(filteredTests.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredTests.length, currentPage * itemsPerPage)} of {filteredTests.length} attempted assessments
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
              <span className="text-sm font-medium px-2">Page {currentPage} of {Math.ceil(filteredTests.length / itemsPerPage) || 1}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredTests.length / itemsPerPage), prev + 1))}
                disabled={currentPage === Math.ceil(filteredTests.length / itemsPerPage) || filteredTests.length === 0}
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
