
import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Minus, Users } from "lucide-react";

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
    handleNumberOfPeopleChange(newValue);
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
          <Label>Number of Visitors (including yourself)</Label>
          <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
            <Button 
              type="button"
              variant="ghost"
              size="icon"
              onClick={decreaseNumberOfPeople}
              disabled={formData.numberOfPeople <= 1}
              className="h-14 w-20 rounded-none text-xl border-r"
            >
              <Minus className="h-5 w-5" />
            </Button>
            
            <div className="flex-1 text-center text-xl font-medium py-3">
              {formData.numberOfPeople}
            </div>
            
            <Button 
              type="button"
              variant="ghost"
              size="icon"
              onClick={increaseNumberOfPeople}
              className="h-14 w-20 rounded-none text-xl border-l"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Enter the number of people visiting
          </p>
        </div>

        {formData.numberOfPeople > 1 && (
          <div className="space-y-4">
            <h4 className="font-medium">Additional Visitors</h4>
            
            {Array.from({ length: formData.numberOfPeople - 1 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="font-medium">Person {index + 2}</div>
                    <div className="space-y-2">
                      <Label htmlFor={`name-${index + 1}`}>Full Name</Label>
                      <Input
                        id={`name-${index + 1}`}
                        value={formData.people[index + 1]?.name || ""}
                        onChange={(e) => handlePersonChange(index + 1, "name", e.target.value)}
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
            <Users className="mr-2 h-4 w-4" />
            Continue
          </Button>
        </div>
      </div>
    </form>
  );
};

export default PeopleInfoForm;
