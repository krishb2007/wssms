
import { db } from "@/integrations/firebase/client";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/integrations/firebase/client"; // Make sure you export storage in your client.ts

// FormEntry interface definition (unchanged)
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

// Form data input type (unchanged)
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
    console.log("Starting to save form data (Firebase)");

    // Prepare data for Firestore
    const dbFormData: Partial<FormEntry> = {
      ...formData,
      picture: null,
      signature: null
    };

    // Handle picture upload to Firebase Storage if needed
    if (formData.picture && typeof formData.picture !== 'string') {
      const file = formData.picture as File;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-picture.${fileExt}`;
      const fileRef = ref(storage, `visitor-pictures/${fileName}`);
      await uploadBytes(fileRef, file);
      dbFormData.picture = await getDownloadURL(fileRef);
    } else if (typeof formData.picture === 'string') {
      dbFormData.picture = formData.picture;
    }

    // Handle signature upload to Firebase Storage if needed
    if (formData.signature && typeof formData.signature !== 'string') {
      const file = formData.signature as File;
      const fileName = `${Date.now()}-signature.png`;
      const fileRef = ref(storage, `visitor-signatures/${fileName}`);
      await uploadBytes(fileRef, file);
      dbFormData.signature = await getDownloadURL(fileRef);
    } else if (typeof formData.signature === 'string') {
      dbFormData.signature = formData.signature;
    }

    // Combine purpose and otherPurpose if purpose is "other"
    const purposeValue = formData.purpose === "other" ? formData.otherPurpose : formData.purpose;

    // Prepare Firestore entry
    const entryData = {
      visitorName: formData.visitorName,
      schoolName: "Woodstock School", // Hardcoded as in your example
      numberOfPeople: formData.numberOfPeople,
      people: formData.people,
      purpose: purposeValue,
      otherPurpose: formData.purpose === "other" ? formData.otherPurpose : "",
      address: formData.address,
      picture: dbFormData.picture,
      signature: dbFormData.signature,
      startTime: formData.startTime,
      endTime: formData.endTime,
      phoneNumber: formData.phoneNumber,
      acceptedPolicy: formData.acceptedPolicy ?? false,
      timestamp: Timestamp.now()
    };

    // Save to Firestore
    const docRef = await addDoc(collection(db, "visitor_registrations"), entryData);

    const savedEntry: FormEntry = {
      ...entryData,
      id: docRef.id,
      visitCount: 1 // You can increment logic if needed
    };

    return savedEntry;
  } catch (error) {
    console.error("Error in saveFormData (Firebase):", error);
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
