import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bookmark, Search, Star, Tag, Trash2, Edit2, Heart } from "lucide-react";
import { SavedQuestion, Question, Option, Subject, Course, Program, User } from "@/entities/all";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";


export default function SavedQuestionsPage() {
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // 10 items per page
  const isMobile = useIsMobile();


  useEffect(() => {
    loadData();
  }, []);


  const loadData = async () => {
    setIsLoading(true);
    try {
      // Get current user
      const user = await User.me();
      setCurrentUser(user);

      // Load saved questions for current user
      const saved = await SavedQuestion.filter({ user_email: user.email });

      // Load question details for each saved item
      const savedWithDetails = await Promise.all(
        saved.map(async (savedItem) => {
          try {
            const question = await Question.get(savedItem.question_id);
            const options = await Option.filter({ question_id: question.id });

            // Load subject, course, and program details
            let subject = null;
            let course = null;
            let program = null;

            if (question.subject_id) {
              try {
                subject = await Subject.get(question.subject_id);
                if (subject?.course_id) {
                  course = await Course.get(subject.course_id);
                  if (course?.program_id) {
                    program = await Program.get(course.program_id);
                  }
                }
              } catch (error) {
                console.warn("Error loading related data:", error);
              }
            }

            return {
              ...savedItem,
              question: {
                ...question,
                options,
                subject,
                course,
                program
              }
            };
          } catch (error) {
            console.warn(`Question not found for saved item ${savedItem.id}:`, error);
            return null;
          }
        })
      );

      setSavedQuestions(savedWithDetails.filter(item => item !== null));
    } catch (error) {
      console.error("Error loading saved questions:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleUnsave = async (savedItemId) => {
    try {
      await SavedQuestion.delete(savedItemId);
      loadData();
    } catch (error) {
      console.error("Error removing saved question:", error);
    }
  };


  const handleToggleFavorite = async (savedItem) => {
    try {
      await SavedQuestion.update(savedItem.id, {
        is_favorite: !savedItem.is_favorite
      });
      loadData();
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };


  const handleEditSave = async (formData) => {
    try {
      await SavedQuestion.update(editingItem.id, formData);
      setShowEditModal(false);
      setEditingItem(null);
      loadData();
    } catch (error) {
      console.error("Error updating saved question:", error);
    }
  };


  const getAllTags = () => {
    const tags = new Set();
    savedQuestions.forEach(item => {
      if (item.tags) {
        item.tags.split(',').forEach(tag => tags.add(tag.trim()));
      }
    });
    return Array.from(tags);
  };


  const filteredQuestions = savedQuestions.filter(item => {
    const matchesSearch = !searchTerm ||
      item.question.question_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.question.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTag = !selectedTag ||
      item.tags?.split(',').some(tag => tag.trim() === selectedTag);

    return matchesSearch && matchesTag;
  });

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const paginatedQuestions = filteredQuestions.slice(indexOfFirst, indexOfLast);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTag]);


  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800"
  };


  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="text-slate-600 ml-4">Loading saved questions...</p>
        </div>
      </div>
    );
  }


  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-slate-900`}>Saved Questions</h1>
        <p className={`text-slate-600 mt-2 ${isMobile ? 'text-sm' : ''}`}>Your bookmarked questions and personal notes</p>
      </div>


      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-violet-50 rounded-xl">
                <Bookmark className="w-6 h-6 text-violet-600" />
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Saved</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{savedQuestions.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-rose-50 rounded-xl">
                <Heart className="w-6 h-6 text-rose-600" />
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Favorites</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{savedQuestions.filter(q => q.is_favorite).length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-emerald-50 rounded-xl">
                <Edit2 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">With Notes</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{savedQuestions.filter(q => q.notes).length}</p>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search saved questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedTag === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTag("")}
          >
            All Tags
          </Button>
          {getAllTags().map(tag => (
            <Button
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag(tag)}
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Button>
          ))}
        </div>
      </div>


      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <Bookmark className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No saved questions found</h3>
            <p className="text-slate-600 mb-6">Start saving questions from the Question Bank to see them here</p>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Bookmark className="w-4 h-4 mr-2" />
              Browse Questions
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-6">
            {paginatedQuestions.map((savedItem) => (
              <Card key={savedItem.id} className="hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {savedItem.is_favorite && (
                          <Heart className="w-4 h-4 text-red-500 fill-current" />
                        )}
                        <Badge variant="secondary" className={difficultyColors[savedItem.question.difficulty]}>
                          {savedItem.question.difficulty?.toUpperCase()}
                        </Badge>
                        {savedItem.question.subject && (
                          <Badge variant="outline">
                            {savedItem.question.subject.name}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">
                        {savedItem.question.question_text}
                      </CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleFavorite(savedItem)}
                      >
                        <Heart className={`w-4 h-4 ${savedItem.is_favorite ? 'text-red-500 fill-current' : 'text-slate-400'}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingItem(savedItem);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUnsave(savedItem.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    {savedItem.question.options?.map((option, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded border text-sm ${option.is_correct
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : 'bg-slate-50 border-slate-200'
                          }`}
                      >
                        <span className="font-medium">{option.option_label}:</span> {option.option_text}
                      </div>
                    ))}
                  </div>

                  {/* Personal Notes */}
                  {savedItem.notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-sm font-medium text-blue-800 mb-1">Your Notes:</p>
                      <p className="text-sm text-teal-700">{savedItem.notes}</p>
                    </div>
                  )}

                  {/* Tags */}
                  {savedItem.tags && (
                    <div className="flex flex-wrap gap-1">
                      {savedItem.tags.split(',').map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-4">
            <div className="text-sm text-slate-600">
              Showing {Math.min(filteredQuestions.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredQuestions.length, currentPage * itemsPerPage)} of {filteredQuestions.length} saved questions
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm font-medium px-2">Page {currentPage} of {Math.ceil(filteredQuestions.length / itemsPerPage) || 1}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredQuestions.length / itemsPerPage), prev + 1))}
                disabled={currentPage === Math.ceil(filteredQuestions.length / itemsPerPage) || filteredQuestions.length === 0}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}


      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Saved Question</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <EditSavedQuestionForm
              savedItem={editingItem}
              onSave={handleEditSave}
              onCancel={() => setShowEditModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


function EditSavedQuestionForm({ savedItem, onSave, onCancel }) {
  const [notes, setNotes] = useState(savedItem.notes || "");
  const [tags, setTags] = useState(savedItem.tags || "");
  const [isFavorite, setIsFavorite] = useState(savedItem.is_favorite || false);


  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      notes,
      tags,
      is_favorite: isFavorite
    });
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Personal Notes</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add your personal notes about this question..."
          className="mt-2"
          rows={4}
        />
      </div>

      <div>
        <Label>Tags (comma-separated)</Label>
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g., important, review, difficult"
          className="mt-2"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_favorite"
          checked={isFavorite}
          onChange={(e) => setIsFavorite(e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="is_favorite">Mark as favorite</Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  );
}
