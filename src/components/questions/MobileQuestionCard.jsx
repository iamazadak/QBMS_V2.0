import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ChevronDown,
    ChevronUp,
    Edit2,
    Trash2,
    CheckCircle2,
    Info,
    Layers,
    BookOpen
} from "lucide-react";

const levelColors = {
    easy: "bg-emerald-50 text-emerald-700 border-emerald-100",
    medium: "bg-amber-50 text-amber-700 border-amber-100",
    hard: "bg-rose-50 text-rose-700 border-rose-100",
};

export default function MobileQuestionCard({ question, onEdit, onDelete, isSelected, onSelect }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const correctAnswer = question.options?.find(opt => opt.is_correct);

    return (
        <Card className={`mb-4 transition-all duration-300 shadow-sm ${isSelected ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-slate-200'
            }`}>
            {/* Header: Label, Selection & Badge */}
            <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                        checked={isSelected}
                        onChange={(e) => onSelect(question.id, e.target.checked)}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Select
                    </span>
                </div>
            </CardHeader>

            {/* Question Text */}
            <CardContent className="p-4 pb-2">
                <p className="text-slate-800 font-bold text-base leading-snug">
                    {question.question_text}
                </p>

                {/* Options Preview */}
                <div className="mt-4 space-y-2">
                    {question.options?.map((option) => (
                        <div
                            key={option.id}
                            className={`flex items-center gap-3 p-2.5 rounded-xl border text-sm transition-all ${isExpanded && option.is_correct
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : 'bg-slate-50/50 border-slate-100 text-slate-600'
                                }`}
                        >
                            <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black ${isExpanded && option.is_correct ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                                }`}>
                                {option.option_label}
                            </span>
                            <span className="font-medium">{option.option_text}</span>
                            {isExpanded && option.is_correct && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-emerald-500" />}
                        </div>
                    ))}
                </div>

                {/* Explanation */}
                {isExpanded && (
                    <div className="mt-4 bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 space-y-2 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center gap-2 mb-1">
                            <Info className="w-3.5 h-3.5 text-indigo-500" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Detailed Solution</h4>
                        </div>
                        <p className="text-slate-700 text-xs leading-relaxed">
                            {question.solution_explanation || question.explanation || "No explanation provided."}
                        </p>
                        <div className="pt-2 border-t border-indigo-100/50 flex items-center gap-2">
                            <span className="text-[9px] font-bold text-slate-400">Answer:</span>
                            <Badge variant="secondary" className="bg-emerald-500 text-white text-[9px] h-5 px-1.5 border-transparent">
                                {correctAnswer?.option_label}
                            </Badge>
                        </div>
                    </div>
                )}
            </CardContent>

            {/* Actions & Metadata */}
            <CardFooter className="p-3 bg-slate-50/50 rounded-b-xl flex flex-col items-stretch gap-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 font-bold text-[10px] uppercase tracking-wider ${isExpanded ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500'}`}
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? 'Hide Solution' : 'View Solution'}
                        {isExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 hover:bg-indigo-50" onClick={() => onEdit(question)}>
                            <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600 hover:bg-rose-50" onClick={() => onDelete([question.id])}>
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-slate-200/50">
                    <Badge variant="outline" className={`${levelColors[question.level]} capitalize shadow-none border font-bold text-[9px] h-5 px-1.5`}>
                        {question.level}
                    </Badge>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                        <BookOpen className="w-3 h-3 text-slate-400" />
                        {question.subject?.name || 'General'}
                    </div>
                    {question.competency && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600">
                            <CheckCircle2 className="w-3 h-3" />
                            {question.competency.name}
                        </div>
                    )}
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        <Layers className="w-3 h-3" />
                        {question.course?.name || 'N/A'}
                    </div>
                    <span className="text-[10px] font-bold text-indigo-500">+{question.positive_marks} Marks</span>
                    {question.tags && question.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {question.tags.map(tag => (
                                <span key={tag.id} className="text-[8px] bg-teal-500 text-white px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">
                                    {tag.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}
