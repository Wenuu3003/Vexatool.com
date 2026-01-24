// Zodiac sign data and compatibility calculations

export interface ZodiacSign {
  name: string;
  symbol: string;
  element: "fire" | "earth" | "air" | "water";
  dates: { startMonth: number; startDay: number; endMonth: number; endDay: number };
}

export const zodiacSigns: ZodiacSign[] = [
  { name: "Aries", symbol: "♈", element: "fire", dates: { startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 } },
  { name: "Taurus", symbol: "♉", element: "earth", dates: { startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 } },
  { name: "Gemini", symbol: "♊", element: "air", dates: { startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 } },
  { name: "Cancer", symbol: "♋", element: "water", dates: { startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 } },
  { name: "Leo", symbol: "♌", element: "fire", dates: { startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 } },
  { name: "Virgo", symbol: "♍", element: "earth", dates: { startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 } },
  { name: "Libra", symbol: "♎", element: "air", dates: { startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 } },
  { name: "Scorpio", symbol: "♏", element: "water", dates: { startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 } },
  { name: "Sagittarius", symbol: "♐", element: "fire", dates: { startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 } },
  { name: "Capricorn", symbol: "♑", element: "earth", dates: { startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 } },
  { name: "Aquarius", symbol: "♒", element: "air", dates: { startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 } },
  { name: "Pisces", symbol: "♓", element: "water", dates: { startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 } },
];

// Element compatibility matrix (higher = more compatible)
const elementCompatibility: Record<string, Record<string, number>> = {
  fire: { fire: 85, air: 90, earth: 60, water: 55 },
  earth: { fire: 60, air: 65, earth: 85, water: 90 },
  air: { fire: 90, air: 85, earth: 65, water: 60 },
  water: { fire: 55, air: 60, earth: 90, water: 85 },
};

// Specific sign pairings with bonus/penalty
const signPairings: Record<string, number> = {
  "Aries-Leo": 95,
  "Aries-Sagittarius": 93,
  "Taurus-Virgo": 92,
  "Taurus-Capricorn": 90,
  "Gemini-Libra": 93,
  "Gemini-Aquarius": 91,
  "Cancer-Scorpio": 94,
  "Cancer-Pisces": 92,
  "Leo-Sagittarius": 93,
  "Virgo-Capricorn": 91,
  "Libra-Aquarius": 92,
  "Scorpio-Pisces": 93,
  // Same sign pairs
  "Aries-Aries": 80,
  "Taurus-Taurus": 85,
  "Gemini-Gemini": 75,
  "Cancer-Cancer": 88,
  "Leo-Leo": 78,
  "Virgo-Virgo": 82,
  "Libra-Libra": 84,
  "Scorpio-Scorpio": 70,
  "Sagittarius-Sagittarius": 82,
  "Capricorn-Capricorn": 80,
  "Aquarius-Aquarius": 76,
  "Pisces-Pisces": 86,
};

export function getZodiacSign(dob: string): ZodiacSign | null {
  if (!dob) return null;
  
  const date = new Date(dob);
  const month = date.getMonth() + 1; // JS months are 0-indexed
  const day = date.getDate();
  
  for (const sign of zodiacSigns) {
    const { startMonth, startDay, endMonth, endDay } = sign.dates;
    
    // Handle Capricorn which spans year boundary
    if (startMonth > endMonth) {
      if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
        return sign;
      }
    } else {
      if ((month === startMonth && day >= startDay) || 
          (month === endMonth && day <= endDay) ||
          (month > startMonth && month < endMonth)) {
        return sign;
      }
    }
  }
  
  return null;
}

export interface ZodiacCompatibilityResult {
  sign1: ZodiacSign;
  sign2: ZodiacSign;
  score: number;
  elementMatch: string;
  description: string;
}

export function getZodiacCompatibility(dob1: string, dob2: string): ZodiacCompatibilityResult | null {
  const sign1 = getZodiacSign(dob1);
  const sign2 = getZodiacSign(dob2);
  
  if (!sign1 || !sign2) return null;
  
  // Get base element compatibility
  let score = elementCompatibility[sign1.element][sign2.element];
  
  // Check for specific pairing bonus
  const pairKey1 = `${sign1.name}-${sign2.name}`;
  const pairKey2 = `${sign2.name}-${sign1.name}`;
  
  if (signPairings[pairKey1]) {
    score = signPairings[pairKey1];
  } else if (signPairings[pairKey2]) {
    score = signPairings[pairKey2];
  }
  
  // Ensure score is in valid range
  score = Math.max(50, Math.min(100, score));
  
  // Generate element match description
  const elementMatch = getElementMatchDescription(sign1.element, sign2.element);
  
  // Generate compatibility description
  const description = getCompatibilityDescription(sign1, sign2, score);
  
  return { sign1, sign2, score, elementMatch, description };
}

function getElementMatchDescription(e1: string, e2: string): string {
  if (e1 === e2) {
    const descriptions: Record<string, string> = {
      fire: "🔥 Double Fire - Passionate & Dynamic!",
      earth: "🌍 Double Earth - Stable & Grounded!",
      air: "💨 Double Air - Intellectual & Free!",
      water: "💧 Double Water - Deep & Emotional!",
    };
    return descriptions[e1];
  }
  
  const pairs: Record<string, string> = {
    "fire-air": "🔥💨 Fire meets Air - Explosive Chemistry!",
    "air-fire": "💨🔥 Air fuels Fire - Exciting Energy!",
    "earth-water": "🌍💧 Earth meets Water - Nurturing Bond!",
    "water-earth": "💧🌍 Water nourishes Earth - Perfect Harmony!",
    "fire-fire": "🔥🔥 Fire meets Fire - Intense Passion!",
    "water-water": "💧💧 Water meets Water - Deep Connection!",
    "fire-earth": "🔥🌍 Fire meets Earth - Creative Tension!",
    "earth-fire": "🌍🔥 Earth grounds Fire - Balancing Act!",
    "fire-water": "🔥💧 Fire meets Water - Steamy Chemistry!",
    "water-fire": "💧🔥 Water meets Fire - Opposites Attract!",
    "air-earth": "💨🌍 Air meets Earth - Growth Potential!",
    "earth-air": "🌍💨 Earth meets Air - Learning Together!",
    "air-water": "💨💧 Air meets Water - Mysterious Bond!",
    "water-air": "💧💨 Water meets Air - Emotional Depth!",
  };
  
  return pairs[`${e1}-${e2}`] || "✨ Unique Cosmic Connection!";
}

function getCompatibilityDescription(sign1: ZodiacSign, sign2: ZodiacSign, score: number): string {
  const same = sign1.name === sign2.name;
  
  if (same) {
    return `Two ${sign1.name}s together! You understand each other deeply.`;
  }
  
  if (score >= 90) {
    return `${sign1.name} & ${sign2.name} - A celestial perfect match! The stars align for you!`;
  }
  if (score >= 80) {
    return `${sign1.name} & ${sign2.name} - Strong cosmic connection! Great compatibility!`;
  }
  if (score >= 70) {
    return `${sign1.name} & ${sign2.name} - Good astrological harmony with room to grow!`;
  }
  if (score >= 60) {
    return `${sign1.name} & ${sign2.name} - Different but complementary energies!`;
  }
  return `${sign1.name} & ${sign2.name} - Unique challenges lead to unique growth!`;
}
