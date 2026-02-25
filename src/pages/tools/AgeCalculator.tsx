import { useState } from "react";
import { Calendar, Calculator } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolLayout } from "@/components/ToolLayout";
import { RelatedTools } from "@/components/RelatedTools";
import { calculateAge } from "@/lib/ageCalculator";
import { AgeResultDisplay, AgeResult } from "@/components/calculators/AgeResultDisplay";
import { AgeWishesDisplay } from "@/components/calculators/AgeWishesDisplay";
import { toast } from "sonner";
import { Helmet } from "react-helmet";
import { TableOfContents } from "@/components/TableOfContents";

// SEO FAQ Schema
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How accurate is this age calculator?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our age calculator is 100% accurate, calculating your exact age down to the day, including leap years and varying month lengths."
      }
    },
    {
      "@type": "Question",
      "name": "Can I calculate age in Telugu?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Our age calculator supports both English and Telugu languages. Switch between languages anytime for birthday wishes and motivation tips."
      }
    },
    {
      "@type": "Question",
      "name": "How do the birthday wishes work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our calculator automatically detects if your birthday is today, upcoming (within 7 days), or recently passed, and shows appropriate birthday wishes with confetti celebration on your special day."
      }
    },
    {
      "@type": "Question",
      "name": "What are the motivation tips based on?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Motivation tips are personalized based on your age group: Child (0-17), Young Adult (18-34), Adult (35-59), and Senior (60+), providing relevant life wisdom for each stage."
      }
    },
    {
      "@type": "Question",
      "name": "Can I share my age results on social media?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely! Create beautiful shareable cards for Instagram Stories (9:16) and WhatsApp Status (1:1) with your age, photo, and personalized messages."
      }
    }
  ]
};

// Translations
const translations = {
  en: {
    title: "Age Calculator",
    subtitle: "Calculate your exact age with birthday wishes & life tips",
    birthDate: "Your Birth Date",
    calculateDate: "Calculate Age On",
    yourName: "Your Name (Optional)",
    calculate: "Calculate My Age",
    language: "Language",
    yourAge: "Your Exact Age",
    years: "Years",
    months: "Months",
    days: "Days",
    nextBirthday: "Next Birthday",
    daysUntil: "days until your birthday",
    bornOn: "You Were Born On",
    shareResult: "Copy & Share",
    totalDays: "Total Days",
    totalWeeks: "Total Weeks",
    totalHours: "Total Hours",
    birthdayWishes: "Birthday Wishes",
    motivationTips: "Life Wisdom",
    advanceBirthday: "Advance Birthday",
    belatedBirthday: "Belated Birthday",
    presentBirthday: "🎂 It's Your Birthday! 🎂",
    daysLeft: "days until your birthday",
    ageBasedAdvice: "Tips for Your Age",
  },
  te: {
    title: "వయస్సు కాలిక్యులేటర్",
    subtitle: "పుట్టినరోజు శుభాకాంక్షలు & జీవిత చిట్కాలతో మీ ఖచ్చితమైన వయస్సును లెక్కించండి",
    birthDate: "మీ పుట్టిన తేదీ",
    calculateDate: "ఈ తేదీన వయస్సు లెక్కించండి",
    yourName: "మీ పేరు (ఐచ్ఛికం)",
    calculate: "నా వయస్సు లెక్కించండి",
    language: "భాష",
    yourAge: "మీ ఖచ్చితమైన వయస్సు",
    years: "సంవత్సరాలు",
    months: "నెలలు",
    days: "రోజులు",
    nextBirthday: "తదుపరి పుట్టినరోజు",
    daysUntil: "మీ పుట్టినరోజుకు రోజులు",
    bornOn: "మీరు పుట్టిన రోజు",
    shareResult: "కాపీ & షేర్",
    totalDays: "మొత్తం రోజులు",
    totalWeeks: "మొత్తం వారాలు",
    totalHours: "మొత్తం గంటలు",
    birthdayWishes: "పుట్టినరోజు శుభాకాంక్షలు",
    motivationTips: "జీవిత జ్ఞానం",
    advanceBirthday: "ముందస్తు పుట్టినరోజు",
    belatedBirthday: "ఆలస్యమైన పుట్టినరోజు",
    presentBirthday: "🎂 మీ పుట్టినరోజు! 🎂",
    daysLeft: "మీ పుట్టినరోజుకు రోజులు",
    ageBasedAdvice: "మీ వయస్సుకు చిట్కాలు",
  },
};

