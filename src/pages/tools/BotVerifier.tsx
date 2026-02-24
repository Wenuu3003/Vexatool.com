import { useState } from "react";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Search, Shield, Globe, Server } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface VerificationResult {
  ip: string;
  botType: string;
  isVerified: boolean;
  hostname: string | null;
  forwardIp: string | null;
  error: string | null;
  verificationMethod: string;
  trustedHostnameSuffix: string;
}

const BotVerifier = () => {
  const [ipAddress, setIpAddress] = useState("");
  const [botType, setBotType] = useState<"bingbot" | "googlebot">("googlebot");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async () => {
    if (!ipAddress.trim()) {
      toast({
        title: "IP Required",
        description: "Please enter an IP address to verify.",
        variant: "destructive",
      });
      return;
    }

    // Basic IP validation
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipv4Pattern.test(ipAddress.trim())) {
      toast({
        title: "Invalid IP Format",
        description: "Please enter a valid IPv4 address (e.g., 66.249.66.1).",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("indexnow", {
        body: {
          action: `verify-${botType}`,
          ip: ipAddress.trim(),
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      setResult(data as VerificationResult);

      if (data.isVerified) {
        toast({
          title: "Verified ✓",
          description: `This IP belongs to a legitimate ${botType === "googlebot" ? "Googlebot" : "Bingbot"} crawler.`,
        });
      } else {
        toast({
          title: "Not Verified",
          description: data.error || "This IP does not appear to be a legitimate crawler.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "An error occurred during verification.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exampleIps = {
    googlebot: ["66.249.66.1", "66.249.68.1", "72.14.199.1"],
    bingbot: ["157.55.39.1", "40.77.167.1", "207.46.13.1"],
  };

  return (
    <>
      <Helmet>
        <title>Bot IP Verifier - Verify Googlebot & Bingbot IPs | VexaTool</title>
        <meta
          name="description"
          content="Verify if an IP address belongs to a legitimate Googlebot or Bingbot crawler using reverse DNS lookup verification."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Bot IP Verifier</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Verify if an IP address belongs to a legitimate search engine crawler using reverse DNS lookup.
              This helps identify fake bots that may be scraping your website.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Verification Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Verify IP Address
                </CardTitle>
                <CardDescription>
                  Enter an IP address and select the bot type to verify
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="ip-address">IP Address</Label>
                  <Input
                    id="ip-address"
                    type="text"
                    placeholder="e.g., 66.249.66.1"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Bot Type</Label>
                  <RadioGroup
                    value={botType}
                    onValueChange={(v) => setBotType(v as "bingbot" | "googlebot")}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="googlebot" id="googlebot" />
                      <Label htmlFor="googlebot" className="cursor-pointer font-normal">
                        Googlebot
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bingbot" id="bingbot" />
                      <Label htmlFor="bingbot" className="cursor-pointer font-normal">
                        Bingbot
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button onClick={handleVerify} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Verify IP
                    </>
                  )}
                </Button>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Example IPs to test:</p>
                  <div className="flex flex-wrap gap-2">
                    {exampleIps[botType].map((ip) => (
                      <Badge
                        key={ip}
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80"
                        onClick={() => setIpAddress(ip)}
                      >
                        {ip}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Verification Results
                </CardTitle>
                <CardDescription>
                  DNS lookup results and verification status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!result && !isLoading && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Enter an IP address and click verify to see results</p>
                  </div>
                )}

                {isLoading && (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin text-primary" />
                    <p className="text-muted-foreground">Performing DNS lookups...</p>
                  </div>
                )}

                {result && !isLoading && (
                  <div className="space-y-4">
                    {/* Status Banner */}
                    <div
                      className={`p-4 rounded-lg flex items-center gap-3 ${
                        result.isVerified
                          ? "bg-green-500/10 border border-green-500/20"
                          : "bg-red-500/10 border border-red-500/20"
                      }`}
                    >
                      {result.isVerified ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                      )}
                      <div>
                        <p className={`font-semibold ${result.isVerified ? "text-green-600" : "text-red-600"}`}>
                          {result.isVerified ? "Verified Crawler" : "Not Verified"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {result.isVerified
                            ? `This is a legitimate ${result.botType} IP`
                            : result.error || "Could not verify this IP as a legitimate crawler"}
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">IP Address</span>
                        <span className="font-mono">{result.ip}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Bot Type</span>
                        <Badge variant="outline">{result.botType}</Badge>
                      </div>
                      {result.hostname && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Hostname (PTR)</span>
                          <span className="font-mono text-xs break-all text-right max-w-[200px]">
                            {result.hostname}
                          </span>
                        </div>
                      )}
                      {result.forwardIp && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Forward IP (A)</span>
                          <span className="font-mono">{result.forwardIp}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Expected Suffix</span>
                        <span className="font-mono text-xs">{result.trustedHostnameSuffix}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-muted-foreground">Method</span>
                        <span className="text-xs text-right max-w-[180px]">{result.verificationMethod}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>How Bot Verification Works</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-2">1. Reverse DNS (PTR)</h4>
                  <p className="text-sm text-muted-foreground">
                    The IP address is looked up to find its hostname. Legitimate Googlebot IPs resolve to
                    hostnames ending in <code>.googlebot.com</code> or <code>.google.com</code>.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-2">2. Forward DNS (A)</h4>
                  <p className="text-sm text-muted-foreground">
                    The hostname is then looked up to get its IP address. This must match the original IP to
                    confirm authenticity.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-2">3. Verification</h4>
                  <p className="text-sm text-muted-foreground">
                    Both checks must pass: correct hostname suffix AND matching forward/reverse IPs. This
                    prevents spoofing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BotVerifier;
