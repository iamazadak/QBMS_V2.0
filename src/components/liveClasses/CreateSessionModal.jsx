import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { LiveSession } from "@/entities/all";
import { Alert, AlertDescription } from "@/components/ui/alert";


export default function CreateSessionModal({ isOpen, onClose, programs, courses, subjects, onSessionCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructor_name: "",
    instructor_email: "",
    program_id: "",
    course_id: "",
    subject_id: "",
    scheduled_date: null,
    duration_minutes: 60,
    max_participants: 100,
    zoom_meeting_id: "",
    zoom_join_url: "",
    zoom_password: ""
  });
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        title: "",
        description: "",
        instructor_name: "",
        instructor_email: "",
        program_id: "",
        course_id: "",
        subject_id: "",
        scheduled_date: null,
        duration_minutes: 60,
        max_participants: 100,
        zoom_meeting_id: "",
        zoom_join_url: "",
        zoom_password: ""
      });
    }
  }, [isOpen]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.instructor_name || !formData.scheduled_date) {
      alert("Please fill in all required fields");
      return;
    }


    if (!formData.zoom_join_url) {
      alert("Please provide Zoom meeting details");
      return;
    }


    setIsLoading(true);
    try {
      // Create the live session
      const sessionData = {
        ...formData,
        scheduled_date: formData.scheduled_date.toISOString(),
        status: "scheduled"
      };


      await LiveSession.create(sessionData);
      alert("Live session created successfully!");
      onSessionCreated();
    } catch (error) {
      console.error("Error creating live session:", error);
      alert("Error creating session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  const generateZoomMeeting = () => {
    // This is a placeholder - in production, this would call Zoom API
    const mockMeetingId = Math.floor(100000000 + Math.random() * 900000000);
    const mockPassword = Math.random().toString(36).substring(7);

    setFormData({
      ...formData,
      zoom_meeting_id: mockMeetingId.toString(),
      zoom_join_url: `https://zoom.us/j/${mockMeetingId}?pwd=${mockPassword}`,
      zoom_password: mockPassword
    });


    alert("Mock Zoom meeting generated. In production, this would create a real Zoom meeting via API.");
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Live Session</DialogTitle>
        </DialogHeader>


        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-teal-600" />
          <AlertDescription className="text-blue-800">
            <strong>Note:</strong> To enable actual Zoom API integration, please enable backend functions in Dashboard → Settings.
            Currently using mock Zoom meeting generation for demonstration.
          </AlertDescription>
        </Alert>


        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div>
            <Label htmlFor="title">Session Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Advanced JavaScript Concepts"
              className="mt-1"
            />
          </div>


          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what will be covered in this session"
              className="mt-1"
              rows={3}
            />
          </div>


          {/* Instructor Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="instructor_name">Instructor Name *</Label>
              <Input
                id="instructor_name"
                value={formData.instructor_name}
                onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })}
                placeholder="Instructor name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="instructor_email">Instructor Email</Label>
              <Input
                id="instructor_email"
                type="email"
                value={formData.instructor_email}
                onChange={(e) => setFormData({ ...formData, instructor_email: e.target.value })}
                placeholder="instructor@example.com"
                className="mt-1"
              />
            </div>
          </div>


          {/* Course/Program Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="program">Program</Label>
              <Select
                value={formData.program_id}
                onValueChange={(value) => setFormData({ ...formData, program_id: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map(program => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="course">Course</Label>
              <Select
                value={formData.course_id}
                onValueChange={(value) => setFormData({ ...formData, course_id: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={formData.subject_id}
                onValueChange={(value) => setFormData({ ...formData, subject_id: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>


          {/* Schedule Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label>Scheduled Date & Time *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.scheduled_date ? format(formData.scheduled_date, 'PPP p') : 'Select date and time'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.scheduled_date}
                    onSelect={(date) => setFormData({ ...formData, scheduled_date: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                min="15"
                step="15"
                className="mt-1"
              />
            </div>
          </div>


          <div>
            <Label htmlFor="max_participants">Max Participants</Label>
            <Input
              id="max_participants"
              type="number"
              value={formData.max_participants}
              onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
              min="1"
              className="mt-1"
            />
          </div>


          {/* Zoom Meeting Details */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <Label>Zoom Meeting Details</Label>
              <Button
                type="button"
                variant="outline"
                onClick={generateZoomMeeting}
              >
                Generate Zoom Meeting (Mock)
              </Button>
            </div>


            <div className="space-y-4">
              <div>
                <Label htmlFor="zoom_meeting_id">Meeting ID</Label>
                <Input
                  id="zoom_meeting_id"
                  value={formData.zoom_meeting_id}
                  onChange={(e) => setFormData({ ...formData, zoom_meeting_id: e.target.value })}
                  placeholder="123 456 7890"
                  className="mt-1"
                />
              </div>


              <div>
                <Label htmlFor="zoom_join_url">Join URL *</Label>
                <Input
                  id="zoom_join_url"
                  value={formData.zoom_join_url}
                  onChange={(e) => setFormData({ ...formData, zoom_join_url: e.target.value })}
                  placeholder="https://zoom.us/j/..."
                  className="mt-1"
                />
              </div>


              <div>
                <Label htmlFor="zoom_password">Meeting Password</Label>
                <Input
                  id="zoom_password"
                  value={formData.zoom_password}
                  onChange={(e) => setFormData({ ...formData, zoom_password: e.target.value })}
                  placeholder="Optional password"
                  className="mt-1"
                />
              </div>
            </div>
          </div>


          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Live Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
