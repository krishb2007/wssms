
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Signature } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface SignatureFormProps {
  formData: {
    signature: File | string | null;
  };
  updateFormData: (data: Partial<{ signature: File | string | null }>) => void;
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
    formData.signature && typeof formData.signature !== 'string' 
      ? URL.createObjectURL(formData.signature as File)
      : typeof formData.signature === 'string' ? formData.signature : null
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
          <p className="text-sm text-gray-500 mt-1">Please sign the Student Protection Form</p>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="policy">
            <AccordionTrigger className="text-blue-600">
              Read Student Protection Policy
            </AccordionTrigger>
           <AccordionContent>
  <div className="text-sm text-gray-700 space-y-3 px-1 py-2">
    <p>
      <strong>Woodstock School Student Protection Policy</strong>
    </p>
    <p>
      I hereby acknowledge and understand the Importance of adhering to
      Woodstock School's Child Protection Policy and the provisions of the POCSO Act 2012.
      I commit to following the guidelines outlined below:
    </p>
    <ol className="list-decimal ml-4 mt-2 space-y-1">
      <li>
        Protection of Children: The POCSO Act Is designed to protect children
        (under 18 years of age) from sexual offences, including sexual harassment,
        assault, and exploitation.
      </li>
      <li>
        Mandatory Reporting: Any suspicion or knowledge of an offence against a child must
        be reported to the authorities. Failure to report such an incident is a punishable offence.
      </li>
      <li>
        Child-Friendly Procedures: The Act ensures that all legal proceedings are conducted
        in a manner that is child-friendly and that the privacy and dignity of the child are respected.
      </li>
      <li>
        Punishable Offences: The Act covers a wide range of offences, including penetrative
        sexual assault, sexual harassment, and use of a child for pornography, all of which carry
        severe penalties.
      </li>
      <li>
        No Tolerance Policy: The school maintains a strict no-tolerance policy regarding any
        form of child abuse or exploitation or behavior that's unacceptable in the presence of
        children like smoking, using abusive and inappropriate language, consuming alcohol, or
        visiting the campus in an inebriated condition.
      </li>
    </ol>
    <p className="mt-2">
      Please be mindful of privacy (taking pictures and uploading them on social media)
      and physical contact with children.
    </p>
    <p>
      The school reserves the right to refuse or terminate your visit at any time if these
      guidelines are not respected.
    </p>
  </div>
</AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <Card className="overflow-hidden mt-4">
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
