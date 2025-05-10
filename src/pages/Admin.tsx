
import React, { useState, useEffect } from "react";
import { getAllFormEntries, searchEntries, deleteFormEntry } from "@/services/formDataService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Search, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { FormEntry } from "@/services/formDataService";
import { useAuth } from "@/App";

const Admin = () => {
  const [entries, setEntries] = useState<FormEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<FormEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Load entries when component mounts
    const loadEntries = async () => {
      setIsLoading(true);
      try {
        if (searchQuery.trim()) {
          const results = await searchEntries(searchQuery);
          setEntries(results);
        } else {
          const allEntries = await getAllFormEntries();
          setEntries(allEntries);
        }
      } catch (error) {
        console.error("Error loading entries:", error);
        toast({
          title: "Error",
          description: "Failed to load visitor entries. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadEntries();
    
    // Set up a refresh interval to check for new entries
    const intervalId = setInterval(() => loadEntries(), 30000);
    
    return () => clearInterval(intervalId);
  }, [searchQuery]);

  // Get background notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy - HH:mm');
    } catch (e) {
      return dateString;
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (searchQuery.trim()) {
        const results = await searchEntries(searchQuery);
        setEntries(results);
      } else {
        const allEntries = await getAllFormEntries();
        setEntries(allEntries);
      }
    } catch (error) {
      console.error("Error searching:", error);
      toast({
        title: "Error",
        description: "Failed to search entries. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const success = await deleteFormEntry(id);
      if (success) {
        toast({
          title: "Entry deleted",
          description: "The visitor entry has been successfully removed.",
        });
        // Update the entries list
        setEntries(entries.filter(entry => entry.id !== id));
      } else {
        toast({
          title: "Error",
          description: "There was a problem deleting the entry.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast({
        title: "Error",
        description: "Failed to delete the entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    setSearchQuery("");
    setIsLoading(true);
    try {
      const allEntries = await getAllFormEntries();
      setEntries(allEntries);
      toast({
        title: "Refreshed",
        description: "Visitor data has been updated.",
      });
    } catch (error) {
      console.error("Error refreshing:", error);
      toast({
        title: "Error",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm">Logged in as: {user?.email}</p>
          <Button onClick={handleRefresh}>
            Refresh
          </Button>
        </div>
      </div>

      <Card className="p-6 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <Input
            placeholder="Search by name, purpose, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Registrations</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No registrations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Visitor Name</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>People</TableHead>
                  <TableHead>Visit Count</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.timestamp)}</TableCell>
                    <TableCell>{entry.visitorName}</TableCell>
                    <TableCell>
                      <Badge>
                        {entry.purpose === 'other' 
                          ? entry.otherPurpose 
                          : entry.purpose.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{entry.numberOfPeople}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.visitCount || 1}</Badge>
                    </TableCell>
                    <TableCell>{entry.phoneNumber}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setSelectedEntry(entry)}
                            >
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Registration Details</DialogTitle>
                              <DialogDescription>Complete details about this visitor registration.</DialogDescription>
                            </DialogHeader>
                            {selectedEntry && (
                              <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                                <div>
                                  <h3 className="font-semibold text-lg">Visitor Information</h3>
                                  <p className="text-sm">Name: {selectedEntry.visitorName}</p>
                                  <p className="text-sm">School: {selectedEntry.schoolName}</p>
                                  <p className="text-sm">Visit Count: {selectedEntry.visitCount || 1}</p>
                                  <p className="text-sm">Registered: {formatDate(selectedEntry.timestamp)}</p>
                                </div>
                                
                                <div>
                                  <h3 className="font-semibold text-lg">Visit Duration</h3>
                                  <p className="text-sm">Start: {selectedEntry.startTime ? formatDate(selectedEntry.startTime) : 'Not specified'}</p>
                                  <p className="text-sm">End: {selectedEntry.endTime ? formatDate(selectedEntry.endTime) : 'Not specified'}</p>
                                </div>
                                
                                <div>
                                  <h3 className="font-semibold text-lg">People ({selectedEntry.numberOfPeople})</h3>
                                  <ul className="list-disc pl-5 text-sm">
                                    {selectedEntry.people.map((person, idx) => (
                                      <li key={idx}>
                                        {person.name || selectedEntry.visitorName} {person.role ? `- ${person.role}` : ''}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div>
                                  <h3 className="font-semibold text-lg">Purpose of Visit</h3>
                                  <p className="text-sm">
                                    {selectedEntry.purpose === 'other' 
                                      ? selectedEntry.otherPurpose 
                                      : selectedEntry.purpose.replace('_', ' ')}
                                  </p>
                                </div>
                                
                                <div>
                                  <h3 className="font-semibold text-lg">Contact Information</h3>
                                  <p className="text-sm">{selectedEntry.phoneNumber}</p>
                                </div>
                                
                                <div>
                                  <h3 className="font-semibold text-lg">Address</h3>
                                  <p className="text-sm">
                                    {selectedEntry.address.city}
                                    {selectedEntry.address.state ? `, ${selectedEntry.address.state}` : ''} 
                                    {selectedEntry.address.country ? `, ${selectedEntry.address.country}` : ''}
                                  </p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  {selectedEntry.picture && (
                                    <div>
                                      <h3 className="font-semibold text-lg">Photo</h3>
                                      <img 
                                        src={selectedEntry.picture} 
                                        alt="Visitor" 
                                        className="h-48 object-cover rounded-md" 
                                      />
                                    </div>
                                  )}
                                  
                                  {selectedEntry.signature && (
                                    <div>
                                      <h3 className="font-semibold text-lg">Signature</h3>
                                      <img 
                                        src={selectedEntry.signature} 
                                        alt="Signature" 
                                        className="h-24 object-contain rounded-md bg-white border p-2" 
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Visitor Entry</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this visitor entry? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteEntry(entry.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Admin;
