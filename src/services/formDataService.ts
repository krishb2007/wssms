import { supabase } from "@/integrations/supabase/client";

// FormEntry interface definition
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
  picture: string | null; // Database only stores URLs, not File objects
  signature: string | null; // Database only stores URLs, not File objects
  startTime?: string;
  endTime?: string | null; // Making end time optional
  visitCount?: number;
  phoneNumber: string;
  acceptedPolicy?: boolean;
}

// Form data input type (can include File objects before storage)
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
    console.log("Starting to save form data");
    
    // Create a copy of form data that will be modified with URLs instead of files
    const dbFormData: Partial<FormEntry> = {
      ...formData,
      picture: null,
      signature: null
    };
    
    // For picture handling - upload to Supabase storage if it's a File
    if (formData.picture && typeof formData.picture !== 'string') {
      const file = formData.picture as File;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-picture.${fileExt}`;
      
      const { data: pictureData, error: pictureError } = await supabase.storage
        .from('visitor-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (pictureError) {
        console.error("Error uploading picture:", pictureError);
        throw pictureError;
      }
      
      // Get public URL for the file (now using the publicUrl method directly)
      const pictureUrl = supabase.storage
        .from('visitor-pictures')
        .getPublicUrl(fileName);
        
      dbFormData.picture = pictureUrl.data.publicUrl;
    } else if (typeof formData.picture === 'string') {
      dbFormData.picture = formData.picture;
    }
    
    // For signature handling - upload to Supabase storage if it's a File or Blob
    if (formData.signature && typeof formData.signature !== 'string') {
      const file = formData.signature as File;
      const fileName = `${Date.now()}-signature.png`;
      
      const { data: signatureData, error: signatureError } = await supabase.storage
        .from('visitor-signatures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (signatureError) {
        console.error("Error uploading signature:", signatureError);
        throw signatureError;
      }
      
      // Get public URL for the file (now using the publicUrl method directly)
      const signatureUrl = supabase.storage
        .from('visitor-signatures')
        .getPublicUrl(fileName);
        
      dbFormData.signature = signatureUrl.data.publicUrl;
    } else if (typeof formData.signature === 'string') {
      dbFormData.signature = formData.signature;
    }
    
    // Combine purpose and otherPurpose if purpose is "other"
    const purposeValue = formData.purpose === "other" ? formData.otherPurpose : formData.purpose;
    
    // Insert the data into the database
    const { data, error } = await supabase
      .from('visitor_registrations')
      .insert({
        visitorname: dbFormData.visitorName,
        schoolname: "Woodstock School", // Use hardcoded value since the column might not exist
        numberofpeople: dbFormData.numberOfPeople,
        people: dbFormData.people,
        purpose: purposeValue, // Use the combined purpose value
        address: dbFormData.address,
        picture_url: dbFormData.picture,
        signature_url: dbFormData.signature,
        starttime: dbFormData.startTime,
        endtime: dbFormData.endTime,
        phonenumber: dbFormData.phoneNumber,
        accepted_policy: formData.acceptedPolicy
      })
      .select();
    
    if (error) {
      console.error("Database error:", error);
      throw error;
    }
    
    console.log("Form data saved successfully:", data);
    
    // Return the saved entry (transforming from snake_case to camelCase)
    const savedEntry: FormEntry = {
      id: data[0].id,
      timestamp: data[0].created_at,
      visitorName: data[0].visitorname,
      schoolName: "Woodstock School", // Using hardcoded value
      numberOfPeople: data[0].numberofpeople,
      people: data[0].people as Array<{ name: string; role: string }>,
      purpose: data[0].purpose,
      otherPurpose: formData.purpose === "other" ? formData.otherPurpose : "",
      address: data[0].address as { city: string; state: string; country: string },
      picture: data[0].picture_url,
      signature: data[0].signature_url,
      startTime: data[0].starttime,
      endTime: data[0].endtime,
      phoneNumber: data[0].phonenumber,
      visitCount: data[0].visitcount || 1,
      acceptedPolicy: data[0].accepted_policy
    };
    
    return savedEntry;
  } catch (error) {
    console.error("Error in saveFormData:", error);
    throw error;
  }
};

export const notifyAdmin = async (entry: FormEntry) => {
  try {
    console.log("Would notify admin about entry:", entry);
    // In a real-world scenario, you'd send an email or push notification here
    
    // For demo purposes, showing a notification if the browser supports it
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
