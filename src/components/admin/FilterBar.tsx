
import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, X } from "lucide-react";

export interface FilterState {
  status: string;
  purpose: string;
  dateRange: string;
  entryLocation: string;
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  entryLocations: string[];
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active (On Campus)' },
  { value: 'meeting_ended', label: 'Meeting Ended' },
  { value: 'exited', label: 'Exited' },
];

const PURPOSE_OPTIONS = [
  { value: 'all', label: 'All Purposes' },
  { value: 'visit', label: 'Visit' },
  { value: 'work', label: 'Work' },
  { value: 'tourism', label: 'Tourism' },
  { value: 'sports', label: 'Sports' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'official_visit', label: 'Official Visit' },
  { value: 'student_visit', label: 'Student Visit' },
  { value: 'meeting_school_staff', label: 'Meeting School Staff' },
];

const DATE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, entryLocations }) => {
  const hasActiveFilters = filters.status !== 'all' || filters.purpose !== 'all' || filters.dateRange !== 'all' || filters.entryLocation !== 'all';

  const clearFilters = () => {
    onFilterChange({ status: 'all', purpose: 'all', dateRange: 'all', entryLocation: 'all' });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4 px-4 py-3 bg-gray-800/50 rounded-lg border border-gray-700">
      <div className="flex items-center gap-1.5 text-amber-400 mr-1">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-bold">Filters:</span>
      </div>

      <Select value={filters.status} onValueChange={(v) => onFilterChange({ ...filters, status: v })}>
        <SelectTrigger className="w-[160px] h-8 text-xs bg-gray-700 border-gray-600 text-white font-medium focus:ring-amber-500">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-gray-700 border-gray-600">
          {STATUS_OPTIONS.map(o => (
            <SelectItem key={o.value} value={o.value} className="text-white text-xs font-medium hover:bg-gray-600 focus:bg-gray-600 focus:text-white">{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.purpose} onValueChange={(v) => onFilterChange({ ...filters, purpose: v })}>
        <SelectTrigger className="w-[180px] h-8 text-xs bg-gray-700 border-gray-600 text-white font-medium focus:ring-amber-500">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-gray-700 border-gray-600">
          {PURPOSE_OPTIONS.map(o => (
            <SelectItem key={o.value} value={o.value} className="text-white text-xs font-medium hover:bg-gray-600 focus:bg-gray-600 focus:text-white">{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.dateRange} onValueChange={(v) => onFilterChange({ ...filters, dateRange: v })}>
        <SelectTrigger className="w-[140px] h-8 text-xs bg-gray-700 border-gray-600 text-white font-medium focus:ring-amber-500">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-gray-700 border-gray-600">
          {DATE_OPTIONS.map(o => (
            <SelectItem key={o.value} value={o.value} className="text-white text-xs font-medium hover:bg-gray-600 focus:bg-gray-600 focus:text-white">{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {entryLocations.length > 0 && (
        <Select value={filters.entryLocation} onValueChange={(v) => onFilterChange({ ...filters, entryLocation: v })}>
          <SelectTrigger className="w-[160px] h-8 text-xs bg-gray-700 border-gray-600 text-white font-medium focus:ring-amber-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-700 border-gray-600">
            <SelectItem value="all" className="text-white text-xs font-medium hover:bg-gray-600 focus:bg-gray-600 focus:text-white">All Locations</SelectItem>
            {entryLocations.map(loc => (
              <SelectItem key={loc} value={loc} className="text-white text-xs font-medium hover:bg-gray-600 focus:bg-gray-600 focus:text-white">{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {hasActiveFilters && (
        <Button
          size="sm"
          variant="ghost"
          onClick={clearFilters}
          className="h-8 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 font-bold"
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
};
