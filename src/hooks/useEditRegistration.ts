
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
    
    let currentEndTime: string;
    
    if (registration.endtime) {
      // Convert UTC time from database to IST for display
      const utcDate = new Date(registration.endtime);
      // Add 5.5 hours to convert UTC to IST
      const istTimestamp = utcDate.getTime() + (5.5 * 60 * 60 * 1000);
      const istDate = new Date(istTimestamp);
      currentEndTime = istDate.toISOString().slice(0, 16);
      console.log("Converted UTC to IST for display:", registration.endtime, "->", currentEndTime);
    } else {
      // For new entries, use current IST time
      const now = new Date();
      const istTimestamp = now.getTime() + (5.5 * 60 * 60 * 1000);
      const istDate = new Date(istTimestamp);
      currentEndTime = istDate.toISOString().slice(0, 16);
      console.log("Using current IST time:", currentEndTime);
    }
    
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

      // Convert datetime-local input (treated as IST) to UTC for storage
      console.log("Original editEndTime from input (as IST):", editEndTime);
      
      // Parse the datetime-local string and treat it as IST
      // Format: "2024-01-01T15:30" - this represents IST time
      const istDateString = editEndTime + ':00.000Z'; // Add seconds and Z
      const tempDate = new Date(istDateString);
      
      // This gives us a UTC timestamp, but we need to adjust because
      // the input was actually IST, not UTC
      // Subtract 5.5 hours to convert from IST to UTC
      const utcTimestamp = tempDate.getTime() - (5.5 * 60 * 60 * 1000);
      const utcDate = new Date(utcTimestamp);
      const endTimeISO = utcDate.toISOString();
      
      console.log("Input treated as IST:", editEndTime);
      console.log("Converted to UTC for storage:", endTimeISO);
      console.log("UTC timestamp:", utcTimestamp);

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
