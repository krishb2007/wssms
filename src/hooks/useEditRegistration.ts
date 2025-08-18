import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { VisitorRegistration } from '@/components/admin/types';

export const useEditRegistration = (updateRegistration: (id: string, updates: Partial<VisitorRegistration>) => void) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEndTime, setEditEndTime] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const startEdit = (registration: VisitorRegistration) => {
    setEditingId(registration.id);

    let currentEndTime: string;

    if (registration.endtime) {
      // Convert UTC time from Supabase to IST for display in datetime-local input
      const utcDate = new Date(registration.endtime);
      // Add 5.5 hours to convert UTC to IST
      const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
      currentEndTime = istDate.toISOString().slice(0, 16);
    } else {
      // Use current IST time if no endtime exists
      const now = new Date();
      // Get current IST time
      const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      currentEndTime = istTime.toISOString().slice(0, 16);
    }

    setEditEndTime(currentEndTime);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditEndTime('');
  };

  const saveEdit = async (id: string) => {
    if (saving) return;

    try {
      setSaving(true);

      if (!editEndTime) {
        toast({
          title: "Error",
          description: "Please select an end time",
          variant: "destructive",
        });
        return;
      }

      // Parse the datetime-local input as IST and convert to UTC for Supabase
      const istDate = new Date(editEndTime);
      
      // Convert IST to UTC by subtracting 5.5 hours
      const utcDate = new Date(istDate.getTime() - (5.5 * 60 * 60 * 1000));
      
      // Format as ISO string for Supabase (will be stored as UTC)
      const utcString = utcDate.toISOString();

      const { data, error } = await supabase
        .from('visitor_registrations')
        .update({ endtime: utcString })
        .eq('id', id)
        .select();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update end time: " + error.message,
          variant: "destructive",
        });
        return;
      }

      if (!data || data.length === 0) {
        toast({
          title: "Error",
          description: "Update failed - registration not found",
          variant: "destructive",
        });
        return;
      }

      updateRegistration(id, { endtime: utcString });

      toast({
        title: "Success",
        description: "End time updated successfully",
      });

      setEditingId(null);
      setEditEndTime('');

    } catch (error) {
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
