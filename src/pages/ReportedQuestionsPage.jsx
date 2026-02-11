import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Search, Clock, CheckCircle, X, Eye } from "lucide-react";
import { ReportedQuestion, Question, Option, User } from "@/entities/all";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


export default function ReportedQuestionsPage() {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);


  useEffect(() => {
    loadReports();
  }, []);


  const loadReports = async () => {
    setIsLoading(true);
    try {
      const reportsData = await ReportedQuestion.list("-created_date");

      // Load question details for each report
      const reportsWithDetails = await Promise.all(
        reportsData.map(async (report) => {
          try {
            const question = await Question.get(report.question_id);
            const options = await Option.filter({ question_id: question.id });

            return {
              ...report,
              question: {
                ...question,
                options
              }
            };
          } catch (error) {
            console.warn(`Question not found for report ${report.id}:`, error);
            return {
              ...report,
              question: null
            };
          }
        })
      );

      setReports(reportsWithDetails.filter(r => r.question !== null));
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      await ReportedQuestion.update(reportId, { status: newStatus });
      loadReports();
    } catch (error) {
      console.error("Error updating report status:", error);
    }
  };


  const filteredReports = reports.filter(report => {
    const matchesSearch = !searchTerm ||
      report.question?.question_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporter_email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || report.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });


  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      reviewing: "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800",
      dismissed: "bg-gray-100 text-gray-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };


  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800"
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };


  const getIssueTypeLabel = (issueType) => {
    const labels = {
      incorrect_answer: "Incorrect Answer",
      unclear_question: "Unclear Question",
      typo: "Typo/Grammar",
      inappropriate_content: "Inappropriate Content",
      other: "Other"
    };
    return labels[issueType] || issueType;
  };


  const calculateStats = () => {
    return {
      total: reports.length,
      pending: reports.filter(r => r.status === 'pending').length,
      reviewing: reports.filter(r => r.status === 'reviewing').length,
      resolved: reports.filter(r => r.status === 'resolved').length,
      highPriority: reports.filter(r => ['high', 'critical'].includes(r.priority)).length
    };
  };


  const stats = calculateStats();


  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="text-slate-600 ml-4">Loading reported questions...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Reported Questions</h1>
        <p className="text-slate-600 mt-2">Manage question issues and feedback</p>
      </div>


      {/* Stats Ribbon */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-2 mb-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{stats.total}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Total Reports</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{stats.pending}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Pending</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{stats.reviewing}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Reviewing</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{stats.resolved}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Resolved</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 py-3 min-w-max">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl relative">
            <AlertTriangle className="w-5 h-5" />
            {stats.highPriority > 0 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-pulse"></div>}
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{stats.highPriority}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">High Priority</p>
          </div>
        </div>
      </div>


      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>


      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No reports found</h3>
            <p className="text-slate-600 mb-6">No question issues have been reported yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className={getStatusColor(report.status)}>
                        {report.status.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary" className={getPriorityColor(report.priority)}>
                        {report.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {getIssueTypeLabel(report.issue_type)}
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                      {report.question?.question_text}
                    </h3>

                    <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                      <strong>Issue:</strong> {report.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Reported by: {report.reporter_email}</span>
                      <span>•</span>
                      <span>{new Date(report.created_date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReport(report);
                        setShowDetailModal(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>

                    <div className="flex gap-2">
                      {report.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(report.id, 'reviewing')}
                        >
                          Start Review
                        </Button>
                      )}

                      {report.status === 'reviewing' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(report.id, 'resolved')}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(report.id, 'dismissed')}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Dismiss
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}


      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <ReportDetailView report={selectedReport} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


function ReportDetailView({ report }) {
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          {report.status.toUpperCase()}
        </Badge>
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          {report.priority.toUpperCase()}
        </Badge>
        <Badge variant="outline">
          {report.issue_type.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>


      <div>
        <h3 className="font-semibold mb-2">Reported Question:</h3>
        <div className="bg-slate-50 p-4 rounded-lg">
          <p className="font-medium mb-3">{report.question?.question_text}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {report.question?.options?.map((option, index) => (
              <div
                key={index}
                className={`p-2 rounded border text-sm ${option.is_correct
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-white border-slate-200'
                  }`}
              >
                <span className="font-medium">{option.option_label}:</span> {option.option_text}
              </div>
            ))}
          </div>
        </div>
      </div>


      <div>
        <h3 className="font-semibold mb-2">Issue Description:</h3>
        <p className="bg-red-50 p-4 rounded-lg text-red-800">{report.description}</p>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Report Details:</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Reporter:</strong> {report.reporter_email}</p>
            <p><strong>Date:</strong> {new Date(report.created_date).toLocaleString()}</p>
            <p><strong>Issue Type:</strong> {report.issue_type.replace('_', ' ')}</p>
          </div>
        </div>

        {report.admin_notes && (
          <div>
            <h3 className="font-semibold mb-2">Admin Notes:</h3>
            <p className="bg-blue-50 p-3 rounded-lg text-blue-800 text-sm">
              {report.admin_notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
