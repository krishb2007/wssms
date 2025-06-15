
import { supabase } from '../integrations/supabase/client';

export interface VisitorFormData {
  visitorname: string;
  phonenumber: string;
  numberofpeople: number;
  people: Array<{ name: string; role: string }>;
  purpose: string;
  address: {
    city: string;
    state: string;
    country: string;
  };
  picture: File | string | null;
  signature: File | string | null;
  starttime: string;
  endtime: string | null;
}

export interface VisitorRegistration {
  id: string;
  created_at: string;
  visitorname: string;
  schoolname?: string;
  numberofpeople: number;
  people: string;
  purpose: string;
  phonenumber: string;
  picture_url?: string;
  signature_url?: string;
  starttime?: string;
  endtime?: string;
}

export const saveVisitorRegistration = async (data: VisitorFormData): Promise<VisitorRegistration> => {
  try {
    console.log("Saving visitor registration to database:", data);

    // Convert people array to JSON string
    const peopleJson = JSON.stringify(data.people);
    
    // Convert address object to JSON string
    const addressJson = JSON.stringify(data.address);

    // Handle file uploads if needed (simplified for now)
    let pictureUrl = null;
    let signatureUrl = null;
    
    if (data.picture && typeof data.picture === 'string') {
      pictureUrl = data.picture;
    }
    
    if (data.signature && typeof data.signature === 'string') {
      signatureUrl = data.signature;
    }

    const insertData = {
      visitorname: data.visitorname,
      phonenumber: data.phonenumber,
      numberofpeople: data.numberofpeople,
      people: peopleJson,
      purpose: data.purpose,
      address: addressJson,
      picture_url: pictureUrl,
      signature_url: signatureUrl,
      starttime: data.starttime,
      endtime: data.endtime,
      schoolname: "Woodstock School"
    };

    const { data: result, error } = await supabase
      .from('visitor_registrations')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    console.log("Successfully saved visitor registration:", result);
    return result;

  } catch (error) {
    console.error("Error in saveVisitorRegistration:", error);
    throw error;
  }
};

export const getAllVisitorRegistrations = async (): Promise<VisitorRegistration[]> => {
  try {
    console.log("Fetching all visitor registrations from database...");
    
    const { data, error } = await supabase
      .from('visitor_registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    console.log("Successfully fetched visitor registrations:", data);
    return data || [];

  } catch (error) {
    console.error("Error in getAllVisitorRegistrations:", error);
    throw error;
  }
};

export const deleteVisitorRegistration = async (id: string): Promise<void> => {
  try {
    console.log("Deleting visitor registration from database:", id);
    
    const { error } = await supabase
      .from('visitor_registrations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    console.log("Successfully deleted visitor registration:", id);

  } catch (error) {
    console.error("Error in deleteVisitorRegistration:", error);
    throw error;
  }
};
