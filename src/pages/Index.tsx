
import React, { useState } from "react";
import WelcomePage from "@/components/WelcomePage";
import NameForm from "@/components/NameForm";
import NumberOfPeopleForm from "@/components/NumberOfPeopleForm"; 
import PeopleInfoForm from "@/components/PeopleInfoForm";
import PurposeForm from "@/components/PurposeForm";
import DurationForm from "@/components/DurationForm";
import ContactInfoForm from "@/components/ContactInfoForm";
import AddressForm from "@/components/AddressForm";
import UploadForm from "@/components/UploadForm";
import SignatureForm from "@/components/SignatureForm";
import ConfirmationPage from "@/components/ConfirmationPage";
import { toast } from "@/components/ui/use-toast";
import { saveFormData, notifyAdmin } from "@/services/formDataService";

const Index = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    visitorName: "",
    schoolName: "Woodstock School", // Default school name
    numberOfPeople: 1,
    people: [{ name: "", role: "" }],
    purpose: "",
    otherPurpose: "",
    startTime: "",
    endTime: "",
    phoneNumber: "",
    verifiedOtp: false,
    address: {
      city: "",
      state: "",
      country: "India", // Default country selection
    },
    picture: null as File | string | null,
    signature: null as File | string | null,
  });

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (step < 11) {
      let nextStepValue = step + 1;
      
      // Skip "PeopleInfoForm" if only 1 person
      if (step === 3 && formData.numberOfPeople === 1) {
        nextStepValue = 5; // Skip to purpose form
      }
      
      setStep(nextStepValue);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      let prevStepValue = step - 1;
      
      // Skip back over "PeopleInfoForm" if only 1 person
      if (step === 5 && formData.numberOfPeople === 1) {
        prevStepValue = 3; // Go back to number of people form
      }
      
      setStep(prevStepValue);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    try {
      // Save form data to our "database"
      const savedEntry = saveFormData(formData as any);
      
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
        endTime: "",
        phoneNumber: "",
        verifiedOtp: false,
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
      toast({
        title: "Error",
        description: "There was a problem submitting your registration.",
        variant: "destructive",
      });
    }
  };

  const renderForm = () => {
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
          <NumberOfPeopleForm
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 4:
        return (
          <PeopleInfoForm
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 5:
        return (
          <PurposeForm
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 6:
        return (
          <DurationForm
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 7:
        return (
          <ContactInfoForm
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 8:
        return (
          <AddressForm
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 9:
        return (
          <UploadForm
            formData={formData}
            updateFormData={updateFormData as any}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 10:
        return (
          <SignatureForm
            formData={formData}
            updateFormData={updateFormData as any}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 11:
        return (
          <ConfirmationPage
            formData={formData as any}
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
                Step {step} of 11: {getStepName(step)}
              </p>
              <div className="w-full bg-gray-200 h-2 mt-4 rounded-full">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 11) * 100}%` }}
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
      return "Number of Visitors";
    case 4:
      return "Additional Visitors";
    case 5:
      return "Purpose of Visit";
    case 6:
      return "Visit Duration";
    case 7:
      return "Contact Details";
    case 8:
      return "Address Information";
    case 9:
      return "Upload Photo";
    case 10:
      return "Signature";
    case 11:
      return "Review & Submit";
    default:
      return "";
  }
};

export default Index;
