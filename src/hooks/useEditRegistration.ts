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
      // Assume endtime is stored in IST and display as is for editing
      currentEndTime = registration.endtime.slice(0, 16);
    } else {
      // Use current IST time if no endtime exists
      const now = new Date();
      // Get IST time by adding 5.5 hours to UTC
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const ist = new Date(utc + (5.5 * 60 * 60 * 1000));
      currentEndTime = ist.toISOString().slice(0, 16);
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

      // Parse the input as a local time and format as IST string
      const localDate = new Date(editEndTime);

      // Add IST offset (if the browser isn't already in IST)
      const utc = localDate.getTime() + (localDate.getTimezoneOffset() * 60000);
      const istDate = new Date(utc + (5.5 * 60 * 60 * 1000));

      // Format as 'YYYY-MM-DDTHH:mm:ss' (no 'Z', no offset)
      const pad = (n: number) => n.toString().padStart(2, '0');
      const istString =
        `${istDate.getFullYear()}-${pad(istDate.getMonth() + 1)}-${pad(istDate.getDate())}T` +
        `${pad(istDate.getHours())}:${pad(istDate.getMinutes())}:${pad(istDate.getSeconds())}`;

      const { data, error } = await supabase
        .from('visitor_registrations')
        .update({ endtime: istString })
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

      // Update local state with the IST string that was saved to Supabase
      updateRegistration(id, { endtime: istString });

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
