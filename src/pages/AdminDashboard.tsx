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

      const { error } = await supabase
        .from('visitor_registrations')
        .update({ endtime: endTimeISO })
        .eq('id', id);

      console.log("Update response:", { error });

      if (error) {
        console.error("Update error:", error);
        toast({
          title: "Error",
          description: "Failed to update end time: " + error.message,
          variant: "destructive",
        });
        return;
      }

      console.log("Successfully updated end time");
      
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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100">
        <div className="text-center">
          <RefreshCw className="mx-auto h-12 w-12 animate-spin text-purple-600 mb-4" />
          <p className="text-gray-700 font-bold text-xl">Loading registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 shadow-xl rounded-xl p-4 mb-4 border border-purple-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Visitor Management System
              </h1>
              <p className="text-purple-100 text-base font-medium">Monitor and manage visitor registrations</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-xs text-purple-200 font-medium">Signed in as</p>
                <p className="font-bold text-white text-sm">{user?.email}</p>
              </div>
              <Button 
                onClick={handleLogout} 
                variant="outline"
                className="flex items-center space-x-2 bg-white text-purple-600 hover:bg-purple-50 border-2 border-white font-bold text-sm px-3 py-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-3">
              <div className="flex items-center">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-purple-100">Total Visitors</p>
                  <p className="text-xl font-bold text-white">{registrations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-3">
              <div className="flex items-center">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-emerald-100">Active Visits</p>
                  <p className="text-xl font-bold text-white">
                    {registrations.filter(r => !r.endtime).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-3">
              <div className="flex items-center">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-blue-100">Today's Visits</p>
                  <p className="text-xl font-bold text-white">
                    {registrations.filter(r => 
                      new Date(r.created_at).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-rose-500 to-rose-600 text-white">
            <CardContent className="p-3">
              <div className="flex items-center">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-rose-100">Completed</p>
                  <p className="text-xl font-bold text-white">
                    {registrations.filter(r => r.endtime).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 py-3">
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
                  <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                    <TableHead className="font-bold text-blue-900 text-sm border-r border-blue-100">Visitor</TableHead>
                    <TableHead className="font-bold text-blue-900 text-sm border-r border-blue-100">Contact</TableHead>
                    <TableHead className="font-bold text-blue-900 text-sm border-r border-blue-100">Purpose</TableHead>
                    <TableHead className="font-bold text-blue-900 text-sm border-r border-blue-100">People</TableHead>
                    <TableHead className="font-bold text-blue-900 text-sm border-r border-blue-100">Visit Duration</TableHead>
                    <TableHead className="font-bold text-blue-900 text-sm border-r border-blue-100">Status</TableHead>
                    <TableHead className="font-bold text-blue-900 text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration, index) => (
                    <TableRow 
                      key={registration.id} 
                      className={`transition-all duration-200 border-b border-gray-100 ${
                        index % 2 === 0 
                          ? 'bg-gradient-to-r from-blue-25 to-indigo-25 hover:from-blue-50 hover:to-indigo-50' 
                          : 'bg-gradient-to-r from-purple-25 to-pink-25 hover:from-purple-50 hover:to-pink-50'
                      }`}
                    >
                      <TableCell className="py-4 border-r border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              index % 2 === 0 
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                                : 'bg-gradient-to-br from-purple-500 to-pink-600'
                            }`}>
                              <User className="h-5 w-5 text-white" />
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
                      <TableCell className="py-4 border-r border-gray-100">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900 flex items-center font-medium">
                            <Phone className="h-3 w-3 mr-1 text-gray-500" />
                            {registration.phonenumber}
                          </div>
                          <div className="text-xs text-gray-600 flex items-center font-medium">
                            <MapPin className="h-3 w-3 mr-1 text-gray-500" />
                            {registration.address?.slice(0, 25)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 border-r border-gray-100">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                          index % 2 === 0 
                            ? 'bg-blue-100 text-blue-800 border-blue-200' 
                            : 'bg-purple-100 text-purple-800 border-purple-200'
                        }`}>
                          {formatPurpose(registration.purpose)}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 border-r border-gray-100">
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {registration.numberofpeople} {registration.numberofpeople === 1 ? 'person' : 'people'}
                          </div>
                          <div className="text-xs text-gray-600 max-w-xs truncate font-medium">
                            {parsePeople(registration.people)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 border-r border-gray-100">
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-gray-600 font-medium">
                            <Clock className="h-3 w-3 mr-1" />
                            Started: {formatDate(registration.starttime)}
                          </div>
                          {editingId === registration.id ? (
                            <div className="space-y-1">
                              <Input
                                type="datetime-local"
                                value={editEndTime}
                                onChange={(e) => setEditEndTime(e.target.value)}
                                className="w-40 text-xs border-2 border-orange-300 focus:border-orange-500 font-medium"
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
                      <TableCell className="py-4 border-r border-gray-100">
                        {getStatusBadge(registration)}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className={`h-8 w-8 p-0 border-2 hover:scale-105 transition-transform ${
                                  index % 2 === 0 
                                    ? 'border-blue-500 text-blue-600 hover:bg-blue-50' 
                                    : 'border-purple-500 text-purple-600 hover:bg-purple-50'
                                }`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
                              <div className="bg-white">
                                <DialogHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
                                  <DialogTitle className="text-lg font-bold flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    {registration.visitorname}
                                  </DialogTitle>
                                  <DialogDescription className="text-blue-100 text-sm">
                                    Complete visitor information and documentation
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="p-6">
                                  {/* Top Row: Visitor Information (left) and Photo (right) */}
                                  <div className="grid grid-cols-2 gap-6 mb-6">
                                    {/* Visitor Information */}
                                    <div className="bg-gray-50 rounded-lg p-4 border">
                                      <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center">
                                        <User className="h-4 w-4 mr-2" />
                                        Visitor Information
                                      </h3>
                                      <div className="space-y-3">
                                        <div>
                                          <p className="text-xs text-gray-500">Name</p>
                                          <p className="text-sm font-semibold text-gray-900">{registration.visitorname}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">Phone</p>
                                          <p className="text-sm font-semibold text-gray-900">{registration.phonenumber}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">Purpose</p>
                                          <p className="text-sm font-semibold text-gray-900">{formatPurpose(registration.purpose)}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">School/Institution</p>
                                          <p className="text-sm font-semibold text-gray-900">{registration.schoolname}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">Address</p>
                                          <p className="text-sm font-semibold text-gray-900">{registration.address}</p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Photo */}
                                    <div className="bg-gray-50 rounded-lg p-4 border">
                                      <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center">
                                        <Image className="h-4 w-4 mr-2" />
                                        Visitor Photo
                                      </h3>
                                      {registration.picture_url ? (
                                        <img
                                          src={getImageUrl(registration.picture_url)}
                                          alt="Visitor"
                                          className="w-full h-60 object-cover rounded-lg"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjM4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzllYTNhOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIGltYWdlIGF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
                                          }}
                                        />
                                      ) : (
                                        <div className="w-full h-60 bg-gray-200 rounded-lg flex items-center justify-center">
                                          <div className="text-center">
                                            <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-500 text-sm">No photo available</p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Bottom Row: Visit Details (left) and Digital Signature (right) */}
                                  <div className="grid grid-cols-2 gap-6">
                                    {/* Visit Details */}
                                    <div className="bg-gray-50 rounded-lg p-4 border">
                                      <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center">
                                        <Clock className="h-4 w-4 mr-2" />
                                        Visit Details
                                      </h3>
                                      <div className="space-y-3">
                                        <div>
                                          <p className="text-xs text-gray-500">People ({registration.numberofpeople})</p>
                                          <p className="text-sm font-semibold text-gray-900">{parsePeople(registration.people)}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">Start Time</p>
                                          <p className="text-sm font-semibold text-gray-900">{formatDate(registration.starttime)}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">End Time</p>
                                          <p className="text-sm font-semibold text-gray-900">{formatDate(registration.endtime)}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">Registered On</p>
                                          <p className="text-sm font-semibold text-gray-900">{formatDate(registration.created_at)}</p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Digital Signature */}
                                    <div className="bg-gray-50 rounded-lg p-4 border">
                                      <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center">
                                        <FileSignature className="h-4 w-4 mr-2" />
                                        Digital Signature
                                      </h3>
                                      {registration.signature_url ? (
                                        <img
                                          src={getImageUrl(registration.signature_url)}
                                          alt="Signature"
                                          className="w-full h-60 object-contain rounded-lg bg-white border"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjM4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzllYTNhOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIHNpZ25hdHVyZSBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
                                          }}
                                        />
                                      ) : (
                                        <div className="w-full h-60 bg-gray-200 rounded-lg flex items-center justify-center">
                                          <div className="text-center">
                                            <FileSignature className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-500 text-sm">No signature available</p>
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
                                className="h-8 w-8 p-0 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 hover:scale-105 transition-transform"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
                                disabled={saving}
                                className="h-8 w-8 p-0 border-2 border-gray-400 text-gray-600 hover:bg-gray-50 disabled:opacity-50 hover:scale-105 transition-transform"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(registration)}
                              className={`h-8 w-8 p-0 border-2 hover:scale-105 transition-transform ${
                                index % 2 === 0 
                                  ? 'border-orange-500 text-orange-600 hover:bg-orange-50' 
                                  : 'border-pink-500 text-pink-600 hover:bg-pink-50'
                              }`}
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
