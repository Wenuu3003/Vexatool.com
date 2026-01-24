interface AgeCalculationResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalHours: number;
  nextBirthday: Date;
  daysUntilBirthday: number;
  dayOfBirth: string;
}

const dayNamesMap: Record<string, string[]> = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  "en-fun": ["Lazy Sunday", "Manic Monday", "Taco Tuesday", "Hump Day", "Almost Friday", "TGIF", "Party Saturday"],
  hi: ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"],
  te: ["ఆదివారం", "సోమవారం", "మంగళవారం", "బుధవారం", "గురువారం", "శుక్రవారం", "శనివారం"],
};

export function calculateAge(
  birthDateStr: string,
  targetDateStr: string,
  language: string = "en"
): AgeCalculationResult | null {
  if (!birthDateStr) return null;

  const birth = new Date(birthDateStr);
  const target = new Date(targetDateStr);

  if (birth > target) return null;

  // Calculate exact age
  let years = target.getFullYear() - birth.getFullYear();
  let months = target.getMonth() - birth.getMonth();
  let days = target.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    const lastMonth = new Date(target.getFullYear(), target.getMonth(), 0);
    days += lastMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  // Calculate totals
  const diffTime = target.getTime() - birth.getTime();
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = Math.floor(diffTime / (1000 * 60 * 60));

  // Calculate next birthday
  let nextBirthday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBirthday <= target) {
    nextBirthday = new Date(target.getFullYear() + 1, birth.getMonth(), birth.getDate());
  }

  const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
  
  const dayNames = dayNamesMap[language] || dayNamesMap.en;
  const dayOfBirth = dayNames[birth.getDay()];

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    totalHours,
    nextBirthday,
    daysUntilBirthday,
    dayOfBirth,
  };
}
