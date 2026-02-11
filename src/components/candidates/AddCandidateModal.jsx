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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Candidate, Program, Course, Classroom } from "@/entities/all";


function AddCandidateModal({ isOpen, onClose, candidate, programs, courses, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    student_id: "",
    program_id: "",
    course_id: "",
    classroom_id: "",
    gooru_id: "",
    enrollment_date: new Date(),
    status: "active"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [classrooms, setClassrooms] = useState([]);

  useEffect(() => {
    async function fetchClassrooms() {
      try {
        const classroomData = await Classroom.list();
        setClassrooms(classroomData);
      } catch (error) {
        console.error("Error fetching classrooms:", error);
      }
    }

    fetchClassrooms();
  }, []);


  useEffect(() => {
    if (candidate) {
      setFormData({
        name: candidate.name || "",
        email: candidate.email || "",
        phone: candidate.phone || "",
        student_id: candidate.student_id || "",
        program_id: candidate.program_id || "",
        course_id: candidate.course_id || "",
        classroom_id: candidate.classroom_id || "",
        gooru_id: candidate.gooru_id || "",
        enrollment_date: candidate.enrollment_date ? new Date(candidate.enrollment_date) : new Date(),
        status: candidate.status || "active"
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        student_id: "",
        program_id: "",
        course_id: "",
        classroom_id: "",
        gooru_id: "",
        enrollment_date: new Date(),
        status: "active"
      });
    }
  }, [candidate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.program_id || !formData.course_id) {
      alert("Please fill in all required fields");
      return;
    }


    setIsLoading(true);
    try {
      const candidateData = {
        ...formData,
        enrollment_date: formData.enrollment_date.toISOString().split('T')[0]
      };


      if (candidate) {
        await Candidate.update(candidate.id, candidateData);
      } else {
        await Candidate.create(candidateData);
      }


      onSave();
    } catch (error) {
      console.error("Error saving candidate:", error);
      alert("Error saving candidate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{candidate ? "Edit Candidate" : "Add New Candidate"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
                className="mt-1"
              />
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="student_id">Student ID</Label>
              <Input
                id="student_id"
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                placeholder="Enter student ID"
                className="mt-1"
              />
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="program">Program *</Label>
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
              <Label htmlFor="course">Course *</Label>
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
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="classroom">Classroom</Label>
              <Select
                value={formData.classroom_id}
                onValueChange={(value) => setFormData({ ...formData, classroom_id: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select classroom" />
                </SelectTrigger>
                <SelectContent>
                  {classrooms.map(classroom => (
                    <SelectItem key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="gooru_id">GOORU ID</Label>
              <Input
                id="gooru_id"
                value={formData.gooru_id}
                onChange={(e) => setFormData({ ...formData, gooru_id: e.target.value })}
                placeholder="Enter GOORU ID"
                className="mt-1"
              />
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Enrollment Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.enrollment_date ? format(formData.enrollment_date, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.enrollment_date}
                    onSelect={(date) => setFormData({ ...formData, enrollment_date: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                  <SelectItem value="dropped">Dropped</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>


          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} variant="primary">
              {isLoading ? "Saving..." : candidate ? "Update Candidate" : "Add Candidate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddCandidateModal;
