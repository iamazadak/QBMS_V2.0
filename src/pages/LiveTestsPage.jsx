import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, FileText, Calendar, ExternalLink, Edit, Loader2, Trash2 } from "lucide-react";
import { Exam } from "@/entities/all";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";


export default function LiveTestsPage() {
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
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


  const getStatusColor = (exam) => {
    if (exam.is_published) {
      return "bg-green-100 text-green-800 border-green-200";
    }
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  };


  const getExamTypeColor = (type) => {
    const colors = {
      practice: "bg-blue-100 text-blue-800",
      mock_test: "bg-purple-100 text-purple-800",
      previous_year: "bg-orange-100 text-orange-800",
      live_test: "bg-red-100 text-red-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };


  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="text-slate-600 ml-4">Loading tests...</p>
        </div>
      </div>
    );
  }


  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-slate-900`}>Live Tests & Quizzes</h1>
          <p className={`text-slate-600 mt-2 ${isMobile ? 'text-sm' : ''}`}>Manage and monitor your active examinations</p>
        </div>
      </div>


      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-violet-50 rounded-xl">
                <FileText className="w-6 h-6 text-violet-600" />
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Tests</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{exams.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-emerald-50 rounded-xl">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Published</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{exams.filter(e => e.is_published).length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-amber-50 rounded-xl">
                <Edit className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Draft</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{exams.filter(e => !e.is_published).length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-rose-50 rounded-xl">
                <Clock className="w-6 h-6 text-rose-600" />
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Questions</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{exams.reduce((sum, exam) => sum + (exam.total_questions || 0), 0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Tests Grid */}
      {exams.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No tests created yet</h3>
            <p className="text-slate-600 mb-6">Get started by creating your first test or quiz from the Question Bank</p>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <FileText className="w-4 h-4 mr-2" />
              Go to Question Bank
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
          {exams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-lg transition-shadow duration-300 border-slate-200/60">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-slate-900 mb-2">
                      {exam.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-3">
                      {exam.exam_type && (
                        <Badge variant="secondary" className={getExamTypeColor(exam.exam_type)}>
                          {exam.exam_type?.replace('_', ' ').toUpperCase()}
                        </Badge>
                      )}
                      <div className="flex items-center gap-4 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={exam.is_published}
                            onCheckedChange={() => handleTogglePublished(exam)}
                            disabled={updatingId === exam.id}
                          />
                          <span className={cn(
                            "text-xs font-bold uppercase tracking-wider transition-colors",
                            exam.is_published ? "text-emerald-600" : "text-amber-600"
                          )}>
                            {updatingId === exam.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              exam.is_published ? 'Active' : 'Draft'
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-3">
                {exam.description && (
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {exam.description}
                  </p>
                )}

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <FileText className="w-4 h-4" />
                    <span>{exam.total_questions} Questions</span>
                  </div>

                  {exam.duration_minutes && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4" />
                      <span>{exam.duration_minutes} Minutes</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="w-4 h-4" />
                    <span>{exam.total_marks} Total Marks</span>
                  </div>

                  {exam.scheduled_date && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(exam.scheduled_date), "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  {exam.editor_link && (
                    <Button variant="outline" size="sm" asChild className="flex-1 border-slate-200 text-slate-600 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50 font-medium">
                      <a href={exam.editor_link} target="_blank" rel="noopener noreferrer">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </a>
                    </Button>
                  )}

                  {exam.respondent_link && (
                    <Button variant="outline" size="sm" asChild className="flex-1 border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 font-medium">
                      <a href={exam.respondent_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View
                      </a>
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteExam(exam.id)}
                    disabled={updatingId === exam.id}
                    className="border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                  >
                    {updatingId === exam.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Created {exam.created_at && format(new Date(exam.created_at), "MMM d, yyyy")}
                  </p>
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