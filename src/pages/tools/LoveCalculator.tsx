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
import { AgeWishesDisplay } from "@/components/calculators/AgeWishesDisplay";
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
    birthdayWishes: "Birthday Wishes",
    motivationTips: "Life Wisdom",
    advanceBirthday: "Advance Birthday Wishes",
    belatedBirthday: "Belated Birthday Wishes",
    presentBirthday: "Happy Birthday Today!",
    daysLeft: "days until your birthday!",
    ageBasedAdvice: "Age-based life advice",
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
    birthdayWishes: "Birthday Magic ✨",
    motivationTips: "Life Hacks 🚀",
    advanceBirthday: "Pre-Party Vibes",
    belatedBirthday: "Fashionably Late Wishes",
    presentBirthday: "IT'S YOUR DAY! 🎉",
    daysLeft: "sleeps until your party!",
    ageBasedAdvice: "Wisdom for your journey",
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
    birthdayWishes: "जन्मदिन की शुभकामनाएं",
    motivationTips: "जीवन ज्ञान",
    advanceBirthday: "अग्रिम जन्मदिन की शुभकामनाएं",
    belatedBirthday: "विलंबित जन्मदिन की शुभकामनाएं",
    presentBirthday: "आज आपका जन्मदिन है!",
    daysLeft: "दिन बाकी आपके जन्मदिन में!",
    ageBasedAdvice: "आयु के अनुसार सलाह",
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
    birthdayWishes: "పుట్టినరోజు శుభాకాంక్షలు",
    motivationTips: "జీవిత జ్ఞానం",
    advanceBirthday: "ముందస్తు పుట్టినరోజు శుభాకాంక్షలు",
    belatedBirthday: "ఆలస్యమైన పుట్టినరోజు శుభాకాంక్షలు",
    presentBirthday: "ఈ రోజు మీ పుట్టినరోజు!",
    daysLeft: "రోజులు మీ పుట్టినరోజుకు!",
    ageBasedAdvice: "వయసు ఆధారిత జీవిత సలహా",
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
  const [agePhoto, setAgePhoto] = useState<string | null>(null);
  const [ageName, setAgeName] = useState("");
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
    const text = `❤️ Love Calculator Result ❤️\n${loveForm.name1} + ${loveForm.name2} = ${loveResult.percentage}% Compatible!\n📊 Name Match: ${loveResult.nameMatchScore}% | Numerology: ${loveResult.numerologyScore}%\n${loveResult.message}\n\nTry it: https://vexatool.com/love-calculator`;

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
    const text = `🎂 Age Calculator Result 🎂\nI am ${ageResult.years} years, ${ageResult.months} months, and ${ageResult.days} days old!\n📅 Total: ${ageResult.totalDays.toLocaleString()} days lived!\n${ageResult.daysUntilBirthday} days until my next birthday! 🎉\n\nCalculate yours: https://vexatool.com/love-calculator`;

    try {
      await navigator.clipboard.writeText(text);
      toast({ title: t.copied });
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const seoContent = {
    toolName: "Love Calculator & Age Calculator with Birthday Wishes",
    whatIs: "Our Love Calculator is a fun entertainment tool that calculates love compatibility using a triple-scoring algorithm: name matching (45%), numerology life path analysis (30%), and zodiac sign compatibility (25%). Our Age Calculator provides precise age calculations with special features: automatic birthday wishes (Present, Advance, or Belated based on your birthday), age-based motivation tips for children, young adults, adults, and seniors. Both tools support Telugu and English languages with photo uploads for personalized shareable cards perfect for Instagram Stories and WhatsApp Status.",
    howToUse: [
      "For Love Calculator: Enter both names, select gender, and optionally add DOB for numerology & zodiac analysis.",
      "Upload photos (optional) to personalize your share cards with profile pictures.",
      "Click 'Calculate Love' to see your compatibility percentage with detailed breakdown.",
      "For Age Calculator: Select your preferred language (English or Telugu) from the dropdown.",
      "Enter your name (optional), date of birth, and optionally select a target date.",
      "Upload your photo to create personalized birthday share cards.",
      "View your exact age, total days lived, birth day, and birthday countdown.",
      "If it's your birthday, receive present wishes! If approaching, get advance wishes! If passed, get belated wishes!",
      "Read personalized motivation tips based on your age group (child, young, adult, senior).",
      "Share fun results on Instagram Stories (9:16) or WhatsApp Status (1:1) using the share buttons!",
    ],
    features: [
      "Triple-scoring love compatibility: Name matching (45%) + Numerology (30%) + Zodiac (25%)",
      "Zodiac sign compatibility with element matching (Fire, Earth, Air, Water)",
      "Photo uploads for personalized social media share cards",
      "Instagram Story format (1080×1920) & WhatsApp Status format (1080×1080)",
      "Web Share API for direct mobile sharing to apps",
      "Precise age calculation in years, months, and days",
      "Total days, weeks, and hours lived statistics",
      "Next birthday countdown feature",
      "Automatic Birthday Wishes: Present, Advance (within 7 days), or Belated",
      "Age-based Motivation Tips: Child (<18), Young (18-30), Adult (30-50), Senior (50+)",
      "Multi-language support (English, Hindi, Telugu, Fun English)",
      "Confetti celebration on your birthday with celebration sounds!",
      "100% client-side processing - no data sent to servers",
    ],
    safetyNote: "Absolutely! Both tools run entirely in your browser. No personal data, names, photos, or birth dates are collected, stored, or transmitted to any server. The Love Calculator is purely for entertainment and fun with friends and family. Photos are processed locally and never uploaded anywhere.",
    faqs: [
      {
        question: "What is a Love Calculator?",
        answer: "A Love Calculator is a fun entertainment tool that generates a compatibility percentage based on names and optionally birth dates. It uses name matching, numerology life path analysis, and zodiac sign compatibility for engaging results. Remember, it's purely for entertainment!",
      },
      {
        question: "How does the zodiac compatibility feature work?",
        answer: "When you enter birth dates, the calculator identifies your zodiac signs and checks element compatibility. Fire signs (Aries, Leo, Sagittarius) match well with Air signs (Gemini, Libra, Aquarius), while Earth signs (Taurus, Virgo, Capricorn) pair with Water signs (Cancer, Scorpio, Pisces). Same-element matches also score high!",
      },
      {
        question: "How does the Age Calculator detect my birthday?",
        answer: "The Age Calculator compares your birth date with the current date. If today is your birthday, you get 'Present Birthday Wishes' with confetti! If your birthday is within 7 days, you receive 'Advance Birthday Wishes'. If it passed within the last week, you get heartfelt 'Belated Birthday Wishes'.",
      },
      {
        question: "What are the age-based motivation tips?",
        answer: "Based on your age, you receive personalized life wisdom: Children (<18) get advice about dreaming big and learning; Young adults (18-30) receive career and financial tips; Adults (30-50) get family and investment guidance; Seniors (50+) receive wisdom about enjoying life and sharing knowledge.",
      },
      {
        question: "Can I use this calculator in Telugu language?",
        answer: "Yes! The Age Calculator fully supports Telugu (తెలుగు). Switch language using the dropdown at the top. All birthday wishes, motivation tips, labels, and messages display in Telugu. This makes it perfect for sharing with Telugu-speaking friends and family!",
      },
      {
        question: "Can I share my results on Instagram and WhatsApp?",
        answer: "Yes! Both calculators generate beautiful share cards optimized for Instagram Stories (9:16 vertical format) and WhatsApp Status (1:1 square format). On mobile devices, you can share directly to apps using the native share feature. On desktop, images are downloaded for manual sharing.",
      },
      {
        question: "Why should I add my photo and name?",
        answer: "Adding your photo and name personalizes the share cards! Your photo appears in a beautiful circular frame, and your name is prominently displayed on the generated images. This makes sharing on social media more fun and personal.",
      },
      {
        question: "Is this Love Calculator accurate for real relationships?",
        answer: "No, this is purely for entertainment! Real love and relationships are complex and cannot be determined by any calculator or algorithm. Use this tool just for fun with friends, family, and crushes. Real compatibility depends on communication, shared values, and mutual respect.",
      },
      {
        question: "Is the Age Calculator free to use?",
        answer: "Yes, both the Age Calculator and Love Calculator are completely free to use with no hidden charges, subscriptions, or account registration required. All features including photo uploads, birthday wishes, motivation tips, and shareable cards are free!",
      },
      {
        question: "Can I calculate my age on a past or future date?",
        answer: "Yes! The 'Calculate Age On' field lets you see your age on any date—past or future. Great for finding out your age on special occasions like weddings, graduations, or future milestones.",
      },
      {
        question: "Is my data safe when using these tools?",
        answer: "Absolutely safe! Both tools run 100% in your browser. We don't collect, store, or transmit any personal information including names, birth dates, or photos. Your data never leaves your device—complete privacy guaranteed.",
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
        title="Love Calculator ❤️ & Age Calculator – Free Compatibility Test with Zodiac & Shareable Cards"
        description="Free Love Calculator with zodiac compatibility & Age Calculator with personalized share cards. Upload photos, get Instagram & WhatsApp ready images. Fun & safe!"
        keywords="love calculator, age calculator, love compatibility test, zodiac love calculator, name love calculator, birthday calculator, instagram story maker, whatsapp status creator"
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
                photo={agePhoto}
                name={ageName}
                onBirthDateChange={setBirthDate}
                onTargetDateChange={setTargetDate}
                onPhotoChange={setAgePhoto}
                onNameChange={setAgeName}
                onCalculate={handleCalculateAge}
                translations={{
                  ageCalculator: t.ageCalculator,
                  dateOfBirth: t.dateOfBirth,
                  calculateAge: t.calculateAge,
                  calculateAgeOn: t.calculateAgeOn,
                  uploadPhoto: t.uploadPhoto,
                  optional: t.optional,
                  yourName: t.yourName,
                }}
              />

              {ageResult && (
                <>
                  <AgeResultDisplay
                    result={ageResult}
                    birthDate={birthDate}
                    photo={agePhoto}
                    name={ageName}
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
                  
                  {/* Birthday Wishes & Motivation Tips */}
                  <AgeWishesDisplay
                    years={ageResult.years}
                    daysUntilBirthday={ageResult.daysUntilBirthday}
                    language={language === "te" ? "te" : "en"}
                    translations={{
                      birthdayWishes: t.birthdayWishes,
                      motivationTips: t.motivationTips,
                      advanceBirthday: t.advanceBirthday,
                      belatedBirthday: t.belatedBirthday,
                      presentBirthday: t.presentBirthday,
                      daysLeft: t.daysLeft,
                      ageBasedAdvice: t.ageBasedAdvice,
                    }}
                  />
                </>
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
