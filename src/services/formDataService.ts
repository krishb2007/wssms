
import { supabase } from "@/integrations/supabase/client";

// FormEntry interface definition
export interface FormEntry {
  id: string;
  visitorName: string;
  schoolName: string;
  numberOfPeople: number;
  people: Array<{ name: string; role: string }>;
  purpose: string;
  otherPurpose: string;
  phoneNumber: string;
  address: {
    city: string;
    state: string;
    country: string;
  };
  picture: string | null;
  signature: string | null;
  startTime?: string;
  endTime?: string | null; // Making end time optional
  visitCount?: number;
  timestamp: string;
}

// Save form data to Supabase
export const saveFormData = async (formData: Omit<FormEntry, 'id' | 'timestamp'>): Promise<FormEntry> => {
  try {
    // Process file data
    let pictureUrl: string | null = null;
    let signatureUrl: string | null = null;
    
    // For picture handling - upload to Supabase storage if it's a File
    if (formData.picture && typeof formData.picture !== 'string') {
      const file = formData.picture as unknown as File;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-picture.${fileExt}`;
      
      const { data: pictureData, error: pictureError } = await supabase.storage
        .from('visitor-pictures')
        .upload(fileName, file);
      
      if (pictureError) {
        console.error('Error uploading picture:', pictureError);
      } else if (pictureData) {
        const { data } = supabase.storage.from('visitor-pictures').getPublicUrl(pictureData.path);
        pictureUrl = data.publicUrl;
      }
    } else if (typeof formData.picture === 'string') {
      pictureUrl = formData.picture;
    }
    
    // For signature handling - upload to Supabase storage if it's a File or Blob
    if (formData.signature && typeof formData.signature !== 'string') {
      const file = formData.signature as unknown as File;
      const fileName = `${Date.now()}-signature.png`;
      
      const { data: signatureData, error: signatureError } = await supabase.storage
        .from('visitor-signatures')
        .upload(fileName, file);
      
      if (signatureError) {
        console.error('Error uploading signature:', signatureError);
      } else if (signatureData) {
        const { data } = supabase.storage.from('visitor-signatures').getPublicUrl(signatureData.path);
        signatureUrl = data.publicUrl;
      }
    } else if (typeof formData.signature === 'string') {
      signatureUrl = formData.signature;
    }
    
    // Count previous visits by this person
    const { count } = await supabase
      .from('visitor_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('visitorname', formData.visitorName);
    
    const visitCount = (count || 0) + 1; // +1 for current visit
    
    // Prepare entry for database - using lowercase column names to match Supabase schema
    const entry = {
      visitorname: formData.visitorName,
      schoolname: formData.schoolName,
      numberofpeople: formData.numberOfPeople,
      people: formData.people,
      purpose: formData.purpose,
      otherpurpose: formData.otherPurpose,
      phonenumber: formData.phoneNumber,
      address: formData.address,
      picture_url: pictureUrl,
      signature_url: signatureUrl,
      starttime: formData.startTime,
      endtime: formData.endTime || null, // Make end time optional
      visitcount: visitCount,
      created_at: new Date().toISOString()
    };
    
    // Insert into Supabase
    const { data, error } = await supabase
      .from('visitor_registrations')
      .insert([entry])
      .select();
    
    if (error) {
      console.error('Error saving to Supabase:', error);
      
      // Fallback to localStorage if Supabase fails
      const localEntry: FormEntry = {
        id: Date.now().toString(),
        ...formData,
        picture: pictureUrl,
        signature: signatureUrl,
        visitCount,
        timestamp: new Date().toISOString()
      };
      
      const existingEntriesStr = localStorage.getItem('formEntries') || '[]';
      const existingEntries: FormEntry[] = JSON.parse(existingEntriesStr);
      existingEntries.push(localEntry);
      localStorage.setItem('formEntries', JSON.stringify(existingEntries));
      
      return localEntry;
    }
    
    // Return the saved entry with the right format for the application - map from DB column names to app property names
    const savedEntry: FormEntry = {
      id: data[0].id,
      visitorName: data[0].visitorname,
      schoolName: data[0].schoolname,
      numberOfPeople: data[0].numberofpeople,
      people: data[0].people,
      purpose: data[0].purpose,
      otherPurpose: data[0].otherpurpose,
      phoneNumber: data[0].phonenumber,
      address: data[0].address,
      picture: data[0].picture_url,
      signature: data[0].signature_url,
      startTime: data[0].starttime,
      endTime: data[0].endtime,
      visitCount: data[0].visitcount,
      timestamp: data[0].created_at
    };
    
    return savedEntry;
  } catch (err) {
    console.error('Unexpected error in saveFormData:', err);
    
    // Fallback to localStorage in case of any errors
    const localEntry: FormEntry = {
      id: Date.now().toString(),
      ...formData,
      picture: typeof formData.picture === 'string' ? formData.picture : null,
      signature: typeof formData.signature === 'string' ? formData.signature : null,
      visitCount: 1,
      timestamp: new Date().toISOString()
    };
    
    const existingEntriesStr = localStorage.getItem('formEntries') || '[]';
    const existingEntries: FormEntry[] = JSON.parse(existingEntriesStr);
    existingEntries.push(localEntry);
    localStorage.setItem('formEntries', JSON.stringify(existingEntries));
    
    return localEntry;
  }
};

export const getAllFormEntries = async (): Promise<FormEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('visitor_registrations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching from Supabase:', error);
      // Fallback to localStorage
      const entriesStr = localStorage.getItem('formEntries') || '[]';
      return JSON.parse(entriesStr);
    }
    
    // Convert Supabase data to FormEntry format - map from DB column names to app property names
    return data.map(item => ({
      id: item.id,
      visitorName: item.visitorname,
      schoolName: item.schoolname,
      numberOfPeople: item.numberofpeople,
      people: item.people,
      purpose: item.purpose,
      otherPurpose: item.otherpurpose,
      phoneNumber: item.phonenumber,
      address: item.address,
      picture: item.picture_url,
      signature: item.signature_url,
      startTime: item.starttime,
      endTime: item.endtime,
      visitCount: item.visitcount,
      timestamp: item.created_at
    }));
  } catch (err) {
    console.error('Error in getAllFormEntries:', err);
    // Fallback to localStorage
    const entriesStr = localStorage.getItem('formEntries') || '[]';
    return JSON.parse(entriesStr);
  }
};

export const getFormEntry = async (id: string): Promise<FormEntry | undefined> => {
  try {
    const { data, error } = await supabase
      .from('visitor_registrations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      // Fallback to localStorage
      const entries = JSON.parse(localStorage.getItem('formEntries') || '[]');
      return entries.find((entry: FormEntry) => entry.id === id);
    }
    
    return {
      id: data.id,
      visitorName: data.visitorname,
      schoolName: data.schoolname,
      numberOfPeople: data.numberofpeople,
      people: data.people,
      purpose: data.purpose,
      otherPurpose: data.otherpurpose,
      phoneNumber: data.phonenumber,
      address: data.address,
      picture: data.picture_url,
      signature: data.signature_url,
      startTime: data.starttime,
      endTime: data.endtime,
      visitCount: data.visitcount,
      timestamp: data.created_at
    };
  } catch (err) {
    console.error('Error in getFormEntry:', err);
    // Fallback to localStorage
    const entries = JSON.parse(localStorage.getItem('formEntries') || '[]');
    return entries.find((entry: FormEntry) => entry.id === id);
  }
};

export const notifyAdmin = (entry: FormEntry) => {
  // In a real application, this would send an email, push notification, etc.
  console.log(`[ADMIN NOTIFICATION] New visitor: ${entry.visitorName}`);
  
  // For demo purposes, we'll show a notification using the browser API
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('New Visitor Registration', {
      body: `${entry.visitorName} (${entry.purpose}) has registered to visit the campus.`
    });
  }
};
