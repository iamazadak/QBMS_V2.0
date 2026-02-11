import React, { useState } from "react";
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
import { Upload, Download, FileText, CheckCircle, XCircle } from "lucide-react";
import { Program, Course, Subject, Competency, Question, Option } from "@/entities/all";
import { useToast } from "@/components/ui/use-toast";


export default function BulkUploadModal({ isOpen, onClose, onUploadComplete }) {
  const { toast } = useToast();

  const programEntity = new Program();
  const courseEntity = new Course();
  const subjectEntity = new Subject();
  const competencyEntity = new Competency();
  const questionEntity = new Question();
  const optionEntity = new Option();

  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false); // New state variable
  const [uploadStatus, setUploadStatus] = useState({
    total: 0,
    success: 0,
    failed: 0,
    errors: [],
  });


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };


  const downloadTemplate = () => {
    const headers = [
      "program_name", "course_name", "subject_name", "subject_year", "competency_name",
      "question_text", "level", "positive_marks", "explanation",
      "option_a_text", "option_b_text", "option_c_text", "option_d_text",
      "correct_option_label"
    ];
    const csvContent = headers.join(",");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'question_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const handleUpload = async () => {
    if (!file) {
      toast({ variant: "destructive", description: "Please select a file to upload." });
      return;
    }


    setIsUploading(true);
    setUploadStatus({ total: 0, success: 0, failed: 0, errors: [] });


    const fileReader = new FileReader();
    fileReader.readAsText(file);


    fileReader.onload = async (e) => {
      const csvData = e.target.result;
      const lines = csvData.split(/\r\n|\n/);
      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1).filter(line => line.trim() !== '');


      let currentStatus = { total: rows.length, success: 0, failed: 0, errors: [] };
      setUploadStatus(currentStatus);


      const cache = { programs: new Map(), courses: new Map(), subjects: new Map(), competencies: new Map() };

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i].split(',');
        const rowData = headers.reduce((obj, header, index) => {
          obj[header] = row[index] ? row[index].trim() : '';
          return obj;
        }, {});


        try {
          // 1. Program
          let programId = cache.programs.get(rowData.program_name);
          if (!programId) {
            const existingPrograms = await programEntity.filter({ name: rowData.program_name });
            if (existingPrograms.length > 0) {
              programId = existingPrograms[0].id;
            } else {
              const newProgram = await programEntity.create({ name: rowData.program_name });
              programId = newProgram.id;
            }
            cache.programs.set(rowData.program_name, programId);
          }


          // 2. Course
          const courseKey = `${programId}_${rowData.course_name}`;
          let courseId = cache.courses.get(courseKey);
          if (!courseId) {
            const existingCourses = await courseEntity.filter({ name: rowData.course_name, program_id: programId });
            if (existingCourses.length > 0) {
              courseId = existingCourses[0].id;
            } else {
              const newCourse = await courseEntity.create({ name: rowData.course_name, program_id: programId });
              courseId = newCourse.id;
            }
            cache.courses.set(courseKey, courseId);
          }

          // 3. Subject
          const subjectKey = `${courseId}_${rowData.subject_name}`;
          let subjectId = cache.subjects.get(subjectKey);
          if (!subjectId) {
            const existingSubjects = await subjectEntity.filter({ name: rowData.subject_name, course_id: courseId });
            if (existingSubjects.length > 0) {
              subjectId = existingSubjects[0].id;
            } else {
              const newSubject = await subjectEntity.create({ name: rowData.subject_name, course_id: courseId, year: parseInt(rowData.subject_year) || null });
              subjectId = newSubject.id;
            }
            cache.subjects.set(subjectKey, subjectId);
          }

          // 3b. Competency
          let competencyId = null;
          if (rowData.competency_name) {
            const competencyKey = `${subjectId}_${rowData.competency_name}`;
            competencyId = cache.competencies.get(competencyKey);
            if (!competencyId) {
              const existingComp = await competencyEntity.filter({ name: rowData.competency_name, subject_id: subjectId });
              if (existingComp.length > 0) {
                competencyId = existingComp[0].id;
              } else {
                const newComp = await competencyEntity.create({ name: rowData.competency_name, subject_id: subjectId });
                competencyId = newComp.id;
              }
              cache.competencies.set(competencyKey, competencyId);
            }
          }

          // 4. Question
          let processedLevel = (rowData.level || 'medium').toLowerCase().trim();
          const allowedLevels = ['easy', 'medium', 'hard'];
          if (!allowedLevels.includes(processedLevel)) {
            throw new Error(`Invalid level value: '${rowData.level}'. Must be one of ${allowedLevels.join(', ')}.`);
          }

          const newQuestion = await questionEntity.create({
            question_text: rowData.question_text,
            subject_id: subjectId,
            competency_id: competencyId,
            level: processedLevel,
            positive_marks: parseFloat(rowData.positive_marks) || 1,
            solution_explanation: rowData.explanation,
          });

          // 5. Options
          const options = [
            { label: 'A', text: rowData.option_a_text },
            { label: 'B', text: rowData.option_b_text },
            { label: 'C', text: rowData.option_c_text },
            { label: 'D', text: rowData.option_d_text },
          ];


          for (const opt of options) {
            if (opt.text) {
              await optionEntity.create({
                question_id: newQuestion.id,
                option_label: opt.label,
                option_text: opt.text,
                is_correct: rowData.correct_option_label === opt.label,
              });
            }
          }


          currentStatus.success++;
        } catch (error) {
          currentStatus.failed++;
          currentStatus.errors.push(`Row ${i + 2}: ${error.message}`);
        }
        setUploadStatus({ ...currentStatus });
      }
      setIsUploading(false);
      toast({ description: `Bulk upload finished. ${currentStatus.success} succeeded, ${currentStatus.failed} failed.` });
    };


    fileReader.onerror = () => {
      toast({ variant: "destructive", description: "Error reading file." });
      setIsUploading(false);
    };
  };

  const resetState = () => {
    setFile(null);
    setIsUploading(false);
    setUploadStatus({ total: 0, success: 0, failed: 0, errors: [] });
  };

  const handleClose = () => {
    if (isUploading) return;
    resetState();
    if (uploadStatus.total > 0) { // Only call onUploadComplete if an upload was attempted
      onUploadComplete();
    }
    onClose();
  };




  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Bulk Upload Questions
          </DialogTitle>
        </DialogHeader>


        <div className="space-y-4 py-4">
          <p className="text-sm text-slate-600">
            Upload a CSV file with your questions. Make sure it follows the template format.
          </p>
          <div className="p-4 border rounded-lg bg-blue-50 border-blue-200 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-blue-800">CSV Template</h4>
              <p className="text-sm text-teal-700">Download this template to ensure your data is correctly formatted for bulk upload.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>


          <div>
            <Label htmlFor="csv-file" className="mb-2">Upload CSV File</Label>
            <div
              className={`mt-2 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                ${isDraggingOver ? 'border-teal-500 bg-teal-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
              `}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); if (!isUploading) setIsDraggingOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); if (!isUploading) setIsDraggingOver(false); }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDraggingOver(false); // Reset drag state
                if (isUploading) return;
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile && droppedFile.type === 'text/csv') {
                  setFile(droppedFile);
                } else {
                  toast({ variant: "destructive", description: "Only CSV files are supported." });
                }
              }}
              onClick={() => !isUploading && document.getElementById('csv-file').click()}
            >
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center space-x-2">
                  <FileText className="w-6 h-6 text-teal-500" />
                  <span className="text-sm text-slate-700 font-medium">{file.name}</span>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); }} disabled={isUploading} className="rounded-xl">
                    <XCircle className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">CSV only</p>
                </div>
              )}
            </div>
          </div>


          {uploadStatus.total > 0 && (
            <div className="p-4 bg-slate-50 rounded-lg space-y-2">
              <h4 className="font-semibold">Upload Progress</h4>
              <p>Total rows to process: {uploadStatus.total}</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div
                  className="bg-teal-600 h-2.5 rounded-full"
                  style={{ width: `${((uploadStatus.success + uploadStatus.failed) / uploadStatus.total) * 100 || 0}%` }}
                ></div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Succeeded: {uploadStatus.success}
                </p>
                <p className="text-red-600 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  Failed: {uploadStatus.failed}
                </p>
              </div>
              {uploadStatus.errors.length > 0 && (
                <div className="mt-2">
                  <h5 className="font-medium">Error Details:</h5>
                  <div className="max-h-24 overflow-y-auto text-xs bg-red-50 p-2 rounded">
                    {uploadStatus.errors.map((err, i) => <p key={i}>{err}</p>)}
                  </div>
                </div>
              )}
            </div>
          )}


        </div>


        <DialogFooter className="flex justify-center flex-row gap-4">
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            {uploadStatus.total > 0 ? "Close" : "Cancel"}
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading} variant="primary">
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}