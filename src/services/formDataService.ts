import { saveVisitorRegistration, VisitorFormData, getAllVisitorRegistrations, deleteVisitorRegistration } from './visitorService';

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

export interface FormDataWithId {
  id: string;
  created_at: string;
  visitor_name: string;
  contact_email?: string;
  purpose: string;
  number_of_people: number;
  phone_number?: string;
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
    console.log("Fetching all visitor registrations...");
    const data = await getAllVisitorRegistrations();
    
    return data.map(item => ({
      id: item.id,
      created_at: item.created_at,
      visitor_name: item.visitorname,
      contact_email: item.phonenumber, // Using phone as contact for now
      purpose: item.purpose,
      number_of_people: item.numberofpeople,
      phone_number: item.phonenumber
    }));
  } catch (error) {
    console.error("Error fetching form data:", error);
    throw new Error("Failed to fetch visitor data");
  }
};

export const deleteFormData = async (id: string): Promise<void> => {
  try {
    console.log("Deleting visitor registration:", id);
    await deleteVisitorRegistration(id);
    console.log("Successfully deleted visitor registration:", id);
  } catch (error) {
    console.error("Error deleting form data:", error);
    throw new Error("Failed to delete visitor data");
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
