
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import QuestionSelector from './QuestionSelector';

export default function CreateQuestionPaperModal({ isOpen, onClose, template, onSave }) {
  const { toast } = useToast();
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isQuestionSelectorOpen, setIsQuestionSelectorOpen] = useState(false);
  const [editingSectionIndex, setEditingSectionIndex] = useState(null);

  useEffect(() => {
    if (isOpen && template) {
      setSections(template.sections.map(s => ({ ...s, questions: [] })));
    }
  }, [isOpen, template]);

  const handleOpenQuestionSelector = (index) => {
    setEditingSectionIndex(index);
    setIsQuestionSelectorOpen(true);
  };

  const handleSaveSelectedQuestions = (selectedQuestionIds) => {
    const newSections = [...sections];
    newSections[editingSectionIndex].questions = selectedQuestionIds;
    setSections(newSections);
    setIsQuestionSelectorOpen(false);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement save logic for the question paper
      console.log('Saving question paper:', { template, sections });
      onSave({ template, sections });
      onClose();
    } catch (error) {
      console.error('Error saving question paper:', error);
      toast({ variant: 'destructive', description: 'Error saving question paper.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create Question Paper from: {template?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[80vh] overflow-y-auto p-2">
            {sections.map((section, index) => (
              <div key={index} className="p-4 border rounded-lg bg-white">
                <h4 className="font-semibold">{section.name}</h4>
                <p>Number of questions to select: {section.num_questions}</p>
                <div className="col-span-3 mt-4">
                  <Button variant="outline" onClick={() => handleOpenQuestionSelector(index)}>Select Questions ({section.questions.length} selected)</Button>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Question Paper'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isQuestionSelectorOpen} onOpenChange={setIsQuestionSelectorOpen}>
        <DialogContent className="w-full max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select Questions</DialogTitle>
          </DialogHeader>
          <QuestionSelector
            selectedQuestions={sections[editingSectionIndex]?.questions || []}
            onSelectionChange={(selectedIds) => {
              const newSections = [...sections];
              newSections[editingSectionIndex].questions = selectedIds;
              setSections(newSections);
            }}
          />
          <DialogFooter>
            <Button onClick={() => setIsQuestionSelectorOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
