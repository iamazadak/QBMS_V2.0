import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video, Calendar, Clock, Users, Play, Plus, Search, Grid3x3, List, Zap } from "lucide-react";
import { OnlineSession, OnlineSessionAttendee, Program, Course, Subject, User } from "@/entities/all";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths, startOfYear, endOfYear } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";


import CreateSessionModal from "../components/onlineSessions/CreateSessionModal";
import SessionCalendarView from "../components/onlineSessions/SessionCalendarView";
import KpiCard from "@/components/shared/KpiCard";


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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="text-slate-600 ml-4">Loading online sessions...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="">
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
                variant="primary"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Session
              </Button>
            )}
          </div>
        </div>


        {/* Stats Ribbon */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-2 mb-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 leading-none">{counts.upcoming}</p>
              <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Upcoming</p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl relative">
              <Video className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 leading-none">{counts.live}</p>
              <p className="text-subscript uppercase tracking-[0.1em] mt-1.5 leading-none">Live Now</p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Play className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 leading-none">{counts.completed}</p>
              <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Completed</p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-8 py-3 min-w-max">
            <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 leading-none">{counts.totalHours}</p>
              <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Total Hours</p>
            </div>
          </div>
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
                        variant="primary"
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
                variant="destructive"
                className="flex-1"
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
