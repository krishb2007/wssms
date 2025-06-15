import React, { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
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
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    console.log("AdminDashboard useEffect - checking user:", user);
    if (!user || user.role !== 'admin') {
      console.log("User not admin, redirecting to login");
      navigate('/admin-login');
      return;
    }
    fetchRegistrations();
    
    // Set up real-time subscription
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
          console.log('Real-time update received:', payload);
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
      console.log("Fetching visitor registrations...");
      
      const { data, error } = await supabase
        .from('visitor_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      console.log("Fetch result:", { data, error });

      if (error) {
        console.error("Database error:", error);
        toast({
          title: "Error",
          description: "Failed to fetch registrations: " + error.message,
          variant: "destructive",
        });
      } else if (data) {
        console.log(`Successfully fetched ${data.length} registrations`);
        setRegistrations(data);
        setFilteredRegistrations(data);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching data",
        variant: "destructive",
      });
    }
    setLoading(false);
  }

  function startEdit(registration: VisitorRegistration) {
    console.log("Starting edit for registration:", registration.id);
    setEditingId(registration.id);
    const currentEndTime = registration.endtime 
      ? new Date(registration.endtime).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16);
    setEditEndTime(currentEndTime);
  }

  function cancelEdit() {
    console.log("Cancelling edit");
    setEditingId(null);
    setEditEndTime('');
  }

  async function saveEdit(id: string) {
    if (saving) return;
    
    try {
      setSaving(true);
      console.log("Saving end time for registration:", id, "datetime-local value:", editEndTime);
      
      if (!editEndTime) {
        toast({
          title: "Error",
          description: "Please select an end time",
          variant: "destructive",
        });
        return;
      }

      const endTimeISO = new Date(editEndTime).toISOString();
      console.log("Converted to ISO string:", endTimeISO);

      const { data, error } = await supabase
        .from('visitor_registrations')
        .update({ endtime: endTimeISO })
        .eq('id', id)
        .select();

      console.log("Update response:", { data, error });

      if (error) {
        console.error("Update error:", error);
        toast({
          title: "Error",
          description: "Failed to update end time: " + error.message,
          variant: "destructive",
        });
        return;
      }

      if (!data || data.length === 0) {
        console.error("No rows updated");
        toast({
          title: "Error",
          description: "Update failed - registration not found",
          variant: "destructive",
        });
        return;
      }

      console.log("Successfully updated end time, updated record:", data[0]);
      
      // Update local state
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
      console.error("Unexpected error during update:", error);
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
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
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
              <p className="text-amber-200 text-lg font-semibold">Monitor and manage visitor registrations</p>
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
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 border-2 border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-white"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0 bg-gray-800 border-gray-700">
                              <div className="bg-gray-800">
                                <DialogHeader className="bg-gradient-to-r from-amber-800 to-amber-900 text-white p-6">
                                  <DialogTitle className="text-xl font-bold flex items-center">
                                    <User className="h-6 w-6 mr-2" />
                                    {registration.visitorname}
                                  </DialogTitle>
                                  <DialogDescription className="text-amber-200 font-medium">
                                    Complete visitor information and documentation
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="p-6">
                                  {/* Top Row: Visitor Information (left) and Photo (right) */}
                                  <div className="grid grid-cols-2 gap-8 mb-8">
                                    {/* Visitor Information */}
                                    <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                                      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                        <User className="h-5 w-5 mr-2" />
                                        Visitor Information
                                      </h3>
                                      <div className="space-y-3">
                                        <div>
                                          <p className="text-sm text-white font-medium">Name</p>
                                          <p className="text-white font-bold">{registration.visitorname}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-white font-medium">Phone</p>
                                          <p className="text-white font-bold">{registration.phonenumber}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-white font-medium">Purpose</p>
                                          <p className="text-white font-bold">{formatPurpose(registration.purpose)}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-white font-medium">School/Institution</p>
                                          <p className="text-white font-bold">{registration.schoolname}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-white font-medium">Address</p>
                                          <p className="text-white font-bold">{registration.address}</p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Photo */}
                                    <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                                      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                        <Image className="h-5 w-5 mr-2" />
                                        Visitor Photo
                                      </h3>
                                      {registration.picture_url ? (
                                        <img
                                          src={getImageUrl(registration.picture_url)}
                                          alt="Visitor"
                                          className="w-full h-80 object-contain rounded-lg bg-gray-600 border border-gray-500 cursor-pointer hover:scale-105 transition-transform"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjM4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNGY0ZjRmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzllYTNhOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIGltYWdlIGF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
                                          }}
                                          onClick={() => window.open(getImageUrl(registration.picture_url), '_blank')}
                                        />
                                      ) : (
                                        <div className="w-full h-80 bg-gray-600 rounded-lg flex items-center justify-center border border-gray-500">
                                          <div className="text-center">
                                            <Image className="h-8 w-8 text-white mx-auto mb-2" />
                                            <p className="text-white text-sm font-medium">No photo available</p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Bottom Row: Visit Details (left) and Digital Signature (right) */}
                                  <div className="grid grid-cols-2 gap-8">
                                    {/* Visit Details */}
                                    <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                                      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                        <Clock className="h-5 w-5 mr-2" />
                                        Visit Details
                                      </h3>
                                      <div className="space-y-3">
                                        <div>
                                          <p className="text-sm text-white font-medium">People ({registration.numberofpeople})</p>
                                          <p className="text-white font-bold">{parsePeople(registration.people)}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-white font-medium">Start Time</p>
                                          <p className="text-white font-bold">{formatDate(registration.starttime)}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-white font-medium">End Time</p>
                                          <p className="text-white font-bold">{formatDate(registration.endtime)}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-white font-medium">Registered On</p>
                                          <p className="text-white font-bold">{formatDate(registration.created_at)}</p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Digital Signature */}
                                    <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                                      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                        <FileSignature className="h-5 w-5 mr-2" />
                                        Digital Signature
                                      </h3>
                                      {registration.signature_url ? (
                                        <img
                                          src={getImageUrl(registration.signature_url)}
                                          alt="Signature"
                                          className="w-full h-80 object-contain rounded-lg bg-gray-600 border border-gray-500 cursor-pointer hover:scale-105 transition-transform"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjM4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNGY0ZjRmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzllYTNhOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIHNpZ25hdHVyZSBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
                                          }}
                                          onClick={() => window.open(getImageUrl(registration.signature_url), '_blank')}
                                        />
                                      ) : (
                                        <div className="w-full h-80 bg-gray-600 rounded-lg flex items-center justify-center border border-gray-500">
                                          <div className="text-center">
                                            <FileSignature className="h-8 w-8 text-white mx-auto mb-2" />
                                            <p className="text-white text-sm font-medium">No signature available</p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
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
