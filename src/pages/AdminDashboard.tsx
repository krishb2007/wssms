
import React, { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import AdminHeader, { SearchAndRefreshSection } from '../components/admin/AdminHeader';
import VisitorTableRow from '../components/admin/VisitorTableRow';

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
        registration.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        await fetchRegistrations();
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading registrations...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <AdminHeader
        userEmail={user?.email || ''}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={fetchRegistrations}
        onLogout={handleLogout}
      />

      <Card>
        <CardHeader>
          <SearchAndRefreshSection
            filteredCount={filteredRegistrations.length}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onRefresh={fetchRegistrations}
          />
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
                  <TableHead>Media</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((registration) => (
                  <VisitorTableRow
                    key={registration.id}
                    registration={registration}
                    editingId={editingId}
                    editEndTime={editEndTime}
                    formatDate={formatDate}
                    parsePeople={parsePeople}
                    formatPurpose={formatPurpose}
                    onStartEdit={startEdit}
                    onCancelEdit={cancelEdit}
                    onSaveEdit={saveEdit}
                    onEditTimeChange={setEditEndTime}
                  />
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
