
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
    if (!user || user.role !== 'admin') {
      navigate('/admin-login');
      return;
    }
    fetchRegistrations();
    // eslint-disable-next-line
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

  // Fetch all registrations - FIXED TABLE NAME
  async function fetchRegistrations() {
    setLoading(true);
    console.log("Fetching registrations from visitor_registrations table...");
    
    const { data, error } = await supabase
      .from('visitor_registrations') // FIXED: Changed from visitor_registration to visitor_registrations
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching registrations:", error);
      toast({
        title: "Error",
        description: "Failed to fetch registrations: " + error.message,
        variant: "destructive",
      });
    } else if (data) {
      console.log("Successfully fetched registrations:", data);
      setRegistrations(data);
      setFilteredRegistrations(data);
    }
    setLoading(false);
  }

  // Start editing end time
  function startEdit(registration: VisitorRegistration) {
    setEditingId(registration.id);
    const currentEndTime = registration.endtime 
      ? new Date(registration.endtime).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16);
    setEditEndTime(currentEndTime);
  }

  // Cancel editing
  function cancelEdit() {
    setEditingId(null);
    setEditEndTime('');
  }

  // Save edited end time - IMPROVED WITH BETTER ERROR HANDLING
  async function saveEdit(id: string) {
    if (saving) return;
    if (!editEndTime) {
      toast({
        title: "Error",
        description: "Please select an end time",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    console.log("Saving end time for registration ID:", id, "End time:", editEndTime);
    
    const endTimeISO = new Date(editEndTime).toISOString();

    try {
      const { data, error } = await supabase
        .from('visitor_registrations') // FIXED: Changed from visitor_registration to visitor_registrations
        .update({ endtime: endTimeISO })
        .eq('id', id)
        .select();

      if (error) {
        console.error("Error updating end time:", error);
        toast({
          title: "Error",
          description: "Failed to update end time: " + error.message,
          variant: "destructive",
        });
      } else {
        console.log("Successfully updated end time:", data);
        toast({
          title: "Success",
          description: "End time updated successfully",
        });
        
        // Update local state immediately
        setRegistrations(prev => 
          prev.map(reg => 
            reg.id === id ? { ...reg, endtime: endTimeISO } : reg
          )
        );
        setEditingId(null);
        setEditEndTime('');
        
        // Refresh data to ensure sync
        await fetchRegistrations();
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
    
    setSaving(false);
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
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-gray-200 text-gray-800">
          <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
          Completed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-green-100 text-green-800">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
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
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-2xl border border-blue-200 rounded-2xl p-8 mb-6">
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

        {/* Stats Cards - MORE COMPACT */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white">
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-bold text-blue-100">Total Visitors</p>
                  <p className="text-3xl font-black text-white">{registrations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-green-700 text-white">
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-bold text-green-100">Active Visits</p>
                  <p className="text-3xl font-black text-white">
                    {registrations.filter(r => !r.endtime).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-700 text-white">
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-bold text-purple-100">Today's Visits</p>
                  <p className="text-3xl font-black text-white">
                    {registrations.filter(r => 
                      new Date(r.created_at).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500 to-red-600 text-white">
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-bold text-orange-100">Completed</p>
                  <p className="text-3xl font-black text-white">
                    {registrations.filter(r => r.endtime).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-2xl bg-white">
          <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50 p-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-black text-gray-800">
                Visitor Registrations ({filteredRegistrations.length})
              </CardTitle>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search visitors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base font-semibold"
                  />
                </div>
                <Button 
                  onClick={fetchRegistrations} 
                  variant="outline"
                  className="flex items-center space-x-2 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-bold text-base px-4 py-2"
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
                  <TableRow className="bg-gradient-to-r from-gray-100 via-blue-100 to-purple-100">
                    <TableHead className="font-black text-gray-900 text-lg p-4">Visitor</TableHead>
                    <TableHead className="font-black text-gray-900 text-lg p-4">Contact</TableHead>
                    <TableHead className="font-black text-gray-900 text-lg p-4">Purpose</TableHead>
                    <TableHead className="font-black text-gray-900 text-lg p-4">People</TableHead>
                    <TableHead className="font-black text-gray-900 text-lg p-4">Visit Duration</TableHead>
                    <TableHead className="font-black text-gray-900 text-lg p-4">Status</TableHead>
                    <TableHead className="font-black text-gray-900 text-lg p-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration) => (
                    <TableRow 
                      key={registration.id} 
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:via-purple-50 hover:to-pink-50 transition-all duration-200 border-b border-gray-100"
                    >
                      <TableCell className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <div>
                            <div className="text-lg font-black text-gray-900">
                              {registration.visitorname}
                            </div>
                            <div className="text-base text-gray-600 flex items-center font-bold">
                              <Building className="h-4 w-4 mr-2" />
                              {registration.schoolname}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="text-lg text-gray-900 flex items-center font-bold">
                          <Phone className="h-5 w-5 mr-2 text-gray-500" />
                          {registration.phonenumber}
                        </div>
                        <div className="text-base text-gray-600 flex items-center mt-1 font-semibold">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          {registration.address?.slice(0, 30)}...
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-base font-black bg-blue-100 text-blue-800">
                          {formatPurpose(registration.purpose)}
                        </span>
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="text-lg font-black text-gray-900">
                          {registration.numberofpeople} {registration.numberofpeople === 1 ? 'person' : 'people'}
                        </div>
                        <div className="text-sm text-gray-600 max-w-xs truncate font-semibold">
                          {parsePeople(registration.people)}
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="text-base text-gray-900">
                          <div className="flex items-center text-sm text-gray-600 mb-2 font-bold">
                            <Clock className="h-4 w-4 mr-1" />
                            Started: {formatDate(registration.starttime)}
                          </div>
                          {editingId === registration.id ? (
                            <div className="space-y-2">
                              <Input
                                type="datetime-local"
                                value={editEndTime}
                                onChange={(e) => setEditEndTime(e.target.value)}
                                className="w-48 text-sm border-2 border-blue-300 focus:border-blue-500 font-bold"
                              />
                              {saving && (
                                <div className="flex items-center text-orange-600 text-xs font-bold">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Saving...
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-600 font-bold">
                              Ended: {registration.endtime ? formatDate(registration.endtime) : 'Active'}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        {getStatusBadge(registration)}
                      </TableCell>
                      <TableCell className="p-4">
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
                            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-black text-gray-800">
                                  Visitor Details - {registration.visitorname}
                                </DialogTitle>
                                <DialogDescription className="text-lg text-gray-600 font-bold">
                                  Complete information about the visitor registration
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200">
                                    <h4 className="font-black text-xl mb-4 flex items-center text-blue-800">
                                      <User className="h-6 w-6 mr-3" />
                                      Visitor Information
                                    </h4>
                                    <div className="space-y-3 text-lg font-bold">
                                      <p><strong className="text-gray-700">Name:</strong> <span className="text-gray-900">{registration.visitorname}</span></p>
                                      <p><strong className="text-gray-700">Phone:</strong> <span className="text-gray-900">{registration.phonenumber}</span></p>
                                      <p><strong className="text-gray-700">Purpose:</strong> <span className="text-gray-900">{formatPurpose(registration.purpose)}</span></p>
                                      <p><strong className="text-gray-700">Address:</strong> <span className="text-gray-900">{registration.address}</span></p>
                                      <p><strong className="text-gray-700">School:</strong> <span className="text-gray-900">{registration.schoolname}</span></p>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200">
                                    <h4 className="font-black text-xl mb-4 flex items-center text-green-800">
                                      <Clock className="h-6 w-6 mr-3" />
                                      Visit Details
                                    </h4>
                                    <div className="space-y-3 text-lg font-bold">
                                      <p><strong className="text-gray-700">People ({registration.numberofpeople}):</strong></p>
                                      <p className="text-base bg-white p-3 rounded-lg border-2 border-green-200 font-semibold">{parsePeople(registration.people)}</p>
                                      <p><strong className="text-gray-700">Start Time:</strong> <span className="text-gray-900">{formatDate(registration.starttime)}</span></p>
                                      <p><strong className="text-gray-700">End Time:</strong> <span className="text-gray-900">{formatDate(registration.endtime)}</span></p>
                                      <p><strong className="text-gray-700">Registered:</strong> <span className="text-gray-900">{formatDate(registration.created_at)}</span></p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-6">
                                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200">
                                    <h4 className="font-black text-xl mb-4 flex items-center text-purple-800">
                                      <Image className="h-6 w-6 mr-3" />
                                      Photograph
                                    </h4>
                                    {registration.picture_url ? (
                                      <div className="w-full">
                                        <img
                                          src={getImageUrl(registration.picture_url)}
                                          alt="Visitor"
                                          className="w-full max-h-64 object-cover bg-white rounded-xl border-2 border-purple-200 shadow-lg"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzllYTNhOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center border-2 border-purple-200">
                                        <p className="text-gray-500 text-lg font-bold">No photograph provided</p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border-2 border-orange-200">
                                    <h4 className="font-black text-xl mb-4 flex items-center text-orange-800">
                                      <FileSignature className="h-6 w-6 mr-3" />
                                      Signature
                                    </h4>
                                    {registration.signature_url ? (
                                      <div className="w-full">
                                        <img
                                          src={getImageUrl(registration.signature_url)}
                                          alt="Signature"
                                          className="w-full max-h-32 object-contain bg-white rounded-xl border-2 border-orange-200 shadow-lg"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzllYTNhOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNpZ25hdHVyZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-full h-32 bg-gray-200 rounded-xl flex items-center justify-center border-2 border-orange-200">
                                        <p className="text-gray-500 text-lg font-bold">No signature provided</p>
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
                                disabled={saving}
                                className="h-10 w-10 p-0 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                              >
                                <Save className="h-5 w-5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
                                disabled={saving}
                                className="h-10 w-10 p-0 border-2 border-gray-400 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
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
                <p className="text-gray-500 text-xl font-black">
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
