import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, X, UserPlus, Users } from "lucide-react";
import { ClassroomCandidate, Candidate } from "@/entities/all";
import { format } from "date-fns";


export default function ManageCandidatesModal({ isOpen, onClose, classroom, onUpdate }) {
  const [allCandidates, setAllCandidates] = useState([]);
  const [classroomCandidates, setClassroomCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);


  const loadData = useCallback(async () => {
    if (!classroom) return;

    try {
      // Load all candidates and classroom candidates
      const [allCands, classroomCands] = await Promise.all([
        Candidate.filter({ status: 'active' }),
        ClassroomCandidate.filter({ classroom_id: classroom.id })
      ]);


      // Get full candidate details for classroom candidates
      const classroomCandidateDetails = await Promise.all(
        classroomCands.map(async (cc) => {
          try {
            const candidate = await Candidate.get(cc.candidate_id);
            return { ...candidate, classroom_candidate_id: cc.id };
          } catch (error) {
            return null;
          }
        })
      );


      setAllCandidates(allCands);
      setClassroomCandidates(classroomCandidateDetails.filter(c => c !== null));
    } catch (error) {
      console.error("Error loading candidates:", error);
    }
  }, [classroom]);


  useEffect(() => {
    if (isOpen && classroom) {
      loadData();
    }
  }, [isOpen, classroom, loadData]);


  const handleAddCandidates = async () => {
    if (selectedCandidates.length === 0) {
      alert("Please select at least one candidate to add");
      return;
    }


    setIsLoading(true);
    try {
      for (const candidateId of selectedCandidates) {
        await ClassroomCandidate.create({
          classroom_id: classroom.id,
          candidate_id: candidateId,
          enrollment_date: new Date().toISOString().split('T')[0],
          status: 'active'
        });
      }


      setSelectedCandidates([]);
      await loadData();
      onUpdate();
      alert(`Successfully added ${selectedCandidates.length} candidate(s) to the classroom`);
    } catch (error) {
      console.error("Error adding candidates:", error);
      alert("Error adding candidates. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleRemoveCandidate = async (classroomCandidateId) => {
    const confirmRemove = window.confirm("Are you sure you want to remove this candidate from the classroom?");
    if (!confirmRemove) return;


    try {
      await ClassroomCandidate.delete(classroomCandidateId);
      await loadData();
      onUpdate();
    } catch (error) {
      console.error("Error removing candidate:", error);
      alert("Error removing candidate. Please try again.");
    }
  };


  const filteredAvailableCandidates = allCandidates.filter(candidate => {
    const alreadyInClassroom = classroomCandidates.some(cc => cc.id === candidate.id);
    const matchesSearch = candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return !alreadyInClassroom && matchesSearch;
  });


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Manage Students - {classroom?.name}
          </DialogTitle>
        </DialogHeader>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[70vh]">
          {/* Current Classroom Students */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Current Students ({classroomCandidates.length})</h3>
            </div>


            {classroomCandidates.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p>No students in this classroom yet</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classroomCandidates.map((candidate) => (
                      <TableRow key={candidate.id}>
                        <TableCell className="font-medium">{candidate.name}</TableCell>
                        <TableCell className="text-sm text-slate-600">{candidate.email}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveCandidate(candidate.classroom_candidate_id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>


          {/* Available Students to Add */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Add Students</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>


            {filteredAvailableCandidates.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p>No available candidates found</p>
              </div>
            ) : (
              <>
                <div className="border rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAvailableCandidates.map((candidate) => (
                        <TableRow key={candidate.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedCandidates.includes(candidate.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedCandidates([...selectedCandidates, candidate.id]);
                                } else {
                                  setSelectedCandidates(selectedCandidates.filter(id => id !== candidate.id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{candidate.name}</TableCell>
                          <TableCell className="text-sm text-slate-600">{candidate.email}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>


                {selectedCandidates.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-900">
                      {selectedCandidates.length} candidate(s) selected
                    </span>
                    <Button
                      size="sm"
                      onClick={handleAddCandidates}
                      disabled={isLoading}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      {isLoading ? "Adding..." : "Add Selected"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>


        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
