import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Save, X, Eye, User, Building, Phone, MapPin, Clock, Mail, CheckCircle, Search, RefreshCw } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { VisitorRegistration, StaffMeetingTime } from './types';
import { SearchAndRefresh } from './SearchAndRefresh';
import { VisitorDetailsModal } from './VisitorDetailsModal';
import { FilterBar, FilterState } from './FilterBar';

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
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  entryLocations: string[];
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
  onEditEndTimeChange,
  filters,
  onFilterChange,
  entryLocations
}) => {
  const [selectedRegistration, setSelectedRegistration] = useState<VisitorRegistration | null>(null);
  const [endingMeetingId, setEndingMeetingId] = useState<string | null>(null);

  const parseStaffTimes = (registration: VisitorRegistration): StaffMeetingTime[] => {
    if (!registration.meeting_staff_times) return [];
    try { return JSON.parse(registration.meeting_staff_times); } catch { return []; }
  };

  const handleMeetingEnded = async (registration: VisitorRegistration, staffEmail?: string, staffIndex?: number) => {
    setEndingMeetingId(registration.id);
    try {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const ist = new Date(utc + (5.5 * 60 * 60 * 1000));
      const pad = (n: number) => n.toString().padStart(2, '0');
      const istString = `${ist.getFullYear()}-${pad(ist.getMonth() + 1)}-${pad(ist.getDate())}T${pad(ist.getHours())}:${pad(ist.getMinutes())}:${pad(ist.getSeconds())}`;

      const staffTimes = parseStaffTimes(registration);

      if (staffTimes.length > 0) {
        const updated = [...staffTimes];
        let targetIndex = typeof staffIndex === 'number' ? staffIndex : -1;

        if (targetIndex < 0 && staffEmail) {
          targetIndex = updated.findIndex(
            st => st.email.trim().toLowerCase() === staffEmail.trim().toLowerCase() && !st.endTime
          );
        }

        if (targetIndex >= 0 && updated[targetIndex] && !updated[targetIndex].endTime) {
          updated[targetIndex] = { ...updated[targetIndex], endTime: istString };
        }

        const allEnded = updated.length > 0 && updated.every(st => st.endTime);
        const updatePayload: any = {
          meeting_staff_times: JSON.stringify(updated),
          meeting_staff_end_time: allEnded ? istString : null,
        };

        const { error } = await supabase
          .from('visitor_registrations')
          .update(updatePayload)
          .eq('id', registration.id);
        if (error) throw error;
      } else {
        // Legacy: single meeting end
        const { error } = await supabase
          .from('visitor_registrations')
          .update({ meeting_staff_end_time: istString } as any)
          .eq('id', registration.id);
        if (error) throw error;
      }

      toast({ title: "Meeting Ended", description: `Meeting has been marked as concluded. Visitor is still on campus.` });
      onRefresh();
    } catch (err) {
      toast({ title: "Error", description: "Failed to end meeting", variant: "destructive" });
    } finally {
      setEndingMeetingId(null);
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Not set';
    const cleanString = dateString.split('.')[0].replace('Z', '');
    const parts = cleanString.split('T');
    if (parts.length !== 2) return 'Invalid date';
    const [datePart, timePart] = parts;
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours24, minutes] = timePart.split(':').map(Number);
    const hours12 = hours24 % 12 || 12;
    const ampm = hours24 >= 12 ? 'PM' : 'AM';
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = monthNames[month - 1];
    return `${monthName} ${day}, ${year}, ${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const parsePeople = (peopleString: string) => {
    try {
      const people = JSON.parse(peopleString);
      return people.map((person: any) => {
        if (person.role) return `${person.name} (${person.role})`;
        return person.name;
      }).join(', ');
    } catch {
      return peopleString;
    }
  };

  const formatPurpose = (purpose: string): string => {
    const purposeMap: Record<string, string> = {
      visit: "Visit", work: "Work", tourism: "Tourism", sports: "Sports",
      meeting: "Meeting", official_visit: "Official Visit", student_visit: "Student Visit",
      meeting_school_staff: "Meeting School Staff"
    };
    return purposeMap[purpose] || (purpose.charAt(0).toUpperCase() + purpose.slice(1));
  };

  const getStatusBadge = (registration: VisitorRegistration) => {
    if (registration.endtime) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></div>
          Exited
        </span>
      );
    }
    if (registration.meeting_staff_end_time) {
      return (
        <div className="space-y-1">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5"></div>
            Meeting Ended
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
            On Campus
          </span>
        </div>
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
        <CardHeader className="border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 py-3 px-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-white whitespace-nowrap">
              Visitors ({filteredRegistrations.length})
            </h2>
            <FilterBar filters={filters} onFilterChange={onFilterChange} entryLocations={entryLocations} />
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-white h-3.5 w-3.5" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-8 w-48 h-8 text-xs bg-gray-700 border-gray-600 text-white placeholder-white font-medium focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
              <Button 
                onClick={onRefresh} 
                size="sm"
                variant="outline"
                className="h-8 px-2 border-2 border-amber-600 text-amber-400 hover:bg-amber-600 hover:text-white font-bold text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
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
                  <TableHead className="font-bold text-amber-400 border-r border-gray-600">Meeting Duration</TableHead>
                  <TableHead className="font-bold text-amber-400 border-r border-gray-600">Visit Duration</TableHead>
                  <TableHead className="font-bold text-amber-400 border-r border-gray-600">Status</TableHead>
                  <TableHead className="font-bold text-amber-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  const getDateKey = (reg: VisitorRegistration) => {
                    const dateStr = reg.starttime || reg.created_at;
                    if (!dateStr) return 'Unknown';
                    const clean = dateStr.split('.')[0].replace('Z', '');
                    const [datePart] = clean.split('T');
                    const [year, month, day] = datePart.split('-').map(Number);
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return `${monthNames[month - 1]} ${day}, ${year}`;
                  };

                  const today = new Date();
                  const utc = today.getTime() + (today.getTimezoneOffset() * 60000);
                  const ist = new Date(utc + (5.5 * 60 * 60 * 1000));
                  const pad = (n: number) => n.toString().padStart(2, '0');
                  const todayKey = `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][ist.getMonth()]} ${ist.getDate()}, ${ist.getFullYear()}`;

                  let lastDateKey = '';
                  let rowIndex = 0;

                  return filteredRegistrations.map((registration) => {
                    const dateKey = getDateKey(registration);
                    const showDateHeader = dateKey !== lastDateKey;
                    lastDateKey = dateKey;
                    const currentRowIndex = rowIndex++;
                    const isToday = dateKey === todayKey;

                    return (
                      <React.Fragment key={registration.id}>
                        {showDateHeader && (
                          <TableRow className="bg-gray-900/80 hover:bg-gray-900/80 border-b border-gray-600">
                            <TableCell colSpan={8} className="py-2 px-4">
                              <div className="flex items-center space-x-2">
                                <div className={`h-2 w-2 rounded-full ${isToday ? 'bg-green-400 animate-pulse' : 'bg-amber-500'}`} />
                                <span className="text-sm font-bold text-amber-400">
                                  {isToday ? `Today — ${dateKey}` : dateKey}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow 
                          className={`transition-all duration-200 border-b border-gray-700 cursor-pointer ${
                            currentRowIndex % 2 === 0 
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
                          <div className="text-sm font-bold text-white">{registration.visitorname}</div>
                          <div className="text-xs text-white font-medium flex items-center">
                            <Building className="h-3 w-3 mr-1" />
                            {registration.schoolname}
                          </div>
                          {registration.entry_location && (
                            <div className="text-xs text-amber-400 font-medium flex items-center mt-0.5">
                              <MapPin className="h-3 w-3 mr-1" />
                              {registration.entry_location}
                            </div>
                          )}
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
                    {/* Meeting Duration Column */}
                    <TableCell className="py-4 border-r border-gray-700">
                      {registration.purpose === 'meeting_school_staff' ? (() => {
                        const staffTimes = parseStaffTimes(registration);
                        if (staffTimes.length > 0) {
                          return (
                            <div className="space-y-2">
                              {staffTimes.map((st, idx) => (
                                <div key={idx} className="text-xs border-b border-gray-600 pb-1 last:border-0">
                                  <div className="text-amber-400 font-bold truncate max-w-[150px]" title={st.email}>{st.email.split('@')[0]}</div>
                                  <div className="text-white font-medium">In: {formatDate(st.startTime)}</div>
                                  <div className="text-white font-medium">
                                    Out: {st.endTime ? formatDate(st.endTime) : <span className="text-green-400">Ongoing</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return (
                          <div className="space-y-1">
                            <div className="text-xs text-white font-medium">
                              Start: {formatDate(registration.meeting_staff_start_time || registration.starttime)}
                            </div>
                            <div className="text-xs text-white font-medium">
                              End: {registration.meeting_staff_end_time ? formatDate(registration.meeting_staff_end_time) : 'Ongoing'}
                            </div>
                          </div>
                        );
                      })() : (
                        <div className="text-xs text-white/50 font-medium">N/A</div>
                      )}
                    </TableCell>
                    <TableCell className="py-4 border-r border-gray-700">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-white font-medium">
                          <Clock className="h-3 w-3 mr-1" />
                          In: {formatDate(registration.starttime || registration.created_at)}
                        </div>
                        {editingId === registration.id ? (
                          <div className="space-y-1">
                            <Input
                              type="datetime-local"
                              value={editEndTime}
                              onChange={(e) => onEditEndTimeChange(e.target.value)}
                              className="w-52 text-xs bg-gray-700 border-gray-600 text-white font-medium"
                            />
                            {saving && <div className="text-amber-400 text-xs font-medium">Saving...</div>}
                          </div>
                        ) : (
                          <div className="text-xs text-white font-medium">
                            Out: {registration.endtime ? formatDate(registration.endtime) : 'On campus'}
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
                        
                        {/* Meeting Ended Buttons - per staff or single */}
                        {registration.purpose === 'meeting_school_staff' && (() => {
                          const staffTimes = parseStaffTimes(registration);
                          if (staffTimes.length > 0) {
                            const ongoing = staffTimes
                              .map((st, originalIndex) => ({ ...st, originalIndex }))
                              .filter(st => !st.endTime);
                            return ongoing.map((st) => (
                              <Button
                                key={`${st.email}-${st.originalIndex}`}
                                size="sm"
                                variant="outline"
                                onClick={() => handleMeetingEnded(registration, st.email, st.originalIndex)}
                                disabled={endingMeetingId === registration.id}
                                className="h-8 px-2 border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white text-xs"
                                title={`End meeting with ${st.email.split('@')[0]}`}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {st.email.split('@')[0].slice(0, 8)}
                              </Button>
                            ));
                          }
                          if (!registration.meeting_staff_end_time) {
                            return (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMeetingEnded(registration)}
                                disabled={endingMeetingId === registration.id}
                                className="h-8 px-2 border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white text-xs"
                                title="Mark meeting as ended"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  });
                })()}
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
