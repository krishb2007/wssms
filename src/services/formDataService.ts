// Firebase has been removed from this file

// Interfaces (unchanged)
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

// Mock upload handler
const uploadFileMock = async (file: File): Promise<string> => {
  // Replace with real upload logic (e.g. S3, Supabase, or backend endpoint)
  return Promise.resolve(URL.createObjectURL(file)); // for demo/testing purposes
};

export const saveFormData = async (formData: FormDataInput): Promise<FormEntry> => {
  try {
    console.log("Saving form data (no Firebase)");

    const formId = crypto.randomUUID(); // Simulated unique ID
    const now = new Date().toISOString(); // Simulated timestamp

    let pictureUrl: string | null = null;
    let signatureUrl: string | null = null;

    if (formData.picture && typeof formData.picture !== "string") {
      pictureUrl = await uploadFileMock(formData.picture);
    } else if (typeof formData.picture === "string") {
      pictureUrl = formData.picture;
    }

    if (formData.signature && typeof formData.signature !== "string") {
      signatureUrl = await uploadFileMock(formData.signature);
    } else if (typeof formData.signature === "string") {
      signatureUrl = formData.signature;
    }

    const purposeValue = formData.purpose === "other" ? formData.otherPurpose : formData.purpose;

    const savedEntry: FormEntry = {
      id: formId,
      timestamp: now,
      visitorName: formData.visitorName,
      schoolName: "Woodstock School",
      numberOfPeople: formData.numberOfPeople,
      people: formData.people,
      purpose: purposeValue,
      otherPurpose: formData.purpose === "other" ? formData.otherPurpose : "",
      address: formData.address,
      picture: pictureUrl,
      signature: signatureUrl,
      startTime: formData.startTime,
      endTime: formData.endTime,
      phoneNumber: formData.phoneNumber,
      acceptedPolicy: formData.acceptedPolicy ?? false,
      visitCount: 1
    };

    // Replace this with a real API call to save the data to your backend
    console.log("Form data would be sent to server:", savedEntry);

    return savedEntry;
  } catch (error) {
    console.error("Error saving form data (mock):", error);
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
