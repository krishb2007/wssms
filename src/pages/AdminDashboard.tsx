
import React, { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { Pencil, Save, X, LogOut, Search } from "lucide-react";

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
        registration.phonenumber.includes(searchTerm) ||
        registration.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.address.toLowerCase().includes(searchTerm.toLowerCase())
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading registrations...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Visitor Registrations ({filteredRegistrations.length})</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, phone, purpose, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Button onClick={fetchRegistrations} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitor Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>People Count</TableHead>
                  <TableHead>People Details</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell className="font-medium">{registration.visitorname}</TableCell>
                    <TableCell>{registration.phonenumber}</TableCell>
                    <TableCell>{registration.numberofpeople}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {parsePeople(registration.people)}
                    </TableCell>
                    <TableCell>{registration.purpose}</TableCell>
                    <TableCell className="max-w-xs truncate">{registration.address}</TableCell>
                    <TableCell>{formatDate(registration.starttime)}</TableCell>
                    <TableCell>
                      {editingId === registration.id ? (
                        <Input
                          type="datetime-local"
                          value={editEndTime}
                          onChange={(e) => setEditEndTime(e.target.value)}
                          className="w-44"
                        />
                      ) : (
                        <span className={registration.endtime ? '' : 'text-orange-600 font-medium'}>
                          {registration.endtime ? formatDate(registration.endtime) : 'Not set'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(registration.created_at)}</TableCell>
                    <TableCell>
                      {editingId === registration.id ? (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => saveEdit(registration.id)}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(registration)}
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
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No registrations found matching your search.' : 'No registrations found.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
