
import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronUp, ChevronDown, Users } from "lucide-react";

interface Person {
  name: string;
  role: string;
}

interface PeopleInfoFormProps {
  formData: {
    numberOfPeople: number;
    people: Person[];
    visitorName: string;
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
  // Initialize first person with visitor's name
  useEffect(() => {
    if (formData.people.length > 0 && formData.people[0].name === "" && formData.visitorName) {
      const updatedPeople = [...formData.people];
      updatedPeople[0] = { ...updatedPeople[0], name: formData.visitorName };
      updateFormData({ people: updatedPeople });
    }
  }, [formData.visitorName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  const handlePersonChange = (index: number, field: keyof Person, value: string) => {
    const updatedPeople = [...formData.people];
    updatedPeople[index] = { ...updatedPeople[index], [field]: value };
    updateFormData({ people: updatedPeople });
  };

  const increaseNumberOfPeople = () => {
    const newValue = formData.numberOfPeople + 1;
    if (newValue <= 10) {
      handleNumberOfPeopleChange(newValue);
    }
  };

  const decreaseNumberOfPeople = () => {
    const newValue = formData.numberOfPeople - 1;
    if (newValue >= 1) {
      handleNumberOfPeopleChange(newValue);
    }
  };

  const handleNumberOfPeopleChange = (value: number) => {
    if (value >= 1) {
      // Create or maintain existing people entries when changing number of people
      const updatedPeople = Array(value).fill(0).map((_, i) => 
        i < formData.people.length 
          ? formData.people[i] 
          : i === 0 && formData.visitorName 
            ? { name: formData.visitorName, role: "" }
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
          <div className="flex items-center">
            <Input
              id="numberOfPeople"
              type="number"
              min="1"
              max="10"
              value={formData.numberOfPeople}
              onChange={(e) => handleNumberOfPeopleChange(parseInt(e.target.value) || 1)}
              placeholder="Enter number of people"
              required
              className="flex-1"
            />
            <div className="flex flex-col ml-2">
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                onClick={increaseNumberOfPeople}
                disabled={formData.numberOfPeople >= 10}
                className="mb-1 h-8 w-8"
              >
                <ChevronUp className="h-5 w-5" />
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                onClick={decreaseNumberOfPeople}
                disabled={formData.numberOfPeople <= 1}
                className="h-8 w-8"
              >
                <ChevronDown className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Enter the number of people visiting (maximum 10)
          </p>
        </div>

        {formData.numberOfPeople > 1 && (
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
                        placeholder={index === 0 ? "Your name (already filled)" : "Enter full name"}
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
            <Users className="mr-2 h-4 w-4" />
            Continue
          </Button>
        </div>
      </div>
    </form>
  );
};

export default PeopleInfoForm;
