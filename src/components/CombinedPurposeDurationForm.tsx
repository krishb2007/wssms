
import React, { useEffect, useState, useRef, useMemo } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Clock, Plus, X } from "lucide-react";
import { format } from "date-fns";

const STAFF_NAMES = [
  "AanchalNegi","AaronShangne","AbdulRehman","AbhishekKumar","AdityaManral","AfrozAnjum","AishwaryaDasappa","AjayNegi","AkashKar","AkashTuli","AkshayShah","AlokeMaiti","AlpanaPathak","AmritaJohn","AndrewDas","AndrewStuart-Watson","AndriyYanovych","AniruddhUpadhyay","AnjanaMenon","AnjanaSharma","AnneMcgregor","AnthonyHyde","AntonioMelgar","AnupamaMukherjee","AnushaTuli","AnusuyaVijay","AnveshThapa","ArpanaFernandes","ArpanaMalhotra","AshishLuthra","AzadSingh","BlairLee","BormaniDevi","BrigitteConcessio","BrijeshTyagi","CeciliaCastro","ChelseaKorth","ChrisantaEly","ChristopherMartin","ClaireBrady","ComfortAnkutse","CristianRuiz","CristinaSantiago","DanKoopLiechty","DarabNagarwalla","DavidFrederick","DavidWilliamson","DeborrahMondle","DeunKim","DharmendraBhandari","DheeraSingla","DipikaSharma","DishaAggarwal","DuncanOwich","EktaJohn","EldriMeintjes","EnoshThomas","EshaGeorge","EthanBaker","GauravRawat","GirirajShekhawat","GodwinKomora","GurdeepGrover","HarshBajaj","HimanshuHalve","HutenLaldailova","ImtiazRai","IngMariePutka","JaclynDuellman","JacobHorsey","JamesTuffs","JenniferBelz","JenniferFrederick","JerushaMissal","JessicaLall","JitendraSingh","JoelFord","JoonaSheel","JordanKorth","JustineOliver","KalpanaSingh","KamalThapa","KarenLloyd","KaterinaVackova","KetanSwami","KiranSingh","KleinVerHill","KristenRichardson","KuldeepBhandari","KuvengoluKhamo","LanieGaitan","LaureneGuirette","LekhaMukherjee","LimeeshiBhaskaram","MaggieHolmesheoran","ManishaDogra","MariaLusardi","MariaPrieto","MarkCrowell","MarkWindsor","MartaSzypczynska","MerlineJesudoss","MilanSudzuk","ModesteDate","MohammadJamaal","MohdYousuf","MohitHolmesheoran","NalayiniNantha","NehaSingh","NehaSwami","OksanaSielina","PeshumhringHuten","PholkanLukhu","PoojaAggarwal","PoojaSharma","PoonamSharma","PoushaliBanerjee","PrabinRai","PrarthanaSingh","PrasannaBoddapati","PrashantSingh","PrateekSantram","PravinJelaji","PreetiBhandari","PrernaGadve","PriyankaNagalia","PriyaRollins","PruthiviPanda","RaakheeGumireddy","RachnaPeter","RahimaThomas","RajatBhog","RangariraiMagudu","RaveeshDogra","RaviArthur","RenuOberoi","RohitSharma","RonitaDaniel","RuthBroome","RuthKalsang","SaffronToms","SamuelDzongor","SanchaliChakraborty","SandeepRawat","SangayOhm","SangeetaBhandari","SanketShitole","SarahKhan","SarahThomas","SareenaPun","SenoluDawhuo","ShadabBegum","ShailenderBhandari","ShaileshGarg","SheetalWaller","ShivaniSapehia","ShoaibAli","ShreyNagalia","SonamThomas","SonamTshering","SondeepPeter","SongSeokin","SrinivasGopal","StellaDate","SudhirMendiratta","SumanMitra","SunilBaloni","SunilKumar","SunitaPanwar","SureshChand","SwatiRoy","SwetaGarg","TafadzwaChibade","TanuPathak","TanyaGurung","TanyaMarathe","TheresaJoseph","ThomasJacob","TriptiRathore","TseringMalik","TwylaSpiller","UpasnaGhale","VimmiDang","VinodBhandari","VipulVashistha","VishalNegi","VivekWilliam","YunJiKwak","ZohraJohn"
];

