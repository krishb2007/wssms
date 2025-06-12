
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
    if (saving) return; // Prevent multiple saves
    
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

      // Convert the datetime-local value to ISO string
      const endTimeISO = new Date(editEndTime).toISOString();
      console.log("Converted to ISO string:", endTimeISO);

      // First, let's check if the record exists
      const { data: existingRecord, error: checkError } = await supabase
        .from('visitor_registrations')
        .select('id, endtime')
        .eq('id', id)
        .limit(1);

      console.log("Existing record check:", { existingRecord, checkError });

      if (checkError) {
        console.error("Error checking existing record:", checkError);
        toast({
          title: "Error",
          description: "Failed to verify record exists: " + checkError.message,
          variant: "destructive",
        });
        return;
      }

      if (!existingRecord || existingRecord.length === 0) {
        console.error("Record not found for ID:", id);
        toast({
          title: "Error",
          description: "Registration record not found",
          variant: "destructive",
        });
        return;
      }

      // Now perform the update
      const { data, error } = await supabase
        .from('visitor_registrations')
        .update({ endtime: endTimeISO })
        .eq('id', id)
        .select('*');

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

      if (data && data.length > 0) {
        console.log("Successfully updated end time:", data[0]);
        
        // Update local state immediately
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
        
        // Refresh data to ensure sync
        setTimeout(() => {
          fetchRegistrations();
        }, 500);
      } else {
        console.warn("Update successful but no data returned");
        toast({
          title: "Success",
          description: "End time updated successfully",
        });
        
        setEditingId(null);
        setEditEndTime('');
        fetchRegistrations();
      }
      
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
        <span className="inline-flex items-center px-4 py-2 rounded-full text-base font-bold bg-gray-200 text-gray-800">
          <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
          Completed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-4 py-2 rounded-full text-base font-bold bg-green-100 text-green-800">
        <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
        Active
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <RefreshCw className="mx-auto h-12 w-12 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-700 font-bold text-xl">Loading registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-2xl border border-blue-200 rounded-2xl p-10 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-black text-white mb-3">
                Visitor Management System
              </h1>
              <p className="text-blue-100 text-xl font-semibold">Monitor and manage visitor registrations</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-base text-blue-200 font-semibold">Signed in as</p>
                <p className="font-black text-white text-xl">{user?.email}</p>
              </div>
              <Button 
                onClick={handleLogout} 
                variant="outline"
                className="flex items-center space-x-2 bg-white text-blue-600 hover:bg-blue-50 border-3 border-white font-black text-lg px-6 py-3"
              >
                <LogOut className="h-6 w-6" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white">
            <CardContent className="p-8">
              <div className="flex items-center">
                <div className="p-4 bg-white/20 rounded-2xl">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <div className="ml-6">
                  <p className="text-base font-bold text-blue-100">Total Visitors</p>
                  <p className="text-4xl font-black text-white">{registrations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-green-500 to-green-700 text-white">
            <CardContent className="p-8">
              <div className="flex items-center">
                <div className="p-4 bg-white/20 rounded-2xl">
                  <Clock className="h-10 w-10 text-white" />
                </div>
                <div className="ml-6">
                  <p className="text-base font-bold text-green-100">Active Visits</p>
                  <p className="text-4xl font-black text-white">
                    {registrations.filter(r => !r.endtime).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-purple-500 to-purple-700 text-white">
            <CardContent className="p-8">
              <div className="flex items-center">
                <div className="p-4 bg-white/20 rounded-2xl">
                  <Calendar className="h-10 w-10 text-white" />
                </div>
                <div className="ml-6">
                  <p className="text-base font-bold text-purple-100">Today's Visits</p>
                  <p className="text-4xl font-black text-white">
                    {registrations.filter(r => 
                      new Date(r.created_at).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white">
            <CardContent className="p-8">
              <div className="flex items-center">
                <div className="p-4 bg-white/20 rounded-2xl">
                  <Target className="h-10 w-10 text-white" />
                </div>
                <div className="ml-6">
                  <p className="text-base font-bold text-orange-100">Completed</p>
                  <p className="text-4xl font-black text-white">
                    {registrations.filter(r => r.endtime).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-2xl bg-white">
          <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50">
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl font-black text-gray-800">
                Visitor Registrations ({filteredRegistrations.length})
              </CardTitle>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
                  <Input
                    placeholder="Search visitors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 w-80 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-lg font-semibold"
                  />
                </div>
                <Button 
                  onClick={fetchRegistrations} 
                  variant="outline"
                  className="flex items-center space-x-2 border-3 border-blue-500 text-blue-600 hover:bg-blue-50 font-black text-lg px-6 py-3"
                >
                  <RefreshCw className="h-6 w-6" />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-100 via-blue-100 to-purple-100">
                    <TableHead className="font-black text-gray-900 text-lg">Visitor</TableHead>
                    <TableHead className="font-black text-gray-900 text-lg">Contact</TableHead>
                    <TableHead className="font-black text-gray-900 text-lg">Purpose</TableHead>
                    <TableHead className="font-black text-gray-900 text-lg">People</TableHead>
                    <TableHead className="font-black text-gray-900 text-lg">Visit Duration</TableHead>
                    <TableHead className="font-black text-gray-900 text-lg">Status</TableHead>
                    <TableHead className="font-black text-gray-900 text-lg">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration) => (
                    <TableRow 
                      key={registration.id} 
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:via-purple-50 hover:to-pink-50 transition-all duration-200 border-b border-gray-100"
                    >
                      <TableCell className="py-6">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <User className="h-7 w-7 text-white" />
                            </div>
                          </div>
                          <div>
                            <div className="text-lg font-black text-gray-900">
                              {registration.visitorname}
                            </div>
                            <div className="text-base text-gray-600 flex items-center font-bold">
                              <Building className="h-5 w-5 mr-2" />
                              {registration.schoolname}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="text-lg text-gray-900 flex items-center font-bold">
                          <Phone className="h-5 w-5 mr-3 text-gray-500" />
                          {registration.phonenumber}
                        </div>
                        <div className="text-base text-gray-600 flex items-center mt-2 font-semibold">
                          <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                          {registration.address?.slice(0, 35)}...
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-base font-black bg-blue-100 text-blue-800">
                          {formatPurpose(registration.purpose)}
                        </span>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="text-lg font-black text-gray-900">
                          {registration.numberofpeople} {registration.numberofpeople === 1 ? 'person' : 'people'}
                        </div>
                        <div className="text-base text-gray-600 max-w-xs truncate font-semibold">
                          {parsePeople(registration.people)}
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="text-lg text-gray-900">
                          <div className="flex items-center text-base text-gray-600 mb-3 font-bold">
                            <Clock className="h-5 w-5 mr-2" />
                            Started: {formatDate(registration.starttime)}
                          </div>
                          {editingId === registration.id ? (
                            <div className="space-y-2">
                              <Input
                                type="datetime-local"
                                value={editEndTime}
                                onChange={(e) => setEditEndTime(e.target.value)}
                                className="w-56 text-base border-3 border-blue-300 focus:border-blue-500 font-bold"
                              />
                              {saving && (
                                <div className="flex items-center text-orange-600 text-sm font-bold">
                                  <AlertCircle className="h-4 w-4 mr-1" />
                                  Saving...
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-base text-gray-600 font-bold">
                              Ended: {registration.endtime ? formatDate(registration.endtime) : 'Active'}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        {getStatusBadge(registration)}
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="flex items-center space-x-3">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-12 w-12 p-0 border-3 border-blue-500 text-blue-600 hover:bg-blue-50"
                              >
                                <Eye className="h-6 w-6" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="text-3xl font-black text-gray-800">
                                  Visitor Details - {registration.visitorname}
                                </DialogTitle>
                                <DialogDescription className="text-lg text-gray-600 font-bold">
                                  Complete information about the visitor registration
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border-2 border-blue-200">
                                    <h4 className="font-black text-xl mb-6 flex items-center text-blue-800">
                                      <User className="h-6 w-6 mr-3" />
                                      Visitor Information
                                    </h4>
                                    <div className="space-y-4 text-lg font-bold">
                                      <p><strong className="text-gray-700">Name:</strong> <span className="text-gray-900">{registration.visitorname}</span></p>
                                      <p><strong className="text-gray-700">Phone:</strong> <span className="text-gray-900">{registration.phonenumber}</span></p>
                                      <p><strong className="text-gray-700">Purpose:</strong> <span className="text-gray-900">{formatPurpose(registration.purpose)}</span></p>
                                      <p><strong className="text-gray-700">Address:</strong> <span className="text-gray-900">{registration.address}</span></p>
                                      <p><strong className="text-gray-700">School:</strong> <span className="text-gray-900">{registration.schoolname}</span></p>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl border-2 border-green-200">
                                    <h4 className="font-black text-xl mb-6 flex items-center text-green-800">
                                      <Clock className="h-6 w-6 mr-3" />
                                      Visit Details
                                    </h4>
                                    <div className="space-y-4 text-lg font-bold">
                                      <p><strong className="text-gray-700">People ({registration.numberofpeople}):</strong></p>
                                      <p className="text-base bg-white p-4 rounded-xl border-2 border-green-200 font-semibold">{parsePeople(registration.people)}</p>
                                      <p><strong className="text-gray-700">Start Time:</strong> <span className="text-gray-900">{formatDate(registration.starttime)}</span></p>
                                      <p><strong className="text-gray-700">End Time:</strong> <span className="text-gray-900">{formatDate(registration.endtime)}</span></p>
                                      <p><strong className="text-gray-700">Registered:</strong> <span className="text-gray-900">{formatDate(registration.created_at)}</span></p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-8">
                                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border-2 border-purple-200">
                                    <h4 className="font-black text-xl mb-6 flex items-center text-purple-800">
                                      <Image className="h-6 w-6 mr-3" />
                                      Photograph
                                    </h4>
                                    {registration.picture_url ? (
                                      <div className="w-full">
                                        <img
                                          src={getImageUrl(registration.picture_url)}
                                          alt="Visitor"
                                          className="w-full h-80 object-contain bg-white rounded-2xl border-3 border-purple-200 shadow-lg"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzllYTNhOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-full h-80 bg-gray-200 rounded-2xl flex items-center justify-center border-3 border-purple-200">
                                        <p className="text-gray-500 text-xl font-bold">No photograph provided</p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl border-2 border-orange-200">
                                    <h4 className="font-black text-xl mb-6 flex items-center text-orange-800">
                                      <FileSignature className="h-6 w-6 mr-3" />
                                      Signature
                                    </h4>
                                    {registration.signature_url ? (
                                      <div className="w-full">
                                        <img
                                          src={getImageUrl(registration.signature_url)}
                                          alt="Signature"
                                          className="w-full h-40 object-contain bg-white rounded-2xl border-3 border-orange-200 shadow-lg"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzllYTNhOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNpZ25hdHVyZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-full h-40 bg-gray-200 rounded-2xl flex items-center justify-center border-3 border-orange-200">
                                        <p className="text-gray-500 text-xl font-bold">No signature provided</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          {editingId === registration.id ? (
                            <div className="flex space-x-3">
                              <Button
                                size="sm"
                                onClick={() => saveEdit(registration.id)}
                                disabled={saving}
                                className="h-12 w-12 p-0 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                              >
                                <Save className="h-6 w-6" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
                                disabled={saving}
                                className="h-12 w-12 p-0 border-3 border-gray-400 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                              >
                                <X className="h-6 w-6" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(registration)}
                              className="h-12 w-12 p-0 border-3 border-orange-500 text-orange-600 hover:bg-orange-50"
                            >
                              <Pencil className="h-6 w-6" />
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
              <div className="text-center py-20">
                <Search className="mx-auto h-20 w-20 text-gray-400 mb-8" />
                <p className="text-gray-500 text-2xl font-black">
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
