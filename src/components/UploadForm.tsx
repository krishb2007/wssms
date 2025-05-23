import React, { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Camera } from "lucide-react";

interface UploadFormProps {
  formData: {
    picture: File | string | null;
  };
  updateFormData: (data: Partial<{ picture: File | string | null }>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const UploadForm: React.FC<UploadFormProps> = ({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [picturePreview, setPicturePreview] = useState<string | null>(
    formData.picture && typeof formData.picture !== 'string'
      ? URL.createObjectURL(formData.picture as File)
      : typeof formData.picture === 'string' ? formData.picture : null
  );
  const [showCamera, setShowCamera] = useState(true); // Auto-start camera

  // Auto-start camera on component mount
  useEffect(() => {
    setupCamera();
    // eslint-disable-next-line
  }, []);

  // Camera setup
  const setupCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (err) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
      console.error("Error accessing camera:", err);
    }
  };

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        // Match canvas size to video
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;

        // Draw the video frame to the canvas
        context.drawImage(videoRef.current, 0, 0);

        // Convert to data URL and then to file
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "photo.png", { type: "image/png" });
            updateFormData({ picture: file });
            setPicturePreview(URL.createObjectURL(blob));

            // Stop all video tracks
            if (videoRef.current && videoRef.current.srcObject) {
              const stream = videoRef.current.srcObject as MediaStream;
              stream.getTracks().forEach(track => track.stop());
              videoRef.current.srcObject = null;
            }
            setShowCamera(false);
          }
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.picture) {
      toast({
        title: "Missing Photo",
        description: "Please provide your photograph",
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
          <Label htmlFor="picture">Your Photograph</Label>
          <div className="flex flex-col items-center">
            {showCamera ? (
              <div className="relative w-full">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg border border-gray-300"
                />
                <Button
                  type="button"
                  onClick={takePicture}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                >
                  <Camera className="mr-2" /> Capture Photo
                </Button>
              </div>
            ) : picturePreview ? (
              <div className="w-full">
                <img
                  src={picturePreview}
                  alt="Preview"
                  className="h-64 w-full object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    console.log("Retake Photo clicked");
                    setShowCamera(true);
                    setPicturePreview(null);
                    setTimeout(() => {
                      console.log("Calling setupCamera()");
                      setupCamera();
                    }, 0);
                  }}
                  className="mt-4"
                >
                  Retake Photo
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                onClick={setupCamera}
                className="flex items-center"
              >
                <Camera className="mr-2" /> Open Camera
              </Button>
            )}
            <canvas ref={canvasRef} className="hidden" />
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
