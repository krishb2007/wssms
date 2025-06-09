
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
import { Pencil, Save, X, LogOut, Search, Eye, Image, FileSignature, Users, Clock, RefreshCw } from "lucide-react";

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
    setEditEndTime(registration.endtime || new Date().toISOString().slice(0, 16));
  }

  function cancelEdit() {
    console.log("Cancelling edit");
    setEditingId(null);
    setEditEndTime('');
  }

  async function saveEdit(id: string) {
    try {
      console.log("Saving end time for registration:", id, "to:", editEndTime);
      
      const { data, error } = await supabase
        .from('visitor_registrations')
        .update({ endtime: editEndTime || null })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("Update error:", error);
        toast({
          title: "Error",
          description: "Failed to update registration: " + error.message,
          variant: "destructive",
        });
      } else {
        console.log("Successfully updated end time:", data);
        toast({
          title: "Success",
          description: "End time updated successfully",
        });
        setEditingId(null);
        setEditEndTime('');
        await fetchRegistrations(); // Refresh the data
      }
    } catch (error) {
      console.error("Unexpected error during update:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating",
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
    return new Date(dateString).toLocaleString();
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="text-lg text-indigo-700 flex items-center">
          <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
          Loading registrations...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        {/* Header Section with vibrant colors */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-bold mb-3">
                🎛️ Admin Dashboard
              </h1>
              <p className="text-purple-100 text-lg">Manage visitor registrations and access controls</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm text-purple-100">Welcome back,</p>
                <p className="font-semibold text-white text-lg">{user?.email}</p>
              </div>
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                size="lg"
                className="border-white/30 text-white hover:bg-white/20 hover:border-white/50 bg-white/10"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards with vibrant colors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <Card className="bg-gradient-to-br from-green-400 to-emerald-600 text-white border-0 shadow-xl transform hover:scale-105 transition-transform">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-lg">Total Visitors</p>
                  <p className="text-4xl font-bold">{registrations.length}</p>
                </div>
                <Users className="h-16 w-16 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-400 to-red-500 text-white border-0 shadow-xl transform hover:scale-105 transition-transform">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-lg">Active Visits</p>
                  <p className="text-4xl font-bold">
                    {registrations.filter(r => !r.endtime).length}
                  </p>
                </div>
                <Clock className="h-16 w-16 text-orange-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-400 to-purple-600 text-white border-0 shadow-xl transform hover:scale-105 transition-transform">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-lg">Today's Visits</p>
                  <p className="text-4xl font-bold">
                    {registrations.filter(r => 
                      new Date(r.created_at).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
                <Eye className="h-16 w-16 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8">
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl font-bold flex items-center">
                📊 Visitor Registrations ({filteredRegistrations.length})
              </CardTitle>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 h-5 w-5" />
                  <Input
                    placeholder="Search visitors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 w-80 bg-white/20 border-white/30 text-white placeholder-white/70 text-lg py-3 rounded-xl"
                  />
                </div>
                <Button 
                  onClick={fetchRegistrations} 
                  variant="secondary" 
                  size="lg"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-xl"
                >
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-indigo-200">
                    <TableHead className="font-bold text-gray-800 text-base p-4">👤 Visitor Name</TableHead>
                    <TableHead className="font-bold text-gray-800 text-base p-4">📞 Phone</TableHead>
                    <TableHead className="font-bold text-gray-800 text-base p-4">👥 Count</TableHead>
                    <TableHead className="font-bold text-gray-800 text-base p-4">📝 People Details</TableHead>
                    <TableHead className="font-bold text-gray-800 text-base p-4">🎯 Purpose</TableHead>
                    <TableHead className="font-bold text-gray-800 text-base p-4">📍 Address</TableHead>
                    <TableHead className="font-bold text-gray-800 text-base p-4">⏰ Start Time</TableHead>
                    <TableHead className="font-bold text-gray-800 text-base p-4">⏹️ End Time</TableHead>
                    <TableHead className="font-bold text-gray-800 text-base p-4">📅 Registration</TableHead>
                    <TableHead className="font-bold text-gray-800 text-base p-4">📷 Media</TableHead>
                    <TableHead className="font-bold text-gray-800 text-base p-4">⚙️ Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration, index) => (
                    <TableRow 
                      key={registration.id} 
                      className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <TableCell className="font-semibold text-indigo-700 p-4 text-base">
                        {registration.visitorname}
                      </TableCell>
                      <TableCell className="p-4 text-base">{registration.phonenumber}</TableCell>
                      <TableCell className="p-4">
                        <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-2 rounded-full text-sm font-bold shadow-md">
                          {registration.numberofpeople}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate p-4 text-sm">
                        {parsePeople(registration.people)}
                      </TableCell>
                      <TableCell className="p-4">
                        <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 rounded-full text-sm font-bold shadow-md">
                          {formatPurpose(registration.purpose)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate p-4 text-sm">{registration.address}</TableCell>
                      <TableCell className="p-4 text-sm">{formatDate(registration.starttime)}</TableCell>
                      <TableCell className="p-4">
                        {editingId === registration.id ? (
                          <Input
                            type="datetime-local"
                            value={editEndTime}
                            onChange={(e) => setEditEndTime(e.target.value)}
                            className="w-48 border-2 border-indigo-300 focus:border-indigo-500 rounded-lg"
                          />
                        ) : (
                          <span className={`text-sm px-3 py-2 rounded-full font-medium ${
                            registration.endtime 
                              ? 'text-gray-700 bg-gray-100' 
                              : 'text-orange-700 bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-200'
                          }`}>
                            {registration.endtime ? formatDate(registration.endtime) : '🔄 Active'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600 p-4 text-sm">{formatDate(registration.created_at)}</TableCell>
                      <TableCell className="p-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-lg shadow-md"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-50 to-purple-50">
                            <DialogHeader>
                              <DialogTitle className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 font-bold">
                                📋 Visitor Information - {registration.visitorname}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-8">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-xl shadow-lg">
                                  <h4 className="font-bold mb-4 text-blue-800 text-xl flex items-center">
                                    👤 Visitor Information
                                  </h4>
                                  <div className="space-y-3">
                                    <p className="text-base"><strong className="text-blue-700">Name:</strong> {registration.visitorname}</p>
                                    <p className="text-base"><strong className="text-blue-700">Phone:</strong> {registration.phonenumber}</p>
                                    <p className="text-base"><strong className="text-blue-700">Purpose:</strong> {formatPurpose(registration.purpose)}</p>
                                    <p className="text-base"><strong className="text-blue-700">Address:</strong> {registration.address}</p>
                                  </div>
                                </div>
                                <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-xl shadow-lg">
                                  <h4 className="font-bold mb-4 text-green-800 text-xl flex items-center">
                                    📅 Visit Details
                                  </h4>
                                  <div className="space-y-3">
                                    <p className="text-base"><strong className="text-green-700">People ({registration.numberofpeople}):</strong></p>
                                    <p className="text-sm pl-4 bg-white p-3 rounded-lg border-2 border-green-200 shadow-sm">{parsePeople(registration.people)}</p>
                                    <p className="text-base"><strong className="text-green-700">Start Time:</strong> {formatDate(registration.starttime)}</p>
                                    <p className="text-base"><strong className="text-green-700">End Time:</strong> {formatDate(registration.endtime)}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-8">
                                <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-6 rounded-xl shadow-lg">
                                  <h4 className="font-bold mb-4 flex items-center text-purple-800 text-xl">
                                    <Image className="mr-3 h-6 w-6" />
                                    📸 Photograph
                                  </h4>
                                  {registration.picture_url ? (
                                    <div className="flex justify-center">
                                      <img
                                        src={registration.picture_url}
                                        alt="Visitor"
                                        className="h-80 w-auto object-cover rounded-xl border-4 border-purple-300 shadow-xl"
                                      />
                                    </div>
                                  ) : (
                                    <p className="text-base text-gray-500 text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
                                      📷 No photograph provided
                                    </p>
                                  )}
                                </div>
                                
                                <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-6 rounded-xl shadow-lg">
                                  <h4 className="font-bold mb-4 flex items-center text-orange-800 text-xl">
                                    <FileSignature className="mr-3 h-6 w-6" />
                                    ✍️ Signature
                                  </h4>
                                  {registration.signature_url ? (
                                    <div className="flex justify-center">
                                      <img
                                        src={registration.signature_url}
                                        alt="Signature"
                                        className="h-40 w-auto object-contain rounded-xl border-4 border-orange-300 bg-white shadow-xl"
                                      />
                                    </div>
                                  ) : (
                                    <p className="text-base text-gray-500 text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
                                      ✍️ No signature provided
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="p-4">
                        {editingId === registration.id ? (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => saveEdit(registration.id)}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-lg shadow-md"
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEdit}
                              className="border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 rounded-lg"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(registration)}
                            className="border-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 rounded-lg"
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filteredRegistrations.length === 0 && !loading && (
              <div className="text-center py-16">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-gray-500 text-xl font-medium">
                  {searchTerm ? '🔍 No registrations found matching your search.' : '📝 No registrations found.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
