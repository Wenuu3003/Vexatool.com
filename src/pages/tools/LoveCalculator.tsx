import { useState, useEffect } from "react";
import { Heart, Calendar, Sparkles, Copy, RefreshCw, Cake, Clock } from "lucide-react";
import { CanonicalHead } from "@/components/CanonicalHead";
import { ToolLayout } from "@/components/ToolLayout";
import ToolSEOContent from "@/components/ToolSEOContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { cn } from "@/lib/utils";

type Language = "en" | "en-fun" | "hi" | "te";

interface Translations {
  loveCalculator: string;
  ageCalculator: string;
  yourName: string;
  partnerName: string;
  calculate: string;
  tryAnother: string;
  shareResult: string;
  copied: string;
  lovePercentage: string;
  compatibility: string;
  dateOfBirth: string;
  calculateAge: string;
  yourAge: string;
  years: string;
  months: string;
  days: string;
  nextBirthday: string;
  daysUntil: string;
  bornOn: string;
  disclaimer: string;
  enterNames: string;
  enterDob: string;
  messages: {
    perfect: string;
    great: string;
    good: string;
    moderate: string;
    developing: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    loveCalculator: "Love Calculator",
    ageCalculator: "Age Calculator",
    yourName: "Your Name",
    partnerName: "Partner's Name",
    calculate: "Calculate Love",
    tryAnother: "Try Another",
    shareResult: "Share Result",
    copied: "Result copied to clipboard!",
    lovePercentage: "Love Percentage",
    compatibility: "Compatibility",
    dateOfBirth: "Date of Birth",
    calculateAge: "Calculate Age",
    yourAge: "Your Exact Age",
    years: "Years",
    months: "Months",
    days: "Days",
    nextBirthday: "Next Birthday",
    daysUntil: "days until your birthday!",
    bornOn: "You were born on",
    disclaimer: "This tool is for entertainment purposes only.",
    enterNames: "Please enter both names",
    enterDob: "Please enter your date of birth",
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
    calculate: "Find True Love!",
    tryAnother: "Test Another Match",
    shareResult: "Brag About It",
    copied: "Love stats copied! Time to share!",
    lovePercentage: "Love Power Level",
    compatibility: "Vibe Check",
    dateOfBirth: "When Did You Land on Earth?",
    calculateAge: "Reveal My Age",
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
    calculate: "प्रेम जांचें",
    tryAnother: "दोबारा कोशिश करें",
    shareResult: "परिणाम साझा करें",
    copied: "परिणाम कॉपी हो गया!",
    lovePercentage: "प्रेम प्रतिशत",
    compatibility: "अनुकूलता",
    dateOfBirth: "जन्म तिथि",
    calculateAge: "आयु जांचें",
    yourAge: "आपकी सही आयु",
    years: "साल",
    months: "महीने",
    days: "दिन",
    nextBirthday: "अगला जन्मदिन",
    daysUntil: "दिन बाकी आपके जन्मदिन में!",
    bornOn: "आपका जन्म हुआ था",
    disclaimer: "यह टूल केवल मनोरंजन के लिए है।",
    enterNames: "कृपया दोनों नाम दर्ज करें",
    enterDob: "कृपया अपनी जन्म तिथि दर्ज करें",
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
    calculate: "ప్రేమ లెక్కించండి",
    tryAnother: "మళ్ళీ ప్రయత్నించండి",
    shareResult: "ఫలితం షేర్ చేయండి",
    copied: "ఫలితం కాపీ అయింది!",
    lovePercentage: "ప్రేమ శాతం",
    compatibility: "అనుకూలత",
    dateOfBirth: "పుట్టిన తేదీ",
    calculateAge: "వయసు లెక్కించండి",
    yourAge: "మీ ఖచ్చితమైన వయసు",
    years: "సంవత్సరాలు",
    months: "నెలలు",
    days: "రోజులు",
    nextBirthday: "తదుపరి పుట్టినరోజు",
    daysUntil: "రోజులు మీ పుట్టినరోజుకు!",
    bornOn: "మీరు పుట్టారు",
    disclaimer: "ఈ సాధనం వినోదం కోసం మాత్రమే.",
    enterNames: "దయచేసి రెండు పేర్లు నమోదు చేయండి",
    enterDob: "దయచేసి మీ పుట్టిన తేదీ నమోదు చేయండి",
    messages: {
      perfect: "స్వర్గంలో తయారైన జోడీ! మీ బంధం అద్భుతం! 💕",
      great: "మీ ఇద్దరి మధ్య అద్భుతమైన కనెక్షన్ ఉంది! 💖",
      good: "మీ మధ్య నిజమైన కెమిస్ట్రీ ఉంది! 💗",
      moderate: "మీ సంబంధం అందంగా పెరిగే అవకాశం ఉంది! 💓",
      developing: "ప్రతి గొప్ప ప్రేమ కథకు ఒక ప్రారంభం ఉంటుంది! 💝",
    },
  },
};

