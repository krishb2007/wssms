
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Person {
  name: string;
  role: string;
}

interface PeopleInfoFormProps {
  formData: {
    numberOfPeople: number;
    people: Person[];
  };
  updateFormData: (data: Partial<typeof formData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const PeopleInfoForm: React.FC<PeopleInfoFormProps> = ({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  const handlePersonChange = (index: number, field: keyof Person, value: string) => {
    const updatedPeople = [...formData.people];
    updatedPeople[index] = { ...updatedPeople[index], [field]: value };
    updateFormData({ people: updatedPeople });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <h3 className="text-lg font-medium">People Information</h3>
        <p className="text-sm text-gray-500">
          Please enter details of all {formData.numberOfPeople} people.
        </p>

        {Array.from({ length: formData.numberOfPeople }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="font-medium">Person {index + 1}</div>
                <div className="space-y-2">
                  <Label htmlFor={`name-${index}`}>Full Name</Label>
                  <Input
                    id={`name-${index}`}
                    value={formData.people[index]?.name || ""}
                    onChange={(e) => handlePersonChange(index, "name", e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="pt-4 flex space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            className="flex-1"
          >
            Back
          </Button>
          <Button type="submit" className="flex-1">
            Continue
          </Button>
        </div>
      </div>
    </form>
  );
};

export default PeopleInfoForm;
