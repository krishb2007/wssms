
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ConfirmationPageProps {
  formData: {
    schoolName: string;
    numberOfPeople: number;
    people: Array<{ name: string; role: string }>;
    phoneNumber: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    picture: File | null;
    signature: File | null;
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
              <h4 className="font-semibold">School Information</h4>
              <p className="text-sm">{formData.schoolName}</p>
            </div>

            <div>
              <h4 className="font-semibold">People ({formData.numberOfPeople})</h4>
              <ul className="list-disc pl-5 text-sm">
                {formData.people.map((person, idx) => (
                  <li key={idx}>
                    {person.name} - {person.role}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold">Contact Information</h4>
              <p className="text-sm">{formData.phoneNumber} (Verified)</p>
            </div>

            <div>
              <h4 className="font-semibold">Address</h4>
              <p className="text-sm">
                {formData.address.street}, {formData.address.city},{" "}
                {formData.address.state}, {formData.address.zipCode}
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Uploads</h4>
              <div className="text-sm">
                <p>Picture: {formData.picture?.name}</p>
                <p>Signature: {formData.signature?.name}</p>
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