const AgeCalculator = () => {
  const [birthDate, setBirthDate] = useState("");
  const [calculateDate, setCalculateDate] = useState(new Date().toISOString().split("T")[0]);
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [language, setLanguage] = useState<"en" | "te">("en");
  const [result, setResult] = useState<AgeResult | null>(null);

  const t = translations[language];

  const handleCalculate = () => {
    if (!birthDate) {
      toast.error("Please enter your birth date");
      return;
    }

    const ageResult = calculateAge(birthDate, calculateDate, language);
    if (ageResult) {
      setResult(ageResult);
      toast.success("Age calculated successfully! 🎂");
    } else {
      toast.error("Invalid date. Birth date must be before the calculation date.");
    }
  };

  const handleShare = () => {
    if (!result) return;
    
    const shareText = `I'm ${result.years} years, ${result.months} months, and ${result.days} days old! 🎂\n\nThat's ${result.totalDays.toLocaleString()} days or ${result.totalHours.toLocaleString()} hours of life!\n\nCalculate your age at: https://vexatool.com/age-calculator`;
    
    if (navigator.share) {
      navigator.share({
        title: "My Age - Age Calculator",
        text: shareText,
        url: "https://vexatool.com/age-calculator",
      }).catch(() => {
        navigator.clipboard.writeText(shareText);
        toast.success("Copied to clipboard! 📋");
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Copied to clipboard! 📋");
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Helmet>
        <title>Age Calculator - Calculate Exact Age in Years, Months & Days | VexaTool</title>
        <meta name="description" content="Free online age calculator. Calculate your exact age in years, months, days, hours. Birthday wishes in English & Telugu. Share on Instagram & WhatsApp. No signup required." />
        <meta name="keywords" content="age calculator, birthday calculator, how old am I, age in days, age in months, telugu age calculator, birthday wishes, exact age calculator" />
        <link rel="canonical" href="https://vexatool.com/age-calculator" />
        <meta property="og:title" content="Age Calculator - Calculate Exact Age Free | VexaTool" />
        <meta property="og:description" content="Calculate your exact age in years, months, days & hours. Get birthday wishes and life wisdom tips. Share beautiful cards on social media." />
        <meta property="og:url" content="https://vexatool.com/age-calculator" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <ToolLayout
        title={t.title}
        description={t.subtitle}
        icon={Calendar}
        colorClass="bg-gradient-to-br from-blue-500 to-indigo-600"
        category="UtilitiesApplication"
      >
        <div className="max-w-4xl mx-auto">
          {/* Table of Contents */}
          <TableOfContents className="mb-6" />

          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <CardContent className="p-6">
              {/* Language Selector */}
              <div className="flex justify-end mb-4">
                <Select value={language} onValueChange={(v) => setLanguage(v as "en" | "te")}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder={t.language} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">🇬🇧 English</SelectItem>
                    <SelectItem value="te">🇮🇳 తెలుగు</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div id="calculate-age" className="grid gap-4 sm:grid-cols-2">
                {/* Birth Date */}
                <div>
                  <Label htmlFor="birthDate" className="text-sm font-medium">
                    {t.birthDate}
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Calculate Date */}
                <div>
                  <Label htmlFor="calculateDate" className="text-sm font-medium">
                    {t.calculateDate}
                  </Label>
                  <Input
                    id="calculateDate"
                    type="date"
                    value={calculateDate}
                    onChange={(e) => setCalculateDate(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Name (Optional) */}
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">
                    {t.yourName}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="mt-1"
                  />
                </div>

                {/* Photo Upload */}
                <div>
                  <Label htmlFor="photo" className="text-sm font-medium">
                    Photo (Optional)
                  </Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Photo Preview */}
              {photo && (
                <div className="mt-4 flex justify-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-400">
                    <img src={photo} alt="Your photo" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {/* Calculate Button */}
              <Button
                onClick={handleCalculate}
                className="w-full mt-6 gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                size="lg"
              >
                <Calculator className="w-5 h-5" />
                {t.calculate}
              </Button>

              {/* Results */}
              {result && (
                <>
                  <AgeResultDisplay
                    result={result}
                    birthDate={birthDate}
                    photo={photo}
                    name={name}
                    onShare={handleShare}
                    translations={t}
                  />
                  <AgeWishesDisplay
                    years={result.years}
                    daysUntilBirthday={result.daysUntilBirthday}
                    language={language}
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
            </CardContent>
          </Card>

          {/* SEO Content */}
          <div className="mt-8 space-y-8">
            <section id="how-it-works" className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">How Our Age Calculator Works</h2>
              <p>
                Our free age calculator provides precise age calculations down to the exact day. Simply enter your birth date and the date you want to calculate your age for. The calculator considers leap years and varying month lengths for 100% accuracy.
              </p>
              <ul>
                <li><strong>Exact Age:</strong> Years, months, and days breakdown</li>
                <li><strong>Total Statistics:</strong> Days, weeks, and hours you've lived</li>
                <li><strong>Next Birthday:</strong> Countdown to your special day</li>
                <li><strong>Birth Day:</strong> What day of the week you were born</li>
              </ul>
            </section>

            <section id="birthday-wishes" className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">Birthday Wishes Feature</h2>
              <p>
                Our age calculator includes a unique birthday wishes feature available in English and Telugu:
              </p>
              <ul>
                <li><strong>Present Wishes:</strong> Special celebration with confetti when it's your birthday today</li>
                <li><strong>Advance Wishes:</strong> Early birthday messages within 7 days of your birthday</li>
                <li><strong>Belated Wishes:</strong> Late but heartfelt wishes if your birthday recently passed</li>
              </ul>
            </section>

            <section id="motivation-tips" className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">Life Wisdom Tips</h2>
              <p>
                Get personalized motivation and life tips based on your age group:
              </p>
              <ul>
                <li><strong>Children (0-17):</strong> Learning, creativity, and growing up tips</li>
                <li><strong>Young Adults (18-34):</strong> Career, finance, and relationship advice</li>
                <li><strong>Adults (35-59):</strong> Family, investment, and work-life balance tips</li>
                <li><strong>Seniors (60+):</strong> Health, hobbies, and enjoying life wisdom</li>
              </ul>
            </section>

            <section id="share-results" className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">Share Your Results</h2>
              <p>
                Create beautiful shareable cards for social media:
              </p>
              <ul>
                <li><strong>Instagram Stories:</strong> Perfect 9:16 vertical format (1080×1920)</li>
                <li><strong>WhatsApp Status:</strong> Square 1:1 format (1080×1080)</li>
                <li><strong>Personalization:</strong> Include your name and photo</li>
              </ul>
            </section>

            <section id="faq" className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">How accurate is this age calculator?</h3>
                  <p>Our age calculator is 100% accurate, calculating your exact age down to the day, including leap years and varying month lengths.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Can I calculate age in Telugu?</h3>
                  <p>Yes! Our age calculator supports both English and Telugu languages. Switch between languages anytime.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Is my data safe?</h3>
                  <p>Absolutely! All calculations are done in your browser. We never store your birth date or personal information on any server.</p>
                </div>
              </div>
            </section>
          </div>

          {/* Related Tools */}
          <RelatedTools currentPath="/age-calculator" />
        </div>
      </ToolLayout>
    </>
  );
};

export default AgeCalculator;
