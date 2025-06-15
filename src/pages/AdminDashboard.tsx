
import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getAllFormData, deleteFormData, FormDataWithId } from '../services/formDataService';
import { downloadExcel } from '../api/excel';
import { LogOut, Download, Trash2, Search, Users, Calendar, FileText } from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState<FormDataWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      const data = await getAllFormData();
      setFormData(data);
    } catch (error) {
      console.error('Error loading form data:', error);
      toast({
        title: "Error",
        description: "Failed to load form data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFormData(id);
      setFormData(formData.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "Entry deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive",
      });
    }
  };

  const handleDownloadExcel = async () => {
    try {
      await downloadExcel(formData);
      toast({
        title: "Success",
        description: "Excel file downloaded successfully",
      });
    } catch (error) {
      console.error('Error downloading Excel:', error);
      toast({
        title: "Error",
        description: "Failed to download Excel file",
        variant: "destructive",
      });
    }
  };

  const filteredData = formData.filter(item =>
    item.visitor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex justify-center items-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('/lovable-uploads/bfe3e178-bae8-49ce-a019-db646e66fe14.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-4"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('/lovable-uploads/bfe3e178-bae8-49ce-a019-db646e66fe14.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-amber-600/80 via-orange-600/80 to-red-600/80 text-white relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-orange-400/10 to-red-400/10"></div>
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold drop-shadow-lg">
                  Admin Dashboard
                </CardTitle>
                <p className="text-white/90 text-sm font-medium mt-1">
                  Welcome back, {user?.email}
                </p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="text-white border-white/30 bg-white/10 hover:bg-white/20 transition-all duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden">
            <CardContent className="p-6 bg-gradient-to-b from-white/5 to-white/10">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <Users className="w-6 h-6 text-blue-200" />
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium">Total Visitors</p>
                  <p className="text-2xl font-bold text-white">{formData.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden">
            <CardContent className="p-6 bg-gradient-to-b from-white/5 to-white/10">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-500/20 rounded-full">
                  <Calendar className="w-6 h-6 text-green-200" />
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium">Today's Visits</p>
                  <p className="text-2xl font-bold text-white">
                    {formData.filter(item => 
                      new Date(item.created_at).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden">
            <CardContent className="p-6 bg-gradient-to-b from-white/5 to-white/10">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-500/20 rounded-full">
                  <FileText className="w-6 h-6 text-purple-200" />
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium">Filtered Results</p>
                  <p className="text-2xl font-bold text-white">{filteredData.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden">
          <CardContent className="p-6 bg-gradient-to-b from-white/5 to-white/10">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                <Input
                  placeholder="Search visitors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border border-white/30 text-white placeholder:text-white/60 focus:ring-2 focus:ring-orange-400/50"
                />
              </div>
              <Button
                onClick={handleDownloadExcel}
                className="bg-gradient-to-r from-green-600/90 to-emerald-600/90 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Visitor Data Table */}
        <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-amber-600/60 via-orange-600/60 to-red-600/60 text-white relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-orange-400/10 to-red-400/10"></div>
            <CardTitle className="relative z-10 text-lg font-bold drop-shadow-lg">
              Visitor Records ({filteredData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="max-h-96 overflow-y-auto">
                {filteredData.length === 0 ? (
                  <div className="p-8 text-center text-white/70">
                    No visitor records found.
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-white/5 sticky top-0">
                      <tr>
                        <th className="text-left p-4 text-white/90 font-semibold text-sm">Name</th>
                        <th className="text-left p-4 text-white/90 font-semibold text-sm">Email</th>
                        <th className="text-left p-4 text-white/90 font-semibold text-sm">Purpose</th>
                        <th className="text-left p-4 text-white/90 font-semibold text-sm">People</th>
                        <th className="text-left p-4 text-white/90 font-semibold text-sm">Date</th>
                        <th className="text-left p-4 text-white/90 font-semibold text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((item, index) => (
                        <tr key={item.id} className={`border-t border-white/10 ${index % 2 === 0 ? 'bg-white/5' : 'bg-transparent'} hover:bg-white/10 transition-colors`}>
                          <td className="p-4 text-white font-medium">{item.visitor_name}</td>
                          <td className="p-4 text-white/80 text-sm">{item.contact_email}</td>
                          <td className="p-4">
                            <Badge variant="secondary" className="bg-orange-500/20 text-orange-200 border border-orange-500/30">
                              {item.purpose}
                            </Badge>
                          </td>
                          <td className="p-4 text-white/80 text-sm">{item.number_of_people}</td>
                          <td className="p-4 text-white/80 text-sm">
                            {new Date(item.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              className="bg-red-500/20 hover:bg-red-500/40 text-red-200 border border-red-500/30"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
