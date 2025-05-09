
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Signature } from "lucide-react";

interface SignatureFormProps {
  formData: {
    signature: File | null;
  };
  updateFormData: (data: Partial<typeof formData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const SignatureForm: React.FC<SignatureFormProps> = ({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(
    formData.signature ? URL.createObjectURL(formData.signature) : null
  );
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.signature && canvasRef.current) {
      // If no signature has been saved yet, save the current canvas state
      saveSignature();
    }
    nextStep();
  };
  
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.beginPath();
    
    // Get the correct position based on the event type
    const pos = getEventPosition(e, canvas);
    if (pos) {
      ctx.moveTo(pos.x, pos.y);
    }
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const pos = getEventPosition(e, canvas);
    if (pos) {
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#000";
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
  };
  
  const getEventPosition = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      // Mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };
  
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignaturePreview(null);
    updateFormData({ signature: null });
  };
  
  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "signature.png", { type: "image/png" });
        updateFormData({ signature: file });
        setSignaturePreview(URL.createObjectURL(blob));
      }
    });
  };
  
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Clear any existing signature when component mounts or is reset
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };
  
  // Initialize canvas when component mounts
  React.useEffect(() => {
    initCanvas();
  }, []);
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Signature</h3>
          <p className="text-sm text-gray-500 mt-1">Please sign below</p>
        </div>
        
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            {signaturePreview ? (
              <div className="flex flex-col items-center">
                <img
                  src={signaturePreview}
                  alt="Signature"
                  className="border rounded-md bg-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearSignature}
                  className="mt-4"
                >
                  Clear Signature
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={150}
                  className="border border-gray-300 rounded-md bg-white touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                <div className="flex space-x-2 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearSignature}
                  >
                    Clear
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={saveSignature}
                  >
                    Save Signature
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
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
            <Signature className="mr-2 h-4 w-4" />
            Continue
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SignatureForm;
