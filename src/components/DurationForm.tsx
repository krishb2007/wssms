
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";

interface DurationFormProps {
  formData: {
    startTime: string;
    endTime: string;
  };
  updateFormData: (data: Partial<{ startTime: string; endTime: string }>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const DurationForm: React.FC<DurationFormProps> = ({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Visit Duration</h3>
        
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => updateFormData({ startTime: e.target.value })}
            required
          />
          <p className="text-xs text-gray-500">
            When will your visit begin?
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="datetime-local"
            value={formData.endTime}
            onChange={(e) => updateFormData({ endTime: e.target.value })}
            required
          />
          <p className="text-xs text-gray-500">
            When will your visit end?
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
            <Clock className="mr-2 h-4 w-4" />
            Continue
          </Button>
        </div>
      </div>
    </form>
  );
};

export default DurationForm;
