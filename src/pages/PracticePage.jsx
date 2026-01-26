import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Target, Play, Settings, Timer, BookOpen, Brain, TrendingUp, Zap } from "lucide-react";
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
      const subjectsData = await Subject.list();
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
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="text-slate-600 ml-4">Loading practice sessions...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Practice Sessions</h1>
          <p className="text-slate-600 mt-2">Improve your skills with targeted practice</p>
        </div>

        <Button onClick={() => setShowCustomSession(true)} className="bg-teal-600 hover:bg-teal-700">
          <Settings className="w-4 h-4 mr-2" />
          Custom Session
        </Button>
      </div>


      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-violet-50 rounded-xl">
                <Target className="w-6 h-6 text-violet-600" />
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Sessions</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{practiceStats.totalSessions}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-emerald-50 rounded-xl">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Average Score</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{practiceStats.averageScore}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-amber-50 rounded-xl">
                <Timer className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Time Spent</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{Math.round(practiceStats.timeSpent / 60)}h</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-rose-50 rounded-xl">
                <BookOpen className="w-6 h-6 text-rose-600" />
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Questions Done</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{practiceStats.questionsAttempted}</p>
            </div>
          </CardContent>
        </Card>
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
                  <Card key={session.id} className="hover:shadow-lg transition-all duration-300 border-slate-200/60">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${session.color} flex items-center justify-center`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        {session.popular && (
                          <Badge className="bg-yellow-100 text-yellow-800">Popular</Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{session.name}</CardTitle>
                      <p className="text-slate-600 text-sm">{session.description}</p>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-2 mb-4 text-sm text-slate-600">
                        <div className="flex items-center justify-between">
                          <span>Questions:</span>
                          <span className="font-medium">{session.questions}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Time:</span>
                          <span className="font-medium">{session.time} min</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Difficulty:</span>
                          <span className="font-medium capitalize">{session.difficulty}</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleStartSession(session.id)}
                        className="w-full bg-slate-900 hover:bg-slate-800"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Session
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
              <CardTitle className="text-lg">Recent Sessions</CardTitle>
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
            <Button onClick={handleCreateCustomSession} className="bg-teal-600 hover:bg-teal-700">
              Start Practice Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
