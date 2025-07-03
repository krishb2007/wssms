
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { VisitorRegistration } from '@/components/admin/types';

export const useVisitorRegistrations = () => {
  const [registrations, setRegistrations] = useState<VisitorRegistration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<VisitorRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const sortRegistrations = (data: VisitorRegistration[]) => {
    return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  useEffect(() => {
    fetchRegistrations();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('visitor-registrations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'visitor_registrations'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          if (payload.eventType === 'UPDATE') {
            setRegistrations(prev => {
              const updated = prev.map(reg => 
                reg.id === payload.new.id ? { ...reg, ...payload.new } : reg
              );
              return sortRegistrations(updated);
            });
          } else if (payload.eventType === 'INSERT') {
            setRegistrations(prev => {
              const newList = [payload.new as VisitorRegistration, ...prev];
              return sortRegistrations(newList);
            });
          } else if (payload.eventType === 'DELETE') {
            setRegistrations(prev => prev.filter(reg => reg.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      const sortedRegistrations = sortRegistrations([...registrations]);
      setFilteredRegistrations(sortedRegistrations);
    } else {
      const filtered = registrations.filter(registration =>
        registration.visitorname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.phonenumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.schoolname?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const sortedFiltered = sortRegistrations(filtered);
      setFilteredRegistrations(sortedFiltered);
    }
  }, [searchTerm, registrations]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      console.log("Fetching visitor registrations...");
      
      const { data, error } = await supabase
        .from('visitor_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      console.log("Fetch result:", { data, error });

      if (error) {
        console.error("Database error:", error);
        toast({
          title: "Error",
          description: "Failed to fetch registrations: " + error.message,
          variant: "destructive",
        });
      } else if (data) {
        console.log(`Successfully fetched ${data.length} registrations`);
        const sortedData = sortRegistrations(data);
        setRegistrations(sortedData);
        setFilteredRegistrations(sortedData);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching data",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const updateRegistration = (id: string, updates: Partial<VisitorRegistration>) => {
    setRegistrations(prev => {
      const updated = prev.map(reg => 
        reg.id === id ? { ...reg, ...updates } : reg
      );
      return sortRegistrations(updated);
    });
  };

  return {
    registrations,
    filteredRegistrations,
    loading,
    searchTerm,
    setSearchTerm,
    fetchRegistrations,
    updateRegistration
  };
};
