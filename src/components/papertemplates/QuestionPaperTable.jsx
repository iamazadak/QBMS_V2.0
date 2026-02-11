
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Download, FileText, Calendar, Layout } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function QuestionPaperTable({
  questionPapers = [],
  onDelete,
  isLoading = false,
}) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-none bg-slate-50/50 hover:bg-slate-50/50">
            <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Question Paper Title</TableHead>
            <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Template Used</TableHead>
            <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Generated Date</TableHead>
            <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <TableRow key={i} className="border-slate-50">
                <TableCell className="p-8"><div className="h-4 bg-slate-100 rounded w-full animate-pulse"></div></TableCell>
                <TableCell className="p-8"><div className="h-4 bg-slate-100 rounded w-full animate-pulse"></div></TableCell>
                <TableCell className="p-8"><div className="h-4 bg-slate-100 rounded w-full animate-pulse"></div></TableCell>
                <TableCell className="p-8"><div className="h-4 bg-slate-100 rounded w-full animate-pulse"></div></TableCell>
              </TableRow>
            ))
          ) : questionPapers.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={4} className="text-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <FileText className="w-10 h-10 text-slate-200" />
                  </div>
                  <p className="text-xl font-black text-slate-900 tracking-tight">No Question Papers Generated</p>
                  <p className="text-slate-400 text-sm font-medium">Create a template first to generate papers.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            questionPapers.map((qp) => (
              <TableRow key={qp.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                <TableCell className="py-6 px-8">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-white transition-colors">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-none mb-1.5">{qp.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">PDF DOCUMENT</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-6 px-8 text-slate-600 font-medium">
                  <div className="flex items-center gap-2">
                    <Layout className="w-4 h-4 text-slate-300" />
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-md">
                      {qp.paper_template?.title || "CUSTOM"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="py-6 px-8 text-slate-500 font-bold text-xs italic">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-300" />
                    {new Date(qp.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </TableCell>
                <TableCell className="py-6 px-8 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button asChild variant="outline" size="sm" className="rounded-xl">
                      <Link to={`/paperpreview/${qp.id}`} className="flex items-center gap-2">
                        <Eye className="h-3.5 w-3.5" /> PREVIEW
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl">
                      <Download className="h-3.5 w-3.5 mr-2" /> PDF
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(qp.id)} className="h-9 w-9 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                      <Trash2 className="h-4 w-4" />
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
