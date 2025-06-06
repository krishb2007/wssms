
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
}

// Upload file to Supabase storage (placeholder for now)
const uploadFile = async (file: File, bucket: string, path: string): Promise<string | null> => {
  try {
    console.log("Uploading file:", file.name);
    // For now, we'll just return a placeholder URL
    // In production, you would upload to Supabase storage
    return URL.createObjectURL(file);
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
      pictureUrl = await uploadFile(formData.picture, "pictures", `picture_${Date.now()}`);
    } else if (typeof formData.picture === "string") {
      pictureUrl = formData.picture;
    }

    if (formData.signature && typeof formData.signature !== "string") {
      signatureUrl = await uploadFile(formData.signature, "signatures", `signature_${Date.now()}`);
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
      starttime: formData.starttime || new Date().toISOString(),
      endtime: formData.endtime || null,
      picture_url: pictureUrl,
      signature_url: signatureUrl,
    };

    console.log("Attempting to insert into visitor_registrations table:", insertData);

    // Test database connection first
    const { data: testData, error: testError } = await supabase
      .from('visitor_registrations')
      .select('count(*)')
      .limit(1);

    if (testError) {
      console.error("Database connection test failed:", testError);
      throw new Error(`Database connection failed: ${testError.message}`);
    }

    console.log("Database connection successful, proceeding with insert...");

    const { data, error } = await supabase
      .from('visitor_registrations')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error("Database insert error:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
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
