
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Minus, Users } from "lucide-react";

interface NumberOfPeopleFormProps {
  formData: {
    numberOfPeople: number;
    people: Array<{ name: string; role: string }>;
    visitorName: string;
  };
  updateFormData: (data: Partial<{ 
    numberOfPeople: number; 
    people: Array<{ name: string; role: string }>; 
  }>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const NumberOfPeopleForm: React.FC<NumberOfPeopleFormProps> = ({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}) => {
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

  const handleNumberOfPeopleChange = (value: number) => {
    if (value >= 1) {
      // Create or maintain existing people entries
      const updatedPeople = Array(value).fill(0).map((_, i) => 
        i < formData.people.length 
          ? formData.people[i] 
          : i === 0 && formData.visitorName 
            ? { name: formData.visitorName, role: "" }
            : { name: "", role: "" }
      );
      
      // Always ensure the first person is the visitor
      if (formData.visitorName && (!updatedPeople[0] || !updatedPeople[0].name)) {
        updatedPeople[0] = { name: formData.visitorName, role: "" };
      }
      
      updateFormData({ 
        numberOfPeople: value,
        people: updatedPeople
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Number of Visitors</h3>
        
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
            Enter the total number of people in your group
          </p>
        </div>

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

export default NumberOfPeopleForm;
