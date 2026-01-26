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
import { CalendarIcon, AlertCircle, Mail, MessageSquare, Phone } from "lucide-react";
import { format } from "date-fns";
import { OnlineSession, OnlineSessionAttendee, Candidate } from "@/entities/all";
import { SendEmail } from "@/integrations/Core";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";


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
  const [assignmentType, setAssignmentType] = useState("course");
  const [notificationMethods, setNotificationMethods] = useState({
    email: true,
    sms: false,
    whatsapp: false
  });


  useEffect(() => {
    if (!isOpen) {
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
      const sessionData = {
        ...formData,
        scheduled_date: formData.scheduled_date.toISOString(),
        status: "scheduled"
      };


      const createdSession = await OnlineSession.create(sessionData);
      await assignAttendeesAndNotify(createdSession);


      alert("Online session created and notifications sent successfully!");
      onSessionCreated();
    } catch (error) {
      console.error("Error creating online session:", error);
      alert("Error creating session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  const assignAttendeesAndNotify = async (session) => {
    try {
      let candidates = [];


      if (assignmentType === "course" && formData.course_id) {
        const allCandidates = await Candidate.list();
        candidates = allCandidates.filter(c => c.course_id === formData.course_id && c.status === 'active');
      } else if (assignmentType === "program" && formData.program_id) {
        const allCandidates = await Candidate.list();
        candidates = allCandidates.filter(c => c.program_id === formData.program_id && c.status === 'active');
      }


      for (const candidate of candidates) {
        await OnlineSessionAttendee.create({
          session_id: session.id,
          attendee_email: candidate.email,
          attendee_name: candidate.name,
          attendee_phone: candidate.phone || "",
          notification_sent: false
        });


        // Send email notification
        if (notificationMethods.email) {
          try {
            await SendEmail({
              to: candidate.email,
              subject: `Invitation: ${session.title}`,
              body: `
Dear ${candidate.name},

You have been invited to an online session:

Title: ${session.title}
Instructor: ${session.instructor_name}
Date: ${format(new Date(session.scheduled_date), 'PPP')}
Time: ${format(new Date(session.scheduled_date), 'p')}
Duration: ${session.duration_minutes} minutes


${session.description ? `\nDescription:\n${session.description}\n` : ''}


Join Link: ${session.zoom_join_url}
${session.zoom_password ? `Password: ${session.zoom_password}` : ''}

Please join the session on time.


Best regards,
Lernern
              `.rim()
            });


            await OnlineSessionAttendee.filter({
              session_id: session.id,
              attendee_email: candidate.email
            }).then(async (attendees) => {
              if (attendees.length > 0) {
                await OnlineSessionAttendee.update(attendees[0].id, {
                  notification_sent: true,
                  notification_method: 'email'
                });
              }
            });
          } catch (error) {
            console.error(`Failed to send email to ${candidate.email}:`, error);
          }
        }


        // SMS and WhatsApp notifications would require backend functions
        if (notificationMethods.sms || notificationMethods.whatsapp) {
          console.log(`SMS/WhatsApp notifications require backend functions. Phone: ${candidate.phone}`);
        }
      }


      console.log(`Assigned and notified ${candidates.length} attendees`);
    } catch (error) {
      console.error("Error assigning attendees:", error);
    }
  };


  const generateZoomMeeting = () => {
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
          <DialogTitle>Create Online Session</DialogTitle>
        </DialogHeader>


        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-teal-600" />
          <AlertDescription className="text-blue-800">
            <strong>Note:</strong> Email notifications will be sent automatically. For SMS and WhatsApp notifications, enable backend functions in Dashboard → Settings.
          </AlertDescription>
        </Alert>


        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ... keep existing code (title, description, instructor fields) ... */}
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


          {/* Assignment Type and Notification Methods */}
          <div className="border-t pt-4">
            <Label className="mb-3 block">Assign Attendees By</Label>
            <Select value={assignmentType} onValueChange={setAssignmentType}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="course">By Course</SelectItem>
                <SelectItem value="program">By Program</SelectItem>
              </SelectContent>
            </Select>


            <div className="mt-4">
              <Label className="mb-3 block">Notification Methods</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email"
                    checked={notificationMethods.email}
                    onCheckedChange={(checked) => setNotificationMethods({ ...notificationMethods, email: checked })}
                  />
                  <Mail className="w-4 h-4 text-slate-500" />
                  <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Email
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sms"
                    checked={notificationMethods.sms}
                    onCheckedChange={(checked) => setNotificationMethods({ ...notificationMethods, sms: checked })}
                  />
                  <Phone className="w-4 h-4 text-slate-500" />
                  <label htmlFor="sms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    SMS (requires backend functions)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="whatsapp"
                    checked={notificationMethods.whatsapp}
                    onCheckedChange={(checked) => setNotificationMethods({ ...notificationMethods, whatsapp: checked })}
                  />
                  <MessageSquare className="w-4 h-4 text-slate-500" />
                  <label htmlFor="whatsapp" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    WhatsApp (requires backend functions)
                  </label>
                </div>
              </div>
            </div>
          </div>


          {/* ... keep existing code (course selection, schedule, zoom details) ... */}
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
              {isLoading ? "Creating..." : "Create & Notify"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
