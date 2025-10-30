
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Edit2, Trash2, MoreHorizontal, FileText, Plus, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PaperTemplateTable({
  templates = [],
  selectedTemplates = [],
  onSelectionChange,
  onEditTemplate,
  onDeleteTemplates,
  isLoading = false,
}) {
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      onSelectionChange(templates.map((t) => t.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectTemplate = (templateId, checked) => {
    if (checked) {
      onSelectionChange([...selectedTemplates, templateId]);
    } else {
      onSelectionChange(selectedTemplates.filter((id) => id !== templateId));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-x-auto max-h-[60vh] overflow-y-auto">
      {isLoading ? (
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="align-middle text-center p-4">
                <Checkbox disabled />
              </TableHead>
              <TableHead className="align-middle text-left p-4">Template Name</TableHead>
              <TableHead className="align-middle text-left p-4">Exam Type</TableHead>
              <TableHead className="align-middle text-left p-4">Sections</TableHead>
              <TableHead className="align-middle text-left p-4">Created At</TableHead>
              <TableHead className="align-middle text-left p-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell className="align-middle grid place-items-center p-4 h-full">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                </TableCell>
                <TableCell className="align-middle">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                </TableCell>
                <TableCell className="align-middle">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                </TableCell>
                <TableCell className="align-middle">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                </TableCell>
                <TableCell className="align-middle">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                </TableCell>
                <TableCell className="align-middle">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          <Table className="w-full">
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="align-middle text-center p-4">
                  <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
                </TableHead>
                <TableHead className="align-middle text-left p-4">Template Name</TableHead>
                <TableHead className="align-middle text-left p-4">Exam Type</TableHead>
                <TableHead className="align-middle text-left p-4">Sections</TableHead>
                <TableHead className="align-middle text-left p-4">Created At</TableHead>
                <TableHead className="align-middle text-left p-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="text-slate-500 flex flex-col items-center justify-center">
                      <FileText className="w-16 h-16 text-slate-300 mb-4" />
                      <p className="text-lg font-medium">No templates found</p>
                      <p className="text-sm mt-2">
                        Create a new template to get started.
                      </p>
                      <Button variant="outline" className="mt-4" onClick={() => onEditTemplate(null)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Template
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((template, index) => (
                  <React.Fragment key={template.id}>
                    <TableRow
                      className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-slate-100 transition-colors duration-150`}
                    >
                      <TableCell className="align-middle grid place-items-center p-4 h-full">
                        <Checkbox
                          checked={selectedTemplates.includes(template.id)}
                          onCheckedChange={(checked) => handleSelectTemplate(template.id, checked)}
                        />
                      </TableCell>
                      <TableCell className="align-middle">
                        <p className="text-slate-700">{template.name}</p>
                      </TableCell>
                      <TableCell className="align-middle">
                        <p className="text-slate-700">{template.exam_type}</p>
                      </TableCell>
                      <TableCell className="align-middle">
                        <p className="text-slate-700">{template.sections?.length || 0}</p>
                      </TableCell>
                      <TableCell className="align-middle">
                        <p className="text-slate-700">{new Date(template.created_at).toLocaleDateString()}</p>
                      </TableCell>
                      <TableCell className="align-middle grid place-items-center p-4 h-full">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            asChild
                          >
                            <Link to={`/paperpreview/${template.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onEditTemplate(template)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:bg-red-100"
                            onClick={() => onDeleteTemplates([template.id])}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
