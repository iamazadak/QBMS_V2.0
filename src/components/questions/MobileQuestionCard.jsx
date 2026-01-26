import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Edit2, Trash2 } from "lucide-react";

export default function MobileQuestionCard({ question, onEdit, onDelete, isSelected, onSelect }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const levelColors = {
        easy: "bg-emerald-100 text-emerald-800 border-emerald-200",
        medium: "bg-amber-100 text-amber-800 border-amber-200",
        hard: "bg-rose-100 text-rose-800 border-rose-200",
    };

    return (
        <Card className={`mb-3 transition-all duration-200 ${isSelected ? 'ring-2 ring-teal-500 border-teal-500' : ''}`}>
            <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                <div className="flex gap-2 items-start">
                    <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600"
                        checked={isSelected}
                        onChange={(e) => onSelect(question.id, e.target.checked)}
                    />
                    <div>
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            {question.subject?.name || 'No Subject'}
                        </span>
                        <div className="font-medium text-slate-900 line-clamp-2 mt-1">
                            {question.question_text}
                        </div>
                    </div>
                </div>
                <Badge variant="outline" className={`${levelColors[question.level]} capitalize shrink-0 ml-2`}>
                    {question.level}
                </Badge>
            </CardHeader>

            <CardContent className="p-4 pt-2">
                {isExpanded && (
                    <div className="mt-2 space-y-3 text-sm animate-in slide-in-from-top-2 duration-200">
                        <div className="bg-slate-50 p-3 rounded-lg space-y-2">
                            {question.options?.map((opt, idx) => (
                                <div key={idx} className={`flex gap-2 ${opt.is_correct ? 'text-green-700 font-medium' : 'text-slate-600'}`}>
                                    <span className="opacity-70">{opt.option_label}.</span>
                                    <span>{opt.option_text}</span>
                                </div>
                            ))}
                        </div>
                        {question.explanation && (
                            <div className="text-slate-600">
                                <span className="font-semibold text-slate-700">Explanation:</span> {question.explanation}
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mt-2">
                            <div>Course: {question.course?.name}</div>
                            <div>Program: {question.program?.name}</div>
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-3 bg-slate-50 rounded-b-xl flex justify-between items-center">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-500 h-8"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                    {isExpanded ? 'Less' : 'Details'}
                </Button>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-teal-600" onClick={() => onEdit(question)}>
                        <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => onDelete([question.id])}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
