import { Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type Gender = "male" | "female";

export interface LoveFormData {
  name1: string;
  gender1: Gender;
  dob1: string;
  name2: string;
  gender2: Gender;
  dob2: string;
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
  };
}

export function LoveCalculatorForm({
  formData,
  onFormChange,
  onCalculate,
  translations: t,
}: LoveCalculatorFormProps) {
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
