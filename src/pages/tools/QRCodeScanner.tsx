import { useState, useRef, useCallback, useEffect } from "react";
import { ScanLine, Upload, Camera, Copy, ExternalLink } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import jsQR from "jsqr";
import { Helmet } from "react-helmet";

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
      const code = jsQR(imageData.data, imageData.width, imageData.height);
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

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        toast.error("Failed to process image");
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      setPreviewImage(URL.createObjectURL(file));
      
      if (!scanImage(imageData)) {
        toast.error("No QR code found in image. Try a clearer image.");
      }
    };
    img.onerror = () => {
      toast.error("Failed to load image");
    };
    img.src = URL.createObjectURL(file);
    
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
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsScanning(true);
          // Start scanning after video is ready
          animationFrameRef.current = requestAnimationFrame(scanFrame);
        };
      }
    } catch (error) {
      console.error("Camera error:", error);
      toast.error("Could not access camera. Please check permissions.");
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
        </div>
      </ToolLayout>
    </>
  );
};

export default QRCodeScanner;
