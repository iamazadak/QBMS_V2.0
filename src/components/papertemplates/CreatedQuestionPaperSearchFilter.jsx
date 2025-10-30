
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CreatedQuestionPaperSearchFilter({ onFiltersChange, activeFilters, filterData }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm mb-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Input
          placeholder="Search by title..."
          value={activeFilters.search || ''}
          onChange={(e) => onFiltersChange({ ...activeFilters, search: e.target.value })}
        />
        <Select value={activeFilters.program || ''} onValueChange={(value) => onFiltersChange({ ...activeFilters, program: value })}>
          <SelectTrigger><SelectValue placeholder="Program" /></SelectTrigger>
          <SelectContent>
            {filterData.programs.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={activeFilters.course || ''} onValueChange={(value) => onFiltersChange({ ...activeFilters, course: value })}>
          <SelectTrigger><SelectValue placeholder="Course" /></SelectTrigger>
          <SelectContent>
            {filterData.courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={activeFilters.subject || ''} onValueChange={(value) => onFiltersChange({ ...activeFilters, subject: value })}>
          <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
          <SelectContent>
            {filterData.subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={activeFilters.year || ''} onValueChange={(value) => onFiltersChange({ ...activeFilters, year: value })}>
          <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
          <SelectContent>
            {filterData.years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
