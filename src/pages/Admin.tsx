
import React, { useState, useEffect } from "react";
import { getAllFormEntries } from "@/services/formDataService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";

const Admin = () => {
  const [entries, setEntries] = useState<ReturnType<typeof getAllFormEntries>>([]);
  const [selectedEntry, setSelectedEntry] = useState<(typeof entries)[0] | null>(null);

  useEffect(() => {
    // Load entries when component mounts
    const loadEntries = () => {
      const allEntries = getAllFormEntries();
      setEntries(allEntries);
    };

    loadEntries();
    
    // Set up a refresh interval to check for new entries
    const intervalId = setInterval(loadEntries, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => setEntries(getAllFormEntries())}>
          Refresh
        </Button>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Registrations</h2>
        
        {entries.length === 0 ? (
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
                    <TableCell>{entry.phoneNumber}</TableCell>
                    <TableCell>
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
                          </DialogHeader>
                          {selectedEntry && (
                            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                              <div>
                                <h3 className="font-semibold text-lg">Visitor Information</h3>
                                <p className="text-sm">Name: {selectedEntry.visitorName}</p>
                                <p className="text-sm">School: {selectedEntry.schoolName}</p>
                                <p className="text-sm">Registered: {formatDate(selectedEntry.timestamp)}</p>
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
                                  {selectedEntry.address.city}, 
                                  {selectedEntry.address.state ? `${selectedEntry.address.state}, ` : ''} 
                                  {selectedEntry.address.country}
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
                                      className="h-32 object-contain rounded-md bg-white" 
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
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