export interface StaffMeetingTime {
  email: string;
  startTime: string;
  endTime: string | null;
}

interface CombinedPurposeDurationFormProps {
  formData: {
    purpose: string;
    otherPurpose: string;
    staffEmail: string;
    staffEmails: string[];
    startTime: string;
    meetingStaffTimes?: StaffMeetingTime[];
  };
  updateFormData: (data: Partial<{ 
    purpose: string; 
    otherPurpose: string;
    staffEmail: string;
    staffEmails: string[];
    startTime: string;
    meetingStaffTimes: StaffMeetingTime[];
  }>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

// Single staff entry component
const StaffEmailEntry: React.FC<{
  value: string;
  onChange: (val: string) => void;
  onRemove?: () => void;
  showRemove: boolean;
  required: boolean;
  meetingStartTime?: string;
  onMeetingStartTimeChange?: (val: string) => void;
  showMeetingTime: boolean;
}> = ({ value, onChange, onRemove, showRemove, required, meetingStartTime, onMeetingStartTimeChange, showMeetingTime }) => {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [mode, setMode] = useState<"staff" | "custom">("staff");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value?.includes("@woodstock.ac.in")) {
      setSearch(value.replace("@woodstock.ac.in", ""));
      setMode("staff");
    } else if (value && !value.includes("@woodstock.ac.in")) {
      setMode("custom");
    }
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = useMemo(() => {
    if (!search) return STAFF_NAMES.slice(0, 10);
    const lower = search.toLowerCase();
    return STAFF_NAMES.filter(name => name.toLowerCase().includes(lower)).slice(0, 10);
  }, [search]);

  return (
    <div className="space-y-2 p-3 border border-border rounded-md bg-muted/30">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Staff member</span>
        {showRemove && (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="h-6 w-6 p-0">
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center">
          <Input
            type="text"
            value={search}
            onChange={(e) => {
              const username = e.target.value.replace("@woodstock.ac.in", "");
              setSearch(username);
              setShowDropdown(true);
              setMode("staff");
              if (username.trim()) {
                onChange(username + "@woodstock.ac.in");
              } else {
                onChange("");
              }
            }}
            onFocus={() => { setShowDropdown(true); setMode("staff"); }}
            placeholder="Type staff name..."
            required={required}
            className="rounded-r-none"
            autoComplete="off"
          />
          <div className="bg-muted px-3 py-2 text-sm text-muted-foreground border border-l-0 rounded-r-md whitespace-nowrap h-10 flex items-center">
            @woodstock.ac.in
          </div>
        </div>
        {showDropdown && filtered.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
            {filtered.map((name) => (
              <button
                key={name}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => {
                  setSearch(name);
                  onChange(name + "@woodstock.ac.in");
                  setShowDropdown(false);
                }}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="text-xs text-muted-foreground">Or enter full email:</div>
      <Input
        type="email"
        value={mode === "custom" ? value : ""}
        onChange={(e) => {
          onChange(e.target.value);
          setSearch("");
          setMode("custom");
        }}
        placeholder="staff@example.com"
      />
      {showMeetingTime && (
        <div className="mt-2 space-y-1">
          <Label className="text-xs">Meeting Start Time for this staff:</Label>
          <Input
            type="datetime-local"
            value={meetingStartTime || ""}
            onChange={(e) => onMeetingStartTimeChange?.(e.target.value)}
            required
          />
        </div>
      )}
    </div>
  );
};

const CombinedPurposeDurationForm: React.FC<CombinedPurposeDurationFormProps> = ({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}) => {
  const [duration, setDuration] = useState<string>("");

  // Initialize staffEmails from staffEmail if needed
  useEffect(() => {
    if (formData.staffEmail && (!formData.staffEmails || formData.staffEmails.length === 0)) {
      updateFormData({ staffEmails: [formData.staffEmail] });
    }
  }, []);

  useEffect(() => {
    if (!formData.startTime) {
      const now = new Date();
      const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      const formattedDateTime = istTime.toISOString().slice(0, 16);
      updateFormData({ startTime: formattedDateTime });
    }
  }, []);

  const staffEmails = formData.staffEmails && formData.staffEmails.length > 0 
    ? formData.staffEmails 
    : [""];

  const meetingStaffTimes = formData.meetingStaffTimes || [];

  const updateStaffEmail = (index: number, value: string) => {
    const updated = [...staffEmails];
    updated[index] = value;
    // Sync meeting staff times
    const updatedTimes = [...meetingStaffTimes];
    if (updatedTimes[index]) {
      updatedTimes[index] = { ...updatedTimes[index], email: value };
    } else {
      updatedTimes[index] = { email: value, startTime: index === 0 ? formData.startTime : "", endTime: null };
    }
    updateFormData({ staffEmails: updated, staffEmail: updated[0] || "", meetingStaffTimes: updatedTimes });
  };

  const updateStaffMeetingTime = (index: number, startTime: string) => {
    const updatedTimes = [...meetingStaffTimes];
    if (updatedTimes[index]) {
      updatedTimes[index] = { ...updatedTimes[index], startTime };
    } else {
      updatedTimes[index] = { email: staffEmails[index] || "", startTime, endTime: null };
    }
    updateFormData({ meetingStaffTimes: updatedTimes });
  };

  const addStaffEntry = () => {
    const newEmails = [...staffEmails, ""];
    const newTimes = [...meetingStaffTimes, { email: "", startTime: "", endTime: null }];
    updateFormData({ staffEmails: newEmails, meetingStaffTimes: newTimes });
  };

  const removeStaffEntry = (index: number) => {
    const updated = staffEmails.filter((_, i) => i !== index);
    const updatedTimes = meetingStaffTimes.filter((_, i) => i !== index);
    updateFormData({ staffEmails: updated, staffEmail: updated[0] || "", meetingStaffTimes: updatedTimes });
  };

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
    if (formData.purpose === "meeting_school_staff") {
      const validEmails = staffEmails.filter(e => e.trim());
      if (validEmails.length === 0) {
        toast({
          title: "Information required",
          description: "Please enter at least one staff email address",
          variant: "destructive"
        });
        return;
      }
    }
    nextStep();
  };

  const formatTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return format(date, 'hh:mm a');
  };
  
  const getCurrentDateIST = () => {
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    return format(istTime, 'EEEE, MMMM d, yyyy');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Purpose & Duration</h3>

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
          <div className="space-y-3">
            <Label>Staff Email Address(es):</Label>
            {staffEmails.map((email, index) => (
              <StaffEmailEntry
                key={index}
                value={email}
                onChange={(val) => updateStaffEmail(index, val)}
                onRemove={() => removeStaffEntry(index)}
                showRemove={staffEmails.length > 1}
                required={index === 0}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addStaffEntry}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Another Staff Member
            </Button>
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

        <div className="pt-4 border-t border-gray-200 mt-6">
          <h4 className="text-lg font-medium">Visit Duration</h4>
          
          <div className="text-sm text-gray-500 mb-4">
            Today: {getCurrentDateIST()}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time (Current)</Label>
            <div className="bg-gray-100 p-3 rounded border">
              {formatTime(formData.startTime)}
            </div>
            <p className="text-xs text-gray-500">
              Your visit starts now
            </p>
          </div>
          
          {duration && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 flex items-center mt-4">
              <Clock className="h-4 w-4 text-blue-500 mr-2" />
              <div>
                <p className="text-sm text-blue-700">Visit Duration:</p>
                <p className="font-medium">{duration}</p>
              </div>
            </div>
          )}
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
            <Clock className="mr-2 h-4 w-4" />
            Continue
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CombinedPurposeDurationForm;
