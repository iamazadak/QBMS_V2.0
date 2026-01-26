import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Activity, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useProfile } from "../hooks/useAuth";

const StudentDashboardPage = () => {
  const { profile } = useProfile();

  const actions = [
    {
      title: "Active Live Tests",
      icon: Clock,
      desc: "Join ongoing exams",
      link: createPageUrl("LiveTests"),
      color: "bg-teal-100 text-teal-600"
    },
    {
      title: "Practice Questions",
      icon: Target,
      desc: "Sharpen your skills",
      link: createPageUrl("Practice"),
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "My Results",
      icon: Activity,
      desc: "View your performance",
      link: createPageUrl("AttemptedTests"),
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "Test Series",
      icon: BookOpen,
      desc: "Browse collections",
      link: createPageUrl("TestSeries"),
      color: "bg-orange-100 text-orange-600"
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Student Dashboard</h1>
        <p className="text-slate-600 mt-2">
          Welcome back, {profile?.full_name || 'Student'}! Ready to learn?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {actions.map((action, i) => (
          <Link key={i} to={action.link}>
            <Card className="hover:shadow-lg transition-all cursor-pointer h-full border-slate-200">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className={`p-4 rounded-full mb-4 ${action.color}`}>
                  <action.icon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-slate-900">{action.title}</h3>
                <p className="text-slate-500 text-sm">{action.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Placeholder for Recent Activity or Upcoming Tests */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Recommended for You</h2>
        <div className="bg-slate-50 rounded-xl p-8 text-center border border-slate-100">
          <p className="text-slate-500">No recommendations yet. Start practicing to get suggestions!</p>
          <Link to={createPageUrl("Questions")}>
            <Button variant="outline" className="mt-4">Browse Questions</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardPage;