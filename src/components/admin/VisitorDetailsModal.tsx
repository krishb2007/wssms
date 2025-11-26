
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Image, FileSignature, User, Clock } from "lucide-react";
import { VisitorRegistration } from './types';

interface VisitorDetailsModalProps {
  registration: VisitorRegistration;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VisitorDetailsModal: React.FC<VisitorDetailsModalProps> = ({
  registration,
  isOpen,
  onOpenChange
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    
    // Parse the datetime string directly without Date object to avoid timezone conversions
    // Expected format: "2025-11-25T09:19:00" or with timezone info
    const cleanString = dateString.split('.')[0].replace('Z', ''); // Remove milliseconds and Z
    const parts = cleanString.split('T');
    if (parts.length !== 2) return 'Invalid date';
    
    const [datePart, timePart] = parts;
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours24, minutes] = timePart.split(':').map(Number);
    
    // Convert to 12-hour format
    const hours12 = hours24 % 12 || 12;
    const ampm = hours24 >= 12 ? 'PM' : 'AM';
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = monthNames[month - 1];
    
    return `${monthName} ${day}, ${year}, ${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const parsePeople = (peopleString: string) => {
    try {
      const people = JSON.parse(peopleString);
      return people.map((person: any) => {
        if (person.role) {
          return `${person.name} (${person.role})`;
        }
        return person.name;
      }).join(', ');
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0 bg-gray-800 border-gray-700">
        <div className="bg-gray-800">
          <DialogHeader className="bg-gradient-to-r from-amber-800 to-amber-900 text-white p-6">
            <DialogTitle className="text-xl font-bold flex items-center">
              <User className="h-6 w-6 mr-2" />
              {registration.visitorname}
            </DialogTitle>
            <DialogDescription className="text-amber-200 font-medium">
              Complete visitor information and documentation
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6">
            {/* Top Row: Visitor Information (left) and Photo (right) */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* Visitor Information */}
              <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Visitor Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-white font-medium">Name</p>
                    <p className="text-white font-bold">{registration.visitorname}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">Phone</p>
                    <p className="text-white font-bold">{registration.phonenumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">Purpose</p>
                    <p className="text-white font-bold">{formatPurpose(registration.purpose)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">School/Institution</p>
                    <p className="text-white font-bold">{registration.schoolname}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">Address</p>
                    <p className="text-white font-bold">{registration.address}</p>
                  </div>
                </div>
              </div>
              
              {/* Photo */}
              <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Image className="h-5 w-5 mr-2" />
                  Visitor Photo
                </h3>
                {registration.picture_url ? (
                  <img
                    src={getImageUrl(registration.picture_url)}
                    alt="Visitor"
                    className="w-full h-80 object-contain rounded-lg bg-gray-600 border border-gray-500 cursor-pointer hover:opacity-80 transition-opacity"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjM4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNGY0ZjRmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzllYTNhOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIGltYWdlIGF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
                    }}
                    onClick={() => window.open(getImageUrl(registration.picture_url), '_blank')}
                  />
                ) : (
                  <div className="w-full h-80 bg-gray-600 rounded-lg flex items-center justify-center border border-gray-500">
                    <div className="text-center">
                      <Image className="h-8 w-8 text-white mx-auto mb-2" />
                      <p className="text-white text-sm font-medium">No photo available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Bottom Row: Visit Details (left) and Digital Signature (right) */}
            <div className="grid grid-cols-2 gap-8">
              {/* Visit Details */}
              <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Visit Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-white font-medium">People ({registration.numberofpeople})</p>
                    <p className="text-white font-bold">{parsePeople(registration.people)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">Start Time</p>
                    <p className="text-white font-bold">{formatDate(registration.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">End Time</p>
                    <p className="text-white font-bold">{formatDate(registration.endtime)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">Registered On</p>
                    <p className="text-white font-bold">{formatDate(registration.created_at)}</p>
                  </div>
                </div>
              </div>
              
              {/* Digital Signature */}
              <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <FileSignature className="h-5 w-5 mr-2" />
                  Digital Signature
                </h3>
                {registration.signature_url ? (
                  <img
                    src={getImageUrl(registration.signature_url)}
                    alt="Signature"
                    className="w-full h-80 object-contain rounded-lg bg-gray-600 border border-gray-500 cursor-pointer hover:opacity-80 transition-opacity"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjM4NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNGY0ZjRmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzllYTNhOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIHNpZ25hdHVyZSBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
                    }}
                    onClick={() => window.open(getImageUrl(registration.signature_url), '_blank')}
                  />
                ) : (
                  <div className="w-full h-80 bg-gray-600 rounded-lg flex items-center justify-center border border-gray-500">
                    <div className="text-center">
                      <FileSignature className="h-8 w-8 text-white mx-auto mb-2" />
                      <p className="text-white text-sm font-medium">No signature available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
