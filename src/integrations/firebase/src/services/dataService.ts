import { db } from "@/integrations/firebase/client";
import { collection, addDoc } from "firebase/firestore";

export function saveFormData(formData: any) {
  return addDoc(collection(db, "formEntries"), formData);
}
