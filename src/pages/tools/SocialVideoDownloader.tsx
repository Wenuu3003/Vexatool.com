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
import { supabase } from "@/integrations/supabase/client";
import { 
  Download, 
  Video, 
  Link as LinkIcon, 
  RefreshCw, 
  Shield, 
  Smartphone,
  Monitor,
  Check,
  Loader2,
  Instagram,
  Facebook,
  Globe,
  Info,
  AlertCircle,
  Youtube,
  ExternalLink
} from "lucide-react";

type Language = "en" | "te" | "hi";
type MessageType = "error" | "info" | "success" | null;

interface StatusMessage {
  type: MessageType;
  text: string;
}

interface VideoQuality {
  quality: string;
  url: string;
  size?: string;
}

interface VideoInfo {
  platform: string;
  title?: string;
  thumbnail?: string;
  duration?: string;
  author?: string;
  videos?: VideoQuality[];
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    title: "Social Media Video Downloader",
    subtitle: "Download Instagram, Facebook & YouTube Videos Free",
    pasteUrl: "Paste video URL here",
    detectPlatform: "Auto-detecting platform...",
    instagram: "Instagram",
    facebook: "Facebook",
    youtube: "YouTube",
    download: "Fetch Video",
    downloadHD: "Download HD",
    downloadSD: "Download SD",
    tryAnother: "Try Another Link",
    processing: "Fetching video...",
    preview: "Video Preview",
    disclaimer: "This tool supports only publicly available content. We do not host, store, or track any media. All rights belong to the respective owners.",
    privacyNote: "100% Private - Videos are not stored on our servers",
    invalidUrl: "Please enter a valid Instagram, Facebook, or YouTube URL",
    publicOnly: "Only public videos can be downloaded",
    storiesRestricted: "Instagram Stories are restricted by platform limitations. This tool currently supports public Reels and Posts only.",
    howToUse: "How to Use",
    step1: "Copy the video URL from Instagram, Facebook, or YouTube",
    step2: "Paste the URL in the input box above",
    step3: "Click Fetch Video to get download links",
    supported: "Supported Platforms",
    instagramTypes: "Public Reels & Posts",
    facebookTypes: "Public Videos & Reels",
    youtubeTypes: "Videos & Shorts",
    features: "Features",
    feature1: "No login required",
    feature2: "Fast & free downloads",
    feature3: "HD quality available",
    feature4: "Mobile-friendly",
    legal: "Legal Notice",
    legalText: "Only download content you have permission to use. Respect copyright and content creator rights.",
    downloadReady: "Video ready! Choose your preferred quality below.",
    platformNote: "Click a download button to save the video to your device.",
    fetchError: "Unable to fetch this video. Please ensure the content is from a public account.",
  },
  te: {
    title: "సోషల్ మీడియా వీడియో డౌన్‌లోడర్",
    subtitle: "Instagram, Facebook & YouTube వీడియోలను ఉచితంగా డౌన్‌లోడ్ చేయండి",
    pasteUrl: "వీడియో URL ను ఇక్కడ పేస్ట్ చేయండి",
    detectPlatform: "ప్లాట్‌ఫారమ్‌ను గుర్తిస్తోంది...",
    instagram: "Instagram",
    facebook: "Facebook",
    youtube: "YouTube",
    download: "వీడియో పొందండి",
    downloadHD: "HD డౌన్‌లోడ్",
    downloadSD: "SD డౌన్‌లోడ్",
    tryAnother: "మరొక లింక్ ప్రయత్నించండి",
    processing: "వీడియో పొందుతోంది...",
    preview: "వీడియో ప్రివ్యూ",
    disclaimer: "ఈ సాధనం పబ్లిక్‌గా అందుబాటులో ఉన్న కంటెంట్‌ను మాత్రమే సపోర్ట్ చేస్తుంది. మేము ఎటువంటి మీడియాను హోస్ట్, స్టోర్ లేదా ట్రాక్ చేయము. అన్ని హక్కులు సంబంధిత యజమానులకు చెందుతాయి.",
    privacyNote: "100% ప్రైవేట్ - వీడియోలు మా సర్వర్‌లలో నిల్వ చేయబడవు",
    invalidUrl: "దయచేసి చెల్లుబాటు అయ్యే Instagram, Facebook లేదా YouTube URL ను నమోదు చేయండి",
    publicOnly: "పబ్లిక్ వీడియోలను మాత్రమే డౌన్‌లోడ్ చేయవచ్చు",
    storiesRestricted: "ప్లాట్‌ఫారమ్ పరిమితుల కారణంగా Instagram స్టోరీలు అందుబాటులో లేవు. ఈ సాధనం ప్రస్తుతం పబ్లిక్ రీల్స్ మరియు పోస్ట్‌లను మాత్రమే సపోర్ట్ చేస్తుంది.",
    howToUse: "ఎలా వాడాలి",
    step1: "Instagram, Facebook లేదా YouTube నుండి వీడియో URL కాపీ చేయండి",
    step2: "పై ఇన్‌పుట్ బాక్స్‌లో URL పేస్ట్ చేయండి",
    step3: "డౌన్‌లోడ్ లింక్‌లు పొందడానికి వీడియో పొందండి క్లిక్ చేయండి",
    supported: "సపోర్టెడ్ ప్లాట్‌ఫారమ్‌లు",
    instagramTypes: "పబ్లిక్ రీల్స్ & పోస్ట్‌లు",
    facebookTypes: "పబ్లిక్ వీడియోలు & రీల్స్",
    youtubeTypes: "వీడియోలు & షార్ట్స్",
    features: "ఫీచర్లు",
    feature1: "లాగిన్ అవసరం లేదు",
    feature2: "వేగవంతమైన & ఉచిత డౌన్‌లోడ్‌లు",
    feature3: "HD నాణ్యత అందుబాటులో ఉంది",
    feature4: "మొబైల్-ఫ్రెండ్లీ",
    legal: "చట్టపరమైన నోటీసు",
    legalText: "మీకు అనుమతి ఉన్న కంటెంట్‌ను మాత్రమే డౌన్‌లోడ్ చేయండి. కాపీరైట్ మరియు కంటెంట్ క్రియేటర్ హక్కులను గౌరవించండి.",
    downloadReady: "వీడియో సిద్ధంగా ఉంది! క్రింద మీకు ఇష్టమైన నాణ్యతను ఎంచుకోండి.",
    platformNote: "వీడియోను మీ పరికరంలో సేవ్ చేయడానికి డౌన్‌లోడ్ బటన్ క్లిక్ చేయండి.",
    fetchError: "ఈ వీడియోను పొందడం సాధ్యం కాలేదు. కంటెంట్ పబ్లిక్ ఖాతా నుండి ఉండేలా చూసుకోండి.",
  },
  hi: {
    title: "सोशल मीडिया वीडियो डाउनलोडर",
    subtitle: "Instagram, Facebook और YouTube वीडियो मुफ्त डाउनलोड करें",
    pasteUrl: "वीडियो URL यहाँ पेस्ट करें",
    detectPlatform: "प्लेटफ़ॉर्म का पता लगा रहे हैं...",
    instagram: "Instagram",
    facebook: "Facebook",
    youtube: "YouTube",
    download: "वीडियो प्राप्त करें",
    downloadHD: "HD डाउनलोड",
    downloadSD: "SD डाउनलोड",
    tryAnother: "दूसरी लिंक आज़माएं",
    processing: "वीडियो प्राप्त कर रहे हैं...",
    preview: "वीडियो प्रीव्यू",
    disclaimer: "यह टूल केवल सार्वजनिक रूप से उपलब्ध सामग्री का समर्थन करता है। हम किसी भी मीडिया को होस्ट, स्टोर या ट्रैक नहीं करते। सभी अधिकार संबंधित स्वामियों के हैं।",
    privacyNote: "100% प्राइवेट - वीडियो हमारे सर्वर पर स्टोर नहीं होते",
    invalidUrl: "कृपया वैध Instagram, Facebook या YouTube URL दर्ज करें",
    publicOnly: "केवल पब्लिक वीडियो डाउनलोड किए जा सकते हैं",
    storiesRestricted: "प्लेटफ़ॉर्म प्रतिबंधों के कारण Instagram स्टोरीज़ उपलब्ध नहीं हैं। यह टूल वर्तमान में केवल पब्लिक रील्स और पोस्ट्स का समर्थन करता है।",
    howToUse: "कैसे उपयोग करें",
    step1: "Instagram, Facebook या YouTube से वीडियो URL कॉपी करें",
    step2: "ऊपर दिए गए इनपुट बॉक्स में URL पेस्ट करें",
    step3: "डाउनलोड लिंक प्राप्त करने के लिए वीडियो प्राप्त करें क्लिक करें",
    supported: "सपोर्टेड प्लेटफ़ॉर्म",
    instagramTypes: "पब्लिक रील्स & पोस्ट्स",
    facebookTypes: "पब्लिक वीडियो & रील्स",
    youtubeTypes: "वीडियो & शॉर्ट्स",
    features: "फीचर्स",
    feature1: "लॉगिन की आवश्यकता नहीं",
    feature2: "तेज़ और मुफ्त डाउनलोड",
    feature3: "HD क्वालिटी उपलब्ध",
    feature4: "मोबाइल-फ्रेंडली",
    legal: "कानूनी नोटिस",
    legalText: "केवल वही कंटेंट डाउनलोड करें जिसका उपयोग करने की आपको अनुमति है। कॉपीराइट और कंटेंट क्रिएटर के अधिकारों का सम्मान करें।",
    downloadReady: "वीडियो तैयार है! नीचे अपनी पसंदीदा क्वालिटी चुनें।",
    platformNote: "वीडियो को अपने डिवाइस में सेव करने के लिए डाउनलोड बटन क्लिक करें।",
    fetchError: "यह वीडियो प्राप्त करने में असमर्थ। कृपया सुनिश्चित करें कि सामग्री पब्लिक अकाउंट से है।",
  },
};

