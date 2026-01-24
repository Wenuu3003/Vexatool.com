import { useState } from "react";
import { Heart, Calendar, Info } from "lucide-react";
import { CanonicalHead } from "@/components/CanonicalHead";
import { ToolLayout } from "@/components/ToolLayout";
import ToolSEOContent from "@/components/ToolSEOContent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";

import { LoveCalculatorForm, type LoveFormData, type Gender } from "@/components/calculators/LoveCalculatorForm";
import { LoveResultDisplay, type LoveResult } from "@/components/calculators/LoveResultDisplay";
import { AgeCalculatorForm } from "@/components/calculators/AgeCalculatorForm";
import { AgeResultDisplay, type AgeResult } from "@/components/calculators/AgeResultDisplay";
import { calculateLoveCompatibility, getLoveMessage } from "@/lib/loveCalculator";
import { calculateAge } from "@/lib/ageCalculator";

type Language = "en" | "en-fun" | "hi" | "te";

const translations: Record<Language, Record<string, any>> = {
  en: {
    loveCalculator: "Love Calculator",
    ageCalculator: "Age Calculator",
    yourName: "Your Name",
    partnerName: "Partner's Name",
    calculate: "Calculate Love ❤️",
    tryAnother: "Try Another",
    shareResult: "Copy Text",
    downloadCard: "Download Card",
    copied: "Result copied to clipboard!",
    compatibility: "Compatibility",
    dateOfBirth: "Date of Birth",
    calculateAge: "Calculate Age",
    calculateAgeOn: "Calculate Age On",
    yourAge: "Your Exact Age",
    years: "Years",
    months: "Months",
    days: "Days",
    nextBirthday: "Next Birthday",
    daysUntil: "days until your birthday!",
    bornOn: "You were born on",
    disclaimer: "This tool is for entertainment purposes only. Results are not scientifically accurate.",
    enterNames: "Please enter both names",
    enterDob: "Please enter your date of birth",
    selectGender: "Please select gender for both persons",
    futureDateError: "Birth date cannot be in the future",
    gender: "Gender",
    male: "Male",
    female: "Female",
    optional: "Optional",
    nameMatch: "Name Match",
    numerology: "Numerology",
    zodiac: "Zodiac",
    uploadPhoto: "Add Photo",
    totalDays: "Total Days",
    totalWeeks: "Total Weeks",
    totalHours: "Total Hours",
    messages: {
      perfect: "A match made in heaven! Your bond is extraordinary! 💕",
      great: "You two share an amazing connection! Keep nurturing it! 💖",
      good: "There's genuine chemistry between you! Great potential! 💗",
      moderate: "Your relationship has room to grow beautifully! 💓",
      developing: "Every great love story has a beginning! Keep trying! 💝",
    },
  },
  "en-fun": {
    loveCalculator: "Love-O-Meter 💕",
    ageCalculator: "Age Wizard 🎂",
    yourName: "Your Awesome Name",
    partnerName: "Your Crush's Name",
    calculate: "Find True Love! 💘",
    tryAnother: "Test Another Match",
    shareResult: "Copy Text",
    downloadCard: "Get Image 📸",
    copied: "Love stats copied! Time to share!",
    compatibility: "Vibe Check",
    dateOfBirth: "When Did You Land on Earth?",
    calculateAge: "Reveal My Age",
    calculateAgeOn: "Time Travel To",
    yourAge: "You're This Amazing",
    years: "Trips Around Sun",
    months: "Moons",
    days: "Sunrises",
    nextBirthday: "Cake Day Countdown",
    daysUntil: "sleeps until cake time!",
    bornOn: "You blessed the world on",
    disclaimer: "Just for fun! Not a crystal ball! 🔮",
    enterNames: "We need names to work our magic!",
    enterDob: "When's your earth landing date?",
    selectGender: "Pick your vibe for both!",
    futureDateError: "Time travel not supported yet!",
    gender: "Vibe",
    male: "He/Him",
    female: "She/Her",
    optional: "Bonus",
    nameMatch: "Name Vibes",
    numerology: "Cosmic Score",
    zodiac: "Star Signs",
    uploadPhoto: "Selfie",
    totalDays: "Adventures",
    totalWeeks: "Weekends",
    totalHours: "Coffee Hours",
    messages: {
      perfect: "OMG! You two are basically soulmates! Wedding bells incoming! 🔔💍",
      great: "Wow! The universe ships you two SO hard! 🚀💕",
      good: "Sparks are flying! This could be something special! ✨",
      moderate: "There's potential here! Keep vibing! 🎵",
      developing: "Hey, even Ross and Rachel took 10 seasons! 📺💪",
    },
  },
  hi: {
    loveCalculator: "प्रेम कैलकुलेटर",
    ageCalculator: "आयु कैलकुलेटर",
    yourName: "आपका नाम",
    partnerName: "साथी का नाम",
    calculate: "प्रेम जांचें ❤️",
    tryAnother: "दोबारा कोशिश करें",
    shareResult: "कॉपी करें",
    downloadCard: "इमेज डाउनलोड करें",
    copied: "परिणाम कॉपी हो गया!",
    compatibility: "अनुकूलता",
    dateOfBirth: "जन्म तिथि",
    calculateAge: "आयु जांचें",
    calculateAgeOn: "इस तिथि पर आयु",
    yourAge: "आपकी सही आयु",
    years: "साल",
    months: "महीने",
    days: "दिन",
    nextBirthday: "अगला जन्मदिन",
    daysUntil: "दिन बाकी आपके जन्मदिन में!",
    bornOn: "आपका जन्म हुआ था",
    disclaimer: "यह टूल केवल मनोरंजन के लिए है। परिणाम वैज्ञानिक रूप से सटीक नहीं हैं।",
    enterNames: "कृपया दोनों नाम दर्ज करें",
    enterDob: "कृपया अपनी जन्म तिथि दर्ज करें",
    selectGender: "कृपया दोनों के लिए लिंग चुनें",
    futureDateError: "जन्म तिथि भविष्य में नहीं हो सकती",
    gender: "लिंग",
    male: "पुरुष",
    female: "महिला",
    optional: "वैकल्पिक",
    nameMatch: "नाम मिलान",
    numerology: "अंक ज्योतिष",
    zodiac: "राशि",
    uploadPhoto: "फोटो जोड़ें",
    totalDays: "कुल दिन",
    totalWeeks: "कुल सप्ताह",
    totalHours: "कुल घंटे",
    messages: {
      perfect: "स्वर्ग में बना जोड़ा! आपका बंधन अद्भुत है! 💕",
      great: "आप दोनों में गहरा कनेक्शन है! इसे संभालें! 💖",
      good: "आप दोनों में असली केमिस्ट्री है! 💗",
      moderate: "आपके रिश्ते में बढ़ने की गुंजाइश है! 💓",
      developing: "हर महान प्रेम कहानी की एक शुरुआत होती है! 💝",
    },
  },
  te: {
    loveCalculator: "ప్రేమ కాల్క్యులేటర్",
    ageCalculator: "వయసు కాల్క్యులేటర్",
    yourName: "మీ పేరు",
    partnerName: "భాగస్వామి పేరు",
    calculate: "ప్రేమ లెక్కించండి ❤️",
    tryAnother: "మళ్ళీ ప్రయత్నించండి",
    shareResult: "కాపీ చేయండి",
    downloadCard: "ఇమేజ్ డౌన్‌లోడ్",
    copied: "ఫలితం కాపీ అయింది!",
    compatibility: "అనుకూలత",
    dateOfBirth: "పుట్టిన తేదీ",
    calculateAge: "వయసు లెక్కించండి",
    calculateAgeOn: "ఈ తేదీన వయసు",
    yourAge: "మీ ఖచ్చితమైన వయసు",
    years: "సంవత్సరాలు",
    months: "నెలలు",
    days: "రోజులు",
    nextBirthday: "తదుపరి పుట్టినరోజు",
    daysUntil: "రోజులు మీ పుట్టినరోజుకు!",
    bornOn: "మీరు పుట్టారు",
    disclaimer: "ఈ సాధనం వినోదం కోసం మాత్రమే. ఫలితాలు శాస్త్రీయంగా ఖచ్చితమైనవి కావు.",
    enterNames: "దయచేసి రెండు పేర్లు నమోదు చేయండి",
    enterDob: "దయచేసి మీ పుట్టిన తేదీ నమోదు చేయండి",
    selectGender: "దయచేసి ఇద్దరికీ లింగం ఎంచుకోండి",
    futureDateError: "పుట్టిన తేదీ భవిష్యత్తులో ఉండకూడదు",
    gender: "లింగం",
    male: "పురుషుడు",
    female: "స్త్రీ",
    optional: "ఐచ్ఛికం",
    nameMatch: "పేరు సరిపోలిక",
    numerology: "సంఖ్యాశాస్త్రం",
    zodiac: "రాశి",
    uploadPhoto: "ఫోటో జోడించు",
    totalDays: "మొత్తం రోజులు",
    totalWeeks: "మొత్తం వారాలు",
    totalHours: "మొత్తం గంటలు",
    messages: {
      perfect: "స్వర్గంలో తయారైన జోడీ! మీ బంధం అద్భుతం! 💕",
      great: "మీ ఇద్దరి మధ్య అద్భుతమైన కనెక్షన్ ఉంది! 💖",
      good: "మీ మధ్య నిజమైన కెమిస్ట్రీ ఉంది! 💗",
      moderate: "మీ సంబంధం అందంగా పెరిగే అవకాశం ఉంది! 💓",
      developing: "ప్రతి గొప్ప ప్రేమ కథకు ఒక ప్రారంభం ఉంటుంది! 💝",
    },
  },
};

