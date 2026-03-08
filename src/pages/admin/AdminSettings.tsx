import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Save, Globe, Palette, Shield } from "lucide-react";

const db = supabase as any;

const settingsKeys = [
  { key: "site_title", label: "Site Title", placeholder: "VexaTool", group: "general" },
  { key: "site_description", label: "Site Description", placeholder: "Free online tools", group: "general" },
  { key: "contact_email", label: "Contact Email", placeholder: "contact@vexatool.com", group: "general" },
  { key: "logo_url", label: "Logo URL", placeholder: "/favicon.png", group: "branding" },
  { key: "favicon_url", label: "Favicon URL", placeholder: "/favicon.ico", group: "branding" },
  { key: "brand_primary_color", label: "Primary Color (HSL)", placeholder: "217 91% 60%", group: "branding" },
  { key: "og_image_url", label: "Default OG Image URL", placeholder: "/og-image.png", group: "branding" },
  { key: "google_verification", label: "Google Search Console Code", placeholder: "google-site-verification=...", group: "seo" },
  { key: "bing_verification", label: "Bing Webmaster Code", placeholder: "msvalidate.01 content", group: "seo" },
  { key: "yandex_verification", label: "Yandex Verification Code", placeholder: "yandex verification", group: "seo" },
  { key: "twitter_handle", label: "Twitter Handle", placeholder: "@vexatool", group: "seo" },
];

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await db.from("site_settings").select("*");
      const map: Record<string, string> = {};
      (data || []).forEach((s: any) => { map[s.setting_key] = s.setting_value || ""; });
      setSettings(map); setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        const { data: existing } = await db.from("site_settings").select("id").eq("setting_key", key).single();
        if (existing) {
          await db.from("site_settings").update({ setting_value: value }).eq("setting_key", key);
        } else {
          await db.from("site_settings").insert({ setting_key: key, setting_value: value });
        }
      }
      toast({ title: "Settings saved" });
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Settings</h1><p className="text-muted-foreground">Site configuration & SEO</p></div>
        <Button onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? "Saving..." : "Save All"}</Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general"><Globe className="w-4 h-4 mr-1" /> General</TabsTrigger>
          <TabsTrigger value="branding"><Palette className="w-4 h-4 mr-1" /> Branding</TabsTrigger>
          <TabsTrigger value="seo"><Shield className="w-4 h-4 mr-1" /> SEO & Verification</TabsTrigger>
        </TabsList>

        {["general", "branding", "seo"].map((group) => (
          <TabsContent key={group} value={group}>
            <Card><CardContent className="p-6 space-y-4">
              {settingsKeys.filter(s => s.group === group).map((s) => (
                <div key={s.key} className="space-y-2">
                  <Label>{s.label}</Label>
                  <Input value={settings[s.key] || ""} onChange={(e) => setSettings({ ...settings, [s.key]: e.target.value })} placeholder={s.placeholder} />
                </div>
              ))}
            </CardContent></Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AdminSettings;
