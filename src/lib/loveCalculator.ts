import type { Gender } from "@/components/calculators/LoveCalculatorForm";
import { getZodiacCompatibility, type ZodiacCompatibilityResult } from "./zodiacCompatibility";

interface LoveCalculationInput {
  name1: string;
  gender1: Gender;
  dob1?: string;
  name2: string;
  gender2: Gender;
  dob2?: string;
}

interface LoveCalculationResult {
  percentage: number;
  nameMatchScore: number;
  numerologyScore: number;
  zodiacResult: ZodiacCompatibilityResult | null;
  message: string;
  compatibilityLevel: string;
}

// Calculate numerology life path number from DOB
function calculateLifePath(dob: string): number {
  const digits = dob.replace(/-/g, "").split("").map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  
  // Reduce to single digit (except master numbers 11, 22, 33)
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum).split("").map(Number).reduce((a, b) => a + b, 0);
  }
  
  return sum;
}

// Get numerology compatibility
function getNumerologyCompatibility(num1: number, num2: number): number {
  // Compatible number pairs (simplified numerology)
  const compatibilityMap: Record<number, number[]> = {
    1: [1, 3, 5, 7],
    2: [2, 4, 6, 8],
    3: [1, 3, 5, 9],
    4: [2, 4, 6, 8],
    5: [1, 3, 5, 7, 9],
    6: [2, 4, 6, 9],
    7: [1, 5, 7],
    8: [2, 4, 8],
    9: [3, 5, 6, 9],
    11: [2, 4, 6, 11, 22],
    22: [4, 6, 8, 11, 22, 33],
    33: [3, 6, 9, 22, 33],
  };

  const compatible1 = compatibilityMap[num1] || [];
  const compatible2 = compatibilityMap[num2] || [];

  // Perfect match
  if (num1 === num2) return 95;
  
  // Both compatible with each other
  if (compatible1.includes(num2) && compatible2.includes(num1)) return 90;
  
  // One-way compatibility
  if (compatible1.includes(num2) || compatible2.includes(num1)) return 75;
  
  // Neutral
  const diff = Math.abs(num1 - num2);
  return Math.max(50, 70 - diff * 3);
}

// Calculate name match score using letter frequency and patterns
function calculateNameMatchScore(name1: string, name2: string): number {
  const n1 = name1.toLowerCase().replace(/[^a-z]/g, "");
  const n2 = name2.toLowerCase().replace(/[^a-z]/g, "");
  
  if (!n1 || !n2) return 50;

  // Count shared letters
  const freq1: Record<string, number> = {};
  const freq2: Record<string, number> = {};
  
  for (const char of n1) freq1[char] = (freq1[char] || 0) + 1;
  for (const char of n2) freq2[char] = (freq2[char] || 0) + 1;
  
  let sharedLetters = 0;
  let totalLetters = 0;
  
  const allLetters = new Set([...Object.keys(freq1), ...Object.keys(freq2)]);
  for (const letter of allLetters) {
    const c1 = freq1[letter] || 0;
    const c2 = freq2[letter] || 0;
    sharedLetters += Math.min(c1, c2);
    totalLetters += Math.max(c1, c2);
  }
  
  // Base score from letter matching
  const letterScore = (sharedLetters / totalLetters) * 50;
  
  // Bonus for FLAMES-style calculation (deterministic fun)
  const combined = n1 + n2;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash) + combined.charCodeAt(i);
    hash = hash & hash;
  }
  const hashBonus = 25 + Math.abs(hash % 26);
  
  // First letter match bonus
  const firstLetterBonus = n1[0] === n2[0] ? 10 : 0;
  
  // Vowel ratio similarity bonus
  const vowels = "aeiou";
  const v1Ratio = n1.split("").filter(c => vowels.includes(c)).length / n1.length;
  const v2Ratio = n2.split("").filter(c => vowels.includes(c)).length / n2.length;
  const vowelBonus = (1 - Math.abs(v1Ratio - v2Ratio)) * 10;
  
  const total = Math.min(100, letterScore + hashBonus + firstLetterBonus + vowelBonus);
  return Math.round(Math.max(50, total));
}

export function calculateLoveCompatibility(input: LoveCalculationInput): LoveCalculationResult {
  const { name1, dob1, name2, dob2 } = input;
  
  // Calculate name match score
  const nameMatchScore = calculateNameMatchScore(name1, name2);
  
  // Calculate numerology score if DOBs provided
  let numerologyScore = 75; // Default neutral score
  if (dob1 && dob2) {
    const lifePath1 = calculateLifePath(dob1);
    const lifePath2 = calculateLifePath(dob2);
    numerologyScore = getNumerologyCompatibility(lifePath1, lifePath2);
  }
  
  // Calculate zodiac compatibility if DOBs provided
  const zodiacResult = dob1 && dob2 ? getZodiacCompatibility(dob1, dob2) : null;
  
  // Weighted average: 50% names, 30% numerology, 20% zodiac (if available)
  const hasDobs = dob1 && dob2;
  let percentage: number;
  
  if (hasDobs && zodiacResult) {
    percentage = Math.round(
      nameMatchScore * 0.45 + 
      numerologyScore * 0.30 + 
      zodiacResult.score * 0.25
    );
  } else if (hasDobs) {
    percentage = Math.round(nameMatchScore * 0.6 + numerologyScore * 0.4);
  } else {
    percentage = nameMatchScore;
  }
  
  // Ensure always positive (50-100 range)
  const finalPercentage = Math.max(50, Math.min(100, percentage));
  
  // Determine compatibility level
  let compatibilityLevel: string;
  if (finalPercentage >= 90) compatibilityLevel = "Perfect Match! 💕";
  else if (finalPercentage >= 80) compatibilityLevel = "Excellent! 💖";
  else if (finalPercentage >= 70) compatibilityLevel = "Great! 💗";
  else if (finalPercentage >= 60) compatibilityLevel = "Good! 💓";
  else compatibilityLevel = "Growing! 💝";
  
  return {
    percentage: finalPercentage,
    nameMatchScore,
    numerologyScore,
    zodiacResult,
    message: "", // Message will be set by the component based on language
    compatibilityLevel,
  };
}

// Get localized messages based on percentage
export function getLoveMessage(percentage: number, messages: {
  perfect: string;
  great: string;
  good: string;
  moderate: string;
  developing: string;
}): string {
  if (percentage >= 90) return messages.perfect;
  if (percentage >= 80) return messages.great;
  if (percentage >= 70) return messages.good;
  if (percentage >= 60) return messages.moderate;
  return messages.developing;
}
