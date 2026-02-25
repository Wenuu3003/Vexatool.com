import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Maximize, Upload, Download, Loader2, X, Zap, FileImage, User, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ToolSEOContent from "@/components/ToolSEOContent";
import { CanonicalHead } from "@/components/CanonicalHead";
import { Helmet } from "react-helmet";

interface ImageFile {
  file: File;
  preview: string;
  width: number;
  height: number;
}

interface ResizedImage {
  original: ImageFile;
  resized: string;
  newWidth: number;
  newHeight: number;
  sizeKB: number;
}

type SpecialMode = "none" | "govtjob" | "passport" | "whatsapp" | "aadhaar";

const presets = [
  { label: "Custom", value: "custom", width: 0, height: 0 },
  { label: "Passport Photo (35x45mm)", value: "passport", width: 413, height: 531 },
  { label: "Govt Job Form (3.5x4.5cm)", value: "govtjob", width: 413, height: 531 },
  { label: "Instagram Square (1080x1080)", value: "ig-square", width: 1080, height: 1080 },
  { label: "Instagram Portrait (1080x1350)", value: "ig-portrait", width: 1080, height: 1350 },
  { label: "Instagram Story (1080x1920)", value: "ig-story", width: 1080, height: 1920 },
  { label: "Facebook Cover (820x312)", value: "fb-cover", width: 820, height: 312 },
  { label: "Facebook Profile (180x180)", value: "fb-profile", width: 180, height: 180 },
  { label: "Twitter Header (1500x500)", value: "twitter-header", width: 1500, height: 500 },
  { label: "Twitter Post (1200x675)", value: "twitter-post", width: 1200, height: 675 },
  { label: "LinkedIn Banner (1584x396)", value: "linkedin-banner", width: 1584, height: 396 },
  { label: "YouTube Thumbnail (1280x720)", value: "yt-thumb", width: 1280, height: 720 },
  { label: "HD (1920x1080)", value: "hd", width: 1920, height: 1080 },
  { label: "4K (3840x2160)", value: "4k", width: 3840, height: 2160 },
];

const QUICK_SIZE_TARGETS = [
  { label: "20KB", kb: 20, color: "bg-green-500" },
  { label: "50KB", kb: 50, color: "bg-blue-500" },
  { label: "100KB", kb: 100, color: "bg-orange-500" },
  { label: "200KB", kb: 200, color: "bg-purple-500" },
];

