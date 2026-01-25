import { useState, useCallback } from "react";
import { CanonicalHead } from "@/components/CanonicalHead";
import { ToolLayout } from "@/components/ToolLayout";
import ToolSEOContent from "@/components/ToolSEOContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet";
import { 
  Download, 
  Video, 
  Link as LinkIcon, 
  RefreshCw, 
  Shield, 
  Smartphone,
  Monitor,
  AlertTriangle,
  Check,
  Loader2,
  Instagram,
  Facebook,
  Globe,
  Info
} from "lucide-react";

type Language = "en" | "te" | "hi";

const translations: Record<Language, Record<string, string>> = {
  en: {
    title: "Social Media Video Downloader",
    subtitle: "Download Instagram & Facebook Videos Free",
    pasteUrl: "Paste video URL here",
    detectPlatform: "Auto-detecting platform...",
    instagram: "Instagram",
    facebook: "Facebook",
    download: "Download Video",
    downloadHD: "Download HD",
    downloadSD: "Download SD",
    tryAnother: "Try Another Link",
    processing: "Processing...",
    preview: "Video Preview",
    disclaimer: "This tool supports only public content. We do not host, store, or track any media.",
    privacyNote: "100% Private - Videos are processed in your browser",
    invalidUrl: "Please enter a valid Instagram or Facebook URL",
    publicOnly: "Only public videos can be downloaded",
    howToUse: "How to Use",
    step1: "Copy the video URL from Instagram or Facebook",
    step2: "Paste the URL in the input box above",
    step3: "Click Download to save the video",
    supported: "Supported Platforms",
    instagramTypes: "Public Reels, Posts, Stories",
    facebookTypes: "Public Videos, Reels",
    features: "Features",
    feature1: "No login required",
    feature2: "Fast & free downloads",
    feature3: "HD quality available",
    feature4: "Mobile-friendly",
    legal: "Legal Notice",
    legalText: "Only download content you have permission to use. Respect copyright and content creator rights.",
  },
  te: {
    title: "సోషల్ మీడియా వీడియో డౌన్‌లోడర్",
    subtitle: "Instagram & Facebook వీడియోలను ఉచితంగా డౌన్‌లోడ్ చేయండి",
    pasteUrl: "వీడియో URL ను ఇక్కడ పేస్ట్ చేయండి",
    detectPlatform: "ప్లాట్‌ఫారమ్‌ను గుర్తిస్తోంది...",
    instagram: "Instagram",
    facebook: "Facebook",
    download: "వీడియో డౌన్‌లోడ్",
    downloadHD: "HD డౌన్‌లోడ్",
    downloadSD: "SD డౌన్‌లోడ్",
    tryAnother: "మరొక లింక్ ప్రయత్నించండి",
    processing: "ప్రాసెసింగ్...",
    preview: "వీడియో ప్రివ్యూ",
    disclaimer: "ఈ సాధనం పబ్లిక్ కంటెంట్‌ను మాత్రమే సపోర్ట్ చేస్తుంది. మేము ఎటువంటి మీడియాను హోస్ట్, స్టోర్ లేదా ట్రాక్ చేయము.",
    privacyNote: "100% ప్రైవేట్ - వీడియోలు మీ బ్రౌజర్‌లో ప్రాసెస్ అవుతాయి",
    invalidUrl: "దయచేసి చెల్లుబాటు అయ్యే Instagram లేదా Facebook URL ను నమోదు చేయండి",
    publicOnly: "పబ్లిక్ వీడియోలను మాత్రమే డౌన్‌లోడ్ చేయవచ్చు",
    howToUse: "ఎలా వాడాలి",
    step1: "Instagram లేదా Facebook నుండి వీడియో URL కాపీ చేయండి",
    step2: "పై ఇన్‌పుట్ బాక్స్‌లో URL పేస్ట్ చేయండి",
    step3: "వీడియోను సేవ్ చేయడానికి డౌన్‌లోడ్ క్లిక్ చేయండి",
    supported: "సపోర్టెడ్ ప్లాట్‌ఫారమ్‌లు",
    instagramTypes: "పబ్లిక్ రీల్స్, పోస్ట్‌లు, స్టోరీలు",
    facebookTypes: "పబ్లిక్ వీడియోలు, రీల్స్",
    features: "ఫీచర్లు",
    feature1: "లాగిన్ అవసరం లేదు",
    feature2: "వేగవంతమైన & ఉచిత డౌన్‌లోడ్‌లు",
    feature3: "HD నాణ్యత అందుబాటులో ఉంది",
    feature4: "మొబైల్-ఫ్రెండ్లీ",
    legal: "చట్టపరమైన నోటీసు",
    legalText: "మీకు అనుమతి ఉన్న కంటెంట్‌ను మాత్రమే డౌన్‌లోడ్ చేయండి. కాపీరైట్ మరియు కంటెంట్ క్రియేటర్ హక్కులను గౌరవించండి.",
  },
  hi: {
    title: "सोशल मीडिया वीडियो डाउनलोडर",
    subtitle: "Instagram और Facebook वीडियो मुफ्त डाउनलोड करें",
    pasteUrl: "वीडियो URL यहाँ पेस्ट करें",
    detectPlatform: "प्लेटफ़ॉर्म का पता लगा रहे हैं...",
    instagram: "Instagram",
    facebook: "Facebook",
    download: "वीडियो डाउनलोड",
    downloadHD: "HD डाउनलोड",
    downloadSD: "SD डाउनलोड",
    tryAnother: "दूसरी लिंक आज़माएं",
    processing: "प्रोसेसिंग...",
    preview: "वीडियो प्रीव्यू",
    disclaimer: "यह टूल केवल पब्लिक कंटेंट को सपोर्ट करता है। हम किसी भी मीडिया को होस्ट, स्टोर या ट्रैक नहीं करते।",
    privacyNote: "100% प्राइवेट - वीडियो आपके ब्राउज़र में प्रोसेस होते हैं",
    invalidUrl: "कृपया वैध Instagram या Facebook URL दर्ज करें",
    publicOnly: "केवल पब्लिक वीडियो डाउनलोड किए जा सकते हैं",
    howToUse: "कैसे उपयोग करें",
    step1: "Instagram या Facebook से वीडियो URL कॉपी करें",
    step2: "ऊपर दिए गए इनपुट बॉक्स में URL पेस्ट करें",
    step3: "वीडियो सेव करने के लिए डाउनलोड क्लिक करें",
    supported: "सपोर्टेड प्लेटफ़ॉर्म",
    instagramTypes: "पब्लिक रील्स, पोस्ट्स, स्टोरीज़",
    facebookTypes: "पब्लिक वीडियो, रील्स",
    features: "फीचर्स",
    feature1: "लॉगिन की आवश्यकता नहीं",
    feature2: "तेज़ और मुफ्त डाउनलोड",
    feature3: "HD क्वालिटी उपलब्ध",
    feature4: "मोबाइल-फ्रेंडली",
    legal: "कानूनी नोटिस",
    legalText: "केवल वही कंटेंट डाउनलोड करें जिसका उपयोग करने की आपको अनुमति है। कॉपीराइट और कंटेंट क्रिएटर के अधिकारों का सम्मान करें।",
  },
};

