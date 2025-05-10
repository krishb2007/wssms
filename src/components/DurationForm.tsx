
import React, { useEffect } from "react";
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
  useEffect(() => {
    // Set the start time to current time in IST if not already set
    if (!formData.startTime) {
      // Create current date in IST (UTC+5:30)
      const now = new Date();
      // Add 5 hours and 30 minutes to convert to IST
      const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      // Format the date and time to match the datetime-local input format
      const formattedDateTime = istTime.toISOString().slice(0, 16);
      updateFormData({ startTime: formattedDateTime });
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  // Format the time to display in a user-friendly way
  const formatTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return '';
    
    const date = new Date(dateTimeStr);
    // Format to show only time in 12-hour format with AM/PM
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata' // IST timezone
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Visit Duration</h3>
        
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time (Current)</Label>
          <div className="bg-gray-100 p-3 rounded border">
            {formatTime(formData.startTime)}
          </div>
          <p className="text-xs text-gray-500">
            Your visit starts now
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime ? new Date(formData.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).substring(0, 5) : ""}
            onChange={(e) => {
              // Get current date in IST
              const now = new Date();
              const istDate = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
              const dateStr = istDate.toISOString().split('T')[0];
              
              // Combine date with selected time
              const endDateTime = `${dateStr}T${e.target.value}:00`;
              updateFormData({ endTime: endDateTime });
            }}
            required
          />
          <p className="text-xs text-gray-500">
            When will your visit end today?
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
