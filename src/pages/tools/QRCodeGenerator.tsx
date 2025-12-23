import { useState, useRef, useEffect } from "react";
import { QrCode, Download } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import QRCode from "qrcode";

const QRCodeGenerator = () => {
  const [text, setText] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [size, setSize] = useState(256);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (text.trim()) {
      generateQR();
    } else {
      setQrDataUrl(null);
    }
  }, [text, size]);

  const generateQR = async () => {
    if (!text.trim()) return;

    try {
      const dataUrl = await QRCode.toDataURL(text, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      setQrDataUrl(dataUrl);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("QR generation error:", error);
      }
      toast({
        title: "Error",
        description: "Failed to generate QR code.",
        variant: "destructive",
      });
    }
  };

  const downloadQR = (format: 'png' | 'svg') => {
    if (!qrDataUrl) return;

    if (format === 'png') {
      const link = document.createElement("a");
      link.href = qrDataUrl;
      link.download = "qrcode.png";
      link.click();
    } else {
      // Generate SVG
      QRCode.toString(text, { type: 'svg', width: size }, (err, svg) => {
        if (err) {
          toast({
            title: "Error",
            description: "Failed to generate SVG.",
            variant: "destructive",
          });
          return;
        }
        const blob = new Blob([svg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "qrcode.svg";
        link.click();
        URL.revokeObjectURL(url);
      });
    }

    toast({
      title: "Downloaded!",
      description: `QR code saved as ${format.toUpperCase()}.`,
    });
  };

  return (
    <ToolLayout
      title="QR Code Generator"
      description="Generate QR codes for URLs, text, or any data"
      icon={QrCode}
      colorClass="bg-purple-500"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <Label htmlFor="qr-text">Enter URL or text</Label>
          <Input
            id="qr-text"
            placeholder="https://example.com or any text..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="qr-size">Size: {size}px</Label>
          <input
            type="range"
            id="qr-size"
            min="128"
            max="512"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {qrDataUrl && (
          <div className="flex flex-col items-center space-y-6">
            <div className="p-4 bg-white rounded-xl shadow-lg">
              <img src={qrDataUrl} alt="QR Code" className="max-w-full" />
            </div>
            
            <div className="flex gap-4">
              <Button onClick={() => downloadQR('png')} className="gap-2">
                <Download className="w-4 h-4" />
                Download PNG
              </Button>
              <Button variant="outline" onClick={() => downloadQR('svg')} className="gap-2">
                <Download className="w-4 h-4" />
                Download SVG
              </Button>
            </div>
          </div>
        )}

        {!text.trim() && (
          <div className="text-center py-12 text-muted-foreground">
            <QrCode className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>Enter text or URL above to generate a QR code</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default QRCodeGenerator;
