import { Heart, User, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRef } from "react";

export type Gender = "male" | "female";

export interface LoveFormData {
  name1: string;
  gender1: Gender;
  dob1: string;
  photo1: string | null;
  name2: string;
  gender2: Gender;
  dob2: string;
  photo2: string | null;
}

interface LoveCalculatorFormProps {
  formData: LoveFormData;
  onFormChange: (data: Partial<LoveFormData>) => void;
  onCalculate: () => void;
  translations: {
    loveCalculator: string;
    yourName: string;
    partnerName: string;
    calculate: string;
    dateOfBirth: string;
    gender: string;
    male: string;
    female: string;
    optional: string;
    uploadPhoto?: string;
  };
}

export function LoveCalculatorForm({
  formData,
  onFormChange,
  onCalculate,
  translations: t,
}: LoveCalculatorFormProps) {
  const fileInput1Ref = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (personIndex: 1 | 2, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (personIndex === 1) {
        onFormChange({ photo1: result });
      } else {
        onFormChange({ photo2: result });
      }
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (personIndex: 1 | 2) => {
    if (personIndex === 1) {
      onFormChange({ photo1: null });
      if (fileInput1Ref.current) fileInput1Ref.current.value = "";
    } else {
      onFormChange({ photo2: null });
      if (fileInput2Ref.current) fileInput2Ref.current.value = "";
    }
  };

  return (
    <Card className="border-pink-200 dark:border-pink-900">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-pink-600 dark:text-pink-400">
          <Heart className="w-6 h-6" fill="currentColor" />
          {t.loveCalculator}
          <Heart className="w-6 h-6" fill="currentColor" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Person 1 */}
        <div className="p-4 bg-pink-50/50 dark:bg-pink-950/20 rounded-lg space-y-4">
          <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 font-medium">
            <User className="w-4 h-4" />
            <span>Person 1</span>
          </div>
          
          {/* Photo Upload */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {formData.photo1 ? (
                <div className="relative w-16 h-16">
                  <img
                    src={formData.photo1}
                    alt="Person 1"
                    className="w-16 h-16 rounded-full object-cover border-2 border-pink-300"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(1)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInput1Ref.current?.click()}
                  className="w-16 h-16 rounded-full border-2 border-dashed border-pink-300 flex items-center justify-center hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors"
                >
                  <Camera className="w-6 h-6 text-pink-400" />
                </button>
              )}
              <input
                ref={fileInput1Ref}
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoUpload(1, e)}
                className="hidden"
              />
            </div>
            <span className="text-sm text-muted-foreground">{t.uploadPhoto || "Add Photo"} ({t.optional})</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name1">{t.yourName} *</Label>
            <Input
              id="name1"
              value={formData.name1}
              onChange={(e) => onFormChange({ name1: e.target.value })}
              placeholder="Enter name"
              maxLength={50}
              className="border-pink-200 focus:border-pink-400"
            />
          </div>

          <div className="space-y-2">
            <Label>{t.gender} *</Label>
            <RadioGroup
              value={formData.gender1}
              onValueChange={(v) => onFormChange({ gender1: v as Gender })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="gender1-male" />
                <Label htmlFor="gender1-male" className="cursor-pointer">{t.male}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="gender1-female" />
                <Label htmlFor="gender1-female" className="cursor-pointer">{t.female}</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob1">{t.dateOfBirth} ({t.optional})</Label>
            <Input
              id="dob1"
              type="date"
              value={formData.dob1}
              onChange={(e) => onFormChange({ dob1: e.target.value })}
              max={new Date().toISOString().split("T")[0]}
              className="border-pink-200 focus:border-pink-400"
            />
          </div>
        </div>

        {/* Heart Divider */}
        <div className="flex items-center justify-center">
          <Heart className="w-8 h-8 text-pink-500 animate-pulse" fill="currentColor" />
        </div>

        {/* Person 2 */}
        <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-lg space-y-4">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium">
            <User className="w-4 h-4" />
            <span>Person 2</span>
          </div>
          
          {/* Photo Upload */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {formData.photo2 ? (
                <div className="relative w-16 h-16">
                  <img
                    src={formData.photo2}
                    alt="Person 2"
                    className="w-16 h-16 rounded-full object-cover border-2 border-rose-300"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(2)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInput2Ref.current?.click()}
                  className="w-16 h-16 rounded-full border-2 border-dashed border-rose-300 flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
                >
                  <Camera className="w-6 h-6 text-rose-400" />
                </button>
              )}
              <input
                ref={fileInput2Ref}
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoUpload(2, e)}
                className="hidden"
              />
            </div>
            <span className="text-sm text-muted-foreground">{t.uploadPhoto || "Add Photo"} ({t.optional})</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name2">{t.partnerName} *</Label>
            <Input
              id="name2"
              value={formData.name2}
              onChange={(e) => onFormChange({ name2: e.target.value })}
              placeholder="Enter partner's name"
              maxLength={50}
              className="border-rose-200 focus:border-rose-400"
            />
          </div>

          <div className="space-y-2">
            <Label>{t.gender} *</Label>
            <RadioGroup
              value={formData.gender2}
              onValueChange={(v) => onFormChange({ gender2: v as Gender })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="gender2-male" />
                <Label htmlFor="gender2-male" className="cursor-pointer">{t.male}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="gender2-female" />
                <Label htmlFor="gender2-female" className="cursor-pointer">{t.female}</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob2">{t.dateOfBirth} ({t.optional})</Label>
            <Input
              id="dob2"
              type="date"
              value={formData.dob2}
              onChange={(e) => onFormChange({ dob2: e.target.value })}
              max={new Date().toISOString().split("T")[0]}
              className="border-rose-200 focus:border-rose-400"
            />
          </div>
        </div>

        <Button
          onClick={onCalculate}
          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-lg py-6"
        >
          <Heart className="w-5 h-5 mr-2" />
          {t.calculate}
        </Button>
      </CardContent>
    </Card>
  );
}
