import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Users,
  FileText,
  Calendar,
  ExternalLink,
  Edit,
  Loader2,
  Trash2,
  Search,
  Filter,
  Copy,
  CheckCircle2,
  Globe,
  Lock as LockIcon,
  ChevronRight,
  Zap,
  PlayCircle,
  TrendingUp,
  Award,
  Timer,
  BarChart3,
  RefreshCw,
  Plus
} from "lucide-react";
import { Exam } from "@/entities/all";
import { format, isPast, isFuture, isToday } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import KpiCard from "@/components/shared/KpiCard";

export default function LiveTestsPage() {
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    setIsLoading(true);
    try {
      const exam = new Exam();
      const data = await exam.list("created_at", false);
      setExams(data || []);
    } catch (error) {
      console.error("Error loading exams:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePublished = async (exam) => {
    setUpdatingId(exam.id);
    const newStatus = !exam.is_published;

    try {
      const examEntity = new Exam();
      await examEntity.update(exam.id, { is_published: newStatus });

      if (exam.editor_link) {
        try {
          await fetch('/api/google-form-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'updateResponseCollection',
              formUrl: exam.editor_link,
              collectResponses: newStatus
            })
          });
        } catch (err) {
          console.error("Google Sync Error:", err);
        }
      }

      setExams(prev => prev.map(e =>
        e.id === exam.id ? { ...e, is_published: newStatus } : e
      ));

      toast({
        description: `Assessment ${newStatus ? 'published' : 'moved to draft'}.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        description: "Failed to update status.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm("Are you sure you want to delete this test?")) return;

    setUpdatingId(examId);
    try {
      const examEntity = new Exam();
      await examEntity.delete(examId);
      setExams(prev => prev.filter(e => e.id !== examId));
      toast({ description: "Test deleted successfully." });
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast({ variant: "destructive", description: "Failed to delete test." });
    } finally {
      setUpdatingId(null);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    toast({ description: `${type} link copied!` });
  };

  const categorizedExams = useMemo(() => {
    const filtered = exams.filter(exam =>
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exam.description && exam.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const now = new Date();

    return {
      all: filtered,
      live: filtered.filter(e => e.is_published && (!e.scheduled_date || isPast(new Date(e.scheduled_date)))),
      upcoming: filtered.filter(e => e.is_published && e.scheduled_date && isFuture(new Date(e.scheduled_date))),
      drafts: filtered.filter(e => !e.is_published)
    };
  }, [exams, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: exams.length,
      published: exams.filter(e => e.is_published).length,
      draft: exams.filter(e => !e.is_published).length,
      totalQuestions: exams.reduce((sum, exam) => sum + (exam.total_questions || 0), 0)
    };
  }, [exams]);

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto min-h-[400px] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Loading assessments...</p>
      </div>
    );
  }

  return (
    <div className={`transition-all duration-500 ${isMobile ? 'p-4' : 'p-8'}`}>
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-2">
          <h1>Assessment Dashboard</h1>
          <p className="text-description">Manage & monitor active assessments in real-time</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="outline" onClick={loadExams}>
            <RefreshCw className="w-4 h-4 mr-2" /> Sync
          </Button>
          <Button variant="primary" asChild>
            <a href="/questions">
              <Plus className="w-4 h-4 mr-2" /> Create Assessment
            </a>
          </Button>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-2 mb-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{stats.total}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Total Assessments</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{stats.published}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Active Now</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Edit className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{stats.draft}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">In Draft</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 py-3 min-w-max">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <PlayCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{stats.totalQuestions.toLocaleString()}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Questions</p>
          </div>
        </div>
      </div>

      {/* Categorized Tabs / Filters */}
      <Tabs defaultValue="all" onValueChange={setActiveTab} className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between gap-6 items-end mb-8">
          <TabsList className="bg-slate-100 p-1 rounded-2xl h-14 border border-slate-200">
            {["all", "live", "upcoming", "drafts"].map(tab => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="px-8 rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm transition-all h-full"
              >
                {tab} <span className="ml-2 opacity-50 text-[10px]">{categorizedExams[tab].length}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="relative w-full lg:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={18} />
            <Input
              placeholder="Filter by title, topic or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 bg-white border-2 border-slate-100 rounded-2xl focus-visible:ring-teal-100 focus-visible:border-teal-400 font-bold transition-all"
            />
          </div>
        </div>

        {["all", "live", "upcoming", "drafts"].map(tab => (
          <TabsContent key={tab} value={tab} className="mt-0">
            {categorizedExams[tab].length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] py-24 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <PlayCircle className="w-12 h-12 text-slate-200" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">No {tab} assessments found</h3>
                <p className="text-slate-400 font-bold mt-2 max-w-sm mx-auto uppercase tracking-tighter text-xs">
                  Try checking other categories or create a new assessment
                </p>
                <Button variant="outline" onClick={() => setSearchQuery("")} className="mt-8">
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categorizedExams[tab].map((exam) => (
                  <AssessmentCard
                    key={exam.id}
                    exam={exam}
                    onToggle={handleTogglePublished}
                    onDelete={handleDeleteExam}
                    onCopy={copyToClipboard}
                    isUpdating={updatingId === exam.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function AssessmentCard({ exam, onToggle, onDelete, onCopy, isUpdating }) {
  const isLive = exam.is_published && (!exam.scheduled_date || isPast(new Date(exam.scheduled_date)));
  const isUpcoming = exam.is_published && exam.scheduled_date && isFuture(new Date(exam.scheduled_date));

  return (
    <Card className="group relative bg-white rounded-[2.5rem] border-none shadow-[0_4px_25px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.12)] transition-all duration-500 overflow-hidden flex flex-col border-t-8 border-t-transparent hover:border-t-teal-500">
      {/* Visual Header Banner */}
      <div className="h-2 bg-slate-100/50"></div>

      <CardContent className="p-8 flex flex-col h-full">
        {/* Badge Row */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-1.5">
            <Badge variant="outline" className="w-fit py-1 px-3 rounded-full text-[9px] font-black tracking-[0.2em] border-slate-200 uppercase bg-slate-50 text-slate-500">
              {exam.exam_type?.replace('_', ' ') || 'PRACTICE'}
            </Badge>
            {isLive && (
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                <span className="text-[10px] font-black text-rose-600 tracking-tighter uppercase">Live Now</span>
              </div>
            )}
            {isUpcoming && (
              <div className="flex items-center gap-1.5">
                <Timer className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] font-black text-amber-600 tracking-tighter uppercase">Upcoming</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <Switch
                checked={exam.is_published}
                onCheckedChange={() => onToggle(exam)}
                disabled={isUpdating}
                className="data-[state=checked]:bg-teal-500"
              />
              <span className="text-[8px] font-black text-slate-300 mt-1 uppercase tracking-tight">
                {exam.is_published ? 'Public' : 'Hidden'}
              </span>
            </div>
          </div>
        </div>

        {/* Title & Info */}
        <div className="space-y-3 mb-8">
          <h3 className="text-2xl font-black text-slate-900 leading-[1.1] group-hover:text-teal-600 transition-colors duration-300">
            {exam.title}
          </h3>
          <p className="text-slate-400 text-sm font-bold line-clamp-2 leading-relaxed">
            {exam.description || "No description provided for this assessment."}
          </p>
        </div>

        {/* Info Grid (Testbook Style) */}
        <div className="grid grid-cols-3 gap-2 py-4 border-y border-slate-50 mb-8">
          <div className="text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Questions</p>
            <p className="text-sm font-black text-slate-800">{exam.total_questions || 0}</p>
          </div>
          <div className="text-center border-x border-slate-50">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Marks</p>
            <p className="text-sm font-black text-slate-800">{exam.total_marks || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Time</p>
            <p className="text-sm font-black text-slate-800">{exam.duration_minutes || '--'} <span className="text-[10px]">m</span></p>
          </div>
        </div>

        {/* Schedule */}
        {exam.scheduled_date && (
          <div className="flex items-center gap-2 mb-8 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <Calendar className="w-4 h-4 text-slate-400" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Schedule</span>
              <span className="text-xs font-bold text-slate-700">{format(new Date(exam.scheduled_date), "MMM d, h:mm a")}</span>
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="mt-auto flex flex-col gap-2">
          {isLive ? (
            <Button variant="primary" className="w-full h-12 rounded-2xl font-black group/btn" asChild>
              <a href={exam.respondent_link} target="_blank" rel="noopener noreferrer">
                ATTEMPT ASSESSMENT <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </Button>
          ) : isUpcoming ? (
            <Button variant="secondary" className="w-full h-12 rounded-2xl opacity-80 cursor-not-allowed">
              REGISTRATIONS OPEN
            </Button>
          ) : (
            <Button variant="outline" className="w-full h-12 rounded-2xl" asChild>
              <a href={exam.respondent_link || "#"} target="_blank" rel="noopener noreferrer">
                PREVIEW ASSESSMENT
              </a>
            </Button>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onCopy(exam.respondent_link, "Public")}
              className="rounded-xl"
            >
              <Copy className="w-4 h-4" />
            </Button>
            {exam.editor_link && (
              <Button
                variant="outline"
                size="icon"
                asChild
                className="rounded-xl"
              >
                <a href={exam.editor_link} target="_blank" rel="noopener noreferrer">
                  <Edit className="w-4 h-4" />
                </a>
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(exam.id)}
              className="rounded-xl ml-auto hover:text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      <div className="absolute bottom-0 right-8 transform translate-y-1/2 group-hover:-translate-y-8 transition-transform duration-500 opacity-10 pointer-events-none">
        <Award className="w-24 h-24 text-teal-600" />
      </div>
    </Card>
  );
}