
import React, { useState, useEffect, useCallback } from 'react';
import PaperTemplateTable from '../components/papertemplates/PaperTemplateTable';
import AddEditPaperTemplateModal from '../components/papertemplates/AddEditPaperTemplateModal';
import CreateQuestionPaperModal from '../components/papertemplates/CreateQuestionPaperModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PaperTemplate, QuestionPaper } from '@/entities/all';
import { useToast } from '@/components/ui/use-toast';

const paperTemplateEntity = new PaperTemplate();
const questionPaperEntity = new QuestionPaper();

const PaperTemplatesPage = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await paperTemplateEntity.list();
      setTemplates(data);
    } catch (error) {
      toast({ variant: "destructive", description: "Failed to load templates." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setIsAddEditModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    if (selectedTemplates.length !== 1) {
      toast({ variant: "destructive", description: "Please select exactly one template to create a question paper from." });
      return;
    }
    const template = templates.find(t => t.id === selectedTemplates[0]);
    setEditingTemplate(template);
    setIsCreateModalOpen(true);
  };

  const handleDeleteTemplates = async (templateIds) => {
    try {
      await Promise.all(templateIds.map(id => paperTemplateEntity.delete(id)));
      loadTemplates();
      toast({ description: "Templates deleted successfully." });
    } catch (error) {
      toast({ variant: "destructive", description: "Failed to delete templates." });
    }
  };

  const handleSaveTemplate = async (savedTemplate) => {
    try {
      if (editingTemplate) {
        await paperTemplateEntity.update(editingTemplate.id, savedTemplate);
      } else {
        await paperTemplateEntity.create(savedTemplate);
      }
      loadTemplates();
      toast({ description: `Template ${editingTemplate ? 'updated' : 'created'} successfully.` });
    } catch (error) {
      toast({ variant: "destructive", description: `Failed to save template.` });
    }
  };

  const handleSaveQuestionPaper = async (questionPaper) => {
    try {
      await questionPaperEntity.create(questionPaper);
      toast({ description: "Question paper created successfully." });
    } catch (error) {
      toast({ variant: "destructive", description: "Failed to create question paper." });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Paper Templates</h1>
          <p className="text-slate-500">Create and manage paper templates for various examinations.</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleAddTemplate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Template
          </Button>
          <Button onClick={handleOpenCreateModal} disabled={selectedTemplates.length !== 1}>
            Create Question Paper
          </Button>
        </div>
      </div>

      <PaperTemplateTable
        templates={templates}
        selectedTemplates={selectedTemplates}
        onSelectionChange={setSelectedTemplates}
        onEditTemplate={handleEditTemplate}
        onDeleteTemplates={handleDeleteTemplates}
        isLoading={isLoading}
      />

      <AddEditPaperTemplateModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        template={editingTemplate}
        onSave={handleSaveTemplate}
      />

      <CreateQuestionPaperModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        template={editingTemplate}
        onSave={handleSaveQuestionPaper}
      />
    </div>
  );
};

export default PaperTemplatesPage;
