
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface ConfirmationPageProps {
  formData: {
    visitorName: string;
    schoolName: string;
    numberOfPeople: number;
    people: Array<{ name: string; role: string }>;
    phoneNumber: string;
    address: {
      city: string;
      state: string;
      country: string;
    };
    picture: File | string | null;
    signature: File | string | null;
    purpose: string;
    otherPurpose: string;
    startTime: string;
    endTime: string | null;
  };
  prevStep: () => void;
  handleSubmit: () => void;
}

const ConfirmationPage: React.FC<ConfirmationPageProps> = ({
  formData,
  prevStep,
  handleSubmit,
}) => {
  // Helper function to format purpose text
  const formatPurpose = (purpose: string): string => {
    if (purpose === "other") return formData.otherPurpose;
    
    const purposeMap: Record<string, string> = {
      "visit": "Visit",
      "work": "Work",
      "tourism": "Tourism",
      "sports": "Sports",
      "meeting": "Meeting",
      "official_visit": "Official Visit",
      "student_visit": "Student Visit"
    };
    
    return purposeMap[purpose] || purpose.charAt(0).toUpperCase() + purpose.slice(1);
  };

  // Helper function to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    try {
      return format(new Date(dateString), 'MMM dd, yyyy - HH:mm');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Review Your Information</h3>
        <p className="text-sm text-gray-500 mt-1">
          Please review your information before submitting.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">Visitor Information</h4>
              <p className="text-sm">{formData.visitorName}</p>
            </div>

            <div>
              <h4 className="font-semibold">People ({formData.numberOfPeople})</h4>
              <ul className="list-disc pl-5 text-sm">
                {formData.people.map((person, idx) => (
                  <li key={idx}>
                    {person.name || formData.visitorName} {person.role ? `- ${person.role}` : ''}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold">Purpose of Visit</h4>
              <p className="text-sm">{formatPurpose(formData.purpose)}</p>
            </div>

            <div>
              <h4 className="font-semibold">Visit Duration</h4>
              <p className="text-sm">Start: {formatDate(formData.startTime)}</p>
              <p className="text-sm">End: {formatDate(formData.endTime)}</p>
            </div>

            <div>
              <h4 className="font-semibold">Contact Information</h4>
              <p className="text-sm">{formData.phoneNumber}</p>
            </div>

            <div>
              <h4 className="font-semibold">Address</h4>
              <p className="text-sm">
                {formData.address.city}
                {formData.address.state ? `, ${formData.address.state}` : ''}
                {formData.address.country ? `, ${formData.address.country}` : ''}
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Uploads</h4>
              <div className="flex flex-col space-y-2">
                <div>
                  <p className="font-medium text-sm mb-1">Photo:</p>
                  {formData.picture && typeof formData.picture !== 'string' ? (
                    <img 
                      src={URL.createObjectURL(formData.picture)} 
                      alt="Visitor" 
                      className="h-32 object-cover rounded-md"
                    />
                  ) : formData.picture ? (
                    <img 
                      src={formData.picture as string} 
                      alt="Visitor" 
                      className="h-32 object-cover rounded-md"
                    />
                  ) : null}
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">Signature:</p>
                  {formData.signature && typeof formData.signature !== 'string' ? (
                    <img 
                      src={URL.createObjectURL(formData.signature)} 
                      alt="Signature" 
                      className="h-16 object-contain rounded-md bg-white"
                    />
                  ) : formData.signature ? (
                    <img 
                      src={formData.signature as string} 
                      alt="Signature" 
                      className="h-16 object-contain rounded-md bg-white"
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="pt-4 flex flex-col space-y-2">
        <Button
          type="button"
          onClick={handleSubmit}
          className="w-full"
        >
          Submit Registration
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          className="w-full"
        >
          Back
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationPage;
