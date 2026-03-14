import { saveVisitorRegistration, VisitorFormData } from './visitorService';
import { supabase } from '@/integrations/supabase/client';

export interface FormEntry {
  id?: string;
  timestamp?: string;
  visitorName: string;
  schoolName: string;
  numberOfPeople: number;
  people: Array<{ name: string; role: string }>;
  purpose: string;
  otherPurpose: string;
  staffEmail: string;
  staffEmails: string[];
  extraInfo: string;
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

export interface FormDataInput {
  visitorName: string;
  schoolName: string;
  numberOfPeople: number;
  people: Array<{ name: string; role: string }>;
  purpose: string;
  otherPurpose: string;
  staffEmail: string;
  staffEmails: string[];
  extraInfo: string;
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
  idType: string;
  idNumber: string;
  acceptedPolicy?: boolean;
}

export const saveFormData = async (formData: FormDataInput): Promise<FormEntry> => {
  try {
    console.log("Starting form data save process:", formData);

    const purposeValue = formData.purpose === "other" ? formData.otherPurpose : formData.purpose;

    // Combine staff emails into comma-separated string
    const allStaffEmails = formData.staffEmails && formData.staffEmails.length > 0
      ? formData.staffEmails.filter(e => e.trim())
      : (formData.staffEmail ? [formData.staffEmail] : []);
    const emailValue = formData.purpose === "meeting_school_staff" && allStaffEmails.length > 0
      ? allStaffEmails.join(', ')
      : null;

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
      email: emailValue,
      id_type: formData.idType,
      id_number: formData.idNumber,
      extra_info: formData.extraInfo || null,
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
      staffEmail: formData.purpose === "meeting_school_staff" ? formData.staffEmail : "",
      staffEmails: allStaffEmails,
      extraInfo: formData.extraInfo || "",
      address: formData.address,
      picture: savedData.picture_url,
      signature: savedData.signature_url,
      startTime: savedData.starttime,
      endTime: savedData.endtime,
      phoneNumber: savedData.phonenumber,
      acceptedPolicy: formData.acceptedPolicy ?? false,
      visitCount: 1
    };

    // Send email notification if meeting school staff
    if (formData.purpose === "meeting_school_staff" && formData.staffEmail) {
      try {
        console.log("Sending staff notification email to:", formData.staffEmail);
        const emailResponse = await supabase.functions.invoke('send-staff-notification', {
          body: {
            staffEmail: formData.staffEmail,
            visitorName: formData.visitorName,
            purpose: purposeValue,
            numberOfPeople: formData.numberOfPeople,
            startTime: formData.startTime,
            phoneNumber: formData.phoneNumber,
            address: `${formData.address.city}, ${formData.address.state}, ${formData.address.country}`,
            pictureUrl: savedData.picture_url,
            people: formData.people
          }
        });
        
        if (emailResponse.error) {
          console.error("Error sending staff notification:", emailResponse.error);
        } else {
          console.log("Staff notification sent successfully");
        }
      } catch (emailError) {
        console.error("Failed to send staff notification email:", emailError);
        // Don't throw error - we don't want to fail the registration if email fails
      }
    }

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
