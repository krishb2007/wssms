
import React, { useEffect, useState, useRef, useMemo } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Clock, ArrowRightLeft } from "lucide-react";
import { format, differenceInMinutes } from "date-fns";

const STAFF_NAMES = [
  "AanchalNegi","AaronShangne","AbdulRehman","AbhishekKumar","AdityaManral","AfrozAnjum","AishwaryaDasappa","AjayNegi","AkashKar","AkashTuli","AkshayShah","AlokeMaiti","AlpanaPathak","AmritaJohn","AndrewDas","AndrewStuart-Watson","AndriyYanovych","AniruddhUpadhyay","AnjanaMenon","AnjanaSharma","AnneMcgregor","AnthonyHyde","AntonioMelgar","AnupamaMukherjee","AnushaTuli","AnusuyaVijay","AnveshThapa","ArpanaFernandes","ArpanaMalhotra","AshishLuthra","AzadSingh","BlairLee","BormaniDevi","BrigitteConcessio","BrijeshTyagi","CeciliaCastro","ChelseaKorth","ChrisantaEly","ChristopherMartin","ClaireBrady","ComfortAnkutse","CristianRuiz","CristinaSantiago","DanKoopLiechty","DarabNagarwalla","DavidFrederick","DavidWilliamson","DeborrahMondle","DeunKim","DharmendraBhandari","DheeraSingla","DipikaSharma","DishaAggarwal","DuncanOwich","EktaJohn","EldriMeintjes","EnoshThomas","EshaGeorge","EthanBaker","GauravRawat","GirirajShekhawat","GodwinKomora","GurdeepGrover","HarshBajaj","HimanshuHalve","HutenLaldailova","ImtiazRai","IngMariePutka","JaclynDuellman","JacobHorsey","JamesTuffs","JenniferBelz","JenniferFrederick","JerushaMissal","JessicaLall","JitendraSingh","JoelFord","JoonaSheel","JordanKorth","JustineOliver","KalpanaSingh","KamalThapa","KarenLloyd","KaterinaVackova","KetanSwami","KiranSingh","KleinVerHill","KristenRichardson","KuldeepBhandari","KuvengoluKhamo","LanieGaitan","LaureneGuirette","LekhaMukherjee","LimeeshiBhaskaram","MaggieHolmesheoran","ManishaDogra","MariaLusardi","MariaPrieto","MarkCrowell","MarkWindsor","MartaSzypczynska","MerlineJesudoss","MilanSudzuk","ModesteDate","MohammadJamaal","MohdYousuf","MohitHolmesheoran","NalayiniNantha","NehaSingh","NehaSwami","OksanaSielina","PeshumhringHuten","PholkanLukhu","PoojaAggarwal","PoojaSharma","PoonamSharma","PoushaliBanerjee","PrabinRai","PrarthanaSingh","PrasannaBoddapati","PrashantSingh","PrateekSantram","PravinJelaji","PreetiBhandari","PrernaGadve","PriyankaNagalia","PriyaRollins","PruthiviPanda","RaakheeGumireddy","RachnaPeter","RahimaThomas","RajatBhog","RangariraiMagudu","RaveeshDogra","RaviArthur","RenuOberoi","RohitSharma","RonitaDaniel","RuthBroome","RuthKalsang","SaffronToms","SamuelDzongor","SanchaliChakraborty","SandeepRawat","SangayOhm","SangeetaBhandari","SanketShitole","SarahKhan","SarahThomas","SareenaPun","SenoluDawhuo","ShadabBegum","ShailenderBhandari","ShaileshGarg","SheetalWaller","ShivaniSapehia","ShoaibAli","ShreyNagalia","SonamThomas","SonamTshering","SondeepPeter","SongSeokin","SrinivasGopal","StellaDate","SudhirMendiratta","SumanMitra","SunilBaloni","SunilKumar","SunitaPanwar","SureshChand","SwatiRoy","SwetaGarg","TafadzwaChibade","TanuPathak","TanyaGurung","TanyaMarathe","TheresaJoseph","ThomasJacob","TriptiRathore","TseringMalik","TwylaSpiller","UpasnaGhale","VimmiDang","VinodBhandari","VipulVashistha","VishalNegi","VivekWilliam","YunJiKwak","ZohraJohn"
];

