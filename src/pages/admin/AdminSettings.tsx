import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Save, Globe, Palette, Shield } from "lucide-react";

const settingsKeys = [
  { key: "site_title", label: "Site Title", placeholder: "VexaTool" },
  { key: "site_description", label: "Site Description", placeholder: "Free online tools" },
  { key: "logo_url", label: "Logo URL", placeholder: "/favicon.png" },
  { key: "favicon_url", label: "Favicon URL", placeholder: "/favicon.ico" },
  { key: "brand_primary_color", label: "Primary Color (HSL)", placeholder: "217 91% 60%" },
  { key: "brand_secondary_color", label: "Secondary Color (HSL)", placeholder: "210 40% 96%" },
  { key: "google_verification", label: "Google Search Console Code", placeholder: "google-site-verification=..." },
  { key: "bing_verification", label: "Bing Webmaster Code", placeholder: "msvalidate.01 content value" },
  { key: "yandex_verification", label: "Yandex Verification Code", placeholder: "yandex verification" },
  { key: "og_image_url", label: "Default OG Image URL", placeholder: "/og-image.png" },
  { key: "twitter_handle", label: "Twitter Handle", placeholder: "@vexatool" },
  { key: "contact_email", label: "Contact Email", placeholder: "contact@vexatool.com" },
];

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("site_settings").select("*");
      const map: Record<string, string> = {};
      (data || []).forEach((s: any) => { map[s.setting_key] = s.setting_value || ""; });
      setSettings(map);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        const { data: existing } = await supabase.from("site_settings").select("id").eq("setting_key", key).single();
        if (existing) {
          await supabase.from("site_settings").update({ setting_value: value }).eq("setting_key", key);
        } else {
          await supabase.from("site_settings").insert({ setting_key: key, setting_value: value });
        }
      }
      toast({ title: "Settings saved" });
    } catch (err) {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const brandSettings = settingsKeys.filter(s => s.key.includes("brand") || s.key.includes("logo") || s.key.includes("favicon") || s.key.includes("og_image"));
  const seoSettings = settingsKeys.filter(s => s.key.includes("verification") || s.key.includes("twitter"));
  const generalSettings = settingsKeys.filter(s => !brandSettings.includes(s) && !seoSettings.includes(s));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Site configuration & SEO</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />{saving ? "Saving..." : "Save All"}
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general"><Globe className="w-4 h-4 mr-1" /> General</TabsTrigger>
          <TabsTrigger value="branding"><Palette className="w-4 h-4 mr-1" /> Branding</TabsTrigger>
          <TabsTrigger value="seo"><Shield className="w-4 h-4 mr-1" /> SEO & Verification</TabsTrigger>
        </TabsList>

        {[
          { value: "general", items: generalSettings },
          { value: "branding", items: brandSettings },
          { value: "seo", items: seoSettings },
        ].map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <Card>
              <CardContent className="p-6 space-y-4">
                {tab.items.map((s) => (
                  <div key={s.key} className="space-y-2">
                    <Label>{s.label}</Label>
                    <Input
                      value={settings[s.key] || ""}
                      onChange={(e) => setSettings({ ...settings, [s.key]: e.target.value })}
                      placeholder={s.placeholder}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AdminSettings;