type DetectedPlatform = "instagram" | "facebook" | "youtube" | null;

export default function SocialVideoDownloader() {
  const [language, setLanguage] = useState<Language>("en");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage>({ type: null, text: "" });
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [detectedPlatform, setDetectedPlatform] = useState<DetectedPlatform>(null);
  const [isStoriesUrl, setIsStoriesUrl] = useState(false);

  const t = translations[language];

  const detectPlatform = useCallback((inputUrl: string): DetectedPlatform => {
    const lowerUrl = inputUrl.toLowerCase();
    if (lowerUrl.includes("instagram.com") || lowerUrl.includes("instagr.am")) {
      return "instagram";
    }
    if (lowerUrl.includes("facebook.com") || lowerUrl.includes("fb.watch") || lowerUrl.includes("fb.com")) {
      return "facebook";
    }
    if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
      return "youtube";
    }
    return null;
  }, []);

  const isInstagramStory = useCallback((inputUrl: string): boolean => {
    const lowerUrl = inputUrl.toLowerCase();
    return lowerUrl.includes("/stories/") || lowerUrl.includes("/story/");
  }, []);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setStatusMessage({ type: null, text: "" });
    setVideoInfo(null);
    
    const platform = detectPlatform(value);
    setDetectedPlatform(platform);
    
    // Check for Instagram Stories
    const isStory = isInstagramStory(value);
    setIsStoriesUrl(isStory);
    
    if (isStory) {
      setStatusMessage({ type: "info", text: t.storiesRestricted });
    }
  };

  const validateUrl = (inputUrl: string): boolean => {
    // Check for stories first
    if (isInstagramStory(inputUrl)) {
      setStatusMessage({ type: "info", text: t.storiesRestricted });
      return false;
    }
    
    const platform = detectPlatform(inputUrl);
    if (!platform) {
      setStatusMessage({ type: "error", text: t.invalidUrl });
      return false;
    }
    
    try {
      new URL(inputUrl);
      return true;
    } catch {
      setStatusMessage({ type: "error", text: t.invalidUrl });
      return false;
    }
  };

  const handleFetchVideo = async () => {
    if (!validateUrl(url)) return;

    setIsLoading(true);
    setStatusMessage({ type: null, text: "" });
    setVideoInfo(null);

    try {
      const { data, error } = await supabase.functions.invoke('video-extract', {
        body: { url },
      });

      if (error) {
        console.error('Edge function error:', error);
        setStatusMessage({ type: "error", text: t.fetchError });
        return;
      }

      if (data.success && data.videos && data.videos.length > 0) {
        setVideoInfo({
          platform: data.platform,
          title: data.title,
          thumbnail: data.thumbnail,
          duration: data.duration,
          author: data.author,
          videos: data.videos,
        });
        setStatusMessage({ type: "success", text: t.downloadReady });
      } else if (data.isStoryUrl) {
        setStatusMessage({ type: "info", text: t.storiesRestricted });
        setIsStoriesUrl(true);
      } else {
        setStatusMessage({ type: "error", text: data.error || t.fetchError });
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setStatusMessage({ type: "error", text: t.fetchError });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUrl("");
    setVideoInfo(null);
    setStatusMessage({ type: null, text: "" });
    setDetectedPlatform(null);
    setIsStoriesUrl(false);
  };

  const handleDownload = (videoUrl: string, quality: string) => {
    // Open the video URL in a new tab for download
    window.open(videoUrl, '_blank', 'noopener,noreferrer');
    setStatusMessage({ type: "info", text: t.platformNote });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-5 h-5 text-pink-500" />;
      case 'facebook': return <Facebook className="w-5 h-5 text-blue-600" />;
      case 'youtube': return <Youtube className="w-5 h-5 text-red-600" />;
      default: return <Video className="w-5 h-5" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'from-pink-500 to-purple-500';
      case 'facebook': return 'from-blue-500 to-blue-600';
      case 'youtube': return 'from-red-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
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
          "text": "No, this tool only supports public content. Private account videos cannot be accessed or downloaded. This is by design to respect user privacy and platform policies."
        }
      },
      {
        "@type": "Question",
        "name": "Why are Instagram Stories not downloading?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Instagram Stories are restricted by the platform for privacy reasons. Stories are designed to be temporary content (24 hours) and Instagram does not allow external access. Our tool supports public Reels and Posts only."
        }
      },
      {
        "@type": "Question",
        "name": "Is this video downloader tool free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, our Instagram, Facebook, and YouTube video downloader is completely free to use with no hidden charges, subscriptions, or premium features."
        }
      },
      {
        "@type": "Question",
        "name": "Does the video downloader work on mobile phones?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, our tool is fully mobile-responsive and works on all smartphones and tablets, including Android and iOS devices. No app installation required."
        }
      },
      {
        "@type": "Question",
        "name": "Is login required to use this tool?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, absolutely no login is required. Simply paste the video URL and download. We don't collect any personal information or require account creation."
        }
      },
      {
        "@type": "Question",
        "name": "Can I download YouTube Shorts?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, our tool supports YouTube Shorts along with regular YouTube videos. Simply paste the Shorts URL and click Fetch Video to get download links."
        }
      }
    ]
  };

  const seoContent = {
    toolName: "Instagram, Facebook & YouTube Video Downloader",
    whatIs: "Our Social Media Video Downloader is a free online tool that allows you to save videos from Instagram, Facebook, and YouTube directly to your device. It supports Instagram Reels, Posts, Facebook Videos, Reels, and YouTube videos including Shorts from public accounts. The tool works entirely in your browser with no login required, ensuring complete privacy and fast downloads.",
    howToUse: [
      "Open Instagram, Facebook, or YouTube and find the public video you want to download",
      "Copy the video URL (tap the three dots and select 'Copy Link' or copy from the address bar)",
      "Paste the URL in the input box above",
      "Click the Fetch Video button and wait for processing",
      "Choose your preferred quality and click to download"
    ],
    features: [
      "Support for Instagram Reels and Posts from public accounts",
      "Download Facebook Videos and Reels from public pages",
      "Download YouTube videos and Shorts in multiple qualities",
      "No login or registration required - completely anonymous",
      "HD and SD quality options for different file sizes",
      "Mobile-friendly design that works on all devices",
      "Fast processing - we don't store any of your data"
    ],
    safetyNote: "This tool is completely safe to use. All video processing happens through secure servers, and we do not store, host, or track any media files. We respect user privacy and do not require any personal information. Always download only content you have permission to use and respect copyright laws.",
    faqs: [
      {
        question: "Can I download private Instagram videos?",
        answer: "No, this tool only supports public content. Private account videos cannot be accessed or downloaded. This is by design to respect user privacy and platform policies."
      },
      {
        question: "Why are Instagram Stories not downloading?",
        answer: "Instagram Stories are restricted by the platform for privacy reasons. Stories are designed to be temporary (24-hour) content, and Instagram does not allow external access to them. Our tool supports public Reels and Posts only."
      },
      {
        question: "Is this video downloader tool free?",
        answer: "Yes, our Instagram, Facebook, and YouTube video downloader is completely free to use with no hidden charges, subscriptions, or premium features."
      },
      {
        question: "Does the video downloader work on mobile phones?",
        answer: "Yes, our tool is fully mobile-responsive and works seamlessly on all smartphones and tablets, including Android and iOS devices."
      },
      {
        question: "Is login required to use this tool?",
        answer: "No, absolutely no login is required. Simply paste the video URL and download. We don't collect any personal information or require account creation."
      },
      {
        question: "Can I download YouTube Shorts?",
        answer: "Yes, our tool fully supports YouTube Shorts. Just paste the Shorts URL and click Fetch Video to get download options in various qualities."
      },
      {
        question: "What video quality options are available?",
        answer: "We offer multiple quality options including HD (720p, 1080p) and SD (360p, 480p) depending on what's available for the video. Higher quality means larger file sizes."
      },
      {
        question: "Do you add watermarks to downloaded videos?",
        answer: "No, we do not add any watermarks to the videos you download. The video is saved exactly as it was uploaded by the original creator."
      }
    ]
  };

  // Render status message with appropriate styling
  const renderStatusMessage = () => {
    if (!statusMessage.type || !statusMessage.text) return null;
    
    const variants = {
      error: {
        bg: "bg-destructive/10 border-destructive/30",
        text: "text-destructive",
        icon: <AlertCircle className="w-4 h-4" />
      },
      info: {
        bg: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
        text: "text-blue-700 dark:text-blue-300",
        icon: <Info className="w-4 h-4" />
      },
      success: {
        bg: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
        text: "text-green-700 dark:text-green-300",
        icon: <Check className="w-4 h-4" />
      }
    };
    
    const variant = variants[statusMessage.type];
    
    return (
      <Alert className={`${variant.bg} border`}>
        <span className={variant.text}>{variant.icon}</span>
        <AlertDescription className={variant.text}>
          {statusMessage.text}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <>
      <CanonicalHead
        title="Instagram, Facebook & YouTube Video Downloader – Free Online | MyPDFs"
        description="Download Instagram reels, Facebook videos, and YouTube videos from public accounts. Free, fast, mobile-friendly online tool with HD quality."
        keywords="instagram video downloader, facebook video downloader, youtube video downloader, download instagram reels, download facebook videos, download youtube shorts, reels downloader online, free video downloader"
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
        colorClass="bg-gradient-to-br from-pink-500 via-purple-500 to-red-500"
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
            <div className="flex justify-center gap-3 mb-4">
              <Badge variant="outline" className="gap-2 py-2 px-4">
                <Instagram className="w-4 h-4 text-pink-500" />
                {t.instagram}
              </Badge>
              <Badge variant="outline" className="gap-2 py-2 px-4">
                <Facebook className="w-4 h-4 text-blue-600" />
                {t.facebook}
              </Badge>
              <Badge variant="outline" className="gap-2 py-2 px-4">
                <Youtube className="w-4 h-4 text-red-600" />
                {t.youtube}
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
                {detectedPlatform && !isStoriesUrl && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {getPlatformIcon(detectedPlatform)}
                  </div>
                )}
              </div>
              
              {/* Platform Detection Status */}
              {url && !statusMessage.type && !isStoriesUrl && (
                <div className="flex items-center gap-2 text-sm">
                  {detectedPlatform ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-green-600 capitalize">
                        {detectedPlatform} detected
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">{t.detectPlatform}</span>
                  )}
                </div>
              )}

              {/* Status Message (error/info/success) */}
              {renderStatusMessage()}
            </div>

            {/* Fetch/Download Buttons - Hidden when Stories URL detected */}
            {!isStoriesUrl && (
              <>
                {!videoInfo ? (
                  <Button
                    onClick={handleFetchVideo}
                    disabled={!url || isLoading || !detectedPlatform}
                    className="w-full h-14 text-lg gap-3 bg-gradient-to-r from-pink-500 via-purple-500 to-red-500 hover:from-pink-600 hover:via-purple-600 hover:to-red-600"
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
                    <Card className="bg-muted/50 overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {videoInfo.thumbnail ? (
                            <img 
                              src={videoInfo.thumbnail} 
                              alt="Video thumbnail"
                              className="w-32 h-24 object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className={`w-32 h-24 bg-gradient-to-br ${getPlatformColor(videoInfo.platform)} rounded-lg flex items-center justify-center`}>
                              <Video className="w-10 h-10 text-white" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold line-clamp-2">{videoInfo.title || 'Video'}</h4>
                            {videoInfo.author && (
                              <p className="text-sm text-muted-foreground">By: {videoInfo.author}</p>
                            )}
                            {videoInfo.duration && (
                              <p className="text-sm text-muted-foreground">Duration: {videoInfo.duration}</p>
                            )}
                            <Badge className="mt-2 capitalize">
                              {getPlatformIcon(videoInfo.platform)}
                              <span className="ml-1">{videoInfo.platform}</span>
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quality Options */}
                    <div className="grid gap-3">
                      {videoInfo.videos?.map((video, index) => (
                        <Button
                          key={index}
                          onClick={() => handleDownload(video.url, video.quality)}
                          className={`h-14 gap-3 ${index === 0 ? 'bg-green-600 hover:bg-green-700' : ''}`}
                          variant={index === 0 ? 'default' : 'outline'}
                        >
                          {index === 0 ? <Monitor className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                          <span>Download {video.quality}</span>
                          {video.size && <span className="text-sm opacity-75">({video.size})</span>}
                          <ExternalLink className="w-4 h-4 ml-auto" />
                        </Button>
                      ))}
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
              </>
            )}

            {/* Try Another Link - Show when Stories URL detected */}
            {isStoriesUrl && (
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full h-14 gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {t.tryAnother}
              </Button>
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
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Instagram className="w-8 h-8 text-pink-500" />
                    <h3 className="text-lg font-semibold">{t.instagram}</h3>
                  </div>
                  <p className="text-muted-foreground">{t.instagramTypes}</p>
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    Note: Stories are not supported due to platform restrictions
                  </p>
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
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Youtube className="w-8 h-8 text-red-600" />
                    <h3 className="text-lg font-semibold">{t.youtube}</h3>
                  </div>
                  <p className="text-muted-foreground">{t.youtubeTypes}</p>
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
          <h2 className="text-3xl font-bold mb-6">Instagram, Facebook & YouTube Video Downloader – Free Online Tool</h2>
          
          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">What is a Social Media Video Downloader?</h3>
            <p className="text-muted-foreground leading-relaxed">
              A social media video downloader is an online tool that enables you to save videos from platforms like Instagram, Facebook, and YouTube directly to your device. Whether you want to keep a memorable Reel, save an informative video for offline viewing, or archive content from public profiles, our free tool makes it simple and straightforward.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Unlike other downloaders that require software installation or account creation, our browser-based solution works instantly. Simply paste the video URL, and within seconds, you'll have options to download in various qualities. The entire process respects your privacy and requires no personal information.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">How to Download Instagram Reels & Posts</h3>
            <p className="text-muted-foreground leading-relaxed">
              Downloading Instagram videos is easier than ever with our tool. Instagram hosts billions of videos including Reels and regular posts. While the platform doesn't offer a native download option, our tool bridges that gap for public content.
            </p>
            <div className="mt-4 space-y-3">
              <h4 className="font-medium">For Instagram Reels & Posts:</h4>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Open the Instagram app and navigate to the Reel or Post you want to download</li>
                <li>Tap the three-dot menu (⋮) and select "Copy Link"</li>
                <li>Paste the link in our downloader above and click Fetch Video</li>
                <li>Choose your preferred quality and download</li>
              </ol>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">How to Download YouTube Videos & Shorts</h3>
            <p className="text-muted-foreground leading-relaxed">
              YouTube is the world's largest video platform, and our tool supports downloading both regular videos and YouTube Shorts. Here's how to save YouTube content:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground mt-4">
              <li>Open YouTube and find the video or Short you want to download</li>
              <li>Copy the URL from the address bar or use the Share button</li>
              <li>Paste the URL in our tool and click Fetch Video</li>
              <li>Select your preferred quality (HD for best quality, SD for smaller files)</li>
              <li>Click the download button to save the video</li>
            </ol>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">Why Instagram Stories Are Not Supported</h3>
            <p className="text-muted-foreground leading-relaxed">
              You may notice that Instagram Stories cannot be downloaded with our tool. This is not a limitation of our service but rather a deliberate design choice aligned with Instagram's platform policies and privacy protections.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Instagram Stories are designed to be ephemeral content that disappears after 24 hours. The platform specifically restricts external access to Stories to protect user privacy and content control.
            </p>
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
              <li>Click Fetch Video and select your preferred quality</li>
              <li>The video will be saved to your device</li>
            </ol>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">Is It Legal to Download Social Media Videos?</h3>
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
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">Features of Our Online Downloader</h3>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-medium mb-2">🚀 No Installation Required</h4>
                <p className="text-sm text-muted-foreground">Works directly in your browser on any device.</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-medium mb-2">🔒 Privacy First</h4>
                <p className="text-sm text-muted-foreground">We don't store your videos or track your downloads.</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-medium mb-2">⚡ Lightning Fast</h4>
                <p className="text-sm text-muted-foreground">Get your videos in seconds with optimized processing.</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-medium mb-2">💯 Completely Free</h4>
                <p className="text-sm text-muted-foreground">No hidden fees – every feature is free forever.</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">Safety & Privacy</h3>
            <p className="text-muted-foreground leading-relaxed">
              We take your privacy seriously. Here's what you need to know about using our tool safely:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
              <li><strong>No Data Storage:</strong> We don't save any URLs you enter or videos you download</li>
              <li><strong>No Account Required:</strong> Use our tool without creating an account</li>
              <li><strong>Secure Connection:</strong> Our site uses HTTPS encryption</li>
              <li><strong>No Tracking:</strong> We don't use invasive tracking or sell your data</li>
            </ul>
          </section>

          {/* Multi-Language Blog Summaries */}
          <section className="mb-8 border-t pt-8">
            <h3 className="text-2xl font-semibold mb-4">సారాంశం (Telugu Summary)</h3>
            <p className="text-muted-foreground leading-relaxed">
              మా ఉచిత ఆన్‌లైన్ టూల్ Instagram రీల్స్, పోస్ట్‌లు, Facebook వీడియోలు మరియు YouTube వీడియోలను పబ్లిక్ ఖాతాల నుండి డౌన్‌లోడ్ చేయడానికి మిమ్మల్ని అనుమతిస్తుంది. లాగిన్ అవసరం లేదు మరియు ఇది మొబైల్‌లో పూర్తిగా పని చేస్తుంది. ప్లాట్‌ఫారమ్ పరిమితుల కారణంగా Instagram స్టోరీలు సపోర్ట్ చేయబడవు.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">सारांश (Hindi Summary)</h3>
            <p className="text-muted-foreground leading-relaxed">
              हमारा मुफ्त ऑनलाइन टूल आपको पब्लिक अकाउंट्स से Instagram रील्स, पोस्ट्स, Facebook वीडियो और YouTube वीडियो डाउनलोड करने की सुविधा देता है। कोई लॉगिन आवश्यक नहीं है और यह मोबाइल पर पूरी तरह से काम करता है। प्लेटफ़ॉर्म प्रतिबंधों के कारण Instagram स्टोरीज़ समर्थित नहीं हैं।
            </p>
          </section>
        </article>

        {/* SEO Content Component */}
        <ToolSEOContent {...seoContent} />
      </ToolLayout>
    </>
  );
}
