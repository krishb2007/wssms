
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

interface PurposeFormProps {
  formData: {
    purpose: string;
    otherPurpose: string;
    staffEmail: string;
  };
  updateFormData: (data: Partial<{ purpose: string; otherPurpose: string; staffEmail: string }>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const PurposeForm: React.FC<PurposeFormProps> = ({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.purpose === "other" && !formData.otherPurpose) {
      toast({
        title: "Information required",
        description: "Please specify your purpose of visit",
        variant: "destructive"
      });
      return;
    }
    if (formData.purpose === "meeting_school_staff" && !formData.staffEmail) {
      toast({
        title: "Information required",
        description: "Please enter the staff email address",
        variant: "destructive"
      });
      return;
    }
    nextStep();
  };

  return (
    <CardContent>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Purpose of Visit</Label>
            <RadioGroup
              value={formData.purpose}
              onValueChange={(value) => updateFormData({ purpose: value })}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="alumni" id="alumni" />
                <Label htmlFor="alumni">Alumni</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="work" id="work" />
                <Label htmlFor="work">Work</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tourism" id="tourism" />
                <Label htmlFor="tourism">Tourism</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sports" id="sports" />
                <Label htmlFor="sports">Sports</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="meeting" id="meeting" />
                <Label htmlFor="meeting">Meeting</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="official_visit" id="official_visit" />
                <Label htmlFor="official_visit">Official Visit</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="student_visit" id="student_visit" />
                <Label htmlFor="student_visit">Student Visit</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="meeting_school_staff" id="meeting_school_staff" />
                <Label htmlFor="meeting_school_staff">Meeting School Staff</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.purpose === "meeting_school_staff" && (
            <div className="space-y-2">
              <Label htmlFor="staffEmail">Staff Email Address:</Label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Input
                    id="staffEmail"
                    type="text"
                    value={formData.staffEmail ? formData.staffEmail.replace("@woodstock.ac.in", "") : ""}
                    onChange={(e) => {
                      const username = e.target.value.replace("@woodstock.ac.in", "");
                      updateFormData({ staffEmail: username + "@woodstock.ac.in" });
                    }}
                    placeholder="Enter staff username"
                    required={formData.purpose === "meeting_school_staff"}
                    className="rounded-r-none"
                  />
                  <div className="bg-muted px-3 py-2 text-sm text-muted-foreground border border-l-0 rounded-r-md">
                    @woodstock.ac.in
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Or enter full email address:
                </div>
                <Input
                  type="email"
                  value={formData.staffEmail || ""}
                  onChange={(e) => updateFormData({ staffEmail: e.target.value })}
                  placeholder="staff@example.com"
                />
              </div>
            </div>
          )}

          {formData.purpose === "other" && (
            <div className="space-y-2">
              <Label htmlFor="otherPurpose">Please specify:</Label>
              <Input
                id="otherPurpose"
                value={formData.otherPurpose}
                onChange={(e) =>
                  updateFormData({ otherPurpose: e.target.value })
                }
                placeholder="Enter purpose of visit"
                required={formData.purpose === "other"}
              />
            </div>
          )}

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
    </CardContent>
  );
};

export default PurposeForm;
