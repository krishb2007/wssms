
import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CombinedNamePeopleFormProps {
  formData: {
    visitorName: string;
    numberOfPeople: number;
    people: { name: string; role: string }[];
  };
  updateFormData: (data: Partial<{ 
    visitorName: string;
    numberOfPeople: number; 
    people: Array<{ name: string; role: string }>; 
  }>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CombinedNamePeopleForm: React.FC<CombinedNamePeopleFormProps> = ({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}) => {
  // Initialize first person with visitor's name
  useEffect(() => {
    if (formData.visitorName && formData.people.length > 0 && !formData.people[0].name) {
      const updatedPeople = [...formData.people];
      updatedPeople[0] = { ...updatedPeople[0], name: formData.visitorName };
      updateFormData({ people: updatedPeople });
    }
  }, [formData.visitorName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
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

  const handlePersonChange = (index: number, field: keyof { name: string; role: string }, value: string) => {
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
        <h3 className="text-lg font-medium">Visitor Information</h3>
        
        <div className="space-y-2">
          <Label htmlFor="visitorName">Your Name</Label>
          <Input
            id="visitorName"
            type="text"
            value={formData.visitorName}
            onChange={(e) => updateFormData({ visitorName: e.target.value })}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="space-y-2 mt-6">
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
            Enter the total number of people in your group
          </p>
        </div>

        {formData.numberOfPeople > 1 && (
          <div className="space-y-4 mt-6">
            <h4 className="font-medium">Additional Visitors</h4>
            
            {Array.from({ length: formData.numberOfPeople - 1 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="font-medium">Person {index + 2}</div>
                    <div className="space-y-2">
                      <Label htmlFor={`name-${index + 1}`}>Full Name (optional)</Label>
                      <Input
                        id={`name-${index + 1}`}
                        value={formData.people[index + 1]?.name || ""}
                        onChange={(e) => handlePersonChange(index + 1, "name", e.target.value)}
                        placeholder="Enter full name"
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

export default CombinedNamePeopleForm;