export default function LoveCalculator() {
  const { toast } = useToast();
  const [language, setLanguage] = useState<Language>("en");
  const [activeTab, setActiveTab] = useState("love");
  const [showHearts, setShowHearts] = useState(false);

  // Love Calculator State
  const [loveForm, setLoveForm] = useState<LoveFormData>({
    name1: "",
    gender1: "male",
    dob1: "",
    photo1: null,
    name2: "",
    gender2: "female",
    dob2: "",
    photo2: null,
  });
  const [loveResult, setLoveResult] = useState<LoveResult | null>(null);

  // Age Calculator State
  const [birthDate, setBirthDate] = useState("");
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split("T")[0]);
  const [ageResult, setAgeResult] = useState<AgeResult | null>(null);

  const t = translations[language];

  const handleLoveFormChange = (data: Partial<LoveFormData>) => {
    setLoveForm((prev) => ({ ...prev, ...data }));
  };

  const handleCalculateLove = () => {
    const { name1, name2, gender1, gender2, dob1, dob2 } = loveForm;

    if (!name1.trim() || !name2.trim()) {
      toast({ title: t.enterNames, variant: "destructive" });
      return;
    }

    if (!gender1 || !gender2) {
      toast({ title: t.selectGender, variant: "destructive" });
      return;
    }

    const result = calculateLoveCompatibility({
      name1: name1.trim(),
      gender1,
      dob1: dob1 || undefined,
      name2: name2.trim(),
      gender2,
      dob2: dob2 || undefined,
    });

    const message = getLoveMessage(result.percentage, t.messages);

    setLoveResult({
      ...result,
      message,
    });

    setShowHearts(true);
    setTimeout(() => setShowHearts(false), 3000);
  };

  const handleResetLove = () => {
    setLoveForm({
      name1: "",
      gender1: "male",
      dob1: "",
      photo1: null,
      name2: "",
      gender2: "female",
      dob2: "",
      photo2: null,
    });
    setLoveResult(null);
  };

  const handleShareLove = async () => {
    if (!loveResult) return;
    const text = `❤️ Love Calculator Result ❤️\n${loveForm.name1} + ${loveForm.name2} = ${loveResult.percentage}% Compatible!\n📊 Name Match: ${loveResult.nameMatchScore}% | Numerology: ${loveResult.numerologyScore}%\n${loveResult.message}\n\nTry it: https://mypdfs.in/love-calculator`;

    try {
      await navigator.clipboard.writeText(text);
      toast({ title: t.copied });
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleCalculateAge = () => {
    if (!birthDate) {
      toast({ title: t.enterDob, variant: "destructive" });
      return;
    }

    const result = calculateAge(birthDate, targetDate, language);

    if (!result) {
      toast({ title: t.futureDateError, variant: "destructive" });
      return;
    }

    setAgeResult(result);
  };

  const handleShareAge = async () => {
    if (!ageResult) return;
    const text = `🎂 Age Calculator Result 🎂\nI am ${ageResult.years} years, ${ageResult.months} months, and ${ageResult.days} days old!\n📅 Total: ${ageResult.totalDays.toLocaleString()} days lived!\n${ageResult.daysUntilBirthday} days until my next birthday! 🎉\n\nCalculate yours: https://mypdfs.in/love-calculator`;

    try {
      await navigator.clipboard.writeText(text);
      toast({ title: t.copied });
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const seoContent = {
    toolName: "Love Calculator & Age Calculator",
    whatIs: "Our Love Calculator is a professional entertainment tool that calculates love compatibility using both name matching and numerology analysis. By adding your Date of Birth, the algorithm considers numerological life path numbers for enhanced compatibility insights. Our Age Calculator provides precise age calculations including years, months, days, total days lived, and a countdown to your next birthday.",
    howToUse: [
      "For Love Calculator: Enter both names, select gender, and optionally add DOB for numerology analysis.",
      "Click 'Calculate Love' to see your compatibility percentage with detailed breakdown.",
      "For Age Calculator: Enter your date of birth and optionally select a target date.",
      "View your exact age, total days lived, birth day, and birthday countdown.",
      "Share your fun results with friends using the 'Share Result' button!",
    ],
    features: [
      "Advanced love compatibility using name matching + numerology",
      "Gender selection for personalized results",
      "Optional DOB input for numerological life path analysis",
      "Precise age calculation in years, months, and days",
      "Total days, weeks, and hours lived statistics",
      "Next birthday countdown feature",
      "Multi-language support (English, Hindi, Telugu)",
      "100% client-side - no data sent to servers",
    ],
    safetyNote: "Absolutely! Both tools run entirely in your browser. No personal data is collected, stored, or transmitted. The Love Calculator is purely for entertainment and does not make any real predictions about relationships.",
    faqs: [
      {
        question: "What is a Love Calculator?",
        answer: "A Love Calculator is a fun entertainment tool that generates a compatibility percentage based on names and optionally numerology. It uses letter matching and life path number analysis for enhanced results.",
      },
      {
        question: "Is this Love Calculator accurate?",
        answer: "No, this is purely for entertainment! Love and relationships are complex and cannot be determined by any calculator. Use this tool just for fun with friends and family.",
      },
      {
        question: "How does the numerology feature work?",
        answer: "When you enter birth dates, the calculator computes life path numbers (a numerology concept) and checks compatibility between them. This adds an extra fun dimension to the results.",
      },
      {
        question: "Is the Age Calculator free?",
        answer: "Yes, both the Age Calculator and Love Calculator are completely free to use with no hidden charges or subscriptions required.",
      },
      {
        question: "Can I calculate age on a past or future date?",
        answer: "Yes! The 'Calculate Age On' field lets you see your age on any date - past or future. Great for finding out your age on a special occasion.",
      },
      {
        question: "Is this tool safe to use?",
        answer: "Yes, completely safe. Both tools run 100% in your browser. We don't collect, store, or transmit any personal information. Your data stays on your device.",
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: seoContent.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <CanonicalHead
        title="Love Calculator ❤️ & Age Calculator – Check Compatibility & Exact Age Online"
        description="Check love compatibility with our Love Calculator using name matching & numerology. Calculate exact age, total days lived & birthday countdown. Free & fun!"
        keywords="love calculator, age calculator, love compatibility, name love calculator, numerology love test, online age calculator, birthday calculator"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <ToolLayout
        title="Love Calculator & Age Calculator"
        description="Professional love compatibility test with numerology & precise age calculator"
        icon={Heart}
        colorClass="bg-gradient-to-br from-pink-500 to-rose-500"
      >
        {/* Floating Hearts Animation */}
        {showHearts && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <Heart
                key={i}
                className="absolute text-pink-500 animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${1 + Math.random()}s`,
                  fontSize: `${20 + Math.random() * 30}px`,
                  opacity: 0.8,
                }}
                fill="currentColor"
              />
            ))}
          </div>
        )}

        <div className="space-y-6">
          {/* Language Selector */}
          <div className="flex justify-end">
            <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="en-fun">English (Fun)</SelectItem>
                <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="love" className="gap-2">
                <Heart className="w-4 h-4" />
                {t.loveCalculator}
              </TabsTrigger>
              <TabsTrigger value="age" className="gap-2">
                <Calendar className="w-4 h-4" />
                {t.ageCalculator}
              </TabsTrigger>
            </TabsList>

            {/* Love Calculator Tab */}
            <TabsContent value="love" className="space-y-6">
              <LoveCalculatorForm
                formData={loveForm}
                onFormChange={handleLoveFormChange}
                onCalculate={handleCalculateLove}
                translations={{
                  loveCalculator: t.loveCalculator,
                  yourName: t.yourName,
                  partnerName: t.partnerName,
                  calculate: t.calculate,
                  dateOfBirth: t.dateOfBirth,
                  gender: t.gender,
                  male: t.male,
                  female: t.female,
                  optional: t.optional,
                }}
              />

              {loveResult && (
                <LoveResultDisplay
                  result={loveResult}
                  name1={loveForm.name1}
                  name2={loveForm.name2}
                  photo1={loveForm.photo1}
                  photo2={loveForm.photo2}
                  onReset={handleResetLove}
                  onShare={handleShareLove}
                  translations={{
                    tryAnother: t.tryAnother,
                    shareResult: t.shareResult,
                    compatibility: t.compatibility,
                    nameMatch: t.nameMatch,
                    numerology: t.numerology,
                    zodiac: t.zodiac,
                    downloadCard: t.downloadCard,
                  }}
                />
              )}

              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700 dark:text-amber-300">
                  ⚠️ {t.disclaimer}
                </AlertDescription>
              </Alert>
            </TabsContent>

            {/* Age Calculator Tab */}
            <TabsContent value="age" className="space-y-6">
              <AgeCalculatorForm
                birthDate={birthDate}
                targetDate={targetDate}
                onBirthDateChange={setBirthDate}
                onTargetDateChange={setTargetDate}
                onCalculate={handleCalculateAge}
                translations={{
                  ageCalculator: t.ageCalculator,
                  dateOfBirth: t.dateOfBirth,
                  calculateAge: t.calculateAge,
                  calculateAgeOn: t.calculateAgeOn,
                }}
              />

              {ageResult && (
                <AgeResultDisplay
                  result={ageResult}
                  onShare={handleShareAge}
                  translations={{
                    yourAge: t.yourAge,
                    years: t.years,
                    months: t.months,
                    days: t.days,
                    nextBirthday: t.nextBirthday,
                    daysUntil: t.daysUntil,
                    bornOn: t.bornOn,
                    shareResult: t.shareResult,
                    totalDays: t.totalDays,
                    totalWeeks: t.totalWeeks,
                    totalHours: t.totalHours,
                  }}
                />
              )}
            </TabsContent>
          </Tabs>

          {/* SEO Content */}
          <ToolSEOContent
            toolName={seoContent.toolName}
            whatIs={seoContent.whatIs}
            howToUse={seoContent.howToUse}
            features={seoContent.features}
            safetyNote={seoContent.safetyNote}
            faqs={seoContent.faqs}
          />
        </div>
      </ToolLayout>
    </>
  );
}
