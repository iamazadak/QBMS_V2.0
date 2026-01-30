import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  TrendingUp,
  Award
} from "lucide-react";
import { Exam } from "@/entities/all";
import { format } from "date-fns";
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


export default function LiveTestsPage() {
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

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
      setExams(data);
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
      // 1. Update in Supabase
      const examEntity = new Exam();
      await examEntity.update(exam.id, { is_published: newStatus });

      // 2. If it has a Google Form link, sync with Google
      if (exam.editor_link) {
        try {
          const response = await fetch('/api/google-form-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'updateResponseCollection',
              formUrl: exam.editor_link,
              collectResponses: newStatus
            })
          });

          if (!response.ok) {
            console.warn("Failed to sync status with Google Form");
          }
        } catch (err) {
          console.error("Google Sync Error:", err);
        }
      }

      // 3. Update local state
      setExams(prev => prev.map(e =>
        e.id === exam.id ? { ...e, is_published: newStatus } : e
      ));

      toast({
        description: `Assessment ${newStatus ? 'published' : 'moved to draft'}. ${exam.editor_link ? 'Synced with Google Form.' : ''}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        description: "Failed to update status. Please try again.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm("Are you sure you want to delete this test? This action cannot be undone.")) return;

    setUpdatingId(examId);
    try {
      const examEntity = new Exam();
      await examEntity.delete(examId);

      setExams(prev => prev.filter(e => e.id !== examId));
      console.log('Test deleted successfully:', examId);
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
    toast({
      description: `${type} link copied to clipboard!`,
    });
  };

  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exam.description && exam.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "active" && exam.is_published) ||
        (statusFilter === "draft" && !exam.is_published);

      const matchesType = typeFilter === "all" || exam.exam_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [exams, searchQuery, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    return {
      total: exams.length,
      published: exams.filter(e => e.is_published).length,
      draft: exams.filter(e => !e.is_published).length,
      totalQuestions: exams.reduce((sum, exam) => sum + (exam.total_questions || 0), 0)
    };
  }, [exams]);

  const getExamTypeColor = (type) => {
    const colors = {
      practice: "bg-blue-50 text-blue-700 border-blue-100",
      mock_test: "bg-purple-50 text-purple-700 border-purple-100",
      previous_year: "bg-orange-50 text-orange-700 border-orange-100",
      live_test: "bg-rose-50 text-rose-700 border-rose-100"
    };
    return colors[type] || "bg-slate-50 text-slate-700 border-slate-100";
  };


  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto min-h-[400px] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-slate-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-teal-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-slate-500 mt-4 font-medium animate-pulse text-sm tracking-wide">Loading assessments...</p>
      </div>
    );
  }


  return (
    <div className={`max-w-[1600px] mx-auto ${isMobile ? 'p-4' : 'p-8'}`}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Award className="w-6 h-6 text-teal-700" />
            </div>
            <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-slate-900 tracking-tight`}>Live Tests & Quizzes</h1>
          </div>
          <p className={`text-slate-500 font-medium ${isMobile ? 'text-sm' : 'text-lg'}`}>Manage, monitor and publish your assessments</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button variant="outline" onClick={loadExams} className="border-slate-200 text-slate-600 hover:bg-slate-50">
            Refresh Data
          </Button>
          <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-100" asChild>
            <a href="/questions">Create New Test</a>
          </Button>
        </div>
      </div>


      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="bg-white rounded-3xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden group">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-indigo-50 rounded-2xl group-hover:bg-indigo-600 transition-colors duration-300">
                  <FileText className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</span>
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900">{stats.total}</p>
                <p className="text-slate-500 text-sm font-semibold mt-1">Assessments Created</p>
              </div>
            </div>
            <div className="h-1.5 w-full bg-indigo-600"></div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden group">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-50 rounded-2xl group-hover:bg-emerald-600 transition-colors duration-300">
                  <Globe className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Active</span>
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900">{stats.published}</p>
                <p className="text-slate-500 text-sm font-semibold mt-1">Published Online</p>
              </div>
            </div>
            <div className="h-1.5 w-full bg-emerald-600"></div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden group">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-50 rounded-2xl group-hover:bg-amber-600 transition-colors duration-300">
                  <LockIcon className="w-6 h-6 text-amber-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Internal</span>
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900">{stats.draft}</p>
                <p className="text-slate-500 text-sm font-semibold mt-1">Saved as Draft</p>
              </div>
            </div>
            <div className="h-1.5 w-full bg-amber-500"></div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden group">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-rose-50 rounded-2xl group-hover:bg-rose-600 transition-colors duration-300">
                  <Award className="w-6 h-6 text-rose-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">Metrics</span>
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900">{stats.totalQuestions}</p>
                <p className="text-slate-500 text-sm font-semibold mt-1">Total Questions Pool</p>
              </div>
            </div>
            <div className="h-1.5 w-full bg-rose-600"></div>
          </CardContent>
        </Card>
      </div>


      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-8 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={20} />
          <Input
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-slate-50 border-none h-12 rounded-2xl focus-visible:ring-2 focus-visible:ring-teal-600/20"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-slate-50 border-none h-12 rounded-2xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px] bg-slate-50 border-none h-12 rounded-2xl">
              <SelectValue placeholder="Exam Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="practice">Practice</SelectItem>
              <SelectItem value="mock_test">Mock Test</SelectItem>
              <SelectItem value="previous_year">Previous Year</SelectItem>
              <SelectItem value="live_test">Live Test</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            onClick={() => { setSearchQuery(""); setStatusFilter("all"); setTypeFilter("all"); }}
            className="h-12 rounded-2xl px-6 text-slate-500 font-medium hover:bg-slate-50"
          >
            Reset Filters
          </Button>
        </div>
      </div>


      {/* Tests Grid */}
      {filteredExams.length === 0 ? (
        <Card className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] py-20">
          <CardContent className="flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No assessments found</h3>
            <p className="text-slate-500 max-w-sm text-center font-medium">
              We couldn't find any assessments matching your current search or filter criteria.
            </p>
            <Button
              variant="outline"
              onClick={() => { setSearchQuery(""); setStatusFilter("all"); setTypeFilter("all"); }}
              className="mt-8 rounded-2xl px-8 border-slate-200"
            >
              Clear all filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid grid-cols-1 ${isMobile ? 'gap-6' : 'md:grid-cols-2 lg:grid-cols-3 gap-8'}`}>
          {filteredExams.map((exam) => (
            <Card key={exam.id} className="bg-white rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden flex flex-col group border-t-4 border-t-transparent hover:border-t-teal-600">
              <CardHeader className="p-8 pb-4">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="outline" className={`py-1 px-4 rounded-full text-[10px] font-black tracking-widest border uppercase ${getExamTypeColor(exam.exam_type)}`}>
                    {exam.exam_type?.replace('_', ' ')}
                  </Badge>

                  <div className="flex items-center gap-3">
                    <Switch
                      checked={exam.is_published}
                      onCheckedChange={() => handleTogglePublished(exam)}
                      disabled={updatingId === exam.id}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                    <Badge className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${exam.is_published ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                      {updatingId === exam.id ? <Loader2 className="w-3 h-3 animate-spin" /> : (exam.is_published ? 'ACTIVE' : 'DRAFT')}
                    </Badge>
                  </div>
                </div>

                <CardTitle className="text-xl font-bold text-slate-900 leading-tight group-hover:text-teal-700 transition-colors">
                  {exam.title}
                </CardTitle>
                {exam.description && (
                  <p className="text-slate-500 text-sm mt-3 line-clamp-2 font-medium leading-relaxed">
                    {exam.description}
                  </p>
                )}
              </CardHeader>

              <CardContent className="p-8 pt-4 flex-1 flex flex-col">
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <FileText className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Items</p>
                      <p className="text-sm font-bold text-slate-700">{exam.total_questions || 0} Qs</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                    <div className="p-2 bg-rose-100 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Marks</p>
                      <p className="text-sm font-bold text-slate-700">{exam.total_marks || 0} Pts</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Duration</p>
                      <p className="text-sm font-bold text-slate-700">{exam.duration_minutes || '--'} Min</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Globe className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Form</p>
                      <p className="text-sm font-bold text-slate-700">{exam.editor_link ? 'Google' : 'Local'}</p>
                    </div>
                  </div>
                </div>

                {exam.scheduled_date && (
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-6 bg-slate-50 w-fit px-3 py-1.5 rounded-full border border-slate-100">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Scheduled for: {format(new Date(exam.scheduled_date), "MMM d, h:mm a")}</span>
                  </div>
                )}

                <div className="mt-auto pt-6 border-t border-slate-100 space-y-3">
                  <div className="flex gap-2 w-full">
                    {exam.editor_link && (
                      <Button variant="outline" size="sm" asChild className="flex-1 rounded-xl h-10 border-slate-100 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 transition-all font-bold">
                        <a href={exam.editor_link} target="_blank" rel="noopener noreferrer">
                          <Edit className="w-4 h-4 mr-2" />
                          Editor
                        </a>
                      </Button>
                    )}

                    {exam.respondent_link && (
                      <Button variant="outline" size="sm" asChild className="flex-1 rounded-xl h-10 border-slate-100 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all font-bold">
                        <a href={exam.respondent_link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Public
                        </a>
                      </Button>
                    )}

                    {exam.respondent_link && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(exam.respondent_link, "Respondent")}
                        className="rounded-xl h-10 w-10 border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700"
                        title="Copy Public Link"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                      <Calendar className="w-3 h-3" />
                      <span>{exam.created_at ? format(new Date(exam.created_at), "MMM d, yyyy") : 'Unknown'}</span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteExam(exam.id)}
                      disabled={updatingId === exam.id}
                      className="text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg p-1 h-auto"
                    >
                      {updatingId === exam.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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

const cn = (...inputs) => inputs.filter(Boolean).join(' ');