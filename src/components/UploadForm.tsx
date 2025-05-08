
import React, { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface UploadFormProps {
  formData: {
    picture: File | null;
    signature: File | null;
  };
  updateFormData: (data: Partial<typeof formData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const UploadForm: React.FC<UploadFormProps> = ({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}) => {
  const pictureInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: "picture" | "signature"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size should be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (fileType === "picture") {
        setPicturePreview(e.target?.result as string);
        updateFormData({ picture: file });
      } else {
        setSignaturePreview(e.target?.result as string);
        updateFormData({ signature: file });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.picture || !formData.signature) {
      toast({
        title: "Missing Files",
        description: "Please upload both a picture and signature",
        variant: "destructive",
      });
      return;
    }
    
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="space-y-4">
          <Label htmlFor="picture">Upload Picture</Label>
          <div className="flex flex-col items-center">
            {picturePreview ? (
              <div className="mb-4">
                <img
                  src={picturePreview}
                  alt="Preview"
                  className="h-40 w-40 object-cover rounded-md"
                />
              </div>
            ) : (
              <div className="mb-4 h-40 w-40 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50">
                <span className="text-sm text-gray-500">No picture selected</span>
              </div>
            )}
            <input
              ref={pictureInputRef}
              id="picture"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, "picture")}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => pictureInputRef.current?.click()}
            >
              {picturePreview ? "Change Picture" : "Select Picture"}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Label htmlFor="signature">Upload Signature</Label>
          <div className="flex flex-col items-center">
            {signaturePreview ? (
              <div className="mb-4">
                <img
                  src={signaturePreview}
                  alt="Signature"
                  className="h-20 max-w-full object-contain rounded-md"
                />
              </div>
            ) : (
              <div className="mb-4 h-20 w-full border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50">
                <span className="text-sm text-gray-500">No signature selected</span>
              </div>
            )}
            <input
              ref={signatureInputRef}
              id="signature"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, "signature")}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => signatureInputRef.current?.click()}
            >
              {signaturePreview ? "Change Signature" : "Select Signature"}
            </Button>
          </div>
        </div>

        <div className="pt-4 flex space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            className="flex-1"
          >
            Back
          </Button>
          <Button type="submit" className="flex-1">
            Continue
          </Button>
        </div>
      </div>
    </form>
  );
};

export default UploadForm;
