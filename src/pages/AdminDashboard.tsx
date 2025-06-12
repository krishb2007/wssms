
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
import { Pencil, Save, X, LogOut, Search, Eye, Image, FileSignature, Users, Clock, RefreshCw, Calendar, MapPin, Phone, User, Building, Target, ChevronDown } from "lucide-react";

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
    try {
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

      if (data && data.length > 0) {
        console.log("Successfully updated end time:", data[0]);
        
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
        
        // Refresh data to ensure sync
        await fetchRegistrations();
      } else {
        console.warn("No data returned from update");
        toast({
          title: "Warning",
          description: "Update may not have been saved",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error("Unexpected error during update:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating: " + (error as Error).message,
        variant: "destructive",
      });
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
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-200 text-gray-800">
          <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
          Completed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800">
        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
        Active
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <RefreshCw className="mx-auto h-10 w-10 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-700 font-semibold text-lg">Loading registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-xl border border-blue-200 rounded-xl p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Visitor Management System
              </h1>
              <p className="text-blue-100 text-lg">Monitor and manage visitor registrations</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm text-blue-200">Signed in as</p>
                <p className="font-semibold text-white text-lg">{user?.email}</p>
              </div>
              <Button 
                onClick={handleLogout} 
                variant="outline"
                className="flex items-center space-x-2 bg-white text-blue-600 hover:bg-blue-50 border-2 border-white font-semibold"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-100">Total Visitors</p>
                  <p className="text-3xl font-bold text-white">{registrations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-emerald-100">Active Visits</p>
                  <p className="text-3xl font-bold text-white">
                    {registrations.filter(r => !r.endtime).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-100">Today's Visits</p>
                  <p className="text-3xl font-bold text-white">
                    {registrations.filter(r => 
                      new Date(r.created_at).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-orange-100">Completed</p>
                  <p className="text-3xl font-bold text-white">
                    {registrations.filter(r => r.endtime).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-100">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-gray-800">
                Visitor Registrations ({filteredRegistrations.length})
              </CardTitle>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search visitors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11 w-72 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base"
                  />
                </div>
                <Button 
                  onClick={fetchRegistrations} 
                  variant="outline"
                  className="flex items-center space-x-2 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-semibold"
                >
                  <RefreshCw className="h-5 w-5" />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-100 to-slate-200">
                    <TableHead className="font-bold text-gray-900 text-base">Visitor</TableHead>
                    <TableHead className="font-bold text-gray-900 text-base">Contact</TableHead>
                    <TableHead className="font-bold text-gray-900 text-base">Purpose</TableHead>
                    <TableHead className="font-bold text-gray-900 text-base">People</TableHead>
                    <TableHead className="font-bold text-gray-900 text-base">Visit Duration</TableHead>
                    <TableHead className="font-bold text-gray-900 text-base">Status</TableHead>
                    <TableHead className="font-bold text-gray-900 text-base">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration) => (
                    <TableRow 
                      key={registration.id} 
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-b border-gray-100"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <div>
                            <div className="text-base font-semibold text-gray-900">
                              {registration.visitorname}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center">
                              <Building className="h-4 w-4 mr-1" />
                              {registration.schoolname}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-base text-gray-900 flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          {registration.phonenumber}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                          {registration.address?.slice(0, 35)}...
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                          {formatPurpose(registration.purpose)}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-base font-semibold text-gray-900">
                          {registration.numberofpeople} {registration.numberofpeople === 1 ? 'person' : 'people'}
                        </div>
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {parsePeople(registration.people)}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-base text-gray-900">
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <Clock className="h-4 w-4 mr-1" />
                            Started: {formatDate(registration.starttime)}
                          </div>
                          {editingId === registration.id ? (
                            <Input
                              type="datetime-local"
                              value={editEndTime}
                              onChange={(e) => setEditEndTime(e.target.value)}
                              className="w-48 text-sm border-2 border-blue-300 focus:border-blue-500"
                            />
                          ) : (
                            <div className="text-sm text-gray-600">
                              Ended: {registration.endtime ? formatDate(registration.endtime) : 'Active'}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {getStatusBadge(registration)}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-10 w-10 p-0 border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                              >
                                <Eye className="h-5 w-5" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-gray-800">
                                  Visitor Details - {registration.visitorname}
                                </DialogTitle>
                                <DialogDescription className="text-base text-gray-600">
                                  Complete information about the visitor registration
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                                    <h4 className="font-bold text-lg mb-4 flex items-center text-blue-800">
                                      <User className="h-5 w-5 mr-2" />
                                      Visitor Information
                                    </h4>
                                    <div className="space-y-3 text-base">
                                      <p><strong className="text-gray-700">Name:</strong> <span className="text-gray-900">{registration.visitorname}</span></p>
                                      <p><strong className="text-gray-700">Phone:</strong> <span className="text-gray-900">{registration.phonenumber}</span></p>
                                      <p><strong className="text-gray-700">Purpose:</strong> <span className="text-gray-900">{formatPurpose(registration.purpose)}</span></p>
                                      <p><strong className="text-gray-700">Address:</strong> <span className="text-gray-900">{registration.address}</span></p>
                                      <p><strong className="text-gray-700">School:</strong> <span className="text-gray-900">{registration.schoolname}</span></p>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-200">
                                    <h4 className="font-bold text-lg mb-4 flex items-center text-emerald-800">
                                      <Clock className="h-5 w-5 mr-2" />
                                      Visit Details
                                    </h4>
                                    <div className="space-y-3 text-base">
                                      <p><strong className="text-gray-700">People ({registration.numberofpeople}):</strong></p>
                                      <p className="text-sm bg-white p-3 rounded-lg border border-emerald-200">{parsePeople(registration.people)}</p>
                                      <p><strong className="text-gray-700">Start Time:</strong> <span className="text-gray-900">{formatDate(registration.starttime)}</span></p>
                                      <p><strong className="text-gray-700">End Time:</strong> <span className="text-gray-900">{formatDate(registration.endtime)}</span></p>
                                      <p><strong className="text-gray-700">Registered:</strong> <span className="text-gray-900">{formatDate(registration.created_at)}</span></p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-6">
                                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                                    <h4 className="font-bold text-lg mb-4 flex items-center text-purple-800">
                                      <Image className="h-5 w-5 mr-2" />
                                      Photograph
                                    </h4>
                                    {registration.picture_url ? (
                                      <div className="w-full">
                                        <img
                                          src={getImageUrl(registration.picture_url)}
                                          alt="Visitor"
                                          className="w-full h-64 object-cover rounded-lg border-2 border-purple-200 shadow-md"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzllYTNhOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-purple-200">
                                        <p className="text-gray-500 text-lg">No photograph provided</p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-xl border border-orange-200">
                                    <h4 className="font-bold text-lg mb-4 flex items-center text-orange-800">
                                      <FileSignature className="h-5 w-5 mr-2" />
                                      Signature
                                    </h4>
                                    {registration.signature_url ? (
                                      <div className="w-full">
                                        <img
                                          src={getImageUrl(registration.signature_url)}
                                          alt="Signature"
                                          className="w-full h-32 object-contain bg-white rounded-lg border-2 border-orange-200 shadow-md"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzllYTNhOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNpZ25hdHVyZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-orange-200">
                                        <p className="text-gray-500 text-lg">No signature provided</p>
                                      </div>
                                    )}
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
                                className="h-10 w-10 p-0 bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <Save className="h-5 w-5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
                                className="h-10 w-10 p-0 border-2 border-gray-400 text-gray-600 hover:bg-gray-50"
                              >
                                <X className="h-5 w-5" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(registration)}
                              className="h-10 w-10 p-0 border-2 border-orange-500 text-orange-600 hover:bg-orange-50"
                            >
                              <Pencil className="h-5 w-5" />
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
                <Search className="mx-auto h-16 w-16 text-gray-400 mb-6" />
                <p className="text-gray-500 text-xl font-semibold">
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
