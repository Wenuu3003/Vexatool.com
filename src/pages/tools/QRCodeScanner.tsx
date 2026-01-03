import { useState, useRef, useCallback, useEffect } from "react";
import { ScanLine, Upload, Camera, Copy, ExternalLink } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import jsQR from "jsqr";
import { Helmet } from "react-helmet";
import ToolSEOContent from "@/components/ToolSEOContent";

const QRCodeScanner = () => {
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const scanImage = useCallback((imageData: ImageData): boolean => {
    try {
      // Try with default options first
      let code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth",
      });
      
      if (code) {
        setScannedResult(code.data);
        toast.success("QR Code found!");
        return true;
      }
      
      // If not found, try with dontInvert option
      code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      
      if (code) {
        setScannedResult(code.data);
        toast.success("QR Code found!");
        return true;
      }
    } catch (error) {
      console.error("QR scan error:", error);
    }
    return false;
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous state
    setScannedResult(null);
    setPreviewImage(null);

    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);

    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      // Try multiple scales for better detection
      const scales = [1, 0.5, 2, 0.75, 1.5];
      let found = false;
      
      for (const scale of scales) {
        if (found) break;
        
        const canvas = document.createElement("canvas");
        const scaledWidth = Math.floor(img.width * scale);
        const scaledHeight = Math.floor(img.height * scale);
        
        // Limit max size for performance
        const maxSize = 2000;
        const finalScale = Math.min(1, maxSize / Math.max(scaledWidth, scaledHeight));
        canvas.width = Math.floor(scaledWidth * finalScale);
        canvas.height = Math.floor(scaledHeight * finalScale);
        
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) continue;

        // Apply image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        if (scanImage(imageData)) {
          found = true;
          break;
        }
        
        // Try with increased contrast
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          // Convert to grayscale
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          // Increase contrast
          const contrast = gray < 128 ? 0 : 255;
          data[i] = contrast;
          data[i + 1] = contrast;
          data[i + 2] = contrast;
        }
        
        if (scanImage(imageData)) {
          found = true;
          break;
        }
      }
      
      if (!found) {
        toast.error("No QR code found. Try a clearer image with good contrast.");
      }
    };
    
    img.onerror = () => {
      toast.error("Failed to load image");
    };
    
    img.src = objectUrl;
    
    // Reset file input
    e.target.value = "";
  };

  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      if (scanImage(imageData)) {
        stopCamera();
        return;
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  }, [scanImage, stopCamera]);

  const startCamera = async () => {
    try {
      // Reset state
      setScannedResult(null);
      setPreviewImage(null);
      
      // First check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Camera not supported in this browser");
        return;
      }

      // Set scanning state immediately to show video element
      setIsScanning(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      // Wait for next tick to ensure video element is mounted
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Use both onloadedmetadata and oncanplay for better compatibility
        const startScanning = () => {
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              animationFrameRef.current = requestAnimationFrame(scanFrame);
            }).catch(err => {
              console.error("Video play error:", err);
            });
          }
        };
        
        videoRef.current.onloadedmetadata = startScanning;
        videoRef.current.oncanplay = startScanning;
      }
    } catch (error) {
      console.error("Camera error:", error);
      setIsScanning(false);
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          toast.error("Camera access denied. Please allow camera permissions.");
        } else if (error.name === 'NotFoundError') {
          toast.error("No camera found on this device.");
        } else {
          toast.error("Could not access camera. Please check permissions.");
        }
      } else {
        toast.error("Could not access camera. Please check permissions.");
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const copyResult = () => {
    if (scannedResult) {
      navigator.clipboard.writeText(scannedResult);
      toast.success("Copied to clipboard!");
    }
  };

  const openLink = () => {
    if (scannedResult && (scannedResult.startsWith("http://") || scannedResult.startsWith("https://"))) {
      window.open(scannedResult, "_blank", "noopener,noreferrer");
    }
  };

  const isUrl = scannedResult && (scannedResult.startsWith("http://") || scannedResult.startsWith("https://"));

  return (
    <>
      <Helmet>
        <title>QR Code Scanner Free Online - Scan QR from Image or Camera | Mypdfs</title>
        <meta name="description" content="Free online QR code scanner. Scan QR codes from images or camera instantly. Fast and accurate QR code reading with one-click copy and open features." />
        <meta name="keywords" content="QR code scanner, scan QR code, read QR code, QR reader, free QR scanner, camera QR scan, image QR scan, QR decoder" />
        <link rel="canonical" href="https://mypdfs.lovable.app/qr-code-scanner" />
      </Helmet>
      <ToolLayout
        title="QR Code Scanner"
        description="Scan QR codes from images or using your camera instantly"
        icon={ScanLine}
        colorClass="bg-violet-500"
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="hidden"
              aria-label="Upload image with QR code"
            />
            <Button
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="w-5 h-5" aria-hidden="true" />
              Upload Image
            </Button>
            <Button
              size="lg"
              variant={isScanning ? "destructive" : "outline"}
              onClick={isScanning ? stopCamera : startCamera}
              className="gap-2"
            >
              <Camera className="w-5 h-5" aria-hidden="true" />
              {isScanning ? "Stop Camera" : "Use Camera"}
            </Button>
          </div>

          {isScanning && (
            <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
              <video 
                ref={videoRef} 
                className="w-full h-full object-cover" 
                playsInline 
                muted
                autoPlay
                aria-label="Camera feed for QR code scanning"
              />
              <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
              <div className="absolute inset-0 border-2 border-primary/50 pointer-events-none">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary animate-pulse" />
              </div>
              <p className="absolute bottom-4 left-0 right-0 text-center text-white text-sm bg-black/50 py-2">
                Point camera at a QR code
              </p>
            </div>
          )}

          {previewImage && !isScanning && (
            <div className="text-center">
              <img
                src={previewImage}
                alt="Uploaded image for QR code scanning"
                className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg"
              />
            </div>
          )}

          {scannedResult && (
            <div className="bg-card border rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-lg text-foreground">Scanned Result:</h3>
              <div className="bg-muted p-4 rounded-lg break-all font-mono text-sm text-foreground">
                {scannedResult}
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button onClick={copyResult} variant="outline" className="gap-2">
                  <Copy className="w-4 h-4" aria-hidden="true" />
                  Copy
                </Button>
                {isUrl && (
                  <Button onClick={openLink} className="gap-2">
                    <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    Open Link
                  </Button>
                )}
              </div>
            </div>
          )}

          {!scannedResult && !isScanning && !previewImage && (
            <div className="text-center py-12 text-muted-foreground">
              <ScanLine className="w-16 h-16 mx-auto mb-4 opacity-20" aria-hidden="true" />
              <p>Upload an image or use your camera to scan a QR code</p>
            </div>
          )}

          <div className="bg-muted/50 rounded-xl p-4">
            <h4 className="font-medium text-foreground mb-2">Tips for better scanning:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Ensure the QR code is clear and not blurry</li>
              <li>• Good lighting helps with camera scanning</li>
              <li>• Hold steady when using camera</li>
              <li>• Make sure the entire QR code is visible</li>
            </ul>
          </div>

          <ToolSEOContent
            toolName="QR Code Scanner"
            whatIs="A QR code scanner reads and decodes the information stored in QR (Quick Response) codes. Our free online scanner can read QR codes from uploaded images or directly through your device's camera. Whether you need to decode a QR code from a screenshot, extract a URL from printed materials, or scan codes in real-time, this tool provides instant results with one-click copy and open functionality."
            howToUse={[
              "Choose your scanning method: upload an image or use your camera.",
              "For images, click 'Upload Image' and select a file containing a QR code.",
              "For camera scanning, click 'Use Camera' and point at the QR code.",
              "Once decoded, copy the content or open links directly from the results."
            ]}
            features={[
              "Scan QR codes from uploaded images or screenshots.",
              "Real-time camera scanning with live preview.",
              "Automatic contrast enhancement for better detection.",
              "One-click copy to clipboard functionality.",
              "Direct link opening for URL-based QR codes.",
              "Works on desktop and mobile devices."
            ]}
            safetyNote="All QR code scanning happens locally in your browser. Your images and camera feed are processed on your device and never sent to external servers. Decoded content is displayed only to you and is not logged or stored anywhere."
            faqs={[
              {
                question: "Why isn't my QR code being detected?",
                answer: "Ensure the QR code is clear, well-lit, and fully visible. Blurry or partially obscured codes may not scan. Try adjusting the angle or distance, or upload a clearer image."
              },
              {
                question: "What types of QR codes can this scanner read?",
                answer: "This scanner reads standard QR codes containing URLs, text, contact information, WiFi credentials, and other encoded data. It supports most common QR code formats."
              },
              {
                question: "Is camera scanning safe?",
                answer: "Yes, camera access is used only for QR code scanning. The video feed is processed locally and never transmitted. You can revoke camera permissions anytime through your browser settings."
              },
              {
                question: "Can I scan QR codes from screenshots?",
                answer: "Absolutely. Upload any image containing a QR code, including screenshots, photos, or downloaded images. The scanner will detect and decode the QR code automatically."
              }
            ]}
          />
        </div>
      </ToolLayout>
    </>
  );
};

export default QRCodeScanner;
