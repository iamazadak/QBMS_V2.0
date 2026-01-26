import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Clock, FileText, Users, Trophy, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Exam, Subject } from "@/entities/all";
import { useIsMobile } from "@/hooks/use-mobile";


export default function TestSeriesPage() {
  const [testSeries, setTestSeries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();


  useEffect(() => {
    loadTestSeries();
  }, []);


  const loadTestSeries = async () => {
    setIsLoading(true);
    try {
      // Group exams by subject to create test series
      const exams = await Exam.list("-created_date");
      const subjects = await Subject.list();

      // Create test series by grouping exams by exam_type
      const seriesMap = new Map();

      for (const exam of exams) {
        const seriesKey = exam.exam_type || 'general';

        if (!seriesMap.has(seriesKey)) {
          seriesMap.set(seriesKey, {
            id: seriesKey,
            title: `${exam.exam_type?.replace('_', ' ').toUpperCase() || 'General'} Test Series`,
            description: `Collection of ${exam.exam_type?.replace('_', ' ') || 'general'} tests`,
            tests: [],
            totalQuestions: 0,
            totalMarks: 0,
            avgDuration: 0,
            subjects: new Set()
          });
        }

        const series = seriesMap.get(seriesKey);
        series.tests.push(exam);
        series.totalQuestions += exam.total_questions || 0;
        series.totalMarks += exam.total_marks || 0;
      }

      // Calculate averages and convert to array
      const seriesArray = Array.from(seriesMap.values()).map(series => ({
        ...series,
        avgDuration: series.tests.length > 0 ? Math.round(series.tests.reduce((sum, test) => sum + (Number(test.duration_minutes) || 0), 0) / series.tests.length) : 0,
        subjects: Array.from(series.subjects)
      }));

      setTestSeries(seriesArray);
    } catch (error) {
      console.error("Error loading test series:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const filteredSeries = testSeries.filter(series =>
    series.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    series.description.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const getSeriesColor = (seriesId) => {
    const colors = {
      practice: "from-teal-500 to-teal-600",
      mock_test: "from-purple-500 to-purple-600",
      live_test: "from-red-500 to-red-600",
      previous_year: "from-orange-500 to-orange-600"
    };
    return colors[seriesId] || "from-gray-500 to-gray-600";
  };


  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="text-slate-600 ml-4">Loading test series...</p>
        </div>
      </div>
    );
  }


  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-slate-900`}>Test Series</h1>
          <p className={`text-slate-600 mt-2 ${isMobile ? 'text-sm' : ''}`}>Organized collections of tests and quizzes</p>
        </div>

        <Button className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Test Series
        </Button>
      </div>


      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search test series..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>


      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-violet-50 rounded-xl">
                <BookOpen className="w-6 h-6 text-violet-600" />
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Series</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{testSeries.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-emerald-50 rounded-xl">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Tests</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{testSeries.reduce((sum, series) => sum + series.tests.length, 0)}</p>
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
              <p className="text-slate-500 text-sm font-medium">Total Questions</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{testSeries.reduce((sum, series) => sum + series.totalQuestions, 0)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-rose-50 rounded-xl">
                <Trophy className="w-6 h-6 text-rose-600" />
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Marks</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{testSeries.reduce((sum, series) => sum + series.totalMarks, 0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Test Series Grid */}
      {filteredSeries.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No test series found</h3>
            <p className="text-slate-600 mb-6">Create your first test series to organize your exams</p>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Test Series
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
          {filteredSeries.map((series) => (
            <Card key={series.id} className="hover:shadow-lg transition-shadow duration-300 border-slate-200/60 overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${getSeriesColor(series.id)}`} />

              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-slate-900 mb-2">
                      {series.title}
                    </CardTitle>
                    <p className="text-slate-600 text-sm">
                      {series.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {series.tests.length} Tests
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-lg font-bold text-slate-900">{series.totalQuestions}</p>
                    <p className="text-xs text-slate-600">Questions</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-lg font-bold text-slate-900">{series.totalMarks}</p>
                    <p className="text-xs text-slate-600">Total Marks</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                  <Clock className="w-4 h-4" />
                  <span>Avg. {series.avgDuration} minutes per test</span>
                </div>

                <Button variant="outline" className="w-full">
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Test Series
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
