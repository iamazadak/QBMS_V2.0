
import React, { useState, useEffect, useCallback } from 'react';
import { Question } from '@/entities/all';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/components/ui/use-toast';

const questionEntity = new Question();

const QuestionSelector = ({ selectedQuestions, onSelectionChange }) => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await questionEntity.list();
      setQuestions(data);
    } catch (error) {
      toast({ variant: "destructive", description: "Failed to load questions." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleSelectQuestion = (questionId, checked) => {
    if (checked) {
      onSelectionChange([...selectedQuestions, questionId]);
    } else {
      onSelectionChange(selectedQuestions.filter((id) => id !== questionId));
    }
  };

  return (
    <div className="max-h-[50vh] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Question</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Level</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>
          ) : (
            questions.map((question) => (
              <TableRow key={question.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedQuestions.includes(question.id)}
                    onCheckedChange={(checked) => handleSelectQuestion(question.id, checked)}
                  />
                </TableCell>
                <TableCell>{question.question_text}</TableCell>
                <TableCell>{question.subject?.name}</TableCell>
                <TableCell>{question.level}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default QuestionSelector;
