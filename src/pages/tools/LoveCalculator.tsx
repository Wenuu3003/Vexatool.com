import { useState } from "react";
import { Heart, Info } from "lucide-react";
import { CanonicalHead } from "@/components/CanonicalHead";
import { ToolLayout } from "@/components/ToolLayout";
import ToolSEOContent from "@/components/ToolSEOContent";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

import { LoveCalculatorForm, type LoveFormData, type Gender } from "@/components/calculators/LoveCalculatorForm";
import { LoveResultDisplay, type LoveResult } from "@/components/calculators/LoveResultDisplay";
import { calculateLoveCompatibility, getLoveMessage } from "@/lib/loveCalculator";

type Language = "en" | "en-fun" | "hi" | "te";

const translations: Record<Language, Record<string, any>> = {
  en: {
    loveCalculator: "Love Calculator",
    yourName: "Your Name",
    partnerName: "Partner's Name",
    calculate: "Calculate Love ❤️",
    tryAnother: "Try Another",
    shareResult: "Copy Text",
    downloadCard: "Download Card",
    copied: "Result copied to clipboard!",
    compatibility: "Compatibility",
    dateOfBirth: "Date of Birth",
    gender: "Gender",
    male: "Male",
    female: "Female",
    optional: "Optional",
    nameMatch: "Name Match",
    numerology: "Numerology",
    zodiac: "Zodiac",
    disclaimer: "This tool is for entertainment purposes only. Results are not scientifically accurate.",
    enterNames: "Please enter both names",
    selectGender: "Please select gender for both persons",
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
    yourName: "Your Awesome Name",
    partnerName: "Your Crush's Name",
    calculate: "Find True Love! 💘",
    tryAnother: "Test Another Match",
    shareResult: "Copy Text",
    downloadCard: "Get Image 📸",
    copied: "Love stats copied! Time to share!",
    compatibility: "Vibe Check",
    dateOfBirth: "When Did You Land on Earth?",
    gender: "Vibe",
    male: "He/Him",
    female: "She/Her",
    optional: "Bonus",
    nameMatch: "Name Vibes",
    numerology: "Cosmic Score",
    zodiac: "Star Signs",
    disclaimer: "Just for fun! Not a crystal ball! 🔮",
    enterNames: "We need names to work our magic!",
    selectGender: "Pick your vibe for both!",
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
    yourName: "आपका नाम",
    partnerName: "साथी का नाम",
    calculate: "प्रेम जांचें ❤️",
    tryAnother: "दोबारा कोशिश करें",
    shareResult: "कॉपी करें",
    downloadCard: "इमेज डाउनलोड करें",
    copied: "परिणाम कॉपी हो गया!",
    compatibility: "अनुकूलता",
    dateOfBirth: "जन्म तिथि",
    gender: "लिंग",
    male: "पुरुष",
    female: "महिला",
    optional: "वैकल्पिक",
    nameMatch: "नाम मिलान",
    numerology: "अंक ज्योतिष",
    zodiac: "राशि",
    disclaimer: "यह टूल केवल मनोरंजन के लिए है। परिणाम वैज्ञानिक रूप से सटीक नहीं हैं।",
    enterNames: "कृपया दोनों नाम दर्ज करें",
    selectGender: "कृपया दोनों के लिए लिंग चुनें",
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
    yourName: "మీ పేరు",
    partnerName: "భాగస్వామి పేరు",
    calculate: "ప్రేమ లెక్కించండి ❤️",
    tryAnother: "మళ్ళీ ప్రయత్నించండి",
    shareResult: "కాపీ చేయండి",
    downloadCard: "ఇమేజ్ డౌన్‌లోడ్",
    copied: "ఫలితం కాపీ అయింది!",
    compatibility: "అనుకూలత",
    dateOfBirth: "పుట్టిన తేదీ",
    gender: "లింగం",
    male: "పురుషుడు",
    female: "స్త్రీ",
    optional: "ఐచ్ఛికం",
    nameMatch: "పేరు సరిపోలిక",
    numerology: "సంఖ్యాశాస్త్రం",
    zodiac: "రాశి",
    disclaimer: "ఈ సాధనం వినోదం కోసం మాత్రమే. ఫలితాలు శాస్త్రీయంగా ఖచ్చితమైనవి కావు.",
    enterNames: "దయచేసి రెండు పేర్లు నమోదు చేయండి",
    selectGender: "దయచేసి ఇద్దరికీ లింగం ఎంచుకోండి",
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

  const seoContent = {
    toolName: "Love Calculator – Free Compatibility Test",
    whatIs: "Our Love Calculator is a fun entertainment tool that calculates love compatibility using a triple-scoring algorithm: name matching (45%), numerology life path analysis (30%), and zodiac sign compatibility (25%). Upload photos to create personalized shareable cards perfect for Instagram Stories and WhatsApp Status.",
    howToUse: [
      "Enter both names and select gender for each person.",
      "Optionally add dates of birth for numerology and zodiac analysis.",
      "Upload photos (optional) to personalize your share cards with profile pictures.",
      "Click 'Calculate Love' to see your compatibility percentage with a detailed breakdown.",
      "Share fun results on Instagram Stories or WhatsApp Status using the share buttons!",
    ],
    features: [
      "Triple-scoring love compatibility: Name matching (45%) + Numerology (30%) + Zodiac (25%)",
      "Zodiac sign compatibility with element matching (Fire, Earth, Air, Water)",
      "Photo uploads for personalized social media share cards",
      "Instagram Story format (1080×1920) & WhatsApp Status format (1080×1080)",
      "Web Share API for direct mobile sharing to apps",
      "Multi-language support (English, Hindi, Telugu, Fun English)",
      "100% client-side processing — no data sent to servers",
    ],
    safetyNote: "Absolutely! This tool runs entirely in your browser. No personal data, names, photos, or birth dates are collected, stored, or transmitted to any server. The Love Calculator is purely for entertainment and fun with friends and family.",
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
        question: "Can I share my results on Instagram and WhatsApp?",
        answer: "Yes! The calculator generates beautiful share cards optimized for Instagram Stories (9:16 vertical format) and WhatsApp Status (1:1 square format). On mobile devices, you can share directly to apps using the native share feature. On desktop, images are downloaded for manual sharing.",
      },
      {
        question: "Is this Love Calculator accurate for real relationships?",
        answer: "No, this is purely for entertainment! Real love and relationships are complex and cannot be determined by any calculator or algorithm. Use this tool just for fun with friends, family, and crushes. Real compatibility depends on communication, shared values, and mutual respect.",
      },
      {
        question: "Is my data safe when using this tool?",
        answer: "Absolutely safe! This tool runs 100% in your browser. We don't collect, store, or transmit any personal information including names, birth dates, or photos. Your data never leaves your device — complete privacy guaranteed.",
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
        title="Love Calculator ❤️ Free Compatibility Test with Zodiac & Shareable Cards"
        description="Free Love Calculator with zodiac compatibility, numerology, and name matching. Upload photos, get Instagram & WhatsApp ready images. Fun & safe!"
        keywords="love calculator, love compatibility test, zodiac love calculator, name love calculator, numerology compatibility"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <ToolLayout
        title="Love Calculator"
        description="Professional love compatibility test with numerology & zodiac analysis"
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

          {/* Love Calculator */}
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
