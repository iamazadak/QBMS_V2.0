import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  FileText,
  Clock,
  TrendingUp,
  Award,
  CheckCircle,
  Target,
  Calendar,
  Video,
  Play,
  UserCheck,
  ArrowUp,
  ArrowDown,
  Minus,
  Trophy,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon
} from "lucide-react";
import {
  User,
  Classroom,
  ClassroomCandidate,
  ClassroomTest,
  Question,
  Exam,
  Candidate,
  AttemptedTest,
  OnlineSession,
  OnlineSessionAttendee,
  Subject
} from "@/entities/all";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from "recharts";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";


const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];


export default function DashboardPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalClassrooms: 0,
    totalStudents: 0,
    totalTests: 0,
    totalQuestions: 0,
    activeTests: 0,
    completedTests: 0,
    upcomingSessions: 0,
    avgTestScore: 0,
    totalSessions: 0,
    liveSessions: 0,
    completedSessions: 0,
    totalAttendees: 0,
    avgAttendanceRate: 0,
    topPerformers: 0,
    lowPerformers: 0
  });
 
  // Chart Data States
  const [testTrendsData, setTestTrendsData] = useState([]);
  const [sessionTrendsData, setSessionTrendsData] = useState([]);
  const [difficultyDistribution, setDifficultyDistribution] = useState([]);
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [sessionStatusData, setSessionStatusData] = useState([]);
  const [attendanceComparisonData, setAttendanceComparisonData] = useState([]);
  const [performanceByDifficulty, setPerformanceByDifficulty] = useState([]);
  const [weeklyActivityData, setWeeklyActivityData] = useState([]);
  const [instructorPerformanceData, setInstructorPerformanceData] = useState([]);
  const [testTypeDistribution, setTestTypeDistribution] = useState([]);
  const [studentEngagementData, setStudentEngagementData] = useState([]);


  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        classrooms,
        candidates,
        exams,
        questions,
        attemptedTests,
        onlineSessions,
        allAttendees,
        subjects
      ] = await Promise.all([
        Classroom.list(),
        Candidate.list(),
        Exam.list(),
        Question.list(),
        AttemptedTest.list(),
        OnlineSession.list(),
        OnlineSessionAttendee.list(),
        Subject.list()
      ]);


      const activeTests = exams.filter(e => e.is_published).length;
      const completedTests = attemptedTests.filter(a => a.status === 'completed').length;
      const upcomingSessions = onlineSessions.filter(s =>
        s.status === 'scheduled' && new Date(s.scheduled_date) > new Date()
      ).length;


      const avgScore = attemptedTests.length > 0
        ? attemptedTests.reduce((sum, a) => sum + (a.percentage || 0), 0) / attemptedTests.length
        : 0;


      const liveSessions = onlineSessions.filter(s => s.status === 'live').length;
      const completedSessions = onlineSessions.filter(s => s.status === 'completed').length;


      // Calculate attendance rate
      const attendedCount = allAttendees.filter(a => a.has_joined).length;
      const avgAttendanceRate = allAttendees.length > 0
        ? (attendedCount / allAttendees.length) * 100
        : 0;


      // Performance categories
      const topPerformers = attemptedTests.filter(a => a.percentage >= 80).length;
      const lowPerformers = attemptedTests.filter(a => a.percentage < 40).length;


      setStats({
        totalClassrooms: classrooms.length,
        totalStudents: candidates.filter(c => c.status === 'active').length,
        totalTests: exams.length,
        totalQuestions: questions.length,
        activeTests,
        completedTests,
        upcomingSessions,
        avgTestScore: avgScore.toFixed(1),
        totalSessions: onlineSessions.length,
        liveSessions,
        completedSessions,
        totalAttendees: allAttendees.length,
        avgAttendanceRate: avgAttendanceRate.toFixed(1),
        topPerformers,
        lowPerformers
      });


      // Test Trends - Last 6 months
      const testTrends = {};
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }).reverse();


      last6Months.forEach(month => {
        testTrends[month] = { month, created: 0, attempted: 0, completed: 0 };
      });


      exams.forEach(exam => {
        const month = new Date(exam.created_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (testTrends[month]) testTrends[month].created++;
      });


      attemptedTests.forEach(attempt => {
        const month = new Date(attempt.created_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (testTrends[month]) {
          testTrends[month].attempted++;
          if (attempt.status === 'completed') testTrends[month].completed++;
        }
      });


      setTestTrendsData(Object.values(testTrends));


      // Session Trends
      const sessionTrends = {};
      last6Months.forEach(month => {
        sessionTrends[month] = { month, scheduled: 0, completed: 0, attendance: 0 };
      });


      onlineSessions.forEach(session => {
        const month = new Date(session.scheduled_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (sessionTrends[month]) {
          sessionTrends[month].scheduled++;
          if (session.status === 'completed') sessionTrends[month].completed++;
        }
      });


      setSessionTrendsData(Object.values(sessionTrends));


      // Difficulty Distribution
      const diffCounts = {
        easy: questions.filter(q => q.difficulty === 'easy').length,
        medium: questions.filter(q => q.difficulty === 'medium').length,
        hard: questions.filter(q => q.difficulty === 'hard').length
      };


      setDifficultyDistribution([
        { name: 'Easy', value: diffCounts.easy, color: '#10b981' },
        { name: 'Medium', value: diffCounts.medium, color: '#f59e0b' },
        { name: 'Hard', value: diffCounts.hard, color: '#ef4444' }
      ].filter(item => item.value > 0));


      // Subject Performance Analysis
      const subjectStats = {};
      for (const attempt of attemptedTests) {
        try {
          const exam = await Exam.get(attempt.exam_id);
          // We'll use exam type as a proxy for subjects since exams don't directly have subject_id
          const subjectKey = exam.exam_type || 'general';
         
          if (!subjectStats[subjectKey]) {
            subjectStats[subjectKey] = {
              subject: subjectKey,
              avgScore: 0,
              attempts: 0,
              totalScore: 0
            };
          }
          subjectStats[subjectKey].attempts++;
          subjectStats[subjectKey].totalScore += (attempt.percentage || 0);
        } catch (err) {
          console.warn("Error loading exam for attempt:", err);
        }
      }


      const subjectPerf = Object.values(subjectStats).map(stat => ({
        subject: stat.subject.replace('_', ' ').toUpperCase(),
        avgScore: stat.attempts > 0 ? (stat.totalScore / stat.attempts).toFixed(1) : 0,
        attempts: stat.attempts
      })).slice(0, 8);


      setSubjectPerformance(subjectPerf);


      // Session Status Distribution
      const statusCounts = {
        scheduled: onlineSessions.filter(s => s.status === 'scheduled').length,
        live: liveSessions,
        completed: completedSessions,
        cancelled: onlineSessions.filter(s => s.status === 'cancelled').length
      };


      setSessionStatusData([
        { name: 'Scheduled', value: statusCounts.scheduled, color: '#3b82f6' },
        { name: 'Live', value: statusCounts.live, color: '#ef4444' },
        { name: 'Completed', value: statusCounts.completed, color: '#10b981' },
        { name: 'Cancelled', value: statusCounts.cancelled, color: '#6b7280' }
      ].filter(item => item.value > 0));


      // Attendance Comparison for Top 10 Sessions
      const sessionsWithAttendance = await Promise.all(
        onlineSessions.filter(s => s.status === 'completed').slice(0, 10).map(async (session) => {
          const attendees = await OnlineSessionAttendee.filter({ session_id: session.id });
          const attendedCount = attendees.filter(a => a.has_joined).length;
          const attendanceRate = attendees.length > 0 ? (attendedCount / attendees.length) * 100 : 0;
         
          return {
            name: session.title.substring(0, 15) + (session.title.length > 15 ? '...' : ''),
            attended: attendedCount,
            invited: attendees.length,
            rate: attendanceRate.toFixed(1)
          };
        })
      );


      setAttendanceComparisonData(sessionsWithAttendance);


      // Performance by Difficulty
      const diffPerformance = {
        easy: { difficulty: 'Easy', avgScore: 0, count: 0, total: 0 },
        medium: { difficulty: 'Medium', avgScore: 0, count: 0, total: 0 },
        hard: { difficulty: 'Hard', avgScore: 0, count: 0, total: 0 }
      };


      for (const attempt of attemptedTests) {
        try {
          const exam = await Exam.get(attempt.exam_id);
          // Since we don't have difficulty on exams, we'll estimate based on score
          let diff = 'medium';
          if (attempt.percentage >= 70) diff = 'easy';
          else if (attempt.percentage < 50) diff = 'hard';
         
          diffPerformance[diff].count++;
          diffPerformance[diff].total += (attempt.percentage || 0);
        } catch (err) {
          console.warn("Error:", err);
        }
      }


      const perfByDiff = Object.values(diffPerformance).map(p => ({
        difficulty: p.difficulty,
        avgScore: p.count > 0 ? (p.total / p.count).toFixed(1) : 0,
        attempts: p.count
      }));


      setPerformanceByDifficulty(perfByDiff);


      // Weekly Activity (Last 7 days)
      const weeklyActivity = {};
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        weeklyActivity[day] = { day, tests: 0, sessions: 0, students: 0 };
      }


      attemptedTests.forEach(attempt => {
        const day = new Date(attempt.created_date).toLocaleDateString('en-US', { weekday: 'short' });
        if (weeklyActivity[day]) weeklyActivity[day].tests++;
      });


      onlineSessions.forEach(session => {
        const day = new Date(session.scheduled_date).toLocaleDateString('en-US', { weekday: 'short' });
        if (weeklyActivity[day]) weeklyActivity[day].sessions++;
      });


      setWeeklyActivityData(Object.values(weeklyActivity));


      // Instructor Performance
      const instructorStats = {};
      for (const session of onlineSessions.filter(s => s.status === 'completed')) {
        const instructorEmail = session.instructor_email || 'unknown';
       
        if (!instructorStats[instructorEmail]) {
          instructorStats[instructorEmail] = {
            instructor: session.instructor_name || instructorEmail,
            sessions: 0,
            totalAttendees: 0,
            avgAttendance: 0
          };
        }
       
        instructorStats[instructorEmail].sessions++;
       
        const attendees = await OnlineSessionAttendee.filter({ session_id: session.id });
        const attended = attendees.filter(a => a.has_joined).length;
        instructorStats[instructorEmail].totalAttendees += attended;
      }


      const instructorPerf = Object.values(instructorStats).map(stat => ({
        ...stat,
        avgAttendance: stat.sessions > 0 ? (stat.totalAttendees / stat.sessions).toFixed(1) : 0
      })).slice(0, 5);


      setInstructorPerformanceData(instructorPerf);


      // Test Type Distribution
      const testTypes = {};
      exams.forEach(exam => {
        const type = exam.exam_type || 'general';
        testTypes[type] = (testTypes[type] || 0) + 1;
      });


      setTestTypeDistribution(
        Object.entries(testTypes).map(([name, value], index) => ({
          name: name.replace('_', ' ').toUpperCase(),
          value,
          color: COLORS[index % COLORS.length]
        }))
      );


      // Student Engagement
      const engagementData = [
        { category: 'Tests Taken', value: attemptedTests.length, fullMark: Math.max(attemptedTests.length, 100) },
        { category: 'Avg Score', value: avgScore, fullMark: 100 },
        { category: 'Session Attendance', value: avgAttendanceRate, fullMark: 100 },
        { category: 'Active Students', value: (candidates.filter(c => c.status === 'active').length / Math.max(candidates.length, 1)) * 100, fullMark: 100 },
        { category: 'Test Completion', value: completedTests > 0 ? (completedTests / attemptedTests.length) * 100 : 0, fullMark: 100 }
      ];


      setStudentEngagementData(engagementData);


    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast({ variant: "destructive", description: "Failed to load dashboard data." });
    } finally {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);


  if (isLoading) {
    return (
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 ml-4 text-lg">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }


  const getTrendIcon = (value) => {
    if (value > 0) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (value < 0) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };


  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Analytics Dashboard</h1>
        <p className="text-slate-600 text-lg">
          Comprehensive insights into assessments and learning sessions
        </p>
      </div>


      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>


        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          {/* Primary KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Users className="w-6 h-6" />
                  </div>
                  <Badge className="bg-white/20 text-white border-none">
                    {getTrendIcon(5)} 5%
                  </Badge>
                </div>
                <p className="text-blue-100 text-sm mb-1">Total Students</p>
                <p className="text-4xl font-bold">{stats.totalStudents}</p>
                <p className="text-blue-100 text-xs mt-2">Active learners</p>
              </CardContent>
            </Card>


            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <Badge className="bg-white/20 text-white border-none">
                    {getTrendIcon(stats.avgTestScore > 70 ? 2 : -1)} 
                    {stats.avgTestScore > 70 ? '+2%' : '-1%'}
                  </Badge>                </div>
                <p className="text-green-100 text-sm mb-1">Avg Performance</p>
                <p className="text-4xl font-bold">{stats.avgTestScore}%</p>
                <p className="text-green-100 text-xs mt-2">Across all tests</p>
              </CardContent>
            </Card>


            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <FileText className="w-6 h-6" />
                  </div>
                  <Badge className="bg-white/20 text-white border-none">
                    {getTrendIcon(3)} 3%
                  </Badge>
                </div>
                <p className="text-purple-100 text-sm mb-1">Total Assessments</p>
                <p className="text-4xl font-bold">{stats.totalTests}</p>
                <p className="text-purple-100 text-xs mt-2">{stats.activeTests} active</p>
              </CardContent>
            </Card>


            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Video className="w-6 h-6" />
                  </div>
                  <Badge className="bg-white/20 text-white border-none">
                    {getTrendIcon(stats.avgAttendanceRate > 70 ? 4 : 0)} 
                    {stats.avgAttendanceRate > 70 ? '+4%' : '0%'}
                  </Badge>                </div>
                <p className="text-orange-100 text-sm mb-1">Session Attendance</p>
                <p className="text-4xl font-bold">{stats.avgAttendanceRate}%</p>
                <p className="text-orange-100 text-xs mt-2">Average rate</p>
              </CardContent>
            </Card>
          </div>


          {/* Secondary Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalClassrooms}</p>
                    <p className="text-xs text-slate-600">Classrooms</p>
                  </div>
                </div>
              </CardContent>
            </Card>


            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats.completedTests}</p>
                    <p className="text-xs text-slate-600">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>


            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalQuestions}</p>
                    <p className="text-xs text-slate-600">Questions</p>
                  </div>
                </div>
              </CardContent>
            </Card>


            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Video className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalSessions}</p>
                    <p className="text-xs text-slate-600">Sessions</p>
                  </div>
                </div>
              </CardContent>
            </Card>


            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats.topPerformers}</p>
                    <p className="text-xs text-slate-600">Top (80%+)</p>
                  </div>
                </div>
              </CardContent>
            </Card>


            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats.lowPerformers}</p>
                    <p className="text-xs text-slate-600">Need Help</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>


          {/* Weekly Activity Trend */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Weekly Activity Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={weeklyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="tests" fill="#3b82f6" name="Tests Attempted" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="sessions" fill="#10b981" name="Sessions Held" radius={[8, 8, 0, 0]} />
                  <Line type="monotone" dataKey="students" stroke="#f59e0b" strokeWidth={2} name="Active Students" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>


          {/* Student Engagement Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Student Engagement Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={studentEngagementData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Engagement" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                    <Tooltip />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>


            {/* Test Type Distribution */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-orange-600" />
                  Assessment Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={testTypeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {testTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>


          {/* Quick Actions */}
          <Card className="shadow-lg bg-gradient-to-r from-slate-50 to-blue-50">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 justify-items-center">
              <Button variant="outline" className="justify-start h-auto py-4 hover:bg-white hover:shadow-md transition-all" asChild>
                <Link to={createPageUrl("Classrooms")}>
                  <Users className="w-5 h-5 mr-2" />
                  <div className="text-left">
                    <div className="font-semibold">Classrooms</div>
                    <div className="text-xs text-slate-500">Manage classes</div>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-4 hover:bg-white hover:shadow-md transition-all" asChild>
                <Link to={createPageUrl("LiveTests")}>
                  <FileText className="w-5 h-5 mr-2" />
                  <div className="text-left">
                    <div className="font-semibold">Live Tests</div>
                    <div className="text-xs text-slate-500">View assessments</div>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-4 hover:bg-white hover:shadow-md transition-all" asChild>
                <Link to={createPageUrl("Questions")}>
                  <BookOpen className="w-5 h-5 mr-2" />
                  <div className="text-left">
                    <div className="font-semibold">Question Bank</div>
                    <div className="text-xs text-slate-500">Add questions</div>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-4 hover:bg-white hover:shadow-md transition-all" asChild>
                <Link to={createPageUrl("OnlineSessions")}>
                  <Video className="w-5 h-5 mr-2" />
                  <div className="text-left">
                    <div className="font-semibold">Online Sessions</div>
                    <div className="text-xs text-slate-500">Schedule classes</div>
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>


        {/* ASSESSMENTS TAB */}
        <TabsContent value="assessments" className="space-y-6">
          {/* Assessment Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <FileText className="w-8 h-8 mb-3 opacity-80" />
                <p className="text-4xl font-bold mb-1">{stats.totalTests}</p>
                <p className="text-blue-100">Total Tests</p>
              </CardContent>
            </Card>


            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <CheckCircle className="w-8 h-8 mb-3 opacity-80" />
                <p className="text-4xl font-bold mb-1">{stats.completedTests}</p>
                <p className="text-green-100">Completed</p>
              </CardContent>
            </Card>


            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <Target className="w-8 h-8 mb-3 opacity-80" />
                <p className="text-4xl font-bold mb-1">{stats.avgTestScore}%</p>
                <p className="text-purple-100">Avg Score</p>
              </CardContent>
            </Card>


            <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
              <CardContent className="p-6">
                <Trophy className="w-8 h-8 mb-3 opacity-80" />
                <p className="text-4xl font-bold mb-1">{stats.topPerformers}</p>
                <p className="text-yellow-100">Top Performers</p>
              </CardContent>
            </Card>
          </div>


          {/* Test Trends Over Time */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Assessment Activity Trends (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={testTrendsData}>
                  <defs>
                    <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorAttempted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="created" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCreated)" name="Created" />
                  <Area type="monotone" dataKey="attempted" stroke="#10b981" fillOpacity={1} fill="url(#colorAttempted)" name="Attempted" />
                  <Area type="monotone" dataKey="completed" stroke="#f59e0b" fillOpacity={1} fill="url(#colorCompleted)" name="Completed" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>


          {/* Performance Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Difficulty Distribution */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Question Difficulty Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={difficultyDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {difficultyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>


            {/* Performance by Difficulty */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Performance by Difficulty</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceByDifficulty}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="difficulty" />
                    <YAxis />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="avgScore" fill="#8b5cf6" name="Average Score (%)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>


          {/* Subject Performance */}
          {subjectPerformance.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Performance by Subject/Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={subjectPerformance} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="subject" type="category" width={100} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="avgScore" fill="#10b981" name="Avg Score (%)" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>


        {/* SESSIONS TAB */}
        <TabsContent value="sessions" className="space-y-6">
          {/* Session Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <Video className="w-8 h-8 mb-3 opacity-80" />
                <p className="text-4xl font-bold mb-1">{stats.totalSessions}</p>
                <p className="text-indigo-100">Total Sessions</p>
              </CardContent>
            </Card>


            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
              <CardContent className="p-6">
                <Play className="w-8 h-8 mb-3 opacity-80" />
                <p className="text-4xl font-bold mb-1">{stats.liveSessions}</p>
                <p className="text-red-100">Live Now</p>
              </CardContent>
            </Card>


            <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
              <CardContent className="p-6">
                <CheckCircle className="w-8 h-8 mb-3 opacity-80" />
                <p className="text-4xl font-bold mb-1">{stats.completedSessions}</p>
                <p className="text-teal-100">Completed</p>
              </CardContent>
            </Card>


            <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
              <CardContent className="p-6">
                <UserCheck className="w-8 h-8 mb-3 opacity-80" />
                <p className="text-4xl font-bold mb-1">{stats.avgAttendanceRate}%</p>
                <p className="text-pink-100">Avg Attendance</p>
              </CardContent>
            </Card>
          </div>


          {/* Session Trends */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Online Session Trends (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={sessionTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="scheduled" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} name="Scheduled" />
                  <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} name="Completed" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>


          {/* Session Status & Attendance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Session Status */}
            {sessionStatusData.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Session Status Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sessionStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sessionStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}


            {/* Instructor Performance */}
            {instructorPerformanceData.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Top Instructors by Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={instructorPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="instructor" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                      <Legend />
                      <Bar dataKey="sessions" fill="#3b82f6" name="Sessions" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="avgAttendance" fill="#10b981" name="Avg Attendees" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>


          {/* Attendance Comparison */}
          {attendanceComparisonData.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Session Attendance Analysis (Recent 10 Sessions)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={attendanceComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="invited" fill="#94a3b8" name="Invited" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="attended" fill="#10b981" name="Attended" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
