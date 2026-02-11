import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Clock, FileText, Users, Trophy, Search, Zap, PlayCircle, TrendingUp, Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import KpiCard from "@/components/shared/KpiCard";
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
      const examEntity = new Exam();
      const subjectEntity = new Subject();

      const exams = await examEntity.list("-created_date");
      const subjects = await subjectEntity.list();

      // Create test series by grouping exams by exam_type
      const seriesMap = new Map();

      for (const exam of exams) {
        const seriesKey = exam.exam_type || 'general';

        if (!seriesMap.has(seriesKey)) {
          seriesMap.set(seriesKey, {
            id: seriesKey,
            title: `${exam.exam_type?.replace('_', ' ').toUpperCase() || 'General'} Assessment Series`,
            description: `Collection of ${exam.exam_type?.replace('_', ' ') || 'general'} assessments`,
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
      <div className="p-6">
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
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Assessment Series</h1>
          <p className="text-slate-500 font-medium text-base">Organized collections of assessments and challenges</p>
        </div>

        <Button variant="primary">
          <Plus className="w-4 h-4 mr-2 stroke-[3]" />
          Forge Assessment Series
        </Button>
      </div>


      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Filter assessment series..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-white border-slate-200 focus:ring-2 focus:ring-teal-500/20 rounded-xl"
          />
        </div>
      </div>


      {/* Stats Ribbon */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-2 mb-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{testSeries.length}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Total Series</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{testSeries.reduce((sum, series) => sum + series.tests.length, 0)}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Total Assessments</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{testSeries.reduce((sum, series) => sum + (series.totalQuestions || 0), 0).toLocaleString()}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Total Items</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 py-3 min-w-max">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{testSeries.reduce((sum, series) => sum + (series.totalMarks || 0), 0).toLocaleString()}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Score Pool</p>
          </div>
        </div>
      </div>


      {/* Test Series Grid */}
      {filteredSeries.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No test series found</h3>
            <p className="text-slate-600 mb-6">Create your first test series to organize your exams</p>
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2 stroke-[3]" />
              Forge Assessment Series
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-2 lg:grid-cols-3 gap-8'}`}>
          {filteredSeries.map((series) => (
            <Card key={series.id} className="group hover:shadow-2xl transition-all duration-500 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden bg-white">
              <div className={`h-3 bg-gradient-to-r ${getSeriesColor(series.id)} w-full opacity-80 group-hover:opacity-100 transition-opacity`} />

              <CardHeader className="pb-4 pt-8 px-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest whitespace-nowrap">
                        {series.tests.length} Full Tests
                      </Badge>
                      {series.tests.length > 5 && (
                        <Badge className="bg-teal-500 text-white font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Trending
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-teal-600 transition-colors">
                      {series.title}
                    </CardTitle>
                    <p className="text-slate-400 text-xs font-medium mt-3 leading-relaxed line-clamp-2 italic">
                      {series.description}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-8 pb-8 pt-2">
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100/50 group-hover:bg-white group-hover:border-teal-100 transition-all">
                    <p className="text-sm font-black text-slate-900">{series.totalQuestions}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Questions</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100/50 group-hover:bg-white group-hover:border-teal-100 transition-all">
                    <p className="text-sm font-black text-slate-900">{series.totalMarks}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Max Marks</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-8 px-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold italic">
                    <Clock className="w-4 h-4 text-teal-500/50" />
                    <span>~{series.avgDuration} min / test</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold">
                    <Users className="w-4 h-4 text-indigo-500/50" />
                    <span>Free Access</span>
                  </div>
                </div>

                <Button variant="primary" size="lg" className="w-full group-hover:-translate-y-1">
                  <BookOpen className="w-5 h-5 mr-2" />
                  EXPLORE ARCHIVE
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
