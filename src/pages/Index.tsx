
import React, { useState } from "react";
import WelcomePage from "@/components/WelcomePage";
import NameForm from "@/components/NameForm";
import PeopleInfoForm from "@/components/PeopleInfoForm";
import PurposeForm from "@/components/PurposeForm";
import DurationForm from "@/components/DurationForm";
import ContactInfoForm from "@/components/ContactInfoForm";
import AddressForm from "@/components/AddressForm";
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
  const [formData, setFormData] = useState<FormDataInput>({
    visitorName: "",
    schoolName: "Woodstock School", // Default school name
    numberOfPeople: 1,
    people: [{ name: "", role: "" }],
    purpose: "",
    otherPurpose: "",
    startTime: "",
    endTime: null as string | null, // Optional end time
    phoneNumber: "",
    address: {
      city: "",
      state: "",
      country: "India", // Default country selection
    },
    picture: null as File | string | null,
    signature: null as File | string | null,
  });

  const updateFormData = (data: Partial<FormDataInput>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (step < 10) {
      let nextStepValue = step + 1;
      setStep(nextStepValue);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      let prevStepValue = step - 1;
      setStep(prevStepValue);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmissionError(null);
      console.log("Submitting form data:", formData);
      
      // Save form data to Supabase
      const savedEntry = await saveFormData(formData);
      console.log("Form data saved:", savedEntry);
      
      // Notify admin about the new entry
      notifyAdmin(savedEntry);
      
      toast({
        title: "Registration Complete",
        description: "Your registration has been submitted successfully!",
      });
      
      // Request notification permission for demo purposes
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      // Reset form after submission
      setStep(1);
      setFormData({
        visitorName: "",
        schoolName: "Woodstock School",
        numberOfPeople: 1,
        people: [{ name: "", role: "" }],
        purpose: "",
        otherPurpose: "",
        startTime: "",
        endTime: null,
        phoneNumber: "",
        address: {
          city: "",
          state: "",
          country: "India",
        },
        picture: null,
        signature: null,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      
      // Extract meaningful error message if available
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
              <div className="mt-2">
                Please try again or contact support.
              </div>
            </AlertDescription>
          </Alert>
          <div className="flex justify-center space-x-4 pt-4">
            <button 
              onClick={() => setSubmissionError(null)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Back to Form
            </button>
            <button 
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    switch (step) {
      case 1:
        return <WelcomePage nextStep={nextStep} />;
      case 2:
        return (
          <NameForm
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 3:
        return (
          <PeopleInfoForm
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 4:
        return (
          <PurposeForm
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 5:
        return (
          <DurationForm
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 6:
        return (
          <ContactInfoForm
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 7:
        return (
          <AddressForm
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 8:
        return (
          <UploadForm
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 9:
        return (
          <SignatureForm
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 10:
        return (
          <ConfirmationPage
            formData={formData}
            prevStep={prevStep}
            handleSubmit={handleSubmit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('/lovable-uploads/1221534f-c2c7-4956-a2d9-7904946b648b.png')",
        backgroundAttachment: "fixed"
      }}
    >
      <div className="min-h-screen bg-black/40 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-lg shadow-xl">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Campus Registration Form
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Step {step} of 10: {getStepName(step)}
              </p>
              <div className="w-full bg-gray-200 h-2 mt-4 rounded-full">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 10) * 100}%` }}
                ></div>
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
    case 1:
      return "Welcome to Woodstock School";
    case 2:
      return "Your Name";
    case 3:
      return "Additional Visitors";
    case 4:
      return "Purpose of Visit";
    case 5:
      return "Visit Duration";
    case 6:
      return "Contact Details";
    case 7:
      return "Address Information";
    case 8:
      return "Upload Photo";
    case 9:
      return "Signature";
    case 10:
      return "Review & Submit";
    default:
      return "";
  }
};

export default Index;
