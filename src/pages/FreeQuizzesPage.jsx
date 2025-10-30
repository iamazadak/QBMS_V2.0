import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift, Search, Play, Users, Clock, Star, TrendingUp, Heart, Award } from "lucide-react";


export default function FreeQuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [isLoading, setIsLoading] = useState(true);


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
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 ml-4">Loading free quizzes...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Free Quizzes</h1>
        <p className="text-slate-600 mt-2">Explore our collection of free, community-created quizzes</p>
      </div>


      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100">Total Quizzes</p>
                <p className="text-2xl font-bold">{quizzes.length}</p>
              </div>
              <Gift className="w-8 h-8 text-pink-200" />
            </div>
          </CardContent>
        </Card>
       
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Participants</p>
                <p className="text-2xl font-bold">{(quizzes.reduce((sum, quiz) => sum + quiz.participants, 0) / 1000).toFixed(1)}K</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
       
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Avg Rating</p>
                <p className="text-2xl font-bold">
                  {quizzes.length > 0 ? (quizzes.reduce((sum, quiz) => sum + quiz.rating, 0) / quizzes.length).toFixed(1) : 'N/A'}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>
       
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <Award className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search quizzes by title, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
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
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Featured Quizzes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                 
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    <Play className="w-4 h-4 mr-2" />
                    Start Quiz
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
            All Quizzes ({filteredQuizzes.length})
          </h2>
        </div>


        {filteredQuizzes.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Gift className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No quizzes found</h3>
              <p className="text-slate-600 mb-6">
                {searchTerm || categoryFilter !== "all" || difficultyFilter !== "all"
                  ? "Try adjusting your search filters"
                  : "Free quizzes will appear here once added to the system"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-shadow duration-300 border-slate-200/60">
                {/* Add a thumbnail to each quiz card for visual appeal */}
                <div className="relative">
                  <div
                    className="h-40 bg-cover bg-center rounded-t-lg"
                    style={{ backgroundImage: `url(${quiz.thumbnail})` }}
                  ></div>
                  {quiz.isFeatured && (
                    <Badge className="absolute top-3 left-3 bg-yellow-500 text-white">
                      Featured
                    </Badge>
                  )}
                </div>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {quiz.isNew && (
                          <Badge className="bg-green-500 text-white text-xs">NEW</Badge>
                        )}
                        <Badge variant="secondary" className={getCategoryColor(quiz.category)}>
                          {quiz.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg line-clamp-2 mb-2">
                        {quiz.title}
                      </CardTitle>
                      <p className="text-slate-600 text-sm line-clamp-2">
                        {quiz.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
               
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary" className={getDifficultyColor(quiz.difficulty)}>
                      {quiz.difficulty}
                    </Badge>
                    <span className="text-xs text-slate-500">by {quiz.author}</span>
                  </div>
                 
                  <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{quiz.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{quiz.participants.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current text-yellow-500" />
                      <span>{quiz.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{quiz.questions}Q</span>
                    </div>
                  </div>
                 
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button className="flex-1 bg-slate-900 hover:bg-slate-800">
                      <Play className="w-4 h-4 mr-2" />
                      Start Quiz
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
