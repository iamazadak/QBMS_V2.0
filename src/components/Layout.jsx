
import { useAuth, useProfile } from "../hooks/useAuth";
import { LogOut } from "lucide-react";
import React from "react";
import lernernLogo from "@/assets/lernern_logo.jpeg";

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
  Archive,
  Target,
  Gift,
  Users,
  LayoutDashboard,
  Shield
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
    title: "Paper Templates",
    url: createPageUrl("PaperTemplates"),
    icon: BookOpen,
    description: "Create and manage paper templates"
  },
  {
    title: "Roles & Permissions",
    url: createPageUrl("Roles"),
    icon: Shield,
    description: "Manage system access"
  },
  {
    title: "Candidates",
    url: "/candidates",
    icon: Users,
    description: "Manage students"
  },
  {
    title: "Classrooms",
    url: "/classrooms",
    icon: Users,
    description: "Manage cohorts"
  },
  {
    title: "Online Sessions",
    url: "/onlinesessions",
    icon: Video,
    description: "Live classes"
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
      <div className="min-h-screen flex w-full bg-slate-50">
        <Sidebar className="border-r border-slate-200 bg-white shadow-[1px_0_20px_0_rgba(0,0,0,0.05)]">
          <SidebarHeader className="h-16 flex items-center px-6 border-b border-sidebar-border/40">
            <div className="flex items-center">
              <img
                src={lernernLogo}
                alt="Lernern Logo"
                className="h-12 w-auto object-contain"
              />
            </div>
          </SidebarHeader>

          <SidebarContent className="flex flex-col gap-6 p-4">
            {/* Main Menu */}
            <div className="flex flex-col gap-2">
              <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Main Menu
              </h3>
              <nav className="flex flex-col gap-1 w-full">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <Link
                      key={item.title}
                      to={item.url}
                      className={`group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 w-full relative overflow-hidden ${isActive
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-200'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                      <item.icon className={`w-[18px] h-[18px] shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      <span className="font-medium text-sm truncate flex-1">{item.title}</span>
                      {isActive && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-l-full" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Activity & History */}
            <div className="flex flex-col gap-2">
              <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Activity & History
              </h3>
              <nav className="flex flex-col gap-1 w-full">
                {activityItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <Link
                      key={item.title}
                      to={item.url}
                      className={`group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 w-full relative overflow-hidden ${isActive
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-200'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                      <item.icon className={`w-[18px] h-[18px] shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      <span className="font-medium text-sm truncate flex-1">{item.title}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Administration */}
            {/* Administration */}
            {(() => {
              const visibleManagementItems = managementItems.filter(item => {
                const adminOnly = ["Roles & Permissions", "Candidates", "Classrooms", "Online Sessions"];
                if (adminOnly.includes(item.title)) return profile?.role === 'admin';
                if (item.title === "Paper Templates") return ['admin', 'trainer'].includes(profile?.role);
                return false;
              });

              if (visibleManagementItems.length === 0) return null;

              return (
                <div className="flex flex-col gap-2">
                  <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Administration
                  </h3>
                  <nav className="flex flex-col gap-1 w-full">
                    {visibleManagementItems.map((item) => {
                      const isActive = location.pathname === item.url;
                      return (
                        <Link
                          key={item.title}
                          to={item.url}
                          className={`group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 w-full relative overflow-hidden ${isActive
                            ? 'bg-teal-600 text-white shadow-md shadow-teal-200'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                          <item.icon className={`w-[18px] h-[18px] shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                          <span className="font-medium text-sm truncate flex-1">{item.title}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              );
            })()}
          </SidebarContent>


          <SidebarFooter className="p-4 border-t border-slate-100">
            <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-slate-50 transition-colors group">
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                <span className="text-teal-600 font-bold text-sm">{profile?.full_name?.charAt(0) || 'A'}</span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-semibold text-slate-700 text-sm truncate group-hover:text-teal-600 transition-colors">{profile?.full_name || 'Administrator'}</p>
                <p className="text-xs text-slate-400 truncate">{profile?.role || 'Admin Account'}</p>
              </div>
              <div onClick={(e) => { e.stopPropagation(); signOut(); }} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                <LogOut className="w-4 h-4" />
              </div>
            </button>
          </SidebarFooter>
        </Sidebar>


        <main className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
          {/* Mobile Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4 md:hidden sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
              <img
                src={lernernLogo}
                alt="Lernern Logo"
                className="h-8 w-auto object-contain"
              />
            </div>
          </header>

          {/* Desktop Header / Trigger Area */}
          <header className="hidden md:flex items-center px-4 py-3 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger className="text-slate-500 hover:text-slate-900 transition-colors" />
          </header>

          <div className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
