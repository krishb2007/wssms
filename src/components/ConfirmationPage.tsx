
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ConfirmationPageProps {
  formData: {
    visitorName: string;
    schoolName: string;
    numberOfPeople: number;
    people: Array<{ name: string; role: string }>;
    phoneNumber: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
    };
    picture: File | null;
    signature: File | null;
    purpose: string;
    otherPurpose: string;
  };
  prevStep: () => void;
  handleSubmit: () => void;
}

const ConfirmationPage: React.FC<ConfirmationPageProps> = ({
  formData,
  prevStep,
  handleSubmit,
}) => {
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
              <p className="text-sm">
                {formData.purpose === "other" 
                  ? formData.otherPurpose 
                  : formData.purpose.charAt(0).toUpperCase() + formData.purpose.slice(1)}
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Contact Information</h4>
              <p className="text-sm">{formData.phoneNumber}</p>
            </div>

            <div>
              <h4 className="font-semibold">Address</h4>
              <p className="text-sm">
                {formData.address.street}, {formData.address.city},{" "}
                {formData.address.state}, {formData.address.country}
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Uploads</h4>
              <div className="flex flex-col space-y-2">
                <div>
                  <p className="font-medium text-sm mb-1">Photo:</p>
                  {formData.picture && (
                    <img 
                      src={URL.createObjectURL(formData.picture)} 
                      alt="Visitor" 
                      className="h-32 object-cover rounded-md"
                    />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">Signature:</p>
                  {formData.signature && (
                    <img 
                      src={URL.createObjectURL(formData.signature)} 
                      alt="Signature" 
                      className="h-16 object-contain rounded-md bg-white"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="pt-4 flex space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          className="flex-1"
        >
          Submit Registration
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationPage;
