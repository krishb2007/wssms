
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw } from "lucide-react";

interface SearchAndRefreshProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  resultsCount: number;
}

export const SearchAndRefresh: React.FC<SearchAndRefreshProps> = ({
  searchTerm,
  onSearchChange,
  onRefresh,
  resultsCount
}) => (
  <div className="flex justify-between items-center">
    <h2 className="text-2xl font-bold text-white">
      Visitor Registrations ({resultsCount})
    </h2>
    <div className="flex items-center space-x-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white h-4 w-4" />
        <Input
          placeholder="Search visitors..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 w-64 bg-gray-700 border-gray-600 text-white placeholder-white font-medium focus:border-amber-500 focus:ring-amber-500"
        />
      </div>
      <Button 
        onClick={onRefresh} 
        variant="outline"
        className="flex items-center space-x-2 border-2 border-amber-600 text-amber-400 hover:bg-amber-600 hover:text-white font-bold"
      >
        <RefreshCw className="h-4 w-4" />
        <span>Refresh</span>
      </Button>
    </div>
  </div>
);
