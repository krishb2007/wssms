
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Search } from "lucide-react";

interface AdminHeaderProps {
  userEmail: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onLogout: () => void;
}

export default function AdminHeader({
  userEmail,
  searchTerm,
  onSearchChange,
  onRefresh,
  onLogout
}: AdminHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">Welcome, {userEmail}</span>
        <Button onClick={onLogout} variant="outline" size="sm">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

export function SearchAndRefreshSection({
  filteredCount,
  searchTerm,
  onSearchChange,
  onRefresh
}: {
  filteredCount: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">Visitor Registrations ({filteredCount})</h2>
      <div className="flex items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name, phone, purpose, address, or school..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-80"
          />
        </div>
        <Button onClick={onRefresh} variant="outline" size="sm">
          Refresh
        </Button>
      </div>
    </div>
  );
}
