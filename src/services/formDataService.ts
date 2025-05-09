
// Mock database using localStorage
interface FormEntry {
  id: string;
  visitorName: string;
  schoolName: string;
  numberOfPeople: number;
  people: Array<{ name: string; role: string }>;
  purpose: string;
  otherPurpose: string;
  phoneNumber: string;
  address: {
    city: string;
    state: string;
    country: string;
  };
  picture: string | null;
  signature: string | null;
  timestamp: string;
}

export const saveFormData = (formData: Omit<FormEntry, 'id' | 'timestamp'>): FormEntry => {
  // Process file data
  let pictureData: string | null = null;
  let signatureData: string | null = null;
  
  if (formData.picture instanceof File) {
    pictureData = URL.createObjectURL(formData.picture);
  }
  
  if (formData.signature instanceof File) {
    signatureData = URL.createObjectURL(formData.signature);
  }
  
  const entry: FormEntry = {
    id: Date.now().toString(),
    ...formData,
    picture: pictureData,
    signature: signatureData,
    timestamp: new Date().toISOString()
  };
  
  // Get existing entries
  const existingEntriesStr = localStorage.getItem('formEntries') || '[]';
  const existingEntries: FormEntry[] = JSON.parse(existingEntriesStr);
  
  // Add new entry
  existingEntries.push(entry);
  
  // Save back to localStorage
  localStorage.setItem('formEntries', JSON.stringify(existingEntries));
  
  // Return the saved entry
  return entry;
};

export const getAllFormEntries = (): FormEntry[] => {
  const entriesStr = localStorage.getItem('formEntries') || '[]';
  return JSON.parse(entriesStr);
};

export const getFormEntry = (id: string): FormEntry | undefined => {
  const entries = getAllFormEntries();
  return entries.find(entry => entry.id === id);
};

export const notifyAdmin = (entry: FormEntry) => {
  // In a real application, this would send an email, push notification, etc.
  console.log(`[ADMIN NOTIFICATION] New visitor: ${entry.visitorName}`);
  
  // For demo purposes, we'll show a notification using the browser API
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('New Visitor Registration', {
      body: `${entry.visitorName} (${entry.purpose}) has registered to visit the campus.`
    });
  }
};