const dayNames: Record<Language, string[]> = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  "en-fun": ["Lazy Sunday", "Manic Monday", "Taco Tuesday", "Hump Day", "Almost Friday", "TGIF", "Party Saturday"],
  hi: ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"],
  te: ["ఆదివారం", "సోమవారం", "మంగళవారం", "బుధవారం", "గురువారం", "శుక్రవారం", "శనివారం"],
};

export default function LoveCalculator() {
  const { toast } = useToast();
  const [language, setLanguage] = useState<Language>("en");
  const [activeTab, setActiveTab] = useState("love");
  
  // Love Calculator State
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [loveResult, setLoveResult] = useState<{ percentage: number; message: string } | null>(null);
  const [showHearts, setShowHearts] = useState(false);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  
  // Age Calculator State
  const [birthDate, setBirthDate] = useState("");
  const [ageResult, setAgeResult] = useState<{
    years: number;
    months: number;
    days: number;
    nextBirthday: Date;
    daysUntilBirthday: number;
    dayOfBirth: string;
  } | null>(null);

  const t = translations[language];

  // Animate percentage on result
  useEffect(() => {
    if (loveResult) {
      setAnimatedPercentage(0);
      const duration = 1500;
      const steps = 60;
      const increment = loveResult.percentage / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= loveResult.percentage) {
          setAnimatedPercentage(loveResult.percentage);
          clearInterval(timer);
        } else {
          setAnimatedPercentage(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [loveResult]);

  const calculateLove = () => {
    const trimmedName1 = name1.trim();
    const trimmedName2 = name2.trim();
    
    if (!trimmedName1 || !trimmedName2) {
      toast({ title: t.enterNames, variant: "destructive" });
      return;
    }

    // Fun algorithm based on names (deterministic for same names)
    const combined = (trimmedName1 + trimmedName2).toLowerCase().replace(/[^a-z]/g, "");
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = ((hash << 5) - hash) + combined.charCodeAt(i);
      hash = hash & hash;
    }
    
    // Generate percentage between 50-100 for positive vibes
    const percentage = 50 + Math.abs(hash % 51);
    
    let message: string;
    if (percentage >= 90) message = t.messages.perfect;
    else if (percentage >= 80) message = t.messages.great;
    else if (percentage >= 70) message = t.messages.good;
    else if (percentage >= 60) message = t.messages.moderate;
    else message = t.messages.developing;

    setLoveResult({ percentage, message });
    setShowHearts(true);
    setTimeout(() => setShowHearts(false), 3000);
  };

  const calculateAge = () => {
    if (!birthDate) {
      toast({ title: t.enterDob, variant: "destructive" });
      return;
    }

    const birth = new Date(birthDate);
    const today = new Date();
    
    if (birth > today) {
      toast({ title: "Date cannot be in the future", variant: "destructive" });
      return;
    }

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Calculate next birthday
    let nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday <= today) {
      nextBirthday = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
    }
    
    const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const dayOfBirth = dayNames[language][birth.getDay()];

    setAgeResult({ years, months, days, nextBirthday, daysUntilBirthday, dayOfBirth });
  };

  const resetLove = () => {
    setName1("");
    setName2("");
    setLoveResult(null);
    setAnimatedPercentage(0);
  };

  const shareLoveResult = async () => {
    if (!loveResult) return;
    const text = `❤️ Love Calculator Result ❤️\n${name1} + ${name2} = ${loveResult.percentage}% Compatible!\n${loveResult.message}\nTry it: https://mypdfs.in/love-calculator`;
    
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: t.copied });
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const shareAgeResult = async () => {
    if (!ageResult) return;
    const text = `🎂 Age Calculator Result 🎂\nI am ${ageResult.years} years, ${ageResult.months} months, and ${ageResult.days} days old!\n${ageResult.daysUntilBirthday} days until my next birthday! 🎉\nCalculate yours: https://mypdfs.in/love-calculator`;
    
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: t.copied });
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const seoContent = {
    toolName: "Love Calculator & Age Calculator",
    whatIs: "Our Love Calculator is a fun, entertaining tool that calculates love compatibility between two people based on their names. Paired with our precise Age Calculator, you can find your exact age in years, months, and days, plus countdown to your next birthday. These tools are designed purely for entertainment and fun!",
    howToUse: [
      "For Love Calculator: Enter your name and your partner's name, then click 'Calculate Love' to see your compatibility percentage.",
      "For Age Calculator: Enter your date of birth and click 'Calculate Age' to see your exact age.",
      "Switch between languages using the dropdown menu for Hindi, Telugu, or English.",
      "Share your fun results with friends using the 'Share Result' button!",
    ],
    features: [
      "Instant love compatibility percentage with fun messages",
      "Precise age calculation in years, months, and days",
      "Next birthday countdown feature",
      "Multi-language support (English, Hindi, Telugu)",
      "Beautiful heart animations and smooth transitions",
      "Mobile-friendly responsive design",
      "100% client-side - no data sent to servers",
    ],
    safetyNote: "Absolutely! Both tools run entirely in your browser. No personal data is collected, stored, or transmitted. The Love Calculator is purely for entertainment and does not make any real predictions about relationships.",
    faqs: [
      {
        question: "What is a Love Calculator?",
        answer: "A Love Calculator is a fun, entertaining tool that generates a compatibility percentage based on two names. It uses a simple algorithm to create a score for amusement purposes only - it's not scientifically accurate!",
      },
      {
        question: "Is this Love Calculator accurate?",
        answer: "No, this is purely for entertainment! Love and relationships are complex and cannot be determined by any calculator. Use this tool just for fun with friends and family.",
      },
      {
        question: "Is the Age Calculator free?",
        answer: "Yes, both the Age Calculator and Love Calculator are completely free to use with no hidden charges or subscriptions required.",
      },
      {
        question: "Can I share my love result?",
        answer: "Absolutely! Click the 'Share Result' button to copy your result to clipboard as text. You can then paste and share it on any social media or messaging app.",
      },
      {
        question: "Is this tool safe to use?",
        answer: "Yes, completely safe. Both tools run 100% in your browser. We don't collect, store, or transmit any personal information. Your data stays on your device.",
      },
      {
        question: "Does Love Calculator really predict love?",
        answer: "No! This is a fun entertainment tool only. Real love and compatibility depend on many factors that no algorithm can measure. Enjoy it for what it is - a fun activity!",
      },
      {
        question: "Why are love percentages always above 50%?",
        answer: "We believe in spreading positivity! Our algorithm is designed to give encouraging results because we want everyone to have fun and feel good while using the tool.",
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": seoContent.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  return (
    <>
      <CanonicalHead
        title="Love Calculator ❤️ & Age Calculator – Check Compatibility & Exact Age Online"
        description="Check love compatibility with our Love Calculator ❤️ Also calculate your exact age, next birthday & more. Free, fun, fast & AdSense-safe tool."
        keywords="love calculator, age calculator, love compatibility, name love calculator, online age calculator, fun love test, birthday calculator"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      
      <ToolLayout
        title="Love Calculator & Age Calculator"
        description="Fun love compatibility test and precise age calculator with next birthday countdown"
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
              <Card className="border-pink-200 dark:border-pink-900">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2 text-pink-600 dark:text-pink-400">
                    <Heart className="w-6 h-6" fill="currentColor" />
                    {t.loveCalculator}
                    <Heart className="w-6 h-6" fill="currentColor" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name1">{t.yourName}</Label>
                      <Input
                        id="name1"
                        value={name1}
                        onChange={(e) => setName1(e.target.value)}
                        placeholder="Enter your name"
                        maxLength={50}
                        className="border-pink-200 focus:border-pink-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name2">{t.partnerName}</Label>
                      <Input
                        id="name2"
                        value={name2}
                        onChange={(e) => setName2(e.target.value)}
                        placeholder="Enter partner's name"
                        maxLength={50}
                        className="border-pink-200 focus:border-pink-400"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={calculateLove}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    {t.calculate}
                  </Button>

                  {/* Love Result */}
                  {loveResult && (
                    <div className="mt-6 p-6 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 rounded-xl border border-pink-200 dark:border-pink-800 animate-scale-in">
                      <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-2 text-lg font-medium">
                          <span>{name1}</span>
                          <Heart className="w-5 h-5 text-pink-500" fill="currentColor" />
                          <span>{name2}</span>
                        </div>

                        {/* Animated Progress Circle */}
                        <div className="relative w-40 h-40 mx-auto">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="80"
                              cy="80"
                              r="70"
                              stroke="currentColor"
                              strokeWidth="12"
                              fill="none"
                              className="text-pink-100 dark:text-pink-900"
                            />
                            <circle
                              cx="80"
                              cy="80"
                              r="70"
                              stroke="url(#gradient)"
                              strokeWidth="12"
                              fill="none"
                              strokeLinecap="round"
                              strokeDasharray={440}
                              strokeDashoffset={440 - (440 * animatedPercentage) / 100}
                              className="transition-all duration-100"
                            />
                            <defs>
                              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#ec4899" />
                                <stop offset="100%" stopColor="#f43f5e" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-pink-600 dark:text-pink-400">
                              {animatedPercentage}%
                            </span>
                            <span className="text-sm text-muted-foreground">{t.compatibility}</span>
                          </div>
                        </div>

                        <p className="text-lg font-medium text-pink-700 dark:text-pink-300">
                          {loveResult.message}
                        </p>

                        <div className="flex gap-2 justify-center flex-wrap">
                          <Button variant="outline" onClick={resetLove} className="gap-2">
                            <RefreshCw className="w-4 h-4" />
                            {t.tryAnother}
                          </Button>
                          <Button variant="outline" onClick={shareLoveResult} className="gap-2">
                            <Copy className="w-4 h-4" />
                            {t.shareResult}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-center text-muted-foreground mt-4">
                    ⚠️ {t.disclaimer}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Age Calculator Tab */}
            <TabsContent value="age" className="space-y-6">
              <Card className="border-blue-200 dark:border-blue-900">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                    <Cake className="w-6 h-6" />
                    {t.ageCalculator}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">{t.dateOfBirth}</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className="border-blue-200 focus:border-blue-400"
                    />
                  </div>

                  <Button
                    onClick={calculateAge}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {t.calculateAge}
                  </Button>

                  {/* Age Result */}
                  {ageResult && (
                    <div className="mt-6 space-y-4 animate-scale-in">
                      {/* Main Age Display */}
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                        <h3 className="text-center text-lg font-medium mb-4">{t.yourAge}</h3>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                            <div className="text-3xl font-bold text-blue-600">{ageResult.years}</div>
                            <div className="text-sm text-muted-foreground">{t.years}</div>
                          </div>
                          <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                            <div className="text-3xl font-bold text-indigo-600">{ageResult.months}</div>
                            <div className="text-sm text-muted-foreground">{t.months}</div>
                          </div>
                          <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                            <div className="text-3xl font-bold text-purple-600">{ageResult.days}</div>
                            <div className="text-sm text-muted-foreground">{t.days}</div>
                          </div>
                        </div>
                      </div>

                      {/* Birthday Countdown */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
                          <CardContent className="p-4 text-center">
                            <Cake className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                            <h4 className="font-medium">{t.nextBirthday}</h4>
                            <p className="text-2xl font-bold text-amber-600 mt-1">
                              {ageResult.daysUntilBirthday}
                            </p>
                            <p className="text-sm text-muted-foreground">{t.daysUntil}</p>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
                          <CardContent className="p-4 text-center">
                            <Clock className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                            <h4 className="font-medium">{t.bornOn}</h4>
                            <p className="text-xl font-bold text-emerald-600 mt-1">
                              {ageResult.dayOfBirth}
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      <Button variant="outline" onClick={shareAgeResult} className="w-full gap-2">
                        <Copy className="w-4 h-4" />
                        {t.shareResult}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Blog Content Section */}
          <div className="mt-12 prose prose-gray dark:prose-invert max-w-none">
            <h2 className="text-2xl font-bold mb-4">
              {language === "hi" 
                ? "प्रेम कैलकुलेटर और आयु कैलकुलेटर: मज़ेदार और उपयोगी टूल्स"
                : language === "te"
                ? "ప్రేమ కాల్క్యులేటర్ & వయసు కాల్క్యులేటర్: సరదా మరియు ఉపయోగకరమైన సాధనాలు"
                : "Love Calculator & Age Calculator: Fun & Useful Tools for Everyone"}
            </h2>

            {language === "hi" ? (
              <>
                <h3 className="text-xl font-semibold mt-6">❤️ प्रेम कैलकुलेटर क्या है?</h3>
                <p>
                  प्रेम कैलकुलेटर एक मज़ेदार ऑनलाइन टूल है जो दो नामों के आधार पर प्रेम अनुकूलता प्रतिशत बनाता है। 
                  यह पूरी तरह से मनोरंजन के लिए है और इसका कोई वैज्ञानिक आधार नहीं है। अपने दोस्तों, परिवार, 
                  या क्रश के साथ मज़े के लिए इस्तेमाल करें!
                </p>

                <h3 className="text-xl font-semibold mt-6">🎂 आयु कैलकुलेटर कैसे काम करता है?</h3>
                <p>
                  हमारा आयु कैलकुलेटर आपकी जन्म तिथि लेता है और आपकी सटीक आयु की गणना करता है - साल, महीने और दिनों में। 
                  साथ ही यह बताता है कि आपके अगले जन्मदिन में कितने दिन बाकी हैं और आप किस दिन पैदा हुए थे!
                </p>

                <h3 className="text-xl font-semibold mt-6">🌟 इन टूल्स का उपयोग क्यों करें?</h3>
                <ul>
                  <li>💯 100% मुफ्त - कोई छिपा शुल्क नहीं</li>
                  <li>🔒 पूरी तरह सुरक्षित - कोई डेटा संग्रहित नहीं</li>
                  <li>⚡ तुरंत परिणाम - कोई प्रतीक्षा नहीं</li>
                  <li>📱 मोबाइल फ्रेंडली - कहीं भी इस्तेमाल करें</li>
                  <li>🌐 हिंदी में उपलब्ध</li>
                </ul>

                <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800 mt-6">
                  <p className="text-sm">
                    <strong>⚠️ अस्वीकरण:</strong> प्रेम कैलकुलेटर केवल मनोरंजन के लिए है। यह प्रेम या संबंधों के बारे में 
                    कोई वास्तविक भविष्यवाणी नहीं करता। कृपया इसे हल्के में लें और मज़े करें!
                  </p>
                </div>
              </>
            ) : language === "te" ? (
              <>
                <h3 className="text-xl font-semibold mt-6">❤️ ప్రేమ కాల్క్యులేటర్ అంటే ఏమిటి?</h3>
                <p>
                  ప్రేమ కాల్క్యులేటర్ అనేది రెండు పేర్ల ఆధారంగా ప్రేమ అనుకూలత శాతాన్ని రూపొందించే సరదా ఆన్‌లైన్ సాధనం. 
                  ఇది పూర్తిగా వినోదం కోసం మాత్రమే మరియు దీనికి ఎటువంటి శాస్త్రీయ ఆధారం లేదు. మీ స్నేహితులు, 
                  కుటుంబం లేదా క్రష్‌తో సరదాగా ఉపయోగించండి!
                </p>

                <h3 className="text-xl font-semibold mt-6">🎂 వయసు కాల్క్యులేటర్ ఎలా పని చేస్తుంది?</h3>
                <p>
                  మా వయసు కాల్క్యులేటర్ మీ పుట్టిన తేదీని తీసుకుని మీ ఖచ్చితమైన వయసును లెక్కిస్తుంది - సంవత్సరాలు, 
                  నెలలు మరియు రోజులలో. అలాగే మీ తదుపరి పుట్టినరోజుకు ఎన్ని రోజులు మిగిలి ఉన్నాయో మరియు 
                  మీరు ఏ రోజున పుట్టారో కూడా చూపిస్తుంది!
                </p>

                <h3 className="text-xl font-semibold mt-6">🌟 ఈ సాధనాలను ఎందుకు ఉపయోగించాలి?</h3>
                <ul>
                  <li>💯 100% ఉచితం - దాచిన ఛార్జీలు లేవు</li>
                  <li>🔒 పూర్తిగా సురక్షితం - డేటా నిల్వ చేయబడదు</li>
                  <li>⚡ తక్షణ ఫలితాలు - వేచి ఉండవలసిన అవసరం లేదు</li>
                  <li>📱 మొబైల్ ఫ్రెండ్లీ - ఎక్కడైనా ఉపయోగించండి</li>
                  <li>🌐 తెలుగులో అందుబాటులో</li>
                </ul>

                <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800 mt-6">
                  <p className="text-sm">
                    <strong>⚠️ నిరాకరణ:</strong> ప్రేమ కాల్క్యులేటర్ వినోదం కోసం మాత్రమే. ఇది ప్రేమ లేదా సంబంధాల 
                    గురించి ఎటువంటి నిజమైన అంచనాలను చేయదు. దయచేసి దీన్ని తేలికగా తీసుకోండి మరియు సరదాగా ఆనందించండి!
                  </p>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold mt-6">❤️ What is the Love Calculator?</h3>
                <p>
                  The Love Calculator is a fun, entertaining online tool that generates a love compatibility 
                  percentage based on two names. It's purely for entertainment and has no scientific basis. 
                  Use it for fun with your friends, family, or crush! The algorithm creates a consistent 
                  result for the same names, so you can share and compare with others.
                </p>

                <h3 className="text-xl font-semibold mt-6">🎂 How Does the Age Calculator Work?</h3>
                <p>
                  Our Age Calculator takes your date of birth and calculates your exact age in years, months, 
                  and days. It also shows you how many days are left until your next birthday and what day of 
                  the week you were born on! Perfect for birthday planning, official document filling, or just 
                  satisfying your curiosity about your exact age.
                </p>

                <h3 className="text-xl font-semibold mt-6">🌟 Why Use These Tools?</h3>
                <ul>
                  <li>💯 100% Free - No hidden charges or subscriptions</li>
                  <li>🔒 Completely Safe - No data stored or transmitted</li>
                  <li>⚡ Instant Results - No waiting or loading</li>
                  <li>📱 Mobile Friendly - Use anywhere, anytime</li>
                  <li>🌐 Multi-language Support - English, Hindi, Telugu</li>
                  <li>🎨 Beautiful Animations - Heart effects and smooth transitions</li>
                  <li>📤 Easy Sharing - Copy results with one click</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6">💕 The Fun Behind Love Calculations</h3>
                <p>
                  Our Love Calculator uses a simple algorithm based on the characters in both names. While it's 
                  not scientifically accurate (love is far too complex for any algorithm!), it provides 
                  consistent results for the same name pairs. We've designed it to always give encouraging 
                  results because we believe in spreading positivity! Every match gets at least 50%, because 
                  every connection has potential. 😊
                </p>

                <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800 mt-6">
                  <p className="text-sm">
                    <strong>⚠️ Disclaimer:</strong> The Love Calculator is for entertainment purposes only. 
                    It does not make any real predictions about love or relationships. Please take the results 
                    lightly and have fun! Real love is based on understanding, respect, and genuine connection 
                    - not percentages from an online tool.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <ToolSEOContent {...seoContent} />
      </ToolLayout>
    </>
  );
}
