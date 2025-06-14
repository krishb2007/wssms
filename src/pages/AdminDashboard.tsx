
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
        .select('*')
        .single();

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

      if (data) {
        console.log("Successfully updated end time:", data);
        
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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <RefreshCw className="mx-auto h-12 w-12 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-700 font-bold text-xl">Loading registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Visitor Management System
              </h1>
              <p className="text-blue-100 text-base font-medium">Monitor and manage visitor registrations</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-xs text-blue-200 font-medium">Signed in as</p>
                <p className="font-bold text-white text-sm">{user?.email}</p>
              </div>
              <Button 
                onClick={handleLogout} 
                variant="outline"
                className="flex items-center space-x-2 bg-white text-blue-600 hover:bg-blue-50 border-2 border-white font-bold text-sm px-3 py-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-3">
              <div className="flex items-center">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-blue-100">Total Visitors</p>
                  <p className="text-xl font-bold text-white">{registrations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-3">
              <div className="flex items-center">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-green-100">Active Visits</p>
                  <p className="text-xl font-bold text-white">
                    {registrations.filter(r => !r.endtime).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-3">
              <div className="flex items-center">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-purple-100">Today's Visits</p>
                  <p className="text-xl font-bold text-white">
                    {registrations.filter(r => 
                      new Date(r.created_at).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <CardContent className="p-3">
              <div className="flex items-center">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-orange-100">Completed</p>
                  <p className="text-xl font-bold text-white">
                    {registrations.filter(r => r.endtime).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 py-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold text-gray-800">
                Visitor Registrations ({filteredRegistrations.length})
              </CardTitle>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search visitors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-56 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm font-medium"
                  />
                </div>
                <Button 
                  onClick={fetchRegistrations} 
                  variant="outline"
                  className="flex items-center space-x-2 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-bold text-sm px-3 py-2"
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
                  <TableRow className="bg-gradient-to-r from-gray-100 to-blue-100">
                    <TableHead className="font-bold text-gray-900 text-sm">Visitor</TableHead>
                    <TableHead className="font-bold text-gray-900 text-sm">Contact</TableHead>
                    <TableHead className="font-bold text-gray-900 text-sm">Purpose</TableHead>
                    <TableHead className="font-bold text-gray-900 text-sm">People</TableHead>
                    <TableHead className="font-bold text-gray-900 text-sm">Visit Duration</TableHead>
                    <TableHead className="font-bold text-gray-900 text-sm">Status</TableHead>
                    <TableHead className="font-bold text-gray-900 text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration) => (
                    <TableRow 
                      key={registration.id} 
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-b border-gray-100"
                    >
                      <TableCell className="py-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">
                              {registration.visitorname}
                            </div>
                            <div className="text-xs text-gray-600 flex items-center font-medium">
                              <Building className="h-3 w-3 mr-1" />
                              {registration.schoolname}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="text-sm text-gray-900 flex items-center font-medium">
                          <Phone className="h-3 w-3 mr-1 text-gray-500" />
                          {registration.phonenumber}
                        </div>
                        <div className="text-xs text-gray-600 flex items-center mt-1 font-medium">
                          <MapPin className="h-3 w-3 mr-1 text-gray-500" />
                          {registration.address?.slice(0, 25)}...
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          {formatPurpose(registration.purpose)}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="text-sm font-bold text-gray-900">
                          {registration.numberofpeople} {registration.numberofpeople === 1 ? 'person' : 'people'}
                        </div>
                        <div className="text-xs text-gray-600 max-w-xs truncate font-medium">
                          {parsePeople(registration.people)}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center text-xs text-gray-600 mb-1 font-medium">
                            <Clock className="h-3 w-3 mr-1" />
                            Started: {formatDate(registration.starttime)}
                          </div>
                          {editingId === registration.id ? (
                            <div className="space-y-1">
                              <Input
                                type="datetime-local"
                                value={editEndTime}
                                onChange={(e) => setEditEndTime(e.target.value)}
                                className="w-40 text-xs border-2 border-blue-300 focus:border-blue-500 font-medium"
                              />
                              {saving && (
                                <div className="flex items-center text-orange-600 text-xs font-bold">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Saving...
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-600 font-medium">
                              Ended: {registration.endtime ? formatDate(registration.endtime) : 'Active'}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        {getStatusBadge(registration)}
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center space-x-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 w-7 p-0 border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-gray-800">
                                  {registration.visitorname}
                                </DialogTitle>
                                <DialogDescription className="text-sm text-gray-600 font-medium">
                                  Complete visitor information
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-2 space-y-4">
                                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                                    <h4 className="font-bold text-base mb-3 flex items-center text-blue-800">
                                      <User className="h-4 w-4 mr-2" />
                                      Visitor Information
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm font-medium">
                                      <p><strong className="text-gray-700">Name:</strong> <span className="text-gray-900">{registration.visitorname}</span></p>
                                      <p><strong className="text-gray-700">Phone:</strong> <span className="text-gray-900">{registration.phonenumber}</span></p>
                                      <p><strong className="text-gray-700">Purpose:</strong> <span className="text-gray-900">{formatPurpose(registration.purpose)}</span></p>
                                      <p><strong className="text-gray-700">School:</strong> <span className="text-gray-900">{registration.schoolname}</span></p>
                                      <p className="col-span-2"><strong className="text-gray-700">Address:</strong> <span className="text-gray-900">{registration.address}</span></p>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                                    <h4 className="font-bold text-base mb-3 flex items-center text-green-800">
                                      <Clock className="h-4 w-4 mr-2" />
                                      Visit Details
                                    </h4>
                                    <div className="space-y-2 text-sm font-medium">
                                      <p><strong className="text-gray-700">People ({registration.numberofpeople}):</strong></p>
                                      <p className="text-xs bg-white p-2 rounded border border-green-200 font-medium">{parsePeople(registration.people)}</p>
                                      <div className="grid grid-cols-2 gap-3">
                                        <p><strong className="text-gray-700">Start:</strong> <span className="text-gray-900">{formatDate(registration.starttime)}</span></p>
                                        <p><strong className="text-gray-700">End:</strong> <span className="text-gray-900">{formatDate(registration.endtime)}</span></p>
                                      </div>
                                      <p><strong className="text-gray-700">Registered:</strong> <span className="text-gray-900">{formatDate(registration.created_at)}</span></p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                                    <h4 className="font-bold text-base mb-3 flex items-center text-purple-800">
                                      <Image className="h-4 w-4 mr-2" />
                                      Photo
                                    </h4>
                                    {registration.picture_url ? (
                                      <img
                                        src={getImageUrl(registration.picture_url)}
                                        alt="Visitor"
                                        className="w-full h-32 object-cover bg-white rounded border border-purple-200"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzllYTNhOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIGltYWdlPC90ZXh0Pjwvc3ZnPg==';
                                        }}
                                      />
                                    ) : (
                                      <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center border border-purple-200">
                                        <p className="text-gray-500 text-sm">No photo</p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                                    <h4 className="font-bold text-base mb-3 flex items-center text-orange-800">
                                      <FileSignature className="h-4 w-4 mr-2" />
                                      Signature
                                    </h4>
                                    {registration.signature_url ? (
                                      <img
                                        src={getImageUrl(registration.signature_url)}
                                        alt="Signature"
                                        className="w-full h-20 object-contain bg-white rounded border border-orange-200"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOWVhM2E4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gc2lnbmF0dXJlPC90ZXh0Pjwvc3ZnPg==';
                                        }}
                                      />
                                    ) : (
                                      <div className="w-full h-20 bg-gray-200 rounded flex items-center justify-center border border-orange-200">
                                        <p className="text-gray-500 text-sm">No signature</p>
                                      </div>
                                    )}
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
                                className="h-7 w-7 p-0 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                              >
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
                                disabled={saving}
                                className="h-7 w-7 p-0 border-2 border-gray-400 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(registration)}
                              className="h-7 w-7 p-0 border-2 border-orange-500 text-orange-600 hover:bg-orange-50"
                            >
                              <Pencil className="h-3 w-3" />
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
                <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg font-bold">
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