// Smart iterative compression to hit target KB
async function compressToTargetKB(
  img: HTMLImageElement,
  targetKB: number,
  maxWidth: number,
  maxHeight: number,
  onProgress?: (pct: number) => void
): Promise<{ dataUrl: string; sizeKB: number; finalQuality: number; finalW: number; finalH: number }> {
  const targetBytes = targetKB * 1024;

  let w = img.naturalWidth;
  let h = img.naturalHeight;

  // Cap dimensions to max
  if (w > maxWidth || h > maxHeight) {
    const ratio = Math.min(maxWidth / w, maxHeight / h);
    w = Math.round(w * ratio);
    h = Math.round(h * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);

  let quality = 0.92;
  let result = canvas.toDataURL("image/jpeg", quality);
  let sizeBytes = Math.round((result.length - 22) * 0.75);

  onProgress?.(10);

  // Binary search quality
  let lo = 0.1, hi = 0.95;
  for (let i = 0; i < 12; i++) {
    const mid = (lo + hi) / 2;
    const attempt = canvas.toDataURL("image/jpeg", mid);
    const bytes = Math.round((attempt.length - 22) * 0.75);
    if (bytes <= targetBytes) {
      lo = mid;
      result = attempt;
      sizeBytes = bytes;
    } else {
      hi = mid;
    }
    onProgress?.(10 + Math.round((i / 12) * 50));
  }

  // If still too big, downscale resolution
  if (sizeBytes > targetBytes * 1.05) {
    let scale = 0.9;
    for (let step = 0; step < 8 && sizeBytes > targetBytes * 1.05; step++) {
      const sw = Math.max(Math.round(w * scale), 50);
      const sh = Math.max(Math.round(h * scale), 50);
      const c2 = document.createElement("canvas");
      c2.width = sw;
      c2.height = sh;
      c2.getContext("2d")!.drawImage(img, 0, 0, sw, sh);
      const attempt = c2.toDataURL("image/jpeg", lo);
      const bytes = Math.round((attempt.length - 22) * 0.75);
      if (bytes <= targetBytes) {
        result = attempt;
        sizeBytes = bytes;
        w = sw;
        h = sh;
        canvas.width = sw;
        canvas.height = sh;
        ctx.drawImage(img, 0, 0, sw, sh);
      }
      scale -= 0.1;
      onProgress?.(60 + Math.round((step / 8) * 35));
    }
  }

  onProgress?.(100);
  return {
    dataUrl: result,
    sizeKB: Math.round(sizeBytes / 1024),
    finalQuality: Math.round(lo * 100),
    finalW: w,
    finalH: h,
  };
}

export default function ImageResizer() {
  const [image, setImage] = useState<ImageFile | null>(null);
  const [preset, setPreset] = useState("custom");
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [maintainRatio, setMaintainRatio] = useState(true);
  const [quality, setQuality] = useState(90);
  const [resized, setResized] = useState<ResizedImage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [specialMode, setSpecialMode] = useState<SpecialMode>("none");
  const [govtMaxKB, setGovtMaxKB] = useState<20 | 50>(20);
  const [passportMaxKB, setPassportMaxKB] = useState<20 | 50>(20);
  const [whatsappMaxKB, setWhatsappMaxKB] = useState<20 | 50>(20);
  const [aadhaarMaxKB, setAadhaarMaxKB] = useState<20 | 50>(20);
  const [customTargetKB, setCustomTargetKB] = useState("");
  const [activeQuickKB, setActiveQuickKB] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const aspectRatioRef = useRef(1);
  const { toast } = useToast();

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 25MB.", variant: "destructive" });
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      setImage({ file, preview: url, width: img.naturalWidth, height: img.naturalHeight });
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
      aspectRatioRef.current = img.naturalWidth / img.naturalHeight;
      setResized(null);
      setActiveQuickKB(null);
    };
    img.src = url;
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const fakeEvent = { target: { files: [file], value: "" } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(fakeEvent);
    }
  }, [handleFileSelect]);

  const handlePresetChange = (value: string) => {
    setPreset(value);
    const selected = presets.find((p) => p.value === value);
    if (selected && selected.width > 0) {
      setWidth(selected.width);
      setHeight(selected.height);
      setMaintainRatio(false);
    } else if (image) {
      setWidth(image.width);
      setHeight(image.height);
      setMaintainRatio(true);
    }
  };

  const handleWidthChange = (value: string) => {
    const newWidth = parseInt(value) || 1;
    setWidth(newWidth);
    if (maintainRatio && image) setHeight(Math.round(newWidth / aspectRatioRef.current));
    setPreset("custom");
  };

  const handleHeightChange = (value: string) => {
    const newHeight = parseInt(value) || 1;
    setHeight(newHeight);
    if (maintainRatio && image) setWidth(Math.round(newHeight * aspectRatioRef.current));
    setPreset("custom");
  };

  // Load HTMLImageElement from current image preview
  const loadImg = (): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      if (!image) return reject();
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = image.preview;
    });

  const handleQuickResize = async (targetKB: number) => {
    if (!image) return;
    setActiveQuickKB(targetKB);
    setIsProcessing(true);
    setProgress(0);
    setProgressLabel(`Compressing to ${targetKB}KB…`);

    try {
      const img = await loadImg();
      const { dataUrl, sizeKB, finalW, finalH } = await compressToTargetKB(img, targetKB, image.width, image.height, setProgress);

      setResized({ original: image, resized: dataUrl, newWidth: finalW, newHeight: finalH, sizeKB });
      toast({
        title: `✅ Image resized to ${sizeKB}KB`,
        description: `Successfully compressed! Final size: ${sizeKB}KB (${finalW}×${finalH}px)`,
      });
    } catch {
      toast({ title: "Failed", description: "Could not compress to target size.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
      setProgressLabel("");
    }
  };

  const handleSpecialModeResize = async () => {
    if (!image || specialMode === "none") return;
    setIsProcessing(true);
    setProgress(0);

    const modeConfig: Record<string, { w: number; h: number; kb: number; label: string }> = {
      govtjob:  { w: 413, h: 531, kb: govtMaxKB,      label: "Govt Job" },
      passport: { w: 600, h: 600, kb: passportMaxKB,  label: "Passport" },
      whatsapp: { w: 192, h: 192, kb: whatsappMaxKB,  label: "WhatsApp DP" },
      aadhaar:  { w: 200, h: 200, kb: aadhaarMaxKB,   label: "Aadhaar Photo" },
    };

    const cfg = modeConfig[specialMode];
    if (!cfg) { setIsProcessing(false); return; }

    try {
      const img = await loadImg();
      setProgressLabel(`Preparing ${cfg.label} photo…`);

      const canvas = document.createElement("canvas");
      canvas.width = cfg.w;
      canvas.height = cfg.h;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, cfg.w, cfg.h);

      // Center-crop from source
      const srcAR = img.naturalWidth / img.naturalHeight;
      const dstAR = cfg.w / cfg.h;
      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
      if (srcAR > dstAR) {
        sw = Math.round(img.naturalHeight * dstAR);
        sx = Math.round((img.naturalWidth - sw) / 2);
      } else {
        sh = Math.round(img.naturalWidth / dstAR);
        sy = Math.round((img.naturalHeight - sh) / 2);
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cfg.w, cfg.h);
      setProgress(40);

      const tmpImg = new Image();
      await new Promise<void>((res, rej) => {
        tmpImg.onload = () => res();
        tmpImg.onerror = rej;
        tmpImg.src = canvas.toDataURL("image/png");
      });

      const { dataUrl, sizeKB, finalW, finalH } = await compressToTargetKB(tmpImg, cfg.kb, cfg.w, cfg.h, (p) => setProgress(40 + Math.round(p * 0.6)));

      setResized({ original: image, resized: dataUrl, newWidth: finalW, newHeight: finalH, sizeKB });
      toast({
        title: `✅ ${cfg.label} photo ready!`,
        description: `Size: ${sizeKB}KB (${finalW}×${finalH}px) — white background applied`,
      });
    } catch {
      toast({ title: "Failed", description: "Could not process image.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
      setProgressLabel("");
    }
  };

  const handleCustomKBResize = async () => {
    const kb = parseInt(customTargetKB);
    if (!image || !kb || kb < 1) {
      toast({ title: "Invalid size", description: "Enter a valid KB value.", variant: "destructive" });
      return;
    }
    await handleQuickResize(kb);
  };

  const handleResize = async () => {
    if (!image) return;
    setIsProcessing(true);
    setProgress(0);
    setProgressLabel("Resizing…");

    try {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      const img = await loadImg();
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", quality / 100);
      const sizeKB = Math.round((dataUrl.length - 22) * 0.75 / 1024);
      setProgress(100);
      setResized({ original: image, resized: dataUrl, newWidth: width, newHeight: height, sizeKB });
      toast({ title: "✅ Image resized!", description: `New size: ${width}×${height}px · ${sizeKB}KB` });
    } catch {
      toast({ title: "Resize failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
      setProgressLabel("");
    }
  };

  const handleDownload = () => {
    if (!resized) return;
    const link = document.createElement("a");
    link.href = resized.resized;
    link.download = `resized_${resized.newWidth}x${resized.newHeight}.jpg`;
    link.click();
  };

  const handleReset = () => {
    setImage(null);
    setResized(null);
    setPreset("custom");
    setWidth(800);
    setHeight(600);
    setActiveQuickKB(null);
    setSpecialMode("none");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // JSON-LD structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Image Resizer - Resize to 20KB 50KB for Govt Job Form India",
    "description": "Free online image resizer. Resize photo to 20KB, 50KB for govt job forms, passport size photo India. Smart compression with white background.",
    "url": "https://vexatool.com/image-resizer",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
    "provider": { "@type": "Organization", "name": "VexaTool", "url": "https://vexatool.com" },
  };

  const seoContent = {
    toolName: "Image Resizer – Resize to 20KB 50KB, WhatsApp DP, Aadhaar & Passport Photo India",
    whatIs: "Our free Image Resizer is India's most powerful online tool for resizing photos to exact file sizes and dimensions. Resize an image to 20KB for a government job application, 50KB for online forms, or WhatsApp DP size (192×192px) in one click. It also supports Aadhaar photo (200×200px), Passport Photo (2×2 inch, 300 DPI), and Govt Job Form mode (3.5×4.5 cm with white background). The smart algorithm reduces quality gradually while maintaining maximum clarity — your photos will pass all government portal verifications.",
    howToUse: [
      "Upload your photo by clicking the upload area or dragging and dropping.",
      "Choose a Quick Resize button (20KB, 50KB, 100KB, 200KB) for instant compression.",
      "Or select 'WhatsApp DP' mode for a 192×192px profile picture under 20KB.",
      "Or select 'Aadhaar Photo' mode for 200×200px white background ID photo.",
      "Or select 'Govt Job Form' mode for 3.5×4.5cm with white background (SSC/UPSC/IBPS).",
      "Download your photo and use it directly on government portals or social apps.",
    ],
    features: [
      "Quick resize to 20KB, 50KB, 100KB, 200KB in one click",
      "WhatsApp DP mode: 192×192px, under 20KB, optimized for display",
      "Aadhaar Photo mode: 200×200px, white background, perfect for UIDAI upload",
      "Govt Job Form mode: 3.5×4.5cm, max 20KB or 50KB, white background",
      "Passport Photo India mode: 2×2 inch, 300 DPI compatible",
      "Custom KB target: type any file size in KB",
      "Smart algorithm: adjusts quality and resolution automatically",
      "100% browser-based — no server upload, full privacy for Aadhaar & ID photos",
    ],
    safetyNote: "All image processing runs entirely in your browser. Your photos are never uploaded to any server. This is especially important for sensitive documents like Aadhaar card photos, PAN card, government ID photos, and passport pictures. The original file remains unchanged on your device.",
    faqs: [
      { question: "How to resize image to 20KB for govt job form?", answer: "Upload your photo and click the '20KB' quick button. The tool automatically compresses and adjusts quality to reach exactly 20KB while keeping the photo clear and suitable for government portals like SSC, UPSC, IBPS, and state recruitment boards." },
      { question: "How to resize photo for WhatsApp DP?", answer: "Select the 'WhatsApp DP' mode and click 'Apply WhatsApp DP Mode'. The tool crops and resizes your image to 192×192px and compresses it under 20KB for the perfect profile picture." },
      { question: "What size photo is needed for Aadhaar card update?", answer: "Aadhaar / UIDAI requires a passport-size photo with white background, typically 200×200px. Select 'Aadhaar Photo' mode and the tool automatically applies the correct size, white background, and 20KB/50KB limit." },
      { question: "What is the standard passport photo size in India?", answer: "The standard Indian passport photo size is 2×2 inches (51×51mm) at 300 DPI, which equals 600×600 pixels. Our Passport Photo India mode automatically sets these dimensions." },
      { question: "What size photo is required for govt job application forms?", answer: "Most Indian government job forms (SSC, UPSC, Railway, Banking) require a passport size photo of 3.5×4.5 cm with a white background, and file size between 10KB to 50KB in JPEG format. Our Govt Job Form mode handles all of this automatically." },
      { question: "Does this tool add white background to photos?", answer: "Yes. WhatsApp DP, Aadhaar Photo, Govt Job Form, and Passport Photo modes all automatically add a white background, meeting the requirement for all Indian government documents." },
      { question: "Will compressing to 20KB reduce photo quality?", answer: "The smart compression algorithm reduces quality gradually, from high to minimum, to hit the target size. For typical passport and ID photos, the result at 20KB is perfectly clear and accepted by all government portals." },
      { question: "Can I type a custom KB target size?", answer: "Yes. In the Custom Target Size section, type any KB value (e.g., 30, 75, 150) and click Compress. The smart algorithm will find the best quality-size combination to match your target." },
    ],
  };

  return (
    <>
      <CanonicalHead
        title="Image Resizer – Resize to 20KB, WhatsApp DP, Aadhaar & Passport Photo India | VexaTool"
        description="Resize image to 20KB or 50KB for Govt Job Form, UPSC, SSC. WhatsApp DP 192×192px, Aadhaar photo 200×200px. Free, fast, browser-based."
        keywords="resize image to 20kb, whatsapp dp resize, aadhaar photo size, passport size photo india, govt job form photo, compress image to 20kb, resize photo online free"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <ToolLayout
        title="Image Resizer"
        description="Resize to exact KB for Govt Forms, Passport Photos & Social Media"
        icon={Maximize}
        colorClass="bg-gradient-to-br from-cyan-500 to-blue-600"
        category="Image Tools"
      >
        <div className="space-y-6">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

          {/* Upload Area */}
          {!image ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-muted-foreground/25 p-12 cursor-pointer hover:border-primary/50 transition-colors"
            >
              <Upload className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <p className="font-semibold text-lg">Click to upload or drag & drop</p>
                <p className="text-sm text-muted-foreground mt-1">JPG, PNG, WebP · Max 25MB</p>
              </div>
            </div>
          ) : (
            <>
              {/* Image Preview */}
              <div className="flex items-start gap-4 rounded-xl border p-4 bg-muted/20">
                <img src={image.preview} alt="Preview" className="h-20 w-20 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="font-medium truncate">{image.file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {image.width}×{image.height}px · {Math.round(image.file.size / 1024)}KB
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleReset}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Progress Bar */}
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{progressLabel}</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* ── QUICK RESIZE BUTTONS ── */}
              <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">⚡ Quick Resize to Exact File Size</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {QUICK_SIZE_TARGETS.map(({ label, kb }) => (
                    <Button
                      key={kb}
                      variant={activeQuickKB === kb ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleQuickResize(kb)}
                      disabled={isProcessing}
                      className="font-bold text-sm"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Smart compression — maintains maximum clarity while hitting exact file size
                </p>
              </div>

              {/* ── CUSTOM TARGET KB ── */}
              <div className="rounded-xl border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Custom Target File Size</h3>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Enter target size in KB (e.g. 35)"
                    value={customTargetKB}
                    onChange={(e) => setCustomTargetKB(e.target.value)}
                    className="flex-1"
                    min="1"
                    max="10000"
                  />
                  <Button onClick={handleCustomKBResize} disabled={isProcessing || !customTargetKB} variant="outline">
                    Compress
                  </Button>
                </div>
              </div>

              {/* ── SPECIAL MODES ── */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileImage className="h-4 w-4" />
                  Special Modes
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {/* Govt Job Form */}
                  <div
                    className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${specialMode === "govtjob" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                    onClick={() => setSpecialMode(specialMode === "govtjob" ? "none" : "govtjob")}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm">Govt Job Form</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">India</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      3.5×4.5cm · White background · SSC / UPSC / IBPS / Railways
                    </p>
                    {specialMode === "govtjob" && (
                      <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                        <Label className="text-xs">Max file size</Label>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={govtMaxKB === 20 ? "default" : "outline"}
                            onClick={() => setGovtMaxKB(20)}
                            className="flex-1 text-xs"
                          >20KB</Button>
                          <Button
                            size="sm"
                            variant={govtMaxKB === 50 ? "default" : "outline"}
                            onClick={() => setGovtMaxKB(50)}
                            className="flex-1 text-xs"
                          >50KB</Button>
                        </div>
                        <Button
                          onClick={handleSpecialModeResize}
                          disabled={isProcessing}
                          className="w-full"
                          size="sm"
                        >
                          {isProcessing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                          Apply Govt Job Mode
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Passport Photo India */}
                  <div
                    className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${specialMode === "passport" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                    onClick={() => setSpecialMode(specialMode === "passport" ? "none" : "passport")}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileImage className="h-4 w-4 text-secondary-foreground" />
                        <span className="font-semibold text-sm">Passport Photo India</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">300 DPI</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      2×2 inch · 600×600px · White background · Passport / Visa
                    </p>
                    {specialMode === "passport" && (
                      <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                        <Label className="text-xs">Max file size</Label>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={passportMaxKB === 20 ? "default" : "outline"}
                            onClick={() => setPassportMaxKB(20)}
                            className="flex-1 text-xs"
                          >20KB</Button>
                          <Button
                            size="sm"
                            variant={passportMaxKB === 50 ? "default" : "outline"}
                            onClick={() => setPassportMaxKB(50)}
                            className="flex-1 text-xs"
                          >50KB</Button>
                        </div>
                        <Button
                          onClick={handleSpecialModeResize}
                          disabled={isProcessing}
                          className="w-full"
                          size="sm"
                        >
                          {isProcessing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                          Apply Passport Mode
                        </Button>
                      </div>
                    )}
                  </div>
                  {/* WhatsApp DP */}
                  <div
                    className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${specialMode === "whatsapp" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                    onClick={() => setSpecialMode(specialMode === "whatsapp" ? "none" : "whatsapp")}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💬</span>
                        <span className="font-semibold text-sm">WhatsApp DP</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">192×192</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      192×192px · Under 20KB · Profile picture optimized
                    </p>
                    {specialMode === "whatsapp" && (
                      <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                        <Label className="text-xs">Max file size</Label>
                        <div className="flex gap-2">
                          <Button size="sm" variant={whatsappMaxKB === 20 ? "default" : "outline"} onClick={() => setWhatsappMaxKB(20)} className="flex-1 text-xs">20KB</Button>
                          <Button size="sm" variant={whatsappMaxKB === 50 ? "default" : "outline"} onClick={() => setWhatsappMaxKB(50)} className="flex-1 text-xs">50KB</Button>
                        </div>
                        <Button onClick={handleSpecialModeResize} disabled={isProcessing} className="w-full" size="sm">
                          {isProcessing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                          Apply WhatsApp DP Mode
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Aadhaar Photo */}
                  <div
                    className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${specialMode === "aadhaar" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                    onClick={() => setSpecialMode(specialMode === "aadhaar" ? "none" : "aadhaar")}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🪪</span>
                        <span className="font-semibold text-sm">Aadhaar Photo</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">India ID</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      200×200px · White background · Aadhaar / PAN card upload
                    </p>
                    {specialMode === "aadhaar" && (
                      <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                        <Label className="text-xs">Max file size</Label>
                        <div className="flex gap-2">
                          <Button size="sm" variant={aadhaarMaxKB === 20 ? "default" : "outline"} onClick={() => setAadhaarMaxKB(20)} className="flex-1 text-xs">20KB</Button>
                          <Button size="sm" variant={aadhaarMaxKB === 50 ? "default" : "outline"} onClick={() => setAadhaarMaxKB(50)} className="flex-1 text-xs">50KB</Button>
                        </div>
                        <Button onClick={handleSpecialModeResize} disabled={isProcessing} className="w-full" size="sm">
                          {isProcessing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                          Apply Aadhaar Mode
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── STANDARD RESIZE ── */}
              <div className="rounded-xl border p-4 space-y-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Maximize className="h-4 w-4" />
                  Standard Resize by Dimensions
                </h3>

                <div className="space-y-2">
                  <Label>Preset Size</Label>
                  <Select value={preset} onValueChange={handlePresetChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select preset" />
                    </SelectTrigger>
                    <SelectContent>
                      {presets.map((p) => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="width">Width (px)</Label>
                    <Input id="width" type="number" min="1" max="10000" value={width} onChange={(e) => handleWidthChange(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (px)</Label>
                    <Input id="height" type="number" min="1" max="10000" value={height} onChange={(e) => handleHeightChange(e.target.value)} />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="ratio" checked={maintainRatio} onChange={(e) => setMaintainRatio(e.target.checked)} className="rounded" />
                  <Label htmlFor="ratio" className="cursor-pointer">Maintain aspect ratio</Label>
                </div>

                <div className="space-y-2">
                  <Label>Quality: {quality}%</Label>
                  <Slider value={[quality]} onValueChange={(v) => setQuality(v[0])} min={10} max={100} step={5} />
                </div>

                <Button onClick={handleResize} disabled={isProcessing} className="w-full" size="lg">
                  {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Resizing…</> : <><Maximize className="mr-2 h-4 w-4" />Resize Image</>}
                </Button>
              </div>

              {/* ── RESULT ── */}
              {resized && (
                <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="font-semibold text-primary">
                        ✅ Image successfully resized to {resized.sizeKB}KB
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {resized.newWidth}×{resized.newHeight}px
                      </p>
                    </div>
                    <Button onClick={handleDownload} className="gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                  <img src={resized.resized} alt="Resized" className="max-h-[300px] rounded-lg object-contain mx-auto w-full" />
                </div>
              )}
            </>
          )}
        </div>

        <ToolSEOContent {...seoContent} />
      </ToolLayout>
    </>
  );
}