interface CombinedPurposeDurationFormProps {
  formData: {
    purpose: string;
    otherPurpose: string;
    staffEmail: string;
    startTime: string;
  };
  updateFormData: (data: Partial<{ 
    purpose: string; 
    otherPurpose: string;
    staffEmail: string;
    startTime: string;
    
  }>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CombinedPurposeDurationForm: React.FC<CombinedPurposeDurationFormProps> = ({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}) => {
  const [duration, setDuration] = useState<string>("");
  const [staffSearch, setStaffSearch] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize staffSearch from formData
  useEffect(() => {
    if (formData.staffEmail?.includes("@woodstock.ac.in")) {
      setStaffSearch(formData.staffEmail.replace("@woodstock.ac.in", ""));
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredStaff = useMemo(() => {
    if (!staffSearch) return STAFF_NAMES.slice(0, 10);
    const lower = staffSearch.toLowerCase();
    return STAFF_NAMES.filter(name => name.toLowerCase().includes(lower)).slice(0, 10);
  }, [staffSearch]);

  // Set the start time to current time in IST if not already set
  useEffect(() => {
    if (!formData.startTime) {
      // Create current date in IST (UTC+5:30)
      const now = new Date();
      // Add 5 hours and 30 minutes to convert to IST
      const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      // Format the date and time to match the datetime-local input format
      const formattedDateTime = istTime.toISOString().slice(0, 16);
      updateFormData({ startTime: formattedDateTime });
    }
  }, []);

  useEffect(() => {
    const now = new Date();
    const istDate = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const istTime = istDate.toISOString().slice(0, 16);
    
    if (!formData.startTime) {
      updateFormData({ startTime: istTime });
    }
  }, []);

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

  // Format the time to display in a user-friendly way
  const formatTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return '';
    
    const date = new Date(dateTimeStr);
    // Format to show only time in 12-hour format with AM/PM
    return format(date, 'hh:mm a');
  };
  
  // Get current date in IST for display
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
          <div className="space-y-2">
            <Label htmlFor="staffEmail">Staff Email Address:</Label>
            <div className="space-y-2">
              <div className="relative" ref={dropdownRef}>
                <div className="flex items-center">
                  <Input
                    id="staffEmailUsername"
                    type="text"
                    value={staffSearch}
                    onChange={(e) => {
                      const username = e.target.value.replace("@woodstock.ac.in", "");
                      setStaffSearch(username);
                      setShowDropdown(true);
                      if (username.trim()) {
                        updateFormData({ staffEmail: username + "@woodstock.ac.in" });
                      } else {
                        updateFormData({ staffEmail: "" });
                      }
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Type staff name..."
                    required={formData.purpose === "meeting_school_staff"}
                    className="rounded-r-none"
                    autoComplete="off"
                  />
                  <div className="bg-muted px-3 py-2 text-sm text-muted-foreground border border-l-0 rounded-r-md whitespace-nowrap">
                    @woodstock.ac.in
                  </div>
                </div>
                {showDropdown && filteredStaff.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredStaff.map((name) => (
                      <button
                        key={name}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => {
                          setStaffSearch(name);
                          updateFormData({ staffEmail: name + "@woodstock.ac.in" });
                          setShowDropdown(false);
                        }}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Or enter full email address:
              </div>
              <Input
                id="staffEmailFull"
                type="email"
                value={formData.staffEmail && !formData.staffEmail.includes("@woodstock.ac.in") ? formData.staffEmail : ""}
                onChange={(e) => {
                  updateFormData({ staffEmail: e.target.value });
                  setStaffSearch("");
                }}
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
