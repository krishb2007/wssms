import React, { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Camera } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

  const [mode, setMode] = useState<"camera" | "preview">("camera");
  const [picturePreview, setPicturePreview] = useState<string | null>(
    formData.picture && typeof formData.picture !== 'string'
      ? URL.createObjectURL(formData.picture as File)
      : typeof formData.picture === 'string' ? formData.picture : null
  );

  // Helper: Stop any video stream
  const stopStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      console.log("Stopped previous video stream");
    }
  };

  // Camera setup
  const setupCamera = async () => {
    stopStream(); // Always stop any previous stream first

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log("Camera started, stream set");
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

  // Auto-start camera on mount
  useEffect(() => {
    if (mode === "camera") {
      setupCamera();
    }
    // Cleanup on unmount
    return () => stopStream();
    // eslint-disable-next-line
  }, [mode]);

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "photo.png", { type: "image/png" });
            updateFormData({ picture: file });
            setPicturePreview(URL.createObjectURL(blob));
            stopStream();
            setMode("preview");
            console.log("Picture taken, switched to preview");
          }
        });
      }
    }
  };

  const handleRetakePhoto = () => {
    setPicturePreview(null);
    setMode("camera"); // This will trigger useEffect and setupCamera
    console.log("Retake Photo clicked: Switching to camera mode");
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
            {mode === "camera" ? (
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
                <Dialog>
                  <DialogTrigger asChild>
                    <img
                      src={picturePreview}
                      alt="Preview"
                      className="h-64 w-full object-contain rounded-lg cursor-pointer border border-gray-300"
                    />
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Photo Preview</DialogTitle>
                    </DialogHeader>
                    <img
                      src={picturePreview}
                      alt="Preview"
                      className="w-full h-auto object-contain rounded-lg max-h-[80vh]"
                    />
                  </DialogContent>
                </Dialog>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRetakePhoto}
                  className="mt-4"
                >
                  Retake Photo
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                onClick={() => setMode("camera")}
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
