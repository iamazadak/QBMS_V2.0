import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Trophy, FileText, Calendar, Search, TrendingUp, Target } from "lucide-react";
import { AttemptedTest, Exam, User } from "@/entities/all";
import { format } from "date-fns";


export default function AttemptedTestsPage() {
  const [attemptedTests, setAttemptedTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);


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
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 ml-4">Loading attempted tests...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Attempted Tests</h1>
        <p className="text-slate-600 mt-2">Track your test performance and progress</p>
      </div>


      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Tests</p>
                <p className="text-2xl font-bold">{stats.totalTests}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
       
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Average Score</p>
                <p className="text-2xl font-bold">{stats.avgScore}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
       
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Best Score</p>
                <p className="text-2xl font-bold">{stats.bestScore}%</p>
              </div>
              <Target className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
       
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Total Time</p>
                <p className="text-2xl font-bold">{Math.round(stats.totalTime / 60)}h</p>
              </div>
              <Clock className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search attempted tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>


      {/* Tests List */}
      {filteredTests.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No attempted tests found</h3>
            <p className="text-slate-600 mb-6">Start taking tests to see your performance history here</p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <FileText className="w-4 h-4 mr-2" />
              Browse Available Tests
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTests.map((attempt) => (
            <Card key={attempt.id} className="hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {attempt.exam?.title || "Test"}
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
                      Retake Test
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
