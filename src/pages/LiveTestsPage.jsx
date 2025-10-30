import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, FileText, Calendar, ExternalLink, Edit } from "lucide-react";
import { Exam } from "@/entities/all";
import { format } from "date-fns";


export default function LiveTestsPage() {
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 ml-4">Loading tests...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Live Tests & Quizzes</h1>
          <p className="text-slate-600 mt-2">Manage and monitor your active examinations</p>
        </div>
      </div>


      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Tests</p>
                <p className="text-2xl font-bold">{exams.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
       
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Published</p>
                <p className="text-2xl font-bold">{exams.filter(e => e.is_published).length}</p>
              </div>
              <Users className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
       
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Draft</p>
                <p className="text-2xl font-bold">{exams.filter(e => !e.is_published).length}</p>
              </div>
              <Edit className="w-8 h-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>
       
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Total Questions</p>
                <p className="text-2xl font-bold">{exams.reduce((sum, exam) => sum + (exam.total_questions || 0), 0)}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-200" />
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
            <Button className="bg-blue-600 hover:bg-blue-700">
              <FileText className="w-4 h-4 mr-2" />
              Go to Question Bank
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-lg transition-shadow duration-300 border-slate-200/60">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-slate-900 mb-2">
                      {exam.title}
                    </CardTitle>
                                          <div className="flex gap-2">                      <Badge variant="secondary" className={getExamTypeColor(exam.exam_type)}>
                        {exam.exam_type?.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(exam)}>
                        {exam.is_published ? 'Published' : 'Draft'}
                      </Badge>
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
                 
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span>{exam.duration_minutes} Minutes</span>
                  </div>
                 
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
               
                <div className="flex gap-2">
                  {exam.editor_link && (
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <a href={exam.editor_link} target="_blank" rel="noopener noreferrer">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </a>
                    </Button>
                  )}
                 
                  {exam.respondent_link && (
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <a href={exam.respondent_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View
                      </a>
                    </Button>
                  )}
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
