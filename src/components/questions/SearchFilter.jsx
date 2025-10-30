import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, RefreshCw } from "lucide-react";
import { Program, Course, Subject } from "@/entities/all";
import { useToast } from "@/components/ui/use-toast";

export default function SearchFilter({ onFiltersChange, activeFilters = {} }) {
  const { toast } = useToast();

  const programEntity = new Program();
  const courseEntity = new Course();
  const subjectEntity = new Subject();

  const [searchText, setSearchText] = useState(activeFilters.search || "");
  const [selectedProgram, setSelectedProgram] = useState(activeFilters.program || "");
  const [selectedCourse, setSelectedCourse] = useState(activeFilters.course || "");
  const [selectedSubject, setSelectedSubject] = useState(activeFilters.subject || "");
  const [selectedLevel, setSelectedLevel] = useState(activeFilters.level || "");
  const [selectedYear, setSelectedYear] = useState(activeFilters.year || "");
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Load programs on initial mount
  useEffect(() => {
    loadPrograms();
  }, []);

  // Load courses when selected program changes
  useEffect(() => {
    if (selectedProgram) {
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
    if (selectedCourse) {
      loadSubjects(selectedCourse);
    } else {
      setSubjects([]);
      setSelectedSubject("");
    }
  }, [selectedCourse]);

  const handleFiltersChange = useCallback(() => {
    const filters = {
      search: searchText || "",
      program: selectedProgram || "",
      course: selectedCourse || "",
      subject: selectedSubject || "",
      level: selectedLevel || "",
      year: selectedYear || "",
    };
    console.log("Applying filters:", filters);
    onFiltersChange(filters);
  }, [searchText, selectedProgram, selectedCourse, selectedSubject, selectedLevel, selectedYear, onFiltersChange]);

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

  const clearFilters = () => {
    setSearchText("");
    setSelectedProgram("");
    setSelectedCourse("");
    setSelectedSubject("");
    setSelectedLevel("");
    setSelectedYear("");
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
      case "level":
        setSelectedLevel("");
        break;
      case "year":
        setSelectedYear("");
        break;
      default:
        break;
    }
  };

  const getActiveFilterCount = () => {
    return [searchText, selectedProgram, selectedCourse, selectedSubject, selectedLevel, selectedYear].filter(
      (value) => value && value !== ""
    ).length;
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-slate-900">Search & Filter</h3>
        {getActiveFilterCount() > 0 && (
          <Badge variant="secondary" className="ml-2">
            {getActiveFilterCount()} active
          </Badge>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          placeholder="Search questions..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="pl-10 h-11 w-full"
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
          <select
            value={selectedProgram}
            onChange={(e) => {
              console.log("Program changed to:", e.target.value);
              setSelectedProgram(e.target.value);
            }}
            className="h-10 border border-slate-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Program</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCourse}
            onChange={(e) => {
              console.log("Course changed to:", e.target.value);
              setSelectedCourse(e.target.value);
            }}
            disabled={!selectedProgram}
            className="h-10 border border-slate-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => {
              console.log("Subject changed to:", e.target.value);
              setSelectedSubject(e.target.value);
            }}
            disabled={!selectedCourse}
            className="h-10 border border-slate-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => {
              console.log("Level changed to:", e.target.value);
              setSelectedLevel(e.target.value);
            }}
            className="h-10 border border-slate-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Level</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            value={selectedYear}
            onChange={(e) => {
              console.log("Year changed to:", e.target.value);
              setSelectedYear(e.target.value);
            }}
            className="h-10 border border-slate-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Year</option>
            {Array.from({ length: 3 }, (_, i) => 1 + i).map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Active Filters */}
        {getActiveFilterCount() > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-slate-600 font-medium">Active filters:</span>
            {searchText && (
              <Badge variant="outline" className="gap-1">
                Search: {searchText}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => {
                    console.log("Removing search filter");
                    removeFilter("search");
                  }}
                />
              </Badge>
            )}
            {selectedProgram && (
              <Badge variant="outline" className="gap-1">
                Program: {programs.find((p) => p.id === selectedProgram)?.name || "Unknown"}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => {
                    console.log("Removing program filter");
                    removeFilter("program");
                  }}
                />
              </Badge>
            )}
            {selectedCourse && (
              <Badge variant="outline" className="gap-1">
                Course: {courses.find((c) => c.id === selectedCourse)?.name || "Unknown"}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => {
                    console.log("Removing course filter");
                    removeFilter("course");
                  }}
                />
              </Badge>
            )}
            {selectedSubject && (
              <Badge variant="outline" className="gap-1">
                Subject: {subjects.find((s) => s.id === selectedSubject)?.name || "Unknown"}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => {
                    console.log("Removing subject filter");
                    removeFilter("subject");
                  }}
                />
              </Badge>
            )}
            {selectedLevel && (
              <Badge variant="outline" className="gap-1">
                {selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => {
                    console.log("Removing level filter");
                    removeFilter("level");
                  }}
                />
              </Badge>
            )}
            {selectedYear && (
              <Badge variant="outline" className="gap-1">
                Year: {selectedYear}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => {
                    console.log("Removing year filter");
                    removeFilter("year");
                  }}
                />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                console.log("Clearing all filters");
                clearFilters();
              }}
              className="ml-2"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}