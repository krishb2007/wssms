
import React, { useState } from "react";
import SchoolInfoForm from "@/components/SchoolInfoForm";
import ContactInfoForm from "@/components/ContactInfoForm";
import PeopleInfoForm from "@/components/PeopleInfoForm";
import AddressForm from "@/components/AddressForm";
import UploadForm from "@/components/UploadForm";
import ConfirmationPage from "@/components/ConfirmationPage";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    schoolName: "",
    numberOfPeople: 1,
    people: [{ name: "", role: "" }],
    phoneNumber: "",
    verifiedOtp: false,
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    picture: null,
    signature: null,
  });

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (step < 6) {
      setStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = () => {
    // Here you would typically send the data to your backend
    console.log("Final form data:", formData);
    toast({
      title: "Registration Complete",
      description: "Your school registration has been submitted successfully!",
    });
  };

  // Render the appropriate form based on the current step
  const renderForm = () => {
    switch (step) {
      case 1:
        return (
          <SchoolInfoForm
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
          />
        );
      case 2:
        return (
          <PeopleInfoForm
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 3:
        return (
          <ContactInfoForm
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 4:
        return (
          <AddressForm
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 5:
        return (
          <UploadForm
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 6:
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
                Campus Connect Capture
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Step {step} of 6: {getStepName(step)}
              </p>
              <div className="w-full bg-gray-200 h-2 mt-4 rounded-full">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 6) * 100}%` }}
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

// Helper function to get step name
const getStepName = (step: number): string => {
  switch (step) {
    case 1:
      return "School Information";
    case 2:
      return "People Information";
    case 3:
      return "Contact Details";
    case 4:
      return "Address Information";
    case 5:
      return "Documents Upload";
    case 6:
      return "Review & Submit";
    default:
      return "";
  }
};

export default Index;
