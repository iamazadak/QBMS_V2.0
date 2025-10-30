
import { useAuth, useProfile } from "../hooks/useAuth";
import { LogOut } from "lucide-react";
import React from "react";

import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  BookOpen,
  FileText,
  Clock,
  Activity,
  Bookmark,
  AlertTriangle,
  Video,
  GraduationCap,
  Archive,
  Target,
  Gift,
  Users,
  LayoutDashboard
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";


const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
    description: "Overview & Analytics"
  },
  {
    title: "Question Bank",
    url: createPageUrl("Questions"),
    icon: FileText,
    description: "Manage questions"
  },
  {
    title: "Live Tests",
    url: createPageUrl("LiveTests"),
    icon: Clock,
    description: "Active exams"
  },
  {
    title: "Test Series",
    url: createPageUrl("TestSeries"),
    icon: BookOpen,
    description: "Organized test collections"
  },
  {
    title: "Previous Year Papers",
    url: createPageUrl("PreviousYearPapers"),
    icon: Archive,
    description: "Historical exam papers"
  },
  {
    title: "Practice",
    url: createPageUrl("Practice"),
    icon: Target,
    description: "Practice sessions"
  },
  {
    title: "Free Quizzes",
    url: createPageUrl("FreeQuizzes"),
    icon: Gift,
    description: "Open access quizzes"
  },
  {
    title: "Created Question Papers",
    url: createPageUrl("CreatedQuestionPapers"),
    icon: FileText,
    description: "View and manage created question papers"
  }
];


const managementItems = [
  {
    title: "Classrooms",
    url: createPageUrl("Classrooms"),
    icon: Users,
    description: "Manage classrooms"
  },
  {
    title: "Candidates",
    url: createPageUrl("Candidates"),
    icon: Users,
    description: "Manage student data"
  },
  {
    title: "Online Sessions",
    url: createPageUrl("OnlineSessions"),
    icon: Video,
    description: "Live learning sessions"
  },
  {
    title: "Paper Templates",
    url: createPageUrl("PaperTemplates"),
    icon: BookOpen,
    description: "Create and manage paper templates"
  }
];


const activityItems = [
  {
    title: "Attempted Tests",
    url: createPageUrl("AttemptedTests"),
    icon: Activity,
    description: "View test history"
  },
  {
    title: "Saved Questions",
    url: createPageUrl("SavedQuestions"),
    icon: Bookmark,
    description: "Bookmarked questions"
  },
  {
    title: "Reported Questions",
    url: createPageUrl("ReportedQuestions"),
    icon: AlertTriangle,
    description: "Issues and reports"
  }
];


export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const { signOut } = useAuth();
  const { profile } = useProfile();


  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Sidebar className="border-r border-slate-200/60 backdrop-blur-sm bg-white/80">
          <SidebarHeader className="border-b border-slate-200/60 px-3 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Lernern</h2>
                <p className="text-sm text-slate-500">QBMS Portal</p>
              </div>
            </div>
          </SidebarHeader>
         
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 text-left">
                Tests & Quizzes
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`group hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg ${
                          location.pathname === item.url ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-600'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-3">
                          <item.icon className="w-5 h-5" />
                          <div className="text-left">
                            <span className="font-medium">{item.title}</span>
                            <p className="text-xs opacity-70">{item.description}</p>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>


            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 mt-6 text-left">
                Activity
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {activityItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`group hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 rounded-lg ${
                          location.pathname === item.url ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-3">
                          <item.icon className="w-5 h-5" />
                          <div className="text-left">
                            <span className="font-medium">{item.title}</span>
                            <p className="text-xs opacity-70">{item.description}</p>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>


            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 mt-6 text-left">
                Management
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {managementItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`group hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 rounded-lg ${
                          location.pathname === item.url ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-slate-600'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-3">
                          <item.icon className="w-5 h-5" />
                          <div className="text-left">
                            <span className="font-medium">{item.title}</span>
                            <p className="text-xs opacity-70">{item.description}</p>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>


          <SidebarFooter className="border-t border-slate-200/60 p-4">
            <div className="flex items-center justify-between gap-3 px-3 py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">{profile?.full_name?.charAt(0) || 'A'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">{profile?.full_name || 'Administrator'}</p>
                  <p className="text-xs text-slate-500 truncate">{profile?.role || 'Admin Account'}</p>
                </div>
              </div>
              <button onClick={signOut} className="p-2 rounded-full hover:bg-slate-200">
                <LogOut className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>


        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-semibold text-slate-900">Lernern</h1>
            </div>
          </header>


          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
