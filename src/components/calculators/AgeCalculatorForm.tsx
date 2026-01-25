import { useRef } from "react";
import { Calendar, Cake, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AgeCalculatorFormProps {
  birthDate: string;
  targetDate: string;
  photo: string | null;
  name: string;
  onBirthDateChange: (date: string) => void;
  onTargetDateChange: (date: string) => void;
  onPhotoChange: (photo: string | null) => void;
  onNameChange: (name: string) => void;
  onCalculate: () => void;
  translations: {
    ageCalculator: string;
    dateOfBirth: string;
    calculateAge: string;
    calculateAgeOn: string;
    uploadPhoto?: string;
    optional?: string;
    yourName?: string;
  };
}

export function AgeCalculatorForm({
  birthDate,
  targetDate,
  photo,
  name,
  onBirthDateChange,
  onTargetDateChange,
  onPhotoChange,
  onNameChange,
  onCalculate,
  translations: t,
}: AgeCalculatorFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onPhotoChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    onPhotoChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card className="border-blue-200 dark:border-blue-900">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
          <Cake className="w-6 h-6" />
          {t.ageCalculator}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Photo Upload */}
        <div className="flex items-center justify-center gap-4">
          <div className="relative">
            {photo ? (
              <div className="relative w-20 h-20">
                <img
                  src={photo}
                  alt="Your photo"
                  className="w-20 h-20 rounded-full object-cover border-3 border-blue-300 shadow-lg"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 shadow-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-full border-2 border-dashed border-blue-300 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
              >
                <Camera className="w-8 h-8 text-blue-400" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {t.uploadPhoto || "Add Photo"} ({t.optional || "Optional"})
          </span>
        </div>

        {/* Name Input */}
        <div className="space-y-2">
          <Label htmlFor="ageName">{t.yourName || "Your Name"} ({t.optional || "Optional"})</Label>
          <Input
            id="ageName"
            type="text"
            placeholder="Enter your name for personalized cards"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="border-blue-200 focus:border-blue-400"
            maxLength={30}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="birthDate">{t.dateOfBirth} *</Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => onBirthDateChange(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="border-blue-200 focus:border-blue-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetDate">{t.calculateAgeOn}</Label>
            <Input
              id="targetDate"
              type="date"
              value={targetDate}
              onChange={(e) => onTargetDateChange(e.target.value)}
              className="border-blue-200 focus:border-blue-400"
            />
          </div>
        </div>

        <Button
          onClick={onCalculate}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-lg py-6"
        >
          <Calendar className="w-5 h-5 mr-2" />
          {t.calculateAge}
        </Button>
      </CardContent>
    </Card>
  );
}
