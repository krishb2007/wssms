
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
      ? new Date(registration.endtime).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16);
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

      // Convert datetime-local to UTC for proper storage
      const localDate = new Date(editEndTime);
      // Adjust for IST offset (UTC+5:30) to store correct UTC time
      const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
      const utcTime = new Date(localDate.getTime() - istOffset);
      const endTimeISO = utcTime.toISOString();
      console.log("Local time:", editEndTime, "Converted to UTC:", endTimeISO);

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
