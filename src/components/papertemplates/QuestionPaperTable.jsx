
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function QuestionPaperTable({
  questionPapers = [],
  onDelete,
  isLoading = false,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-x-auto">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Template</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div></TableCell>
                <TableCell><div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div></TableCell>
                <TableCell><div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div></TableCell>
                <TableCell><div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div></TableCell>
              </TableRow>
            ))
          ) : questionPapers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-12">
                <p className="text-lg font-medium text-slate-500">No question papers found.</p>
              </TableCell>
            </TableRow>
          ) : (
            questionPapers.map((qp) => (
              <TableRow key={qp.id}>
                <TableCell>{qp.title}</TableCell>
                <TableCell>{qp.paper_template?.title}</TableCell>
                <TableCell>{new Date(qp.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button asChild variant="ghost" size="icon">
                      <Link to={`/paperpreview/${qp.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(qp.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
