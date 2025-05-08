
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
  updateFormData: (data: Partial<{ 
    numberOfPeople: number;
    people: Person[];
  }>) => void;
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

  const handleNumberOfPeopleChange = (value: number) => {
    if (value >= 1) {
      // Create or maintain existing people entries when changing number of people
      const updatedPeople = Array(value).fill(0).map((_, i) => 
        i < formData.people.length 
          ? formData.people[i] 
          : { name: "", role: "" }
      );
      
      updateFormData({ 
        numberOfPeople: value,
        people: updatedPeople
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <h3 className="text-lg font-medium">People Information</h3>
        
        <div className="space-y-2">
          <Label htmlFor="numberOfPeople">Number of People</Label>
          <Input
            id="numberOfPeople"
            type="number"
            min="1"
            max="10"
            value={formData.numberOfPeople}
            onChange={(e) => handleNumberOfPeopleChange(parseInt(e.target.value) || 1)}
            placeholder="Enter number of people"
            required
          />
          <p className="text-xs text-gray-500">
            Enter the number of people visiting (maximum 10)
          </p>
        </div>

        {formData.numberOfPeople > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Visitor Details</h4>
            
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
          </div>
        )}

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
