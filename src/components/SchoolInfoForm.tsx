
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface SchoolInfoFormProps {
  formData: {
    schoolName: string;
    numberOfPeople: number;
  };
  updateFormData: (data: Partial<typeof formData>) => void;
  nextStep: () => void;
}

const SchoolInfoForm: React.FC<SchoolInfoFormProps> = ({
  formData,
  updateFormData,
  nextStep,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="schoolName">School Name</Label>
          <Input
            id="schoolName"
            type="text"
            value={formData.schoolName}
            onChange={(e) => updateFormData({ schoolName: e.target.value })}
            placeholder="Enter school name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="numberOfPeople">Number of People</Label>
          <Input
            id="numberOfPeople"
            type="number"
            min="1"
            max="10"
            value={formData.numberOfPeople}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (value >= 1) {
                updateFormData({ 
                  numberOfPeople: value,
                  people: Array(value).fill(0).map((_, i) => 
                    i < formData.people.length 
                      ? formData.people[i] 
                      : { name: "", role: "" }
                  )
                });
              }
            }}
            placeholder="Enter number of people"
            required
          />
          <p className="text-xs text-gray-500">
            Enter the number of people from your school (max 10)
          </p>
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full">
            Continue
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SchoolInfoForm;
