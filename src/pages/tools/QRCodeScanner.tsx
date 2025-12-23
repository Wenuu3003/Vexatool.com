import { useState, useRef, useCallback } from "react";
import { ScanLine, Upload, Camera, Copy, ExternalLink } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
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

  const scanImage = useCallback((imageData: ImageData) => {
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code) {
      setScannedResult(code.data);
      toast({
        title: "QR Code Found!",
        description: "Successfully scanned the QR code.",
      });
      return true;
    }
    return false;
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      setPreviewImage(URL.createObjectURL(file));
      
      if (!scanImage(imageData)) {
        toast({
          title: "No QR Code Found",
          description: "Could not detect a QR code in the image. Try a clearer image.",
          variant: "destructive",
        });
      }
    };
    img.src = URL.createObjectURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        scanFrame();
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

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

    if (isScanning) {
      requestAnimationFrame(scanFrame);
    }
  };

  const copyResult = () => {
    if (scannedResult) {
      navigator.clipboard.writeText(scannedResult);
      toast({
        title: "Copied!",
        description: "QR code content copied to clipboard.",
      });
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
        <title>QR Code Scanner Free Online - Scan QR from Image | Mypdfs</title>
        <meta name="description" content="Free online QR code scanner. Scan QR codes from images or camera. Fast and accurate QR code reading with instant results." />
        <meta name="keywords" content="QR code scanner, scan QR code, read QR code, QR reader, free QR scanner, camera QR scan" />
        <link rel="canonical" href="https://mypdfs.lovable.app/qr-code-scanner" />
      </Helmet>
      <ToolLayout
        title="QR Code Scanner"
        description="Scan QR codes from images or using your camera"
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
          />
          <Button
            size="lg"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Upload className="w-5 h-5" />
            Upload Image
          </Button>
          <Button
            size="lg"
            variant={isScanning ? "destructive" : "outline"}
            onClick={isScanning ? stopCamera : startCamera}
            className="gap-2"
          >
            <Camera className="w-5 h-5" />
            {isScanning ? "Stop Camera" : "Use Camera"}
          </Button>
        </div>

        {isScanning && (
          <div className="relative rounded-lg overflow-hidden bg-black">
            <video ref={videoRef} className="w-full" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 border-2 border-primary/50 pointer-events-none">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary animate-pulse" />
            </div>
          </div>
        )}

        {previewImage && !isScanning && (
          <div className="text-center">
            <img
              src={previewImage}
              alt="Uploaded image"
              className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg"
            />
          </div>
        )}

        {scannedResult && (
          <div className="bg-card border rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-lg">Scanned Result:</h3>
            <div className="bg-muted p-4 rounded-lg break-all font-mono text-sm">
              {scannedResult}
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button onClick={copyResult} variant="outline" className="gap-2">
                <Copy className="w-4 h-4" />
                Copy
              </Button>
              {isUrl && (
                <Button onClick={openLink} className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Open Link
                </Button>
              )}
            </div>
          </div>
        )}

        {!scannedResult && !isScanning && !previewImage && (
          <div className="text-center py-12 text-muted-foreground">
            <ScanLine className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>Upload an image or use your camera to scan a QR code</p>
          </div>
        )}
      </div>
      </ToolLayout>
    </>
  );
};

export default QRCodeScanner;
