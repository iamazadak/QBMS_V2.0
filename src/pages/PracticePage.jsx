import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Target, Play, Settings, Timer, BookOpen, Brain, TrendingUp, Zap, FileText, Trophy } from "lucide-react";
import KpiCard from "@/components/shared/KpiCard";
import { Question, Subject, Course, Program } from "@/entities/all";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";


export default function PracticePage() {
  const [practiceStats, setPracticeStats] = useState({
    totalSessions: 0,
    averageScore: 0,
    timeSpent: 0,
    questionsAttempted: 0
  });
  const [showCustomSession, setShowCustomSession] = useState(false);
  const [sessionConfig, setSessionConfig] = useState({
    name: "",
    subjects: [],
    difficulty: "all",
    questionCount: 10,
    timeLimit: 15,
    enableTimer: true,
    shuffleQuestions: true,
    showExplanations: true
  });
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


  const predefinedSessions = [
    {
      id: "quick_practice",
      name: "Quick Practice",
      description: "10 mixed questions, 15 minutes",
      icon: Zap,
      color: "from-teal-500 to-teal-600",
      questions: 10,
      time: 15,
      difficulty: "mixed",
      popular: true
    },
    {
      id: "focused_study",
      name: "Focused Study",
      description: "25 questions by topic, 45 minutes",
      icon: Target,
      color: "from-green-500 to-green-600",
      questions: 25,
      time: 45,
      difficulty: "progressive",
      popular: true
    },
    {
      id: "brain_training",
      name: "Brain Training",
      description: "50 challenging questions, 90 minutes",
      icon: Brain,
      color: "from-purple-500 to-purple-600",
      questions: 50,
      time: 90,
      difficulty: "hard",
      popular: false
    },
    {
      id: "subject_mastery",
      name: "Subject Mastery",
      description: "Deep dive into specific subjects",
      icon: BookOpen,
      color: "from-orange-500 to-orange-600",
      questions: 30,
      time: 60,
      difficulty: "medium",
      popular: false
    }
  ];


  const recentSessions = [
    {
      id: 1,
      name: "Mathematics Practice",
      score: 85,
      questions: 20,
      time: 35,
      date: "2024-01-14"
    },
    {
      id: 2,
      name: "Quick Practice",
      score: 92,
      questions: 10,
      time: 12,
      date: "2024-01-13"
    },
    {
      id: 3,
      name: "Science Review",
      score: 78,
      questions: 15,
      time: 28,
      date: "2024-01-12"
    }
  ];


  useEffect(() => {
    loadData();
  }, []);


  const loadData = async () => {
    setIsLoading(true);
    try {
      const subjectEntity = new Subject();
      const subjectsData = await subjectEntity.list();
      setSubjects(subjectsData);

      // Mock practice stats - in real app this would come from user's practice history
      setPracticeStats({
        totalSessions: 47,
        averageScore: 82,
        timeSpent: 1285, // in minutes
        questionsAttempted: 1420
      });
    } catch (error) {
      console.error("Error loading practice data:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleStartSession = (sessionId) => {
    // In real app, this would navigate to practice session
    console.log("Starting session:", sessionId);
    alert(`Starting ${sessionId} session! This would navigate to the practice interface.`);
  };


  const handleCreateCustomSession = () => {
    if (!sessionConfig.name.trim()) {
      alert("Please enter a session name");
      return;
    }

    console.log("Creating custom session:", sessionConfig);
    alert(`Custom session "${sessionConfig.name}" created! This would start the practice session.`);
    setShowCustomSession(false);
    resetSessionConfig();
  };


  const resetSessionConfig = () => {
    setSessionConfig({
      name: "",
      subjects: [],
      difficulty: "all",
      questionCount: 10,
      timeLimit: 15,
      enableTimer: true,
      shuffleQuestions: true,
      showExplanations: true
    });
  };


  const toggleSubject = (subjectId) => {
    setSessionConfig(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subjectId)
        ? prev.subjects.filter(id => id !== subjectId)
        : [...prev.subjects, subjectId]
    }));
  };


  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="text-slate-600 ml-4">Loading practice sessions...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Practice Assessments</h1>
          <p className="text-slate-500 font-medium text-base">Improve your skills with targeted assessment practice</p>
        </div>

        <Button onClick={() => setShowCustomSession(true)} variant="primary">
          <Settings className="w-4 h-4 mr-2 stroke-[3]" />
          Custom Assessment
        </Button>
      </div>


      {/* Stats Ribbon */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-2 mb-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{practiceStats.totalSessions}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Total Sessions</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{practiceStats.averageScore}%</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Avg Score</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{Math.round(practiceStats.timeSpent / 60)}h</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Time Spent</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 py-3 min-w-max">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{practiceStats.questionsAttempted.toLocaleString()}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Questions</p>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Predefined Sessions */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Practice Sessions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predefinedSessions.map((session) => {
                const IconComponent = session.icon;
                return (
                  <Card key={session.id} className="group hover:shadow-2xl transition-all duration-500 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden bg-white">
                    <CardHeader className="pb-4 pt-8 px-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${session.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                          <IconComponent className="w-7 h-7 text-white" />
                        </div>
                        {session.popular && (
                          <Badge className="bg-teal-500 text-white font-black text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md">
                            <Zap className="w-3 h-3 mr-1" /> HOT
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-teal-600 transition-colors">
                        {session.name}
                      </CardTitle>
                      <p className="text-slate-400 text-xs font-medium mt-2 leading-relaxed italic">
                        {session.description}
                      </p>
                    </CardHeader>

                    <CardContent className="px-8 pb-8 pt-2">
                      <div className="grid grid-cols-3 gap-2 mb-8">
                        <div className="text-center p-3 bg-slate-50 rounded-2xl border border-slate-100/50 group-hover:bg-white group-hover:border-teal-100 transition-all">
                          <p className="text-xs font-black text-slate-900">{session.questions}</p>
                          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Ques</p>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-2xl border border-slate-100/50 group-hover:bg-white group-hover:border-teal-100 transition-all">
                          <p className="text-xs font-black text-slate-900">{session.time}m</p>
                          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Time</p>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-2xl border border-slate-100/50 group-hover:bg-white group-hover:border-teal-100 transition-all">
                          <p className="text-xs font-black text-slate-900">{session.difficulty[0].toUpperCase()}</p>
                          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Diff</p>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleStartSession(session.id)}
                        variant="primary"
                        size="lg"
                        className="w-full group-hover:-translate-y-1"
                      >
                        <Play className="w-4 h-4 mr-2 fill-current" />
                        START ASSESSMENT
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>


        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900">Recent Assessments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{session.name}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>{session.questions}Q</span>
                      <span>•</span>
                      <span>{session.time}m</span>
                      <span>•</span>
                      <span>{session.date}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className={
                    session.score >= 85 ? "bg-green-100 text-green-800" :
                      session.score >= 70 ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                  }>
                    {session.score}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>


          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Sessions</span>
                  <span className="font-bold">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Questions</span>
                  <span className="font-bold">185</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Time</span>
                  <span className="font-bold">4.2h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Avg Score</span>
                  <span className="font-bold text-green-600">87%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>


      {/* Custom Session Modal */}
      <Dialog open={showCustomSession} onOpenChange={setShowCustomSession}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Custom Practice Session</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <Label htmlFor="sessionName">Session Name</Label>
              <Input
                id="sessionName"
                placeholder="Enter session name..."
                value={sessionConfig.name}
                onChange={(e) => setSessionConfig(prev => ({ ...prev, name: e.target.value }))}
                className="mt-2"
              />
            </div>


            <div>
              <Label className="text-sm font-medium">Select Subjects</Label>
              <div className="mt-2 grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                {subjects.map((subject) => (
                  <div key={subject.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={subject.id}
                      checked={sessionConfig.subjects.includes(subject.id)}
                      onCheckedChange={() => toggleSubject(subject.id)}
                    />
                    <Label htmlFor={subject.id} className="text-sm font-normal">
                      {subject.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>


            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Difficulty Level</Label>
                <Select
                  value={sessionConfig.difficulty}
                  onValueChange={(value) => setSessionConfig(prev => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>


              <div>
                <Label>Number of Questions</Label>
                <div className="mt-2">
                  <Slider
                    value={[sessionConfig.questionCount]}
                    onValueChange={(value) => setSessionConfig(prev => ({ ...prev, questionCount: value[0] }))}
                    max={100}
                    min={5}
                    step={5}
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>5</span>
                    <span className="font-medium">{sessionConfig.questionCount}</span>
                    <span>100</span>
                  </div>
                </div>
              </div>
            </div>


            <div>
              <Label>Time Limit (minutes)</Label>
              <div className="mt-2">
                <Slider
                  value={[sessionConfig.timeLimit]}
                  onValueChange={(value) => setSessionConfig(prev => ({ ...prev, timeLimit: value[0] }))}
                  max={180}
                  min={5}
                  step={5}
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>5</span>
                  <span className="font-medium">{sessionConfig.timeLimit}m</span>
                  <span>180</span>
                </div>
              </div>
            </div>


            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableTimer"
                  checked={sessionConfig.enableTimer}
                  onCheckedChange={(checked) => setSessionConfig(prev => ({ ...prev, enableTimer: checked }))}
                />
                <Label htmlFor="enableTimer">Enable timer</Label>
              </div>


              <div className="flex items-center space-x-2">
                <Checkbox
                  id="shuffleQuestions"
                  checked={sessionConfig.shuffleQuestions}
                  onCheckedChange={(checked) => setSessionConfig(prev => ({ ...prev, shuffleQuestions: checked }))}
                />
                <Label htmlFor="shuffleQuestions">Shuffle questions</Label>
              </div>


              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showExplanations"
                  checked={sessionConfig.showExplanations}
                  onCheckedChange={(checked) => setSessionConfig(prev => ({ ...prev, showExplanations: checked }))}
                />
                <Label htmlFor="showExplanations">Show explanations after answers</Label>
              </div>
            </div>
          </div>


          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomSession(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCustomSession} variant="primary">
              Start Practice Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
