import { supabase } from "@/integrations/supabase/client";

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
  picture?: File | string | null;
  signature?: File | string | null;
  starttime?: string;
  endtime?: string | null;
  email?: string | null;
}

// Upload file to Supabase storage
const uploadFile = async (file: File, bucket: string, path: string): Promise<string | null> => {
  try {
    console.log("Uploading file to Supabase storage:", file.name);
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Storage upload error:", error);
      return null;
    }

    // Return the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    console.log("File uploaded successfully, public URL:", publicUrl);
    return publicUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
};

export const saveVisitorRegistration = async (formData: VisitorFormData) => {
  try {
    console.log("Saving visitor registration to database:", formData);

    // Handle file uploads
    let pictureUrl: string | null = null;
    let signatureUrl: string | null = null;

    if (formData.picture && typeof formData.picture !== "string") {
      const timestamp = Date.now();
      pictureUrl = await uploadFile(
        formData.picture, 
        "visitor-pictures", 
        `${timestamp}-picture.png`
      );
    } else if (typeof formData.picture === "string") {
      pictureUrl = formData.picture;
    }

    if (formData.signature && typeof formData.signature !== "string") {
      const timestamp = Date.now();
      signatureUrl = await uploadFile(
        formData.signature, 
        "visitor-signatures", 
        `${timestamp}-signature.png`
      );
    } else if (typeof formData.signature === "string") {
      signatureUrl = formData.signature;
    }

    // Format address as string
    const addressString = `${formData.address.city}, ${formData.address.state}, ${formData.address.country}`;

    // Prepare data for insertion
    const insertData = {
      visitorname: formData.visitorname,
      phonenumber: formData.phonenumber,
      numberofpeople: formData.numberofpeople,
      people: JSON.stringify(formData.people),
      purpose: formData.purpose,
      address: addressString,
      schoolname: "Woodstock School",
      starttime: formData.starttime || (() => {
        // Get current IST time
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const istTime = new Date(utc + (5.5 * 60 * 60 * 1000));
        
        // Format as 'YYYY-MM-DDTHH:mm:ss' (no 'Z', no offset) to store as IST
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${istTime.getFullYear()}-${pad(istTime.getMonth() + 1)}-${pad(istTime.getDate())}T` +
               `${pad(istTime.getHours())}:${pad(istTime.getMinutes())}:${pad(istTime.getSeconds())}`;
      })(),
      endtime: formData.endtime || null,
      picture_url: pictureUrl,
      signature_url: signatureUrl,
      email: formData.email || null,
    };

    console.log("Attempting to insert into visitor_registrations table:", insertData);

    const { data, error } = await supabase
      .from('visitor_registrations')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error("Database insert error:", error);
      throw new Error(`Failed to save registration: ${error.message}`);
    }

    console.log("Visitor registration saved successfully to database:", data);
    return data;
  } catch (error) {
    console.error("Error in saveVisitorRegistration:", error);
    throw error;
  }
};

export const getVisitorRegistrations = async () => {
  try {
    console.log("Fetching visitor registrations from database");
    
    const { data, error } = await supabase
      .from('visitor_registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching visitor registrations:", error);
      throw new Error(`Failed to fetch registrations: ${error.message}`);
    }

    console.log("Fetched visitor registrations:", data);
    return data || [];
  } catch (error) {
    console.error("Error in getVisitorRegistrations:", error);
    throw error;
  }
};
