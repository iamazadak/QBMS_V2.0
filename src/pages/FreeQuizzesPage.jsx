import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift, Search, Play, Users, Clock, Star, TrendingUp, Heart, Award, Zap, FileText } from "lucide-react";
import KpiCard from "@/components/shared/KpiCard";
import { useIsMobile } from "@/hooks/use-mobile";


export default function FreeQuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();


  const categories = [
    "General Knowledge",
    "Science",
    "Mathematics",
    "History",
    "Geography",
    "Literature",
    "Technology",
    "Sports",
    "Entertainment"
  ];


  const generateMockQuizzes = useCallback(() => {
    return [
      {
        id: "fq_1",
        title: "World Capitals Quiz",
        description: "Test your knowledge of world capitals with this engaging geography quiz",
        category: "Geography",
        difficulty: "medium",
        questions: 20,
        duration: 15,
        participants: 12485,
        rating: 4.7,
        isNew: false,
        isFeatured: true,
        author: "GeoMaster",
        thumbnail: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=400",
        tags: ["geography", "capitals", "world"]
      },
      {
        id: "fq_2",
        title: "Basic Math Challenge",
        description: "Sharpen your arithmetic skills with fundamental math problems",
        category: "Mathematics",
        difficulty: "easy",
        questions: 15,
        duration: 10,
        participants: 8940,
        rating: 4.5,
        isNew: true,
        isFeatured: false,
        author: "MathWiz",
        thumbnail: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=400",
        tags: ["math", "arithmetic", "basic"]
      },
      {
        id: "fq_3",
        title: "Science Trivia Extravaganza",
        description: "Explore fascinating science facts across physics, chemistry, and biology",
        category: "Science",
        difficulty: "hard",
        questions: 30,
        duration: 25,
        participants: 6720,
        rating: 4.8,
        isNew: false,
        isFeatured: true,
        author: "ScienceGeek",
        thumbnail: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400",
        tags: ["science", "physics", "chemistry", "biology"]
      },
      {
        id: "fq_4",
        title: "Pop Culture 2024",
        description: "How well do you know this year's biggest trends, movies, and music?",
        category: "Entertainment",
        difficulty: "medium",
        questions: 25,
        duration: 20,
        participants: 15673,
        rating: 4.3,
        isNew: true,
        isFeatured: false,
        author: "PopCulturePro",
        thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
        tags: ["entertainment", "pop culture", "2024", "music", "movies"]
      },
      {
        id: "fq_5",
        title: "Ancient History Mysteries",
        description: "Journey through time to explore civilizations, empires, and historical events",
        category: "History",
        difficulty: "hard",
        questions: 35,
        duration: 30,
        participants: 4920,
        rating: 4.9,
        isNew: false,
        isFeatured: true,
        author: "HistoryBuff",
        thumbnail: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400",
        tags: ["history", "ancient", "civilizations", "empires"]
      },
      {
        id: "fq_6",
        title: "Tech Innovations Quiz",
        description: "Test your knowledge about latest technology trends and innovations",
        category: "Technology",
        difficulty: "medium",
        questions: 18,
        duration: 12,
        participants: 9840,
        rating: 4.4,
        isNew: true,
        isFeatured: false,
        author: "TechGuru",
        thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400",
        tags: ["technology", "innovation", "trends", "gadgets"]
      }
    ];
  }, []);


  const loadQuizzes = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock data for free quizzes - in real app this would come from API
      const mockQuizzes = generateMockQuizzes();
      setQuizzes(mockQuizzes);
    } catch (error) {
      console.error("Error loading free quizzes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [generateMockQuizzes]);


  const applyFilters = useCallback(() => {
    let filtered = [...quizzes];


    if (searchTerm) {
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }


    if (categoryFilter !== "all") {
      filtered = filtered.filter(quiz => quiz.category === categoryFilter);
    }


    if (difficultyFilter !== "all") {
      filtered = filtered.filter(quiz => quiz.difficulty === difficultyFilter);
    }


    // Sort
    switch (sortBy) {
      case "popular":
        filtered.sort((a, b) => b.participants - a.participants);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        // Assuming 'isNew' acts as a flag, true items first. For actual date-based sort, mock data would need dates.
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case "shortest":
        filtered.sort((a, b) => a.duration - b.duration);
        break;
      default:
        // Default sort by popular if sortBy is unrecognized or not set
        filtered.sort((a, b) => b.participants - a.participants);
        break;
    }


    setFilteredQuizzes(filtered);
  }, [quizzes, searchTerm, categoryFilter, difficultyFilter, sortBy]);


  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]); // Dependency array updated to include loadQuizzes


  useEffect(() => {
    applyFilters();
  }, [applyFilters]); // Dependency array updated to include applyFilters


  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      hard: "bg-red-100 text-red-800"
    };
    return colors[difficulty] || "bg-gray-100 text-gray-800";
  };


  const getCategoryColor = (category) => {
    const colors = {
      "General Knowledge": "bg-blue-100 text-blue-800",
      "Science": "bg-purple-100 text-purple-800",
      "Mathematics": "bg-indigo-100 text-indigo-800",
      "History": "bg-amber-100 text-amber-800",
      "Geography": "bg-emerald-100 text-emerald-800",
      "Literature": "bg-pink-100 text-pink-800",
      "Technology": "bg-cyan-100 text-cyan-800",
      "Sports": "bg-orange-100 text-orange-800",
      "Entertainment": "bg-rose-100 text-rose-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };


  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="text-slate-600 ml-4">Loading free quizzes...</p>
        </div>
      </div>
    );
  }


  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Free Assessments</h1>
        <p className="text-slate-500 font-medium text-base">Explore our collection of free, community-created assessments</p>
      </div>


      {/* Stats Ribbon */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-2 mb-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{quizzes.length}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Total Assessments</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">
              {(quizzes.reduce((sum, quiz) => sum + quiz.participants, 0) / 1000).toFixed(1)}K
            </p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Participants</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 py-3 border-r border-slate-100 min-w-max">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">
              {quizzes.length > 0 ? (quizzes.reduce((sum, quiz) => sum + quiz.rating, 0) / quizzes.length).toFixed(1) : 'N/A'}
            </p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Avg Rating</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-8 py-3 min-w-max">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{categories.length}</p>
            <p className="text-subscript uppercase tracking-[0.1em] mt-1.5">Categories</p>
          </div>
        </div>
      </div>


      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search assessments by title, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-white border-slate-200 focus:ring-2 focus:ring-teal-500/20 rounded-xl"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="shortest">Shortest</SelectItem>
          </SelectContent>
        </Select>
      </div>


      {/* Featured Quizzes */}
      {filteredQuizzes.some(quiz => quiz.isFeatured) && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Featured Assessments</h2>
          <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-3 gap-6'}`}>
            {filteredQuizzes.filter(quiz => quiz.isFeatured).slice(0, 3).map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-all duration-300 border-slate-200/60 overflow-hidden">
                <div className="relative">
                  {/* Using dynamic thumbnail from mock data */}
                  <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${quiz.thumbnail})` }}></div>
                  <Badge className="absolute top-3 right-3 bg-yellow-500 text-white">
                    Featured
                  </Badge>
                </div>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg line-clamp-2">{quiz.title}</CardTitle>
                  <p className="text-slate-600 text-sm line-clamp-2">{quiz.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className={getCategoryColor(quiz.category)}>
                      {quiz.category}
                    </Badge>
                    <Badge variant="secondary" className={getDifficultyColor(quiz.difficulty)}>
                      {quiz.difficulty}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 mb-4">
                    <div className="flex items-center justify-between">
                      <span>{quiz.questions} Questions</span>
                      <span>{quiz.duration} min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current text-yellow-500" />
                        {quiz.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {quiz.participants.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Button variant="primary" size="lg" className="w-full">
                    <Play className="w-4 h-4 mr-2 fill-current" />
                    Start Assessment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}


      {/* All Quizzes */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            All Assessments ({filteredQuizzes.length})
          </h2>
        </div>


        {filteredQuizzes.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Gift className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No assessments found</h3>
              <p className="text-slate-600 mb-6">
                {searchTerm || categoryFilter !== "all" || difficultyFilter !== "all"
                  ? "Try adjusting your search filters"
                  : "Free assessments will appear here once added to the system"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-2 lg:grid-cols-3 gap-8'}`}>
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz.id} className="group hover:shadow-2xl transition-all duration-500 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden bg-white flex flex-col">
                <div className="relative overflow-hidden aspect-video">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${quiz.thumbnail})` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-teal-500 text-white font-black text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                      {quiz.isNew ? 'NEW' : 'ASSESSMENT'}
                    </Badge>
                  </div>

                  {quiz.isFeatured && (
                    <div className="absolute top-4 right-4 animate-pulse">
                      <div className="p-2 bg-yellow-400 rounded-full shadow-lg">
                        <Zap className="w-4 h-4 text-white fill-current" />
                      </div>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-4 pt-6 px-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className={`${getCategoryColor(quiz.category)} border-none font-black text-[9px] uppercase tracking-[0.15em] px-0`}>
                      {quiz.category}
                    </Badge>
                    <span className="text-slate-300 text-[10px]">•</span>
                    <Badge variant="outline" className={`${getDifficultyColor(quiz.difficulty)} border-none font-black text-[9px] uppercase tracking-[0.15em] px-0`}>
                      {quiz.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-teal-600 transition-colors line-clamp-1">
                    {quiz.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="px-8 pb-8 flex-1 flex flex-col">
                  <p className="text-slate-400 text-xs font-medium leading-relaxed italic line-clamp-2 mb-8 flex-1">
                    "{quiz.description}"
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-slate-50 rounded-3xl border border-slate-100/50 group-hover:bg-white group-hover:border-teal-100 transition-all">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span className="text-[11px] font-black text-slate-700">{quiz.duration} MIN</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-teal-500" />
                      <span className="text-[11px] font-black text-slate-700">{quiz.questions} QUES</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" size="lg" className="px-5">
                      <Heart className="w-5 h-5" />
                    </Button>
                    <Button variant="primary" size="lg" className="flex-1 group-hover:-translate-y-1">
                      <Play className="w-5 h-5 mr-3 fill-current" />
                      START ASSESSMENT
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
