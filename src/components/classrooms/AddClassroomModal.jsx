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
import { Checkbox } from "@/components/ui/checkbox";
import { Classroom } from "@/entities/all";


function AddClassroomModal({ isOpen, onClose, classroom, programs, courses, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    program_id: "",
    course_id: "",
    teacher_name: "",
    teacher_email: "",
    description: "",
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    if (classroom) {
      setFormData({
        name: classroom.name || "",
        program_id: classroom.program_id || "",
        course_id: classroom.course_id || "",
        teacher_name: classroom.teacher_name || "",
        teacher_email: classroom.teacher_email || "",
        description: classroom.description || "",
        is_active: classroom.is_active !== false
      });
    } else {
      setFormData({
        name: "",
        program_id: "",
        course_id: "",
        teacher_name: "",
        teacher_email: "",
        description: "",
        is_active: true
      });
    }
  }, [classroom]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.program_id || !formData.course_id || !formData.teacher_name) {
      alert("Please fill in all required fields");
      return;
    }


    setIsLoading(true);
    try {
      if (classroom) {
        await Classroom.update(classroom.id, formData);
      } else {
        await Classroom.create(formData);
      }


      onSave();
    } catch (error) {
      console.error("Error saving classroom:", error);
      alert("Error saving classroom. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{classroom ? "Edit Classroom" : "Create New Classroom"}</DialogTitle>
        </DialogHeader>
       
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Classroom Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter classroom name"
              className="mt-1"
            />
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
              <Label htmlFor="teacher_name">Teacher Name *</Label>
              <Input
                id="teacher_name"
                value={formData.teacher_name}
                onChange={(e) => setFormData({ ...formData, teacher_name: e.target.value })}
                placeholder="Enter teacher name"
                className="mt-1"
              />
            </div>
           
            <div>
              <Label htmlFor="teacher_email">Teacher Email</Label>
              <Input
                id="teacher_email"
                type="email"
                value={formData.teacher_email}
                onChange={(e) => setFormData({ ...formData, teacher_email: e.target.value })}
                placeholder="Enter teacher email"
                className="mt-1"
              />
            </div>
          </div>


          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter classroom description"
              className="mt-1"
              rows={3}
            />
          </div>


          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Classroom is active</Label>
          </div>


          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : classroom ? "Update Classroom" : "Create Classroom"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddClassroomModal;
