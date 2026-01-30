
import React, { useState, useEffect, useCallback } from 'react';
import PaperTemplateTable from '../components/papertemplates/PaperTemplateTable';
import AddEditPaperTemplateModal from '../components/papertemplates/AddEditPaperTemplateModal';
import CreateQuestionPaperModal from '../components/papertemplates/CreateQuestionPaperModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, FileText, Layers, Settings, CheckCircle, Clock } from 'lucide-react';
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
  const [paperCount, setPaperCount] = useState(0);

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
    loadPaperCount();
  }, [loadTemplates]);

  const loadPaperCount = async () => {
    try {
      const data = await questionPaperEntity.list();
      setPaperCount(data?.length || 0);
    } catch (error) {
      console.error("Error loading paper count:", error);
    }
  };

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
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Paper Templates</h1>
          <p className="text-slate-600 mt-1 md:mt-2 text-sm md:text-base">Create and manage paper templates for various examinations</p>
        </div>

        <div className="flex flex-wrap gap-2 md:gap-3 w-full lg:w-auto">
          <Button
            variant="outline"
            onClick={handleOpenCreateModal}
            disabled={selectedTemplates.length !== 1}
            className="flex-1 md:flex-none text-sm justify-center hover:bg-emerald-500 hover:text-white transition-all"
          >
            <Settings className="w-4 h-4 mr-2" />
            Create Question Paper
          </Button>
          <Button
            onClick={handleAddTemplate}
            variant="default"
            className="flex-1 md:flex-none text-sm justify-center hover:bg-emerald-500 hover:text-white transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Template
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <Card className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="p-2 md:p-4 bg-violet-50 rounded-xl">
                <Layers className="w-4 h-4 md:w-6 md:h-6 text-violet-600" />
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-xs md:text-sm font-medium">Total Templates</p>
              <p className="text-xl md:text-3xl font-bold text-slate-900 mt-1">{templates.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="p-2 md:p-4 bg-emerald-50 rounded-xl">
                <CheckCircle className="w-4 h-4 md:w-6 md:h-6 text-emerald-600" />
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-xs md:text-sm font-medium">Question Papers</p>
              <p className="text-xl md:text-3xl font-bold text-slate-900 mt-1">{paperCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="p-2 md:p-4 bg-blue-50 rounded-xl">
                <FileText className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-xs md:text-sm font-medium">Selected</p>
              <p className="text-xl md:text-3xl font-bold text-slate-900 mt-1">{selectedTemplates.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="p-2 md:p-4 bg-amber-50 rounded-xl">
                <Clock className="w-4 h-4 md:w-6 md:h-6 text-amber-600" />
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-xs md:text-sm font-medium">New</p>
              <p className="text-xl md:text-3xl font-bold text-slate-900 mt-1">
                {templates.filter(t => {
                  const created = new Date(t.created_at);
                  const now = new Date();
                  return (now - created) < (7 * 24 * 60 * 60 * 1000); // Created in last 7 days
                }).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/60 shadow-sm overflow-hidden">
        <CardContent className="p-0">

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
        </CardContent>
      </Card>
    </div>
  );
};

export default PaperTemplatesPage;
