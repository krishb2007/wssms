
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
  startTime?: string;
  endTime?: string;
  visitCount?: number;
  timestamp: string;
}

export const saveFormData = (formData: Omit<FormEntry, 'id' | 'timestamp'>): FormEntry => {
  // Process file data
  let pictureData: string | null = null;
  let signatureData: string | null = null;
  
  // For picture handling
  if (formData.picture && typeof formData.picture !== 'string') {
    pictureData = URL.createObjectURL(formData.picture as unknown as Blob);
  } else if (typeof formData.picture === 'string') {
    pictureData = formData.picture;
  }
  
  // For signature handling
  if (formData.signature && typeof formData.signature !== 'string') {
    signatureData = URL.createObjectURL(formData.signature as unknown as Blob);
  } else if (typeof formData.signature === 'string') {
    signatureData = formData.signature;
  }
  
  // Get existing entries to check visit count
  const existingEntriesStr = localStorage.getItem('formEntries') || '[]';
  const existingEntries: FormEntry[] = JSON.parse(existingEntriesStr);
  
  // Count previous visits by this person
  const visitCount = existingEntries.filter(entry => 
    entry.visitorName.toLowerCase() === formData.visitorName.toLowerCase()
  ).length + 1; // +1 for current visit
  
  const entry: FormEntry = {
    id: Date.now().toString(),
    ...formData,
    picture: pictureData,
    signature: signatureData,
    visitCount,
    timestamp: new Date().toISOString()
  };
  
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

export const searchEntries = (query: string): FormEntry[] => {
  if (!query.trim()) return getAllFormEntries();
  
  const entries = getAllFormEntries();
  const lowerQuery = query.toLowerCase();
  
  return entries.filter(entry => 
    entry.visitorName.toLowerCase().includes(lowerQuery) ||
    entry.purpose.toLowerCase().includes(lowerQuery) ||
    entry.phoneNumber.includes(lowerQuery) ||
    entry.address.city.toLowerCase().includes(lowerQuery)
  );
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
