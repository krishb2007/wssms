
import { saveVisitorRegistration, VisitorFormData } from './visitorService';
import { supabase } from '../integrations/supabase/client';

export interface FormEntry {
  id?: string;
  timestamp?: string;
  visitorName: string;
  schoolName: string;
  numberOfPeople: number;
  people: Array<{ name: string; role: string }>;
  purpose: string;
  otherPurpose: string;
  address: {
    city: string;
    state: string;
    country: string;
  };
  picture: string | null;
  signature: string | null;
  startTime?: string;
  endTime?: string | null;
  visitCount?: number;
  phoneNumber: string;
  acceptedPolicy?: boolean;
}

export interface FormDataWithId {
  id: string;
  visitor_name: string;
  contact_email?: string;
  purpose: string;
  number_of_people: number;
  created_at: string;
}

export interface FormDataInput {
  visitorName: string;
  schoolName: string;
  numberOfPeople: number;
  people: Array<{ name: string; role: string }>;
  purpose: string;
  otherPurpose: string;
  address: {
    city: string;
    state: string;
    country: string;
  };
  picture: File | string | null;
  signature: File | string | null;
  startTime: string;
  endTime: string | null;
  phoneNumber: string;
  acceptedPolicy?: boolean;
}

export const saveFormData = async (formData: FormDataInput): Promise<FormEntry> => {
  try {
    console.log("Starting form data save process:", formData);

    const purposeValue = formData.purpose === "other" ? formData.otherPurpose : formData.purpose;

    const visitorData: VisitorFormData = {
      visitorname: formData.visitorName,
      phonenumber: formData.phoneNumber,
      numberofpeople: formData.numberOfPeople,
      people: formData.people,
      purpose: purposeValue,
      address: formData.address,
      picture: formData.picture,
      signature: formData.signature,
      starttime: formData.startTime,
      endtime: formData.endTime,
    };

    console.log("Calling saveVisitorRegistration with:", visitorData);
    const savedData = await saveVisitorRegistration(visitorData);

    const savedEntry: FormEntry = {
      id: savedData.id,
      timestamp: savedData.created_at,
      visitorName: savedData.visitorname,
      schoolName: savedData.schoolname || "Woodstock School",
      numberOfPeople: savedData.numberofpeople,
      people: JSON.parse(savedData.people),
      purpose: savedData.purpose,
      otherPurpose: formData.purpose === "other" ? formData.otherPurpose : "",
      address: formData.address,
      picture: savedData.picture_url,
      signature: savedData.signature_url,
      startTime: savedData.starttime,
      endTime: savedData.endtime,
      phoneNumber: savedData.phonenumber,
      acceptedPolicy: formData.acceptedPolicy ?? false,
      visitCount: 1
    };

    console.log("Form data saved successfully:", savedEntry);
    return savedEntry;
  } catch (error) {
    console.error("Error saving form data:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      throw new Error(`Registration failed: ${error.message}`);
    } else {
      throw new Error("Registration failed due to an unexpected error. Please try again.");
    }
  }
};

export const getAllFormData = async (): Promise<FormDataWithId[]> => {
  try {
    const { data, error } = await supabase
      .from('visitor_registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      visitor_name: item.visitorname,
      contact_email: item.phonenumber, // Using phone as contact since we don't have email
      purpose: item.purpose,
      number_of_people: item.numberofpeople,
      created_at: item.created_at
    }));
  } catch (error) {
    console.error('Error fetching form data:', error);
    throw error;
  }
};

export const deleteFormData = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('visitor_registrations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting form data:', error);
    throw error;
  }
};

export const notifyAdmin = async (entry: FormEntry) => {
  try {
    console.log("Would notify admin about entry:", entry);
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Visitor Registration', {
        body: `${entry.visitorName} has registered to visit ${entry.schoolName}`,
        icon: entry.picture || undefined
      });
    }
  } catch (error) {
    console.error("Error notifying admin:", error);
  }
};
