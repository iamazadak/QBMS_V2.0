import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X, RefreshCw } from "lucide-react";
import { Program, Course, Subject, Competency } from "@/entities/all";
import { useToast } from "@/components/ui/use-toast";

export default function SearchFilter({ onFiltersChange, activeFilters = {} }) {
  const { toast } = useToast();

  const programEntity = new Program();
  const courseEntity = new Course();
  const subjectEntity = new Subject();
  const competencyEntity = new Competency();

  const [searchText, setSearchText] = useState(activeFilters.search || "");
  const [selectedProgram, setSelectedProgram] = useState(activeFilters.program || "");
  const [selectedCourse, setSelectedCourse] = useState(activeFilters.course || "");
  const [selectedSubject, setSelectedSubject] = useState(activeFilters.subject || "");
  const [selectedCompetency, setSelectedCompetency] = useState(activeFilters.competency || "");
  const [selectedLevel, setSelectedLevel] = useState(activeFilters.level || "");
  const [selectedYear, setSelectedYear] = useState(activeFilters.year || "");
  const [selectedTag, setSelectedTag] = useState(activeFilters.tag || "");
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [competencies, setCompetencies] = useState([]);

  // Load programs on initial mount
  useEffect(() => {
    loadPrograms();
  }, []);

  // Load courses when selected program changes
  useEffect(() => {
    if (selectedProgram && selectedProgram !== "all") {
      loadCourses(selectedProgram);
    } else {
      setCourses([]);
      setSelectedCourse("");
      setSubjects([]);
      setSelectedSubject("");
    }
  }, [selectedProgram]);

  // Load subjects when selected course changes
  useEffect(() => {
    if (selectedCourse && selectedCourse !== "all") {
      loadSubjects(selectedCourse);
    } else {
      setSubjects([]);
      setSelectedSubject("");
      setCompetencies([]);
      setSelectedCompetency("");
    }
  }, [selectedCourse]);

  // Load competencies when selected subject changes
  useEffect(() => {
    if (selectedSubject && selectedSubject !== "all") {
      loadCompetencies(selectedSubject);
    } else {
      setCompetencies([]);
      setSelectedCompetency("");
    }
  }, [selectedSubject]);

  const handleFiltersChange = useCallback(() => {
    const filters = {
      search: searchText || "",
      program: selectedProgram === "all" ? "" : selectedProgram,
      course: selectedCourse === "all" ? "" : selectedCourse,
      subject: selectedSubject === "all" ? "" : selectedSubject,
      competency: selectedCompetency === "all" ? "" : selectedCompetency,
      level: selectedLevel === "all" ? "" : selectedLevel,
      year: selectedYear === "all" ? "" : selectedYear,
      tag: selectedTag || "",
    };
    console.log("Applying filters:", filters);
    onFiltersChange(filters);
  }, [searchText, selectedProgram, selectedCourse, selectedSubject, selectedCompetency, selectedLevel, selectedYear, selectedTag, onFiltersChange]);

  // Trigger handleFiltersChange when its dependencies change
  useEffect(() => {
    handleFiltersChange();
  }, [handleFiltersChange]);

  const loadPrograms = async () => {
    try {
      const data = await programEntity.list();
      setPrograms(data || []);
    } catch (error) {
      console.error("Error loading programs:", error);
      toast({ variant: "destructive", description: "Failed to load programs." });
    }
  };

  const loadCourses = async (programId) => {
    try {
      const data = await courseEntity.filter({ program_id: programId });
      setCourses(data || []);
    } catch (error) {
      console.error("Error loading courses:", error);
      toast({ variant: "destructive", description: "Failed to load courses." });
    }
  };

  const loadSubjects = async (courseId) => {
    try {
      const data = await subjectEntity.filter({ course_id: courseId });
      setSubjects(data || []);
    } catch (error) {
      console.error("Error loading subjects:", error);
      toast({ variant: "destructive", description: "Failed to load subjects." });
    }
  };

  const loadCompetencies = async (subjectId) => {
    try {
      const data = await competencyEntity.filter({ subject_id: subjectId });
      setCompetencies(data || []);
    } catch (error) {
      console.error("Error loading competencies:", error);
      toast({ variant: "destructive", description: "Failed to load competencies." });
    }
  };

  const clearFilters = () => {
    setSearchText("");
    setSelectedProgram("");
    setSelectedCourse("");
    setSelectedSubject("");
    setSelectedCompetency("");
    setSelectedLevel("");
    setSelectedYear("");
    setSelectedTag("");
  };

  const removeFilter = (filterKey) => {
    switch (filterKey) {
      case "search":
        setSearchText("");
        break;
      case "program":
        setSelectedProgram("");
        break;
      case "course":
        setSelectedCourse("");
        break;
      case "subject":
        setSelectedSubject("");
        break;
      case "competency":
        setSelectedCompetency("");
        break;
      case "level":
        setSelectedLevel("");
        break;
      case "year":
        setSelectedYear("");
        break;
      case "tag":
        setSelectedTag("");
        break;
      default:
        break;
    }
  };

  const getActiveFilterCount = () => {
    return [searchText, selectedProgram, selectedCourse, selectedSubject, selectedCompetency, selectedLevel, selectedYear, selectedTag].filter(
      (value) => value && value !== "" && value !== "all"
    ).length;
  };

  return (
    <div className="w-full space-y-4 mb-6">
      <div className="bg-card rounded-xl border shadow-sm p-5 space-y-5">
        {/* Top Row: Search & Meta Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search questions by text..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 h-10 w-full"
            />
          </div>

          <div className="relative w-full md:max-w-[240px]">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
            <Input
              placeholder="Filter by Tag (#...)"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="pl-9 h-10 w-full text-sm font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="hidden md:flex">
                {getActiveFilterCount()} active filters
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              disabled={getActiveFilterCount() === 0}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${getActiveFilterCount() > 0 ? '' : 'opacity-50'}`} />
              Reset
            </Button>
          </div>
        </div>

        {/* Middle Row: Filter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <Select value={selectedProgram} onValueChange={setSelectedProgram}>
            <SelectTrigger className="bg-white border-slate-200 focus:ring-indigo-100">
              <SelectValue placeholder="All Programs" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-xl border-slate-200">
              <SelectItem value="all">All Programs</SelectItem>
              {programs.map((program) => (
                <SelectItem key={program.id} value={program.id}>
                  {program.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedCourse}
            onValueChange={setSelectedCourse}
            disabled={!selectedProgram || selectedProgram === "all"}
          >
            <SelectTrigger className="bg-white border-slate-200 focus:ring-indigo-100">
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-xl border-slate-200">
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedSubject}
            onValueChange={setSelectedSubject}
            disabled={!selectedCourse || selectedCourse === "all"}
          >
            <SelectTrigger className="bg-white border-slate-200 focus:ring-indigo-100">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-xl border-slate-200">
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedCompetency}
            onValueChange={setSelectedCompetency}
            disabled={!selectedSubject || selectedSubject === "all"}
          >
            <SelectTrigger className="bg-white border-slate-200 focus:ring-indigo-100">
              <SelectValue placeholder="All Competencies" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-xl border-slate-200">
              <SelectItem value="all">All Competencies</SelectItem>
              {competencies.map((comp) => (
                <SelectItem key={comp.id} value={comp.id}>
                  {comp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="bg-white border-slate-200 focus:ring-indigo-100">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-xl border-slate-200">
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="bg-white border-slate-200 focus:ring-indigo-100">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-xl border-slate-200">
              <SelectItem value="all">All Years</SelectItem>
              {Array.from({ length: 3 }, (_, i) => 1 + i).map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  Year {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bottom Row: Active Filter Tags (Mobile/Desktop) */}
        {getActiveFilterCount() > 0 && (
          <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-slate-100">
            <span className="text-filter-label mr-2">Active:</span>

            {searchText && (
              <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                Search: "{searchText}"
                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 rounded-xl" onClick={() => removeFilter("search")}>
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}

            {selectedProgram && selectedProgram !== "all" && (
              <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                {programs.find((p) => p.id === selectedProgram)?.name || "Program"}
                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 rounded-xl" onClick={() => removeFilter("program")}>
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}

            {selectedCourse && selectedCourse !== "all" && (
              <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                {courses.find((c) => c.id === selectedCourse)?.name || "Course"}
                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 rounded-xl" onClick={() => removeFilter("course")}>
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}

            {selectedSubject && selectedSubject !== "all" && (
              <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                {subjects.find((s) => s.id === selectedSubject)?.name || "Subject"}
                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 rounded-xl" onClick={() => removeFilter("subject")}>
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}

            {selectedCompetency && selectedCompetency !== "all" && (
              <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                {competencies.find((c) => c.id === selectedCompetency)?.name || "Competency"}
                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 rounded-xl" onClick={() => removeFilter("competency")}>
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}

            {selectedLevel && selectedLevel !== "all" && (
              <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                {selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)}
                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 rounded-xl" onClick={() => removeFilter("level")}>
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}

            {selectedYear && selectedYear !== "all" && (
              <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                Year {selectedYear}
                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 rounded-xl" onClick={() => removeFilter("year")}>
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}

            {selectedTag && (
              <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-1 bg-slate-900 text-white hover:bg-slate-800 border-slate-700">
                Tag: #{selectedTag}
                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 rounded-xl" onClick={() => removeFilter("tag")}>
                  <X className="w-3 h-3 text-white" />
                </Button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}