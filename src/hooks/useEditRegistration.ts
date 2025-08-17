
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { VisitorRegistration } from '@/components/admin/types';

export const useEditRegistration = (updateRegistration: (id: string, updates: Partial<VisitorRegistration>) => void) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEndTime, setEditEndTime] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const startEdit = (registration: VisitorRegistration) => {
    console.log("Starting edit for registration:", registration.id);
    setEditingId(registration.id);
    const currentEndTime = registration.endtime 
      ? (() => {
          // Convert UTC time from database to IST for display in datetime-local input
          const utcDate = new Date(registration.endtime);
          const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
          return istDate.toISOString().slice(0, 16);
        })()
      : (() => {
          // Convert current UTC time to IST for display
          const now = new Date();
          const istNow = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
          return istNow.toISOString().slice(0, 16);
        })();
    console.log("Setting editEndTime to:", currentEndTime);
    setEditEndTime(currentEndTime);
  };

  const cancelEdit = () => {
    console.log("Cancelling edit");
    setEditingId(null);
    setEditEndTime('');
  };

  const saveEdit = async (id: string) => {
    if (saving) return;
    
    try {
      setSaving(true);
      console.log("Saving end time for registration:", id, "datetime-local value:", editEndTime);
      
      if (!editEndTime) {
        toast({
          title: "Error",
          description: "Please select an end time",
          variant: "destructive",
        });
        return;
      }

      // The datetime-local input gives us a string like "2024-01-01T15:30"
      // We need to treat this as IST time and convert to UTC for storage
      console.log("Original editEndTime from input:", editEndTime);
      
      // Parse the datetime-local string as IST
      const [datePart, timePart] = editEndTime.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);
      
      // Create date object explicitly in IST
      const istDate = new Date();
      istDate.setFullYear(year, month - 1, day); // month is 0-indexed
      istDate.setHours(hour, minute, 0, 0);
      
      // Convert IST to UTC by subtracting 5.5 hours
      const utcDate = new Date(istDate.getTime() - (5.5 * 60 * 60 * 1000));
      const endTimeISO = utcDate.toISOString();
      
      console.log("Parsed as IST:", istDate);
      console.log("Converted to UTC for storage:", endTimeISO);

      const { data, error } = await supabase
        .from('visitor_registrations')
        .update({ endtime: endTimeISO })
        .eq('id', id)
        .select();

      console.log("Update response:", { data, error });

      if (error) {
        console.error("Update error:", error);
        toast({
          title: "Error",
          description: "Failed to update end time: " + error.message,
          variant: "destructive",
        });
        return;
      }

      if (!data || data.length === 0) {
        console.error("No rows updated");
        toast({
          title: "Error",
          description: "Update failed - registration not found",
          variant: "destructive",
        });
        return;
      }

      console.log("Successfully updated end time, updated record:", data[0]);
      
      // Update local state immediately
      updateRegistration(id, { endtime: endTimeISO });
      
      toast({
        title: "Success",
        description: "End time updated successfully",
      });
      
      setEditingId(null);
      setEditEndTime('');
      
    } catch (error) {
      console.error("Unexpected error during update:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating: " + (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    editingId,
    editEndTime,
    saving,
    startEdit,
    cancelEdit,
    saveEdit,
    setEditEndTime
  };
};
