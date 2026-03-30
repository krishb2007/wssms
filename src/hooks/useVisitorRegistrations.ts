
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { VisitorRegistration } from '@/components/admin/types';
import { FilterState } from '@/components/admin/FilterBar';

export const useVisitorRegistrations = () => {
  const [registrations, setRegistrations] = useState<VisitorRegistration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<VisitorRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>({ status: 'all', purpose: 'all', dateRange: 'all', entryLocation: 'all' });

  const entryLocations = useMemo(() => {
    const locs = new Set<string>();
    registrations.forEach(r => { if (r.entry_location) locs.add(r.entry_location); });
    return Array.from(locs).sort();
  }, [registrations]);

  const sortRegistrations = (data: VisitorRegistration[]) => {
    return data.sort((a, b) => {
      // Active (no endtime) visitors first
      const aActive = !a.endtime ? 0 : 1;
      const bActive = !b.endtime ? 0 : 1;
      if (aActive !== bActive) return aActive - bActive;
      // Then by date descending
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
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
    let filtered = [...registrations];

    // Search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.visitorname.toLowerCase().includes(term) ||
        r.phonenumber.toLowerCase().includes(term) ||
        r.purpose.toLowerCase().includes(term) ||
        r.address?.toLowerCase().includes(term) ||
        r.schoolname?.toLowerCase().includes(term) ||
        r.email?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(r => {
        if (filters.status === 'active') return !r.endtime && !r.meeting_staff_end_time;
        if (filters.status === 'meeting_ended') return !r.endtime && !!r.meeting_staff_end_time;
        if (filters.status === 'exited') return !!r.endtime;
        return true;
      });
    }

    // Purpose filter
    if (filters.purpose !== 'all') {
      filtered = filtered.filter(r => r.purpose === filters.purpose);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const ist = new Date(utc + (5.5 * 60 * 60 * 1000));
      const startOfDay = new Date(ist.getFullYear(), ist.getMonth(), ist.getDate());

      filtered = filtered.filter(r => {
        const created = new Date(r.created_at);
        if (filters.dateRange === 'today') return created >= startOfDay;
        if (filters.dateRange === 'week') {
          const weekAgo = new Date(startOfDay);
          weekAgo.setDate(weekAgo.getDate() - weekAgo.getDay());
          return created >= weekAgo;
        }
        if (filters.dateRange === 'month') {
          const monthStart = new Date(ist.getFullYear(), ist.getMonth(), 1);
          return created >= monthStart;
        }
        return true;
      });
    }

    // Entry location filter
    if (filters.entryLocation !== 'all') {
      filtered = filtered.filter(r => r.entry_location === filters.entryLocation);
    }

    setFilteredRegistrations(sortRegistrations(filtered));
  }, [searchTerm, registrations, filters]);

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
        const sortedData = sortRegistrations(data as unknown as VisitorRegistration[]);
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
    filters,
    setFilters,
    entryLocations,
    fetchRegistrations,
    updateRegistration
  };
};
