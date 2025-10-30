import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video, Calendar, Clock, Users, Play, Plus, Search, Grid3x3, List } from "lucide-react";
import { OnlineSession, OnlineSessionAttendee, Program, Course, Subject, User } from "@/entities/all";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths, startOfYear, endOfYear } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";


import CreateSessionModal from "../components/onlineSessions/CreateSessionModal";
import SessionCalendarView from "../components/onlineSessions/SessionCalendarView";


export default function OnlineSessionsPage() {
  const [viewMode, setViewMode] = useState("grid"); // Default to grid view (Live Classes Capsule)
  const [calendarView, setCalendarView] = useState("monthly"); // "daily", "weekly", "monthly", "yearly"
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);


  const applyFilters = useCallback(() => {
    let filtered = [...sessions];


    if (searchTerm) {
      filtered = filtered.filter(session =>
        session.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }


    if (programFilter !== "all") {
      filtered = filtered.filter(session => session.program_id === programFilter);
    }


    if (courseFilter !== "all") {
      filtered = filtered.filter(session => session.course_id === courseFilter);
    }


    if (statusFilter !== "all") {
      filtered = filtered.filter(session => session.status === statusFilter);
    }


    setFilteredSessions(filtered);
  }, [sessions, searchTerm, programFilter, courseFilter, statusFilter]);


  useEffect(() => {
    loadData();
  }, []);


  useEffect(() => {
    applyFilters();
  }, [applyFilters]);


  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch current user and set role (necessary to determine isAdmin)
      const currentUser = await User.me();
      setUser(currentUser);
      const adminRole = currentUser.role === 'admin';
      setIsAdmin(adminRole);


      const [programsData, coursesData, subjectsData] = await Promise.all([
        Program.list(),
        Course.list(),
        Subject.list()
      ]);


      // Load all sessions (no teacher-specific filtering)
      const sessionsData = await OnlineSession.list("-scheduled_date");


      // Load related data for each session
      const sessionsWithDetails = await Promise.all(
        sessionsData.map(async (session) => {
          let program = null;
          let course = null;
          let subject = null;
          let attendeesCount = 0;


          try {
            if (session.program_id) {
              program = await Program.get(session.program_id);
            }
            if (session.course_id) {
              course = await Course.get(session.course_id);
            }
            if (session.subject_id) {
              subject = await Subject.get(session.subject_id);
            }
           
            const attendees = await OnlineSessionAttendee.filter({ session_id: session.id });
            attendeesCount = attendees.length;
          } catch (error) {
            console.warn("Error loading session details:", error);
          }


          return {
            ...session,
            program,
            course,
            subject,
            attendeesCount
          };
        })
      );


      setSessions(sessionsWithDetails);
      setPrograms(programsData);
      setCourses(coursesData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error("Error loading online sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const getSessionCounts = () => {
    return {
      upcoming: sessions.filter(s => s.status === 'scheduled' && new Date(s.scheduled_date) > new Date()).length,
      live: sessions.filter(s => s.status === 'live').length,
      completed: sessions.filter(s => s.status === 'completed').length,
      totalHours: Math.round(sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60)
    };
  };


  const counts = getSessionCounts();


  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 ml-4">Loading online sessions...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Online Sessions</h1>
            <p className="text-slate-600 mt-2">Interactive learning sessions with expert instructors</p>
          </div>
          <div className="flex gap-3">
            <div className="flex gap-1 bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="gap-2"
              >
                <Grid3x3 className="w-4 h-4" />
                Live Classes
              </Button>
              <Button
                variant={viewMode === "calendar" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("calendar")}
                className="gap-2"
              >
                <Calendar className="w-4 h-4" />
                Calendar
              </Button>
            </div>
            {/* Create Session button - now admin-only */}
            {isAdmin && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Session
              </Button>
            )}
          </div>
        </div>


        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Upcoming</p>
                  <p className="text-2xl font-bold">{counts.upcoming}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
         
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100">Live Now</p>
                  <p className="text-2xl font-bold">{counts.live}</p>
                </div>
                <Video className="w-8 h-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
         
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Completed</p>
                  <p className="text-2xl font-bold">{counts.completed}</p>
                </div>
                <Play className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
         
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Total Hours</p>
                  <p className="text-2xl font-bold">{counts.totalHours}</p>
                </div>
                <Clock className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
         
          <Select value={programFilter} onValueChange={setProgramFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              {programs.map(program => (
                <SelectItem key={program.id} value={program.id}>{program.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
         
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map(course => (
                <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>


          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>


        {/* Live Classes Capsule or Calendar View */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.length === 0 ? (
              <div className="col-span-full">
                <Card className="text-center py-16">
                  <CardContent>
                    <Video className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      No sessions found
                    </h3>
                    <p className="text-slate-600 mb-6">
                      {isAdmin
                        ? "Create your first online session to get started"
                        : "There are no sessions available at the moment."
                      }
                    </p>
                    {isAdmin && (
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => setShowCreateModal(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Session
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              filteredSessions.map(session => (
                <SessionCard key={session.id} session={session} onRefresh={loadData} />
              ))
            )}
          </div>
        ) : (
          <SessionCalendarView
            sessions={filteredSessions}
            calendarView={calendarView}
            setCalendarView={setCalendarView}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            onRefresh={loadData}
          />
        )}
      </div>


      {/* Create Session Modal */}
      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        programs={programs}
        courses={courses}
        subjects={subjects}
        onSessionCreated={() => {
          loadData();
          setShowCreateModal(false);
        }}
      />
    </div>
  );
}


function SessionCard({ session, onRefresh }) {
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: format(date, 'MMM d, yyyy'),
      time: format(date, 'h:mm a')
    };
  };


  const { date, time } = formatDateTime(session.scheduled_date);
  const isLive = session.status === 'live';
  const isUpcoming = session.status === 'scheduled' && new Date(session.scheduled_date) > new Date();


  const handleJoin = () => {
    if (session.zoom_join_url) {
      window.open(session.zoom_join_url, '_blank');
    }
  };


  const handleCopyLink = () => {
    if (session.zoom_join_url) {
      navigator.clipboard.writeText(session.zoom_join_url);
      alert("Join link copied!");
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {isLive && (
                  <Badge className="bg-red-500 text-white animate-pulse">
                    🔴 LIVE
                  </Badge>
                )}
                {session.course && (
                  <Badge variant="outline">{session.course.name}</Badge>
                )}
              </div>
              <h3 className="font-semibold text-lg text-slate-900 mb-1">
                {session.title}
              </h3>
              <p className="text-slate-600 text-sm">by {session.instructor_name}</p>
            </div>
          </div>
         
          {session.description && (
            <p className="text-slate-600 text-sm mb-4 line-clamp-2">
              {session.description}
            </p>
          )}
         
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{time}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{session.attendeesCount}/{session.max_participants}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{session.duration_minutes} min</span>
            </div>
          </div>
         
          <div className="flex gap-2">
            {isLive ? (
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleJoin}
              >
                <Play className="w-4 h-4 mr-2" />
                Join Now
              </Button>
            ) : isUpcoming ? (
              <Button variant="outline" className="flex-1" onClick={handleCopyLink}>
                <Calendar className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            ) : session.recording_url ? (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.open(session.recording_url, '_blank')}
              >
                <Play className="w-4 h-4 mr-2" />
                Recording
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
