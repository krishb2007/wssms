import React, { useState, useEffect } from "react";
import WelcomePage from "@/components/WelcomePage";
import CombinedNamePeopleForm from "@/components/CombinedNamePeopleForm";
import CombinedPurposeDurationForm from "@/components/CombinedPurposeDurationForm";
import CombinedContactAddressForm from "@/components/CombinedContactAddressForm";
import UploadForm from "@/components/UploadForm";
import SignatureForm from "@/components/SignatureForm";
import ConfirmationPage from "@/components/ConfirmationPage";
import { toast } from "@/components/ui/use-toast";
import { saveFormData, notifyAdmin, FormDataInput } from "@/services/formDataService";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Index = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [entryLocation, setEntryLocation] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormDataInput & {acceptedPolicy?: boolean}>({
    visitorName: "",
    schoolName: "Woodstock School",
    numberOfPeople: 1,
    people: [{ name: "", role: "" }],
    purpose: "",
    otherPurpose: "",
    staffEmail: "",
    staffEmails: [] as string[],
    extraInfo: "",
    startTime: "",
    endTime: null as string | null,
    phoneNumber: "",
    idType: "",
    idNumber: "",
    address: {
      city: "",
      state: "",
      country: "India",
    },
    picture: null as File | string | null,
    signature: null as File | string | null,
    acceptedPolicy: false,
    meetingStaffStartTime: null,
    meetingStaffEndTime: null,
    entryLocation: null,
    meetingStaffTimes: [],
  });

  // Capture GPS location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
          setEntryLocation(loc);
        },
        (err) => {
          console.log("Geolocation not available:", err.message);
          setEntryLocation("Woodstock School, Mussoorie");
        },
        { timeout: 10000 }
      );
    } else {
      setEntryLocation("Woodstock School, Mussoorie");
    }
  }, []);

  const updateFormData = (data: Partial<FormDataInput>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (step < 7) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmissionError(null);
      
      const submitData = { ...formData, entryLocation };
      console.log("Submitting form data:", submitData);
      
      const savedEntry = await saveFormData(submitData);
      console.log("Form data saved:", savedEntry);
      
      notifyAdmin(savedEntry);
      
      toast({
        title: "Registration Complete",
        description: "Your registration has been submitted successfully!",
      });
      
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      setStep(1);
      setFormData({
        visitorName: "",
        schoolName: "Woodstock School",
        numberOfPeople: 1,
        people: [{ name: "", role: "" }],
        purpose: "",
        otherPurpose: "",
        staffEmail: "",
        staffEmails: [],
        extraInfo: "",
        startTime: "",
        endTime: null,
        phoneNumber: "",
        idType: "",
        idNumber: "",
        address: {
          city: "",
          state: "",
          country: "India",
        },
        picture: null,
        signature: null,
        acceptedPolicy: false,
        meetingStaffStartTime: null,
        meetingStaffEndTime: null,
        entryLocation: null,
        meetingStaffTimes: [],
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as any)?.message || 'There was a problem submitting your registration.';
      setSubmissionError(errorMessage);
      toast({
        title: "Error",
        description: "There was a problem submitting your registration.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderForm = () => {
    if (isSubmitting) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner size="lg" />
          <p className="mt-4 text-lg">Submitting your registration...</p>
        </div>
      );
    }

    if (submissionError) {
      return (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {submissionError}
              <div className="mt-2">Please try again or contact support.</div>
            </AlertDescription>
          </Alert>
          <div className="flex justify-center space-x-4 pt-4">
            <button onClick={() => setSubmissionError(null)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Back to Form</button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Try Again</button>
          </div>
        </div>
      );
    }

    switch (step) {
      case 1: return <WelcomePage nextStep={nextStep} />;
      case 2: return <CombinedNamePeopleForm formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />;
      case 3: return <CombinedPurposeDurationForm formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />;
      case 4: return <CombinedContactAddressForm formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />;
      case 5: return <UploadForm formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />;
      case 6: return <SignatureForm formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />;
      case 7: return <ConfirmationPage formData={formData} prevStep={prevStep} handleSubmit={handleSubmit} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/lovable-uploads/1221534f-c2c7-4956-a2d9-7904946b648b.png')", backgroundAttachment: "fixed" }}>
      <div className="min-h-screen bg-black/40 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-lg shadow-xl">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">Campus Registration Form</h2>
              <p className="mt-2 text-sm text-gray-600">Step {step} of 7: {getStepName(step)}</p>
              <div className="w-full bg-gray-200 h-2 mt-4 rounded-full">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(step / 7) * 100}%` }}></div>
              </div>
            </div>
            {renderForm()}
          </div>
        </div>
      </div>
    </div>
  );
};

const getStepName = (step: number): string => {
  switch (step) {
    case 1: return "Welcome to Woodstock School";
    case 2: return "Visitor Information";
    case 3: return "Purpose & Duration";
    case 4: return "Contact & Address";
    case 5: return "Upload Photo";
    case 6: return "Signature";
    case 7: return "Review & Submit";
    default: return "";
  }
};

export default Index;
