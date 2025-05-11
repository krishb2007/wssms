
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Clock, ArrowRightLeft } from "lucide-react";
import { format, differenceInMinutes } from "date-fns";

interface DurationFormProps {
  formData: {
    startTime: string;
    endTime?: string | null;
  };
  updateFormData: (data: Partial<{ startTime: string; endTime?: string | null }>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const DurationForm: React.FC<DurationFormProps> = ({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}) => {
  const [duration, setDuration] = useState<string>("");
  
  // Set the start time to current time in IST if not already set
  useEffect(() => {
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

  // Calculate duration whenever start or end time changes
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      
      if (end > start) {
        const diffMinutes = differenceInMinutes(end, start);
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        
        let durationText = "";
        if (hours > 0) {
          durationText += `${hours} hour${hours > 1 ? 's' : ''}`;
        }
        if (minutes > 0) {
          durationText += `${hours > 0 ? ' ' : ''}${minutes} minute${minutes > 1 ? 's' : ''}`;
        }
        
        setDuration(durationText || "Less than a minute");
      } else {
        setDuration("End time must be after start time");
      }
    } else {
      setDuration("");
    }
  }, [formData.startTime, formData.endTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  // Format the time to display in a user-friendly way
  const formatTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return '';
    
    const date = new Date(dateTimeStr);
    // Format to show only time in 12-hour format with AM/PM
    return format(date, 'hh:mm a');
  };
  
  // Get current date in IST for display
  const getCurrentDateIST = () => {
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    return format(istTime, 'EEEE, MMMM d, yyyy');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Visit Duration</h3>
        
        <div className="text-sm text-gray-500 mb-4">
          Today: {getCurrentDateIST()}
        </div>
        
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
          <Label htmlFor="endTime">End Time (Optional)</Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime ? new Date(formData.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).substring(0, 5) : ""}
            onChange={(e) => {
              if (e.target.value) {
                // Get current date in IST
                const now = new Date();
                const istDate = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
                const dateStr = istDate.toISOString().split('T')[0];
                
                // Combine date with selected time
                const endDateTime = `${dateStr}T${e.target.value}:00`;
                updateFormData({ endTime: endDateTime });
              } else {
                updateFormData({ endTime: null });
              }
            }}
          />
          <p className="text-xs text-gray-500">
            When will your visit end today? (Leave blank if unknown)
          </p>
        </div>
        
        {duration && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3 flex items-center">
            <Clock className="h-4 w-4 text-blue-500 mr-2" />
            <div>
              <p className="text-sm text-blue-700">Visit Duration:</p>
              <p className="font-medium">{duration}</p>
            </div>
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
          <Button 
            type="submit" 
            className="flex-1"
          >
            <Clock className="mr-2 h-4 w-4" />
            Continue
          </Button>
        </div>
      </div>
    </form>
  );
};

export default DurationForm;
