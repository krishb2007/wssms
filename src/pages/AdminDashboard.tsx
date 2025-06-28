import React, { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Pencil, Save, X, LogOut, Search, Eye, Image, FileSignature, Users, Clock, RefreshCw, Calendar, MapPin, Phone, User, Building, Target } from "lucide-react";

interface VisitorRegistration {
  id: string;
  visitorname: string;
  phonenumber: string;
  numberofpeople: number;
  people: string;
  purpose: string;
  address: string;
  schoolname: string;
  starttime: string | null;
  endtime: string | null;
  created_at: string;
  picture_url: string | null;
  signature_url: string | null;
}

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState<VisitorRegistration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<VisitorRegistration[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEndTime, setEditEndTime] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewingRegistration, setViewingRegistration] = useState<VisitorRegistration | null>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin-login');
      return;
    }
    fetchRegistrations();
    const channel = supabase
      .channel('visitor-registrations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'visitor_registrations'
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setRegistrations(prev => 
              prev.map(reg => 
                reg.id === payload.new.id ? { ...reg, ...payload.new } : reg
              )
            );
          } else if (payload.eventType === 'INSERT') {
            setRegistrations(prev => [payload.new as VisitorRegistration, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setRegistrations(prev => prev.filter(reg => reg.id !== payload.old.id));
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRegistrations(registrations);
    } else {
      const filtered = registrations.filter(registration =>
        registration.visitorname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.phonenumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.schoolname?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRegistrations(filtered);
    }
  }, [searchTerm, registrations]);

  async function fetchRegistrations() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('visitor_registrations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch registrations: " + error.message,
          variant: "destructive",
        });
      } else if (data) {
        setRegistrations(data);
        setFilteredRegistrations(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching data",
        variant: "destructive",
      });
    }
    setLoading(false);
  }

  function startEdit(registration: VisitorRegistration) {
    setEditingId(registration.id);
    const currentEndTime = registration.endtime 
      ? new Date(registration.endtime).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16);
    setEditEndTime(currentEndTime);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditEndTime('');
  }

  async function saveEdit(id: string) {
    if (saving) return;
    try {
      setSaving(true);
      if (!editEndTime) {
        toast({
          title: "Error",
          description: "Please select an end time",
          variant: "destructive",
        });
        return;
      }
      const endTimeISO = new Date(editEndTime).toISOString();
      const { data, error } = await supabase
        .from('visitor_registrations')
        .update({ endtime: endTimeISO })
        .eq('id', id)
        .select();
      if (error) {
        toast({
          title: "Error",
          description: "Failed to update end time: " + error.message,
          variant: "destructive",
        });
        return;
      }
      if (!data || data.length === 0) {
        toast({
          title: "Error",
          description: "Update failed - registration not found",
          variant: "destructive",
        });
        return;
      }
      setRegistrations(prev => 
        prev.map(reg => 
          reg.id === id ? { ...reg, endtime: endTimeISO } : reg
        )
      );
      toast({
        title: "Success",
        description: "End time updated successfully",
      });
      setEditingId(null);
      setEditEndTime('');
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating: " + (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    return `https://efxeohyxpnwewhqwlahw.supabase.co/storage/v1/object/public/${url}`;
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
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border-green-200 border">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
        Active
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-center">
          <RefreshCw className="mx-auto h-12 w-12 animate-spin text-amber-500 mb-4" />
          <p className="text-white font-bold text-xl">Loading registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-800 to-amber-900 shadow-xl rounded-xl p-6 mb-6 border border-amber-700">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Visitor Management System
              </h1>
              <p className="text-amber-200 text-lg font-semibold">Monitor and Manage Visitor Registration</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-amber-200 font-medium">Signed in as</p>
                <p className="font-bold text-white">{user?.email}</p>
              </div>
              <Button 
                onClick={handleLogout} 
                variant="outline"
                className="flex items-center space-x-2 bg-white text-amber-800 hover:bg-amber-50 border-2 border-white font-bold"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-600 to-amber-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-bold text-amber-100">Total Visitors</p>
                  <p className="text-2xl font-bold text-white">{registrations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-bold text-emerald-100">Active Visits</p>
                  <p className="text-2xl font-bold text-white">
                    {registrations.filter(r => !r.endtime).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-bold text-blue-100">Today's Visits</p>
                  <p className="text-2xl font-bold text-white">
                    {registrations.filter(r => 
                      new Date(r.created_at).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-600 to-slate-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-bold text-slate-100">Completed</p>
                  <p className="text-2xl font-bold text-white">
                    {registrations.filter(r => r.endtime).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Main Content */}
        <Card className="border-0 shadow-xl bg-gray-800 border-gray-700">
          <CardHeader className="border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 py-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-white">
                Visitor Registrations ({filteredRegistrations.length})
              </CardTitle>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white h-4 w-4" />
                  <Input
                    placeholder="Search visitors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 bg-gray-700 border-gray-600 text-white placeholder-white font-medium focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
                <Button 
                  onClick={fetchRegistrations} 
                  variant="outline"
                  className="flex items-center space-x-2 border-2 border-amber-600 text-amber-400 hover:bg-amber-600 hover:text-white font-bold"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
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
                    <TableHead className="font-bold text-amber-400 border-r border-gray-600">Visit Duration</TableHead>
                    <TableHead className="font-bold text-amber-400 border-r border-gray-600">Status</TableHead>
                    <TableHead className="font-bold text-amber-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...filteredRegistrations]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((registration, index) => (
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
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          {formatPurpose(registration.purpose)}
                        </span>
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
                            Started: {formatDate(registration.starttime)}
                          </div>
                          {editingId === registration.id ? (
                            <div className="space-y-1">
                              <Input
                                type="datetime-local"
                                value={editEndTime}
                                onChange={(e) => setEditEndTime(e.target.value)}
                                className="w-40 text-xs bg-gray-700 border-gray-600 text-white font-medium"
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
                          <Dialog open={viewingRegistration?.id === registration.id} onOpenChange={(open) => setViewingRegistration(open ? registration : null)}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 border-2 border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-white"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-6 bg-gray-800 border-gray-700">
                              <DialogHeader>
                                <DialogTitle className="text-2xl text-amber-400">Visitor Registration Details</DialogTitle>
                              </DialogHeader>
                              <div className="text-white space-y-2">
                                <div><b>Visitor Name:</b> {registration.visitorname}</div>
                                <div><b>Contact:</b> {registration.phonenumber}</div>
                                <div><b>Purpose:</b> {formatPurpose(registration.purpose)}</div>
                                <div><b>Address:</b> {registration.address}</div>
                                <div><b>School:</b> {registration.schoolname}</div>
                                <div><b>Start Time:</b> {formatDate(registration.starttime)}</div>
                                <div><b>End Time:</b> {registration.endtime ? formatDate(registration.endtime) : "Active"}</div>
                                <div><b>Number of People:</b> {registration.numberofpeople}</div>
                                <div><b>People:</b> {parsePeople(registration.people)}</div>
                                <div><b>Created At:</b> {formatDate(registration.created_at)}</div>
                                <div className="flex space-x-4 mt-4">
                                  {registration.picture_url && (
                                    <div>
                                      <div className="mb-2 text-sm text-amber-200 font-bold">Picture</div>
                                      <img src={getImageUrl(registration.picture_url)} alt="Visitor" className="w-36 h-36 object-cover rounded border-2 border-white" />
                                    </div>
                                  )}
                                  {registration.signature_url && (
                                    <div>
                                      <div className="mb-2 text-sm text-amber-200 font-bold">Signature</div>
                                      <img src={getImageUrl(registration.signature_url)} alt="Signature" className="w-36 h-36 object-contain rounded border-2 border-white bg-white" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          {editingId === registration.id ? (
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                onClick={() => saveEdit(registration.id)}
                                disabled={saving}
                                className="h-8 w-8 p-0 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
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
                              onClick={() => startEdit(registration)}
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
            {filteredRegistrations.length === 0 && !loading && (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-white mb-4" />
                <p className="text-white text-lg font-bold">
                  {searchTerm ? 'No registrations found matching your search.' : 'No registrations found.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
