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
import { Pencil, Save, X, LogOut, Search, Eye, Image, FileSignature, Users, Clock, RefreshCw, Calendar, MapPin, Phone, User, Building, Target, AlertCircle } from "lucide-react";

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
      console.log("Available registrations:", registrations.map(r => ({ id: r.id, name: r.visitorname })));
      
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

      // First check if the registration exists
      const { data: existingReg, error: checkError } = await supabase
        .from('visitor_registrations')
        .select('id, visitorname')
        .eq('id', id)
        .maybeSingle();

      console.log("Registration check:", { existingReg, checkError });

      if (checkError) {
        console.error("Check error:", checkError);
        toast({
          title: "Error",
          description: "Error checking registration: " + checkError.message,
          variant: "destructive",
        });
        return;
      }

      if (!existingReg) {
        console.error("Registration not found with ID:", id);
        toast({
          title: "Error",
          description: "Registration not found",
          variant: "destructive",
        });
        return;
      }

      console.log("Found registration:", existingReg);

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
        console.error("No rows updated - this should not happen after existence check");
        toast({
          title: "Error",
          description: "Update failed unexpectedly",
          variant: "destructive",
        });
        return;
      }

      console.log("Successfully updated end time, updated record:", data[0]);
      
      // Force update local state with the returned data
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
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 shadow-sm">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
          Completed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200 shadow-sm">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
        Active
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-orange-100">
          <RefreshCw className="mx-auto h-12 w-12 animate-spin text-orange-600 mb-4" />
          <p className="text-gray-800 font-semibold text-xl">Loading registrations...</p>
          <p className="text-gray-600 text-sm mt-2">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header with elegant design */}
        <div className="bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 shadow-2xl rounded-3xl p-6 mb-8 border border-orange-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                <Building className="h-8 w-8 mr-3" />
                Woodstock School Visitor Management
              </h1>
              <p className="text-orange-100 text-lg font-medium">Administrative Dashboard - Monitor and manage all visitor registrations</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <p className="text-xs text-orange-200 font-medium">Administrator</p>
                <p className="font-bold text-white text-sm">{user?.email}</p>
              </div>
              <Button 
                onClick={handleLogout} 
                variant="outline"
                className="flex items-center space-x-2 bg-white text-orange-700 hover:bg-orange-50 border-2 border-white font-semibold px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500 to-red-500 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium mb-1">Total Visitors</p>
                  <p className="text-3xl font-bold text-white">{registrations.length}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium mb-1">Active Visits</p>
                  <p className="text-3xl font-bold text-white">
                    {registrations.filter(r => !r.endtime).length}
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl bg-gradient-to-br from-red-500 to-orange-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium mb-1">Today's Visits</p>
                  <p className="text-3xl font-bold text-white">
                    {registrations.filter(r => 
                      new Date(r.created_at).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-600 to-amber-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium mb-1">Completed</p>
                  <p className="text-3xl font-bold text-white">
                    {registrations.filter(r => r.endtime).length}
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Target className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with enhanced styling */}
        <Card className="border-0 shadow-2xl bg-white rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 p-6">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <Users className="h-6 w-6 mr-3 text-orange-600" />
                Visitor Registrations ({filteredRegistrations.length})
              </CardTitle>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search visitors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl shadow-sm"
                  />
                </div>
                <Button 
                  onClick={fetchRegistrations} 
                  variant="outline"
                  className="flex items-center space-x-2 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-semibold px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
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
                  <TableRow className="bg-gradient-to-r from-orange-50 to-amber-50 border-b-2 border-orange-200">
                    <TableHead className="font-bold text-orange-900 py-4 px-6 border-r border-orange-100">Visitor Information</TableHead>
                    <TableHead className="font-bold text-orange-900 py-4 px-6 border-r border-orange-100">Contact Details</TableHead>
                    <TableHead className="font-bold text-orange-900 py-4 px-6 border-r border-orange-100">Visit Purpose</TableHead>
                    <TableHead className="font-bold text-orange-900 py-4 px-6 border-r border-orange-100">Party Details</TableHead>
                    <TableHead className="font-bold text-orange-900 py-4 px-6 border-r border-orange-100">Visit Duration</TableHead>
                    <TableHead className="font-bold text-orange-900 py-4 px-6 border-r border-orange-100">Status</TableHead>
                    <TableHead className="font-bold text-orange-900 py-4 px-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration, index) => (
                    <TableRow 
                      key={registration.id} 
                      className={`transition-all duration-200 border-b border-gray-100 hover:bg-gradient-to-r hover:from-orange-25 hover:to-amber-25 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gradient-to-r from-orange-25/30 to-amber-25/30'
                      }`}
                    >
                      <TableCell className="py-6 px-6 border-r border-gray-100">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                              <User className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <div>
                            <div className="text-base font-bold text-gray-900 mb-1">
                              {registration.visitorname}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center font-medium">
                              <Building className="h-4 w-4 mr-2 text-gray-400" />
                              {registration.schoolname}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-6 border-r border-gray-100">
                        <div className="space-y-2">
                          <div className="text-sm text-gray-900 flex items-center font-medium">
                            <Phone className="h-4 w-4 mr-2 text-gray-500" />
                            {registration.phonenumber}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                            {registration.address?.slice(0, 30)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-6 border-r border-gray-100">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-orange-100 text-orange-800 border border-orange-200 shadow-sm">
                          {formatPurpose(registration.purpose)}
                        </span>
                      </TableCell>
                      <TableCell className="py-6 px-6 border-r border-gray-100">
                        <div>
                          <div className="text-base font-bold text-gray-900 mb-1">
                            {registration.numberofpeople} {registration.numberofpeople === 1 ? 'person' : 'people'}
                          </div>
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {parsePeople(registration.people)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-6 border-r border-gray-100">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600 font-medium">
                            <Clock className="h-4 w-4 mr-2 text-green-500" />
                            <span className="text-green-700">Started:</span> {formatDate(registration.starttime)}
                          </div>
                          {editingId === registration.id ? (
                            <div className="space-y-2">
                              <Input
                                type="datetime-local"
                                value={editEndTime}
                                onChange={(e) => setEditEndTime(e.target.value)}
                                className="w-48 text-sm border-2 border-orange-300 focus:border-orange-500 rounded-lg"
                              />
                              {saving && (
                                <div className="flex items-center text-orange-600 text-sm font-semibold">
                                  <AlertCircle className="h-4 w-4 mr-2" />
                                  Saving...
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center text-sm text-gray-600 font-medium">
                              <Clock className="h-4 w-4 mr-2 text-red-500" />
                              <span className="text-red-700">Ended:</span> {registration.endtime ? formatDate(registration.endtime) : 'Still Active'}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-6 border-r border-gray-100">
                        {getStatusBadge(registration)}
                      </TableCell>
                      <TableCell className="py-6 px-6">
                        <div className="flex items-center space-x-3">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-9 w-9 p-0 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0 rounded-2xl">
                              <div className="bg-white">
                                <DialogHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-t-2xl">
                                  <DialogTitle className="text-xl font-bold flex items-center">
                                    <User className="h-6 w-6 mr-3" />
                                    {registration.visitorname}
                                  </DialogTitle>
                                  <DialogDescription className="text-orange-100 text-base">
                                    Complete visitor information and documentation
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="p-8">
                                  {/* Top Row: Visitor Information (left) and Photo (right) */}
                                  <div className="grid grid-cols-2 gap-8 mb-8">
                                    {/* Visitor Information */}
                                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200 shadow-sm">
                                      <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center">
                                        <User className="h-5 w-5 mr-2" />
                                        Visitor Information
                                      </h3>
                                      <div className="space-y-4">
                                        <div>
                                          <p className="text-sm text-orange-600 font-medium mb-1">Full Name</p>
                                          <p className="text-base font-semibold text-gray-900">{registration.visitorname}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-orange-600 font-medium mb-1">Phone Number</p>
                                          <p className="text-base font-semibold text-gray-900">{registration.phonenumber}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-orange-600 font-medium mb-1">Visit Purpose</p>
                                          <p className="text-base font-semibold text-gray-900">{formatPurpose(registration.purpose)}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-orange-600 font-medium mb-1">School/Institution</p>
                                          <p className="text-base font-semibold text-gray-900">{registration.schoolname}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-orange-600 font-medium mb-1">Address</p>
                                          <p className="text-base font-semibold text-gray-900">{registration.address}</p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Photo */}
                                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 shadow-sm">
                                      <h3 className="text-lg font-bold text-amber-800 mb-4 flex items-center">
                                        <Image className="h-5 w-5 mr-2" />
                                        Visitor Photo
                                      </h3>
                                      {registration.picture_url ? (
                                        <img
                                          src={getImageUrl(registration.picture_url)}
                                          alt="Visitor"
                                          className="w-full h-80 object-contain rounded-xl bg-white border shadow-sm cursor-pointer hover:scale-105 transition-transform duration-200"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjM4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzllYTNhOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIGltYWdlIGF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
                                          }}
                                          onClick={() => window.open(getImageUrl(registration.picture_url), '_blank')}
                                        />
                                      ) : (
                                        <div className="w-full h-80 bg-gray-100 rounded-xl flex items-center justify-center border shadow-sm">
                                          <div className="text-center">
                                            <Image className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-500 font-medium">No photo available</p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Bottom Row: Visit Details (left) and Digital Signature (right) */}
                                  <div className="grid grid-cols-2 gap-8">
                                    {/* Visit Details */}
                                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200 shadow-sm">
                                      <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center">
                                        <Clock className="h-5 w-5 mr-2" />
                                        Visit Details
                                      </h3>
                                      <div className="space-y-4">
                                        <div>
                                          <p className="text-sm text-orange-600 font-medium mb-1">Accompanying People ({registration.numberofpeople})</p>
                                          <p className="text-base font-semibold text-gray-900">{parsePeople(registration.people)}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-orange-600 font-medium mb-1">Visit Start Time</p>
                                          <p className="text-base font-semibold text-gray-900">{formatDate(registration.starttime)}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-orange-600 font-medium mb-1">Visit End Time</p>
                                          <p className="text-base font-semibold text-gray-900">{formatDate(registration.endtime)}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-orange-600 font-medium mb-1">Registration Date</p>
                                          <p className="text-base font-semibold text-gray-900">{formatDate(registration.created_at)}</p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Digital Signature */}
                                    <div className="bg-gradient-to-br from-amber-50 to-red-50 rounded-2xl p-6 border border-amber-200 shadow-sm">
                                      <h3 className="text-lg font-bold text-amber-800 mb-4 flex items-center">
                                        <FileSignature className="h-5 w-5 mr-2" />
                                        Digital Signature
                                      </h3>
                                      {registration.signature_url ? (
                                        <img
                                          src={getImageUrl(registration.signature_url)}
                                          alt="Signature"
                                          className="w-full h-80 object-contain rounded-xl bg-white border shadow-sm cursor-pointer hover:scale-105 transition-transform duration-200"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjM4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzllYTNhOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIHNpZ25hdHVyZSBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
                                          }}
                                          onClick={() => window.open(getImageUrl(registration.signature_url), '_blank')}
                                        />
                                      ) : (
                                        <div className="w-full h-80 bg-gray-100 rounded-xl flex items-center justify-center border shadow-sm">
                                          <div className="text-center">
                                            <FileSignature className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-500 font-medium">No signature available</p>
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
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => saveEdit(registration.id)}
                                disabled={saving}
                                className="h-9 w-9 p-0 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
                                disabled={saving}
                                className="h-9 w-9 p-0 border-2 border-gray-400 text-gray-600 hover:bg-gray-50 disabled:opacity-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(registration)}
                              className="h-9 w-9 p-0 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
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
              <div className="text-center py-16">
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 mx-8 border border-orange-200">
                  <Search className="mx-auto h-16 w-16 text-orange-400 mb-4" />
                  <p className="text-gray-700 text-xl font-semibold mb-2">
                    {searchTerm ? 'No registrations found matching your search.' : 'No registrations found.'}
                  </p>
                  <p className="text-gray-500">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Visitor registrations will appear here once created.'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
