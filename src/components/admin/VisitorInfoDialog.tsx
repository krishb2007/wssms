
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Image, FileSignature } from "lucide-react";

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

interface VisitorInfoDialogProps {
  registration: VisitorRegistration;
  formatDate: (dateString: string | null) => string;
  parsePeople: (peopleString: string) => string;
  formatPurpose: (purpose: string) => string;
}

export default function VisitorInfoDialog({ 
  registration, 
  formatDate, 
  parsePeople, 
  formatPurpose 
}: VisitorInfoDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Visitor Information - {registration.visitorname}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Visitor Information</h4>
              <p className="text-sm"><strong>Name:</strong> {registration.visitorname}</p>
              <p className="text-sm"><strong>Phone:</strong> {registration.phonenumber}</p>
              <p className="text-sm"><strong>Purpose:</strong> {formatPurpose(registration.purpose)}</p>
              <p className="text-sm"><strong>Address:</strong> {registration.address}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Visit Details</h4>
              <p className="text-sm"><strong>People ({registration.numberofpeople}):</strong></p>
              <p className="text-sm pl-4">{parsePeople(registration.people)}</p>
              <p className="text-sm"><strong>Start Time:</strong> {formatDate(registration.starttime)}</p>
              <p className="text-sm"><strong>End Time:</strong> {formatDate(registration.endtime)}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <Image className="mr-2 h-4 w-4" />
                Photograph
              </h4>
              {registration.picture_url ? (
                <img
                  src={registration.picture_url}
                  alt="Visitor"
                  className="h-64 w-auto object-cover rounded-md border"
                />
              ) : (
                <p className="text-sm text-gray-500">No photograph provided</p>
              )}
            </div>
            
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <FileSignature className="mr-2 h-4 w-4" />
                Signature
              </h4>
              {registration.signature_url ? (
                <img
                  src={registration.signature_url}
                  alt="Signature"
                  className="h-32 w-auto object-contain rounded-md border bg-white"
                />
              ) : (
                <p className="text-sm text-gray-500">No signature provided</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