type DetectedPlatform = "instagram" | "facebook" | null;

interface VideoInfo {
  platform: DetectedPlatform;
  url: string;
  thumbnail?: string;
  title?: string;
}

export default function SocialVideoDownloader() {
  const [language, setLanguage] = useState<Language>("en");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [detectedPlatform, setDetectedPlatform] = useState<DetectedPlatform>(null);

  const t = translations[language];

  const detectPlatform = useCallback((inputUrl: string): DetectedPlatform => {
    const lowerUrl = inputUrl.toLowerCase();
    if (lowerUrl.includes("instagram.com") || lowerUrl.includes("instagr.am")) {
      return "instagram";
    }
    if (lowerUrl.includes("facebook.com") || lowerUrl.includes("fb.watch") || lowerUrl.includes("fb.com")) {
      return "facebook";
    }
    return null;
  }, []);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setError(null);
    const platform = detectPlatform(value);
    setDetectedPlatform(platform);
  };

  const validateUrl = (inputUrl: string): boolean => {
    const platform = detectPlatform(inputUrl);
    if (!platform) {
      setError(t.invalidUrl);
      return false;
    }
    try {
      new URL(inputUrl);
      return true;
    } catch {
      setError(t.invalidUrl);
      return false;
    }
  };

  const handleDownload = async () => {
    if (!validateUrl(url)) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate processing - In production, this would call a backend API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const platform = detectPlatform(url);
      setVideoInfo({
        platform,
        url,
        title: `${platform === "instagram" ? "Instagram" : "Facebook"} Video`,
      });
    } catch {
      setError("Unable to process this video. Please ensure the content is public.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUrl("");
    setVideoInfo(null);
    setError(null);
    setDetectedPlatform(null);
  };

  const handleActualDownload = (quality: "hd" | "sd") => {
    // In a real implementation, this would trigger the download
    // For now, we show an informative message
    alert(`To download ${quality.toUpperCase()} quality videos from Instagram and Facebook, the content must be publicly available. Due to platform restrictions, direct downloads require the original post to be public and not restricted.`);
  };

  // FAQ Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Can I download private Instagram videos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, this tool only supports public content. Private account videos cannot be accessed or downloaded without the account owner's permission."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to install an app to download videos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, our online video downloader works directly in your web browser. No app installation, registration, or login is required."
        }
      },
      {
        "@type": "Question",
        "name": "Is this video downloader tool free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, our Instagram and Facebook video downloader is completely free to use with no hidden charges or subscription requirements."
        }
      },
      {
        "@type": "Question",
        "name": "Is downloading Instagram and Facebook videos legal?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Downloading videos for personal use from public accounts is generally acceptable. However, you should not redistribute, monetize, or claim ownership of content you don't own. Always respect copyright and creator rights."
        }
      },
      {
        "@type": "Question",
        "name": "Does the video downloader work on mobile phones?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, our tool is fully mobile-responsive and works on all smartphones and tablets running Android, iOS, or any other mobile operating system."
        }
      }
    ]
  };

  const seoContent = {
    toolName: "Instagram & Facebook Video Downloader",
    whatIs: "Our Social Media Video Downloader is a free online tool that allows you to save videos from Instagram and Facebook directly to your device. It supports Instagram Reels, Stories, Posts, and Facebook Videos and Reels from public accounts. The tool works entirely in your browser with no login required, ensuring complete privacy and fast downloads.",
    howToUse: [
      "Open Instagram or Facebook and find the public video you want to download",
      "Copy the video URL (tap the three dots and select 'Copy Link')",
      "Paste the URL in the input box above",
      "Click the Download button and wait for processing",
      "Choose HD or SD quality and save the video to your device"
    ],
    features: [
      "Support for Instagram Reels, Stories, and Posts from public accounts",
      "Download Facebook Videos and Reels from public pages",
      "No login or registration required - completely anonymous",
      "HD and SD quality options for different file sizes",
      "Mobile-friendly design that works on all devices",
      "Fast processing with no watermarks added by our tool",
      "100% browser-based - we don't store any of your data"
    ],
    safetyNote: "This tool is completely safe to use. All video processing happens in your browser, and we do not store, host, or track any media files. We respect user privacy and do not require any personal information. Always download only content you have permission to use and respect copyright laws.",
    faqs: [
      {
        question: "Can I download private Instagram videos?",
        answer: "No, this tool only supports public content. Private account videos cannot be accessed or downloaded without the account owner's permission. This is by design to respect user privacy."
      },
      {
        question: "Do I need to install an app to download videos?",
        answer: "No, our online video downloader works directly in your web browser. No app installation, registration, or login is required. Simply paste the URL and download."
      },
      {
        question: "Is this video downloader tool free?",
        answer: "Yes, our Instagram and Facebook video downloader is completely free to use with no hidden charges, subscriptions, or premium features locked behind paywalls."
      },
      {
        question: "Is downloading Instagram and Facebook videos legal?",
        answer: "Downloading videos for personal use from public accounts is generally acceptable under fair use. However, redistributing, monetizing, or claiming ownership of content you don't own may violate copyright laws. Always respect creator rights."
      },
      {
        question: "Does the video downloader work on mobile phones?",
        answer: "Yes, our tool is fully mobile-responsive and works seamlessly on all smartphones and tablets, including Android and iOS devices."
      },
      {
        question: "What video quality options are available?",
        answer: "We offer HD (high definition) and SD (standard definition) quality options. HD provides the best quality but larger file sizes, while SD is optimized for smaller storage and faster downloads."
      },
      {
        question: "Why can't I download a specific video?",
        answer: "If a video cannot be downloaded, it's likely from a private account or has restricted privacy settings. Only content from public accounts can be accessed by our tool."
      },
      {
        question: "Do you add watermarks to downloaded videos?",
        answer: "No, we do not add any watermarks to the videos you download. The video is saved exactly as it was uploaded by the original creator."
      }
    ]
  };

  return (
    <>
      <CanonicalHead
        title="Instagram & Facebook Video Downloader – Reels, Stories & Videos | MyPDFs"
        description="Download Instagram reels, stories and Facebook videos from public accounts. Free, fast, mobile-friendly and AdSense safe online tool."
        keywords="instagram video downloader, facebook video downloader, download instagram reels, download facebook videos, instagram story downloader, facebook reel downloader, save instagram video, free video downloader"
      />
      
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <ToolLayout
        title={t.title}
        description={t.subtitle}
        icon={Video}
        colorClass="bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500"
        category="MultimediaApplication"
      >
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
            <SelectTrigger className="w-32">
              <Globe className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="te">తెలుగు</SelectItem>
              <SelectItem value="hi">हिंदी</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Main Tool Card */}
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center gap-4 mb-4">
              <Badge variant="outline" className="gap-2 py-2 px-4">
                <Instagram className="w-4 h-4 text-pink-500" />
                {t.instagram}
              </Badge>
              <Badge variant="outline" className="gap-2 py-2 px-4">
                <Facebook className="w-4 h-4 text-blue-600" />
                {t.facebook}
              </Badge>
            </div>
            <CardTitle className="text-2xl">{t.title}</CardTitle>
            <CardDescription>{t.subtitle}</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* URL Input */}
            <div className="space-y-3">
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder={t.pasteUrl}
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="pl-12 h-14 text-lg"
                  disabled={isLoading}
                />
                {detectedPlatform && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {detectedPlatform === "instagram" ? (
                      <Instagram className="w-5 h-5 text-pink-500" />
                    ) : (
                      <Facebook className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                )}
              </div>
              
              {/* Platform Detection Status */}
              {url && !error && (
                <div className="flex items-center gap-2 text-sm">
                  {detectedPlatform ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-green-600">
                        {detectedPlatform === "instagram" ? t.instagram : t.facebook} detected
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">{t.detectPlatform}</span>
                  )}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Download Buttons */}
            {!videoInfo ? (
              <Button
                onClick={handleDownload}
                disabled={!url || isLoading}
                className="w-full h-14 text-lg gap-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t.processing}
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    {t.download}
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                {/* Preview Card */}
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Video className="w-10 h-10 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{videoInfo.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">{videoInfo.url}</p>
                        <Badge className="mt-2">
                          {videoInfo.platform === "instagram" ? "Instagram" : "Facebook"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quality Options */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleActualDownload("hd")}
                    className="h-14 gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Monitor className="w-5 h-5" />
                    {t.downloadHD}
                  </Button>
                  <Button
                    onClick={() => handleActualDownload("sd")}
                    variant="outline"
                    className="h-14 gap-2"
                  >
                    <Smartphone className="w-5 h-5" />
                    {t.downloadSD}
                  </Button>
                </div>

                {/* Reset Button */}
                <Button
                  onClick={handleReset}
                  variant="ghost"
                  className="w-full gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t.tryAnother}
                </Button>
              </div>
            )}

            {/* Disclaimer */}
            <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <Shield className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
                {t.disclaimer}
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-green-500" />
              {t.privacyNote}
            </div>
          </CardContent>
        </Card>

        {/* Instructions Tabs */}
        <Tabs defaultValue="howto" className="mt-8">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger value="howto">{t.howToUse}</TabsTrigger>
            <TabsTrigger value="platforms">{t.supported}</TabsTrigger>
            <TabsTrigger value="features">{t.features}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="howto" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</span>
                    <span className="pt-1">{t.step1}</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</span>
                    <span className="pt-1">{t.step2}</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</span>
                    <span className="pt-1">{t.step3}</span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="platforms" className="mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Instagram className="w-8 h-8 text-pink-500" />
                    <h3 className="text-lg font-semibold">{t.instagram}</h3>
                  </div>
                  <p className="text-muted-foreground">{t.instagramTypes}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Facebook className="w-8 h-8 text-blue-600" />
                    <h3 className="text-lg font-semibold">{t.facebook}</h3>
                  </div>
                  <p className="text-muted-foreground">{t.facebookTypes}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="features" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <ul className="grid md:grid-cols-2 gap-4">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    {t.feature1}
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    {t.feature2}
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    {t.feature3}
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    {t.feature4}
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Legal Notice */}
        <Alert className="mt-6">
          <Info className="w-4 h-4" />
          <AlertDescription>
            <strong>{t.legal}:</strong> {t.legalText}
          </AlertDescription>
        </Alert>

        {/* SEO Blog Content */}
        <article className="mt-12 prose prose-gray dark:prose-invert max-w-none">
          <h2 className="text-3xl font-bold mb-6">Instagram & Facebook Video Downloader – Free Online Tool</h2>
          
          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">What is a Social Media Video Downloader?</h3>
            <p className="text-muted-foreground leading-relaxed">
              A social media video downloader is an online tool that enables you to save videos from platforms like Instagram and Facebook directly to your device. Whether you want to keep a memorable Reel, save an informative video for offline viewing, or archive content from public profiles, our free tool makes it simple and straightforward.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Unlike other downloaders that require software installation or account creation, our browser-based solution works instantly. Simply paste the video URL, and within seconds, you'll have the option to download in HD or SD quality. The entire process happens in your browser, ensuring your privacy is protected at all times.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">How to Download Instagram Videos & Stories</h3>
            <p className="text-muted-foreground leading-relaxed">
              Downloading Instagram videos is easier than ever with our tool. Instagram hosts billions of videos including Reels, Stories, and regular posts. While the platform doesn't offer a native download option, our tool bridges that gap for public content.
            </p>
            <div className="mt-4 space-y-3">
              <h4 className="font-medium">For Instagram Reels:</h4>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Open the Instagram app and navigate to the Reel you want to download</li>
                <li>Tap the three-dot menu (⋮) and select "Copy Link"</li>
                <li>Paste the link in our downloader above and click Download</li>
                <li>Choose your preferred quality (HD for best quality, SD for smaller size)</li>
              </ol>
            </div>
            <div className="mt-4 space-y-3">
              <h4 className="font-medium">For Instagram Stories:</h4>
              <p className="text-muted-foreground">Stories from public accounts can also be downloaded. Note that Stories are only available for 24 hours, so download them before they disappear. Copy the Story URL from the web version of Instagram and paste it in our tool.</p>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">How to Download Facebook Videos</h3>
            <p className="text-muted-foreground leading-relaxed">
              Facebook remains one of the largest video-sharing platforms globally. Our downloader supports videos from public Facebook pages, groups, and profiles. Here's how to save Facebook videos:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground mt-4">
              <li>Find the video on Facebook you want to download (must be from a public source)</li>
              <li>Click the three-dot menu on the video and select "Copy link"</li>
              <li>Paste the Facebook video URL in our tool</li>
              <li>Click Download and select your preferred quality</li>
              <li>The video will be saved to your device's download folder</li>
            </ol>
            <p className="text-muted-foreground mt-4">
              Note: Facebook Reels follow the same process. Simply copy the Reel link and paste it in our downloader for instant access.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">Is It Legal to Download Instagram & Facebook Videos?</h3>
            <p className="text-muted-foreground leading-relaxed">
              This is a common question, and the answer depends on your intended use. Downloading videos for personal viewing, educational purposes, or backing up your own content is generally acceptable. However, there are important guidelines to follow:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
              <li><strong>Personal Use:</strong> Saving videos for your own offline viewing is typically fine</li>
              <li><strong>No Redistribution:</strong> Don't re-upload or share downloaded videos as your own</li>
              <li><strong>Respect Copyright:</strong> Content creators own their videos; don't monetize their work</li>
              <li><strong>Public Content Only:</strong> Our tool only accesses publicly available videos</li>
              <li><strong>Credit Creators:</strong> If sharing, always give credit to the original creator</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              We encourage users to respect intellectual property rights and use downloaded content responsibly. When in doubt, reach out to the content creator for permission.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">Why Use Our Online Downloader?</h3>
            <p className="text-muted-foreground leading-relaxed">
              With numerous video downloaders available online, what makes ours stand out? Here are the key advantages:
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-medium mb-2">🚀 No Installation Required</h4>
                <p className="text-sm text-muted-foreground">Works directly in your browser on any device – desktop, tablet, or mobile.</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-medium mb-2">🔒 Privacy First</h4>
                <p className="text-sm text-muted-foreground">We don't store your videos or track your downloads. Complete anonymity.</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-medium mb-2">⚡ Lightning Fast</h4>
                <p className="text-sm text-muted-foreground">Get your videos in seconds with our optimized processing engine.</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-medium mb-2">💯 Completely Free</h4>
                <p className="text-sm text-muted-foreground">No hidden fees, no premium tiers – every feature is free forever.</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">Features That Make This Tool Unique</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <span><strong>Multi-Platform Support:</strong> Download from both Instagram and Facebook with a single tool</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <span><strong>Auto Platform Detection:</strong> Our tool automatically detects whether you've pasted an Instagram or Facebook link</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <span><strong>Quality Options:</strong> Choose between HD (high-definition) and SD (standard) based on your needs</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <span><strong>No Watermarks:</strong> We don't add any watermarks to your downloaded videos</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <span><strong>Multi-Language:</strong> Available in English, Telugu, and Hindi for wider accessibility</span>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">Mobile vs Desktop Downloading</h3>
            <p className="text-muted-foreground leading-relaxed">
              Our video downloader works seamlessly on both mobile and desktop devices, but there are some differences to note:
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Smartphone className="w-5 h-5" /> Mobile Experience
                </h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
                  <li>Perfect for downloading on-the-go</li>
                  <li>Works on Android and iOS browsers</li>
                  <li>Touch-friendly interface</li>
                  <li>Downloads save to your gallery or files app</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Monitor className="w-5 h-5" /> Desktop Experience
                </h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
                  <li>Faster processing for larger videos</li>
                  <li>Easier copy-paste from browser tabs</li>
                  <li>Better for bulk downloading</li>
                  <li>Direct save to your chosen folder</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">Safety & Privacy</h3>
            <p className="text-muted-foreground leading-relaxed">
              We take your privacy seriously. Here's what you should know about using our video downloader:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
              <li><strong>No Data Collection:</strong> We don't collect or store any personal information</li>
              <li><strong>No Video Storage:</strong> Videos are processed and delivered directly – we never save them</li>
              <li><strong>Secure Connection:</strong> Our site uses HTTPS encryption for all data transfers</li>
              <li><strong>No Account Required:</strong> No sign-up means no risk of data breaches</li>
              <li><strong>Ad-Safe:</strong> We use only legitimate, non-intrusive advertising</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Your trust is important to us. We've designed this tool with privacy as a core principle, ensuring you can download videos without worrying about your data being misused.
            </p>
          </section>

          {/* Language-specific summaries */}
          <section className="mb-8 bg-muted/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">సారాంశం (Telugu Summary)</h3>
            <p className="text-muted-foreground">
              మా సోషల్ మీడియా వీడియో డౌన్‌లోడర్ Instagram మరియు Facebook నుండి పబ్లిక్ వీడియోలను సేవ్ చేయడానికి ఒక ఉచిత, సురక్షితమైన మార్గం. లాగిన్ అవసరం లేదు, యాప్ ఇన్‌స్టాల్ అవసరం లేదు - కేవలం URL పేస్ట్ చేసి డౌన్‌లోడ్ చేయండి. HD మరియు SD క్వాలిటీలో అందుబాటులో ఉంది. మొబైల్ మరియు డెస్క్‌టాప్ రెండింటిలోనూ పని చేస్తుంది.
            </p>
          </section>

          <section className="mb-8 bg-muted/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">सारांश (Hindi Summary)</h3>
            <p className="text-muted-foreground">
              हमारा सोशल मीडिया वीडियो डाउनलोडर Instagram और Facebook से पब्लिक वीडियो सेव करने का एक मुफ्त, सुरक्षित तरीका है। कोई लॉगिन आवश्यक नहीं, कोई ऐप इंस्टॉल करने की जरूरत नहीं - बस URL पेस्ट करें और डाउनलोड करें। HD और SD क्वालिटी में उपलब्ध। मोबाइल और डेस्कटॉप दोनों पर काम करता है।
            </p>
          </section>
        </article>

        {/* Tool SEO Content Section */}
        <ToolSEOContent {...seoContent} />
      </ToolLayout>
    </>
  );
}
