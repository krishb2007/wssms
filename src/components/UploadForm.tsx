
import React, { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Camera, Signature } from "lucide-react";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showCamera, setShowCamera] = useState(true); // Auto-start camera
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  // Auto-start camera on component mount
  useEffect(() => {
    setupCamera();
    initializeSignaturePad();
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

  // Signature pad
  const initializeSignaturePad = () => {
    if (signatureCanvasRef.current) {
      const canvas = signatureCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = "black";
      }
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const { x, y } = getPointerPosition(e);
    setLastPos({ x, y });
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !signatureCanvasRef.current) return;
    
    const ctx = signatureCanvasRef.current.getContext("2d");
    if (!ctx) return;
    
    const { x, y } = getPointerPosition(e);
    
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    setLastPos({ x, y });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    
    if (signatureCanvasRef.current) {
      signatureCanvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "signature.png", { type: "image/png" });
          updateFormData({ signature: file });
          setSignaturePreview(URL.createObjectURL(blob));
        }
      });
    }
  };

  const getPointerPosition = (e: React.MouseEvent | React.TouchEvent) => {
    if (!signatureCanvasRef.current) return { x: 0, y: 0 };
    
    const rect = signatureCanvasRef.current.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      // Touch event
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      // Mouse event
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    return { x, y };
  };

  const clearSignature = () => {
    if (signatureCanvasRef.current) {
      const ctx = signatureCanvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, signatureCanvasRef.current.width, signatureCanvasRef.current.height);
        setSignaturePreview(null);
        updateFormData({ signature: null });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.picture || !formData.signature) {
      toast({
        title: "Missing Files",
        description: "Please provide both a picture and signature",
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
                  onClick={setupCamera}
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

        <div className="space-y-4">
          <Label htmlFor="signature">Your Signature</Label>
          <div className="flex flex-col items-center">
            <div className="w-full border-2 border-gray-300 rounded-lg bg-white">
              <canvas 
                ref={signatureCanvasRef} 
                width="400" 
                height="150" 
                className="w-full touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            <div className="mt-2 flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={clearSignature}
                className="mt-2"
              >
                <Signature className="mr-2" /> Clear Signature
              </Button>
            </div>
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
