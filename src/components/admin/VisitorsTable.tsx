
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Save, X, Eye, User, Building, Phone, MapPin, Clock, Mail } from "lucide-react";
import { VisitorRegistration } from './types';
import { SearchAndRefresh } from './SearchAndRefresh';
import { VisitorDetailsModal } from './VisitorDetailsModal';

interface VisitorsTableProps {
  registrations: VisitorRegistration[];
  filteredRegistrations: VisitorRegistration[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  editingId: string | null;
  editEndTime: string;
  saving: boolean;
  onStartEdit: (registration: VisitorRegistration) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string) => void;
  onEditEndTimeChange: (value: string) => void;
}

export const VisitorsTable: React.FC<VisitorsTableProps> = ({
  registrations,
  filteredRegistrations,
  searchTerm,
  onSearchChange,
  onRefresh,
  editingId,
  editEndTime,
  saving,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditEndTimeChange
}) => {
  const [selectedRegistration, setSelectedRegistration] = useState<VisitorRegistration | null>(null);

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Not set';
    
    // Check if the date string already contains IST timezone info
    if (dateString.includes('IST') || dateString.includes('+05:30')) {
      // If it's already in IST format, parse it directly without timezone conversion
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // For UTC timestamps, convert to IST
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  };

  const parsePeople = (peopleString: string) => {
    try {
      const people = JSON.parse(peopleString);
      return people.map((person: any) => `${person.name} (${person.role})`).join(', ');
    } catch {
      return peopleString;
    }
  };

  const formatPurpose = (purpose: string): string => {
    const purposeMap: Record<string, string> = {
      visit: "Visit",
      work: "Work",
      tourism: "Tourism",
      sports: "Sports",
      meeting: "Meeting",
      official_visit: "Official Visit",
      student_visit: "Student Visit"
    };
    return purposeMap[purpose] || (purpose.charAt(0).toUpperCase() + purpose.slice(1));
  };

  const getStatusBadge = (registration: VisitorRegistration) => {
    if (registration.endtime) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></div>
          Completed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
        Active
      </span>
    );
  };

  return (
    <>
      <Card className="border-0 shadow-xl bg-gray-800 border-gray-700">
        <CardHeader className="border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 py-4">
          <SearchAndRefresh
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            onRefresh={onRefresh}
            resultsCount={filteredRegistrations.length}
          />
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-700 to-gray-800 border-b-2 border-gray-600 hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-700">
                  <TableHead className="font-bold text-amber-400 border-r border-gray-600">Visitor</TableHead>
                  <TableHead className="font-bold text-amber-400 border-r border-gray-600">Contact</TableHead>
                  <TableHead className="font-bold text-amber-400 border-r border-gray-600">Purpose</TableHead>
                  <TableHead className="font-bold text-amber-400 border-r border-gray-600">People</TableHead>
                  <TableHead className="font-bold text-amber-400 border-r border-gray-600">Visit Duration</TableHead>
                  <TableHead className="font-bold text-amber-400 border-r border-gray-600">Status</TableHead>
                  <TableHead className="font-bold text-amber-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((registration, index) => (
                  <TableRow 
                    key={registration.id} 
                    className={`transition-all duration-200 border-b border-gray-700 cursor-pointer ${
                      index % 2 === 0 
                        ? 'bg-gray-800 hover:bg-gray-700' 
                        : 'bg-gray-750 hover:bg-gray-700'
                    }`}
                  >
                    <TableCell className="py-4 border-r border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">
                            {registration.visitorname}
                          </div>
                          <div className="text-xs text-white font-medium flex items-center">
                            <Building className="h-3 w-3 mr-1" />
                            {registration.schoolname}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 border-r border-gray-700">
                      <div className="space-y-1">
                        <div className="text-sm text-white font-medium flex items-center">
                          <Phone className="h-3 w-3 mr-1 text-white" />
                          {registration.phonenumber}
                        </div>
                        <div className="text-xs text-white font-medium flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {registration.address?.slice(0, 25)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 border-r border-gray-700">
                      <div className="space-y-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          {formatPurpose(registration.purpose)}
                        </span>
                        {registration.email && (
                          <div className="text-xs text-white font-medium flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {registration.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 border-r border-gray-700">
                      <div>
                        <div className="text-sm font-bold text-white">
                          {registration.numberofpeople} {registration.numberofpeople === 1 ? 'person' : 'people'}
                        </div>
                        <div className="text-xs text-white font-medium max-w-xs truncate">
                          {parsePeople(registration.people)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 border-r border-gray-700">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-white font-medium">
                          <Clock className="h-3 w-3 mr-1" />
                          Started: {formatDate(registration.created_at)}
                        </div>
                        {editingId === registration.id ? (
                          <div className="space-y-1">
                            <Input
                              type="datetime-local"
                              value={editEndTime}
                              onChange={(e) => onEditEndTimeChange(e.target.value)}
                              className="w-52 text-xs bg-gray-700 border-gray-600 text-white font-medium"
                            />
                            {saving && (
                              <div className="text-amber-400 text-xs font-medium">
                                Saving...
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-white font-medium">
                            Ended: {registration.endtime ? formatDate(registration.endtime) : 'Active'}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 border-r border-gray-700">
                      {getStatusBadge(registration)}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRegistration(registration)}
                          className="h-8 w-8 p-0 border-2 border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {editingId === registration.id ? (
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              onClick={() => onSaveEdit(registration.id)}
                              disabled={saving}
                              className="h-8 w-8 p-0 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={onCancelEdit}
                              disabled={saving}
                              className="h-8 w-8 p-0 border-2 border-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onStartEdit(registration)}
                            className="h-8 w-8 p-0 border-2 border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredRegistrations.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-white mb-4" />
              <p className="text-white text-lg font-bold">
                {searchTerm ? 'No registrations found matching your search.' : 'No registrations found.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedRegistration && (
        <VisitorDetailsModal
          registration={selectedRegistration}
          isOpen={!!selectedRegistration}
          onOpenChange={(open) => !open && setSelectedRegistration(null)}
        />
      )}
    </>
  );
};
