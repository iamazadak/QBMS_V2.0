import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video, Calendar, Clock, Users, Play, BookOpen, Plus, Search, Link as LinkIcon } from "lucide-react";
import { LiveSession, LiveSessionAttendee, Program, Course, Subject } from "@/entities/all";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";


import CreateSessionModal from "../components/liveClasses/CreateSessionModal";


export default function LiveClassesPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);


  const applyFilters = useCallback(() => {
    let filtered = sessions.filter(session => {
      if (activeTab === "upcoming") {
        return session.status === "scheduled" && new Date(session.scheduled_date) > new Date();
      } else if (activeTab === "live") {
        return session.status === "live";
      } else if (activeTab === "recorded") {
        return session.status === "completed" && session.recording_url;
      }
      return true;
    });


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


    setFilteredSessions(filtered);
  }, [sessions, activeTab, searchTerm, programFilter, courseFilter]);


  useEffect(() => {
    loadData();
  }, []);


  useEffect(() => {
    applyFilters();
  }, [applyFilters]);


  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sessionsData, programsData, coursesData, subjectsData] = await Promise.all([
        LiveSession.list("-scheduled_date"),
        Program.list(),
        Course.list(),
        Subject.list()
      ]);


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
           
            const attendees = await LiveSessionAttendee.filter({ session_id: session.id });
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
      console.error("Error loading live sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleJoinSession = (session) => {
    if (session.zoom_join_url) {
      window.open(session.zoom_join_url, '_blank');
    } else {
      alert("Join link not available for this session");
    }
  };


  const handleCopyLink = (session) => {
    if (session.zoom_join_url) {
      navigator.clipboard.writeText(session.zoom_join_url);
      alert("Join link copied to clipboard!");
    }
  };


  const getLevelColor = (level) => {
    const colors = {
      Beginner: "bg-green-100 text-green-800",
      Intermediate: "bg-yellow-100 text-yellow-800",
      Advanced: "bg-red-100 text-red-800"
    };
    return colors[level] || "bg-gray-100 text-gray-800";
  };


  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: format(date, 'MMM d, yyyy'),
      time: format(date, 'h:mm a')
    };
  };


  const renderSessionCard = (session) => {
    const { date, time } = formatDateTime(session.scheduled_date);
    const isLive = session.status === 'live';
    const isUpcoming = session.status === 'scheduled' && new Date(session.scheduled_date) > new Date();
   
    return (
      <motion.div
        key={session.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {isLive && (
                    <Badge className="bg-red-500 text-white animate-pulse">
                      🔴 LIVE
                    </Badge>
                  )}
                  {session.course && (
                    <Badge variant="outline">
                      {session.course.name}
                    </Badge>
                  )}
                  {session.subject && (
                    <Badge variant="secondary">
                      {session.subject.name}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg mb-1">
                  {session.title}
                </CardTitle>
                <p className="text-slate-600 text-sm">
                  by {session.instructor_name}
                </p>
              </div>
            </div>
          </CardHeader>
         
          <CardContent>
            {session.description && (
              <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                {session.description}
              </p>
            )}
           
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4" />
                <span>{date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="w-4 h-4" />
                <span>{time} ({session.duration_minutes}min)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users className="w-4 h-4" />
                <span>{session.attendeesCount}/{session.max_participants}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <BookOpen className="w-4 h-4" />
                <span>{session.program?.name || 'N/A'}</span>
              </div>
            </div>
           
            <div className="flex gap-2">
              {isLive ? (
                <>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={() => handleJoinSession(session)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Join Live Session
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyLink(session)}
                  >
                    <LinkIcon className="w-4 h-4" />
                  </Button>
                </>
              ) : activeTab === "recorded" ? (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => session.recording_url && window.open(session.recording_url, '_blank')}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch Recording
                </Button>
              ) : isUpcoming ? (
                <>
                  <Button variant="outline" className="flex-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Set Reminder
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyLink(session)}
                  >
                    <LinkIcon className="w-4 h-4" />
                  </Button>
                </>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };


  const getSessionCounts = () => {
    return {
      upcoming: sessions.filter(s => s.status === 'scheduled' && new Date(s.scheduled_date) > new Date()).length,
      live: sessions.filter(s => s.status === 'live').length,
      recorded: sessions.filter(s => s.status === 'completed' && s.recording_url).length,
      totalHours: Math.round(sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60)
    };
  };


  const counts = getSessionCounts();


  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 ml-4">Loading live sessions...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Live Classes</h1>
            <p className="text-slate-600 mt-2">Interactive learning sessions with expert instructors</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Live Session
          </Button>
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
         
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Recorded</p>
                  <p className="text-2xl font-bold">{counts.recorded}</p>
                </div>
                <Play className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
         
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Total Hours</p>
                  <p className="text-2xl font-bold">{counts.totalHours}</p>
                </div>
                <Clock className="w-8 h-8 text-green-200" />
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
        </div>


        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-100 rounded-lg p-1 mb-8">
          {[
            { key: "upcoming", label: "Upcoming", icon: Calendar },
            { key: "live", label: "Live Now", icon: Video },
            { key: "recorded", label: "Recorded", icon: Play }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {key === "live" && counts.live > 0 && (
                <Badge className="bg-red-500 text-white ml-1">
                  {counts.live}
                </Badge>
              )}
            </button>
          ))}
        </div>


        {/* Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredSessions.length === 0 ? (
              <div className="col-span-full">
                <Card className="text-center py-16">
                  <CardContent>
                    <Video className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      No {activeTab} sessions
                    </h3>
                    <p className="text-slate-600 mb-6">
                      {activeTab === "live"
                        ? "No sessions are currently live. Check back later!"
                        : activeTab === "upcoming"
                        ? "No upcoming sessions scheduled at the moment."
                        : "No recorded sessions available yet."}
                    </p>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => setShowCreateModal(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Live Session
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              filteredSessions.map(renderSessionCard)
            )}
          </AnimatePresence>
        </div>
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