
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
    if (!user || user.role !== 'admin') {
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
    setEditingId(registration.id);
    setEditEndTime(registration.endtime || new Date().toISOString().slice(0, 16));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditEndTime('');
  }

  async function saveEdit(id: string) {
    try {
      console.log("Updating end time for registration:", id, "to:", editEndTime);
      
      const { error } = await supabase
        .from('visitor_registrations')
        .update({ endtime: editEndTime || null })
        .eq('id', id);

      if (error) {
        console.error("Update error:", error);
        toast({
          title: "Error",
          description: "Failed to update registration: " + error.message,
          variant: "destructive",
        });
      } else {
        console.log("Successfully updated end time");
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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-lg text-indigo-700 flex items-center">
          <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
          Loading registrations...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto p-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-indigo-100">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Manage visitor registrations and access controls</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Welcome back,</p>
                <p className="font-semibold text-indigo-700">{user?.email}</p>
              </div>
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Visitors</p>
                  <p className="text-3xl font-bold">{registrations.length}</p>
                </div>
                <Users className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Active Visits</p>
                  <p className="text-3xl font-bold">
                    {registrations.filter(r => !r.endtime).length}
                  </p>
                </div>
                <Clock className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Today's Visits</p>
                  <p className="text-3xl font-bold">
                    {registrations.filter(r => 
                      new Date(r.created_at).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
                <Eye className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-white/80 backdrop-blur-sm border border-indigo-100 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-semibold">
                Visitor Registrations ({filteredRegistrations.length})
              </CardTitle>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search visitors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80 bg-white/10 border-white/20 text-white placeholder-white/70"
                  />
                </div>
                <Button 
                  onClick={fetchRegistrations} 
                  variant="secondary" 
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">Visitor Name</TableHead>
                    <TableHead className="font-semibold text-gray-700">Phone</TableHead>
                    <TableHead className="font-semibold text-gray-700">People Count</TableHead>
                    <TableHead className="font-semibold text-gray-700">People Details</TableHead>
                    <TableHead className="font-semibold text-gray-700">Purpose</TableHead>
                    <TableHead className="font-semibold text-gray-700">Address</TableHead>
                    <TableHead className="font-semibold text-gray-700">Start Time</TableHead>
                    <TableHead className="font-semibold text-gray-700">End Time</TableHead>
                    <TableHead className="font-semibold text-gray-700">Registration Date</TableHead>
                    <TableHead className="font-semibold text-gray-700">Media</TableHead>
                    <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration) => (
                    <TableRow key={registration.id} className="hover:bg-indigo-50 transition-colors">
                      <TableCell className="font-medium text-indigo-700">{registration.visitorname}</TableCell>
                      <TableCell>{registration.phonenumber}</TableCell>
                      <TableCell>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                          {registration.numberofpeople}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {parsePeople(registration.people)}
                      </TableCell>
                      <TableCell>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                          {formatPurpose(registration.purpose)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{registration.address}</TableCell>
                      <TableCell>{formatDate(registration.starttime)}</TableCell>
                      <TableCell>
                        {editingId === registration.id ? (
                          <Input
                            type="datetime-local"
                            value={editEndTime}
                            onChange={(e) => setEditEndTime(e.target.value)}
                            className="w-44 border-indigo-300 focus:border-indigo-500"
                          />
                        ) : (
                          <span className={registration.endtime ? 'text-gray-700' : 'text-orange-600 font-medium bg-orange-100 px-2 py-1 rounded'}>
                            {registration.endtime ? formatDate(registration.endtime) : 'Not set'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600">{formatDate(registration.created_at)}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-purple-200 text-purple-600 hover:bg-purple-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-2xl text-indigo-700">
                                Visitor Information - {registration.visitorname}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                  <h4 className="font-semibold mb-3 text-blue-800 text-lg">Visitor Information</h4>
                                  <div className="space-y-2">
                                    <p className="text-sm"><strong className="text-blue-700">Name:</strong> {registration.visitorname}</p>
                                    <p className="text-sm"><strong className="text-blue-700">Phone:</strong> {registration.phonenumber}</p>
                                    <p className="text-sm"><strong className="text-blue-700">Purpose:</strong> {formatPurpose(registration.purpose)}</p>
                                    <p className="text-sm"><strong className="text-blue-700">Address:</strong> {registration.address}</p>
                                  </div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                  <h4 className="font-semibold mb-3 text-green-800 text-lg">Visit Details</h4>
                                  <div className="space-y-2">
                                    <p className="text-sm"><strong className="text-green-700">People ({registration.numberofpeople}):</strong></p>
                                    <p className="text-sm pl-4 bg-white p-2 rounded border">{parsePeople(registration.people)}</p>
                                    <p className="text-sm"><strong className="text-green-700">Start Time:</strong> {formatDate(registration.starttime)}</p>
                                    <p className="text-sm"><strong className="text-green-700">End Time:</strong> {formatDate(registration.endtime)}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-6">
                                <div className="bg-purple-50 p-4 rounded-lg">
                                  <h4 className="font-semibold mb-3 flex items-center text-purple-800 text-lg">
                                    <Image className="mr-2 h-5 w-5" />
                                    Photograph
                                  </h4>
                                  {registration.picture_url ? (
                                    <div className="flex justify-center">
                                      <img
                                        src={registration.picture_url}
                                        alt="Visitor"
                                        className="h-64 w-auto object-cover rounded-lg border-2 border-purple-200 shadow-md"
                                      />
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500 text-center py-8 bg-white rounded border-2 border-dashed border-gray-300">
                                      No photograph provided
                                    </p>
                                  )}
                                </div>
                                
                                <div className="bg-orange-50 p-4 rounded-lg">
                                  <h4 className="font-semibold mb-3 flex items-center text-orange-800 text-lg">
                                    <FileSignature className="mr-2 h-5 w-5" />
                                    Signature
                                  </h4>
                                  {registration.signature_url ? (
                                    <div className="flex justify-center">
                                      <img
                                        src={registration.signature_url}
                                        alt="Signature"
                                        className="h-32 w-auto object-contain rounded-lg border-2 border-orange-200 bg-white shadow-md"
                                      />
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500 text-center py-8 bg-white rounded border-2 border-dashed border-gray-300">
                                      No signature provided
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell>
                        {editingId === registration.id ? (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => saveEdit(registration.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEdit}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(registration)}
                            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filteredRegistrations.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">
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
