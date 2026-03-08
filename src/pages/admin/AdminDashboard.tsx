import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, FileText, HelpCircle, Mail, Users, FolderOpen } from "lucide-react";

const db = supabase as any;

interface Stats {
  tools: number;
  blogs: number;
  faqs: number;
  categories: number;
  messages: number;
  unreadMessages: number;
  users: number;
  enabledTools: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    tools: 0, blogs: 0, faqs: 0, categories: 0,
    messages: 0, unreadMessages: 0, users: 0, enabledTools: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [tools, blogs, faqs, categories, messages, profiles] = await Promise.all([
          db.from("admin_tools").select("id, is_enabled", { count: "exact" }),
          db.from("admin_blogs").select("id", { count: "exact" }),
          db.from("admin_faqs").select("id", { count: "exact" }),
          db.from("admin_categories").select("id", { count: "exact" }),
          db.from("contact_messages").select("id, is_read", { count: "exact" }),
          supabase.from("profiles").select("id", { count: "exact" }),
        ]);

        const unread = messages.data?.filter((m: any) => !m.is_read).length || 0;
        const enabled = tools.data?.filter((t: any) => t.is_enabled).length || 0;

        setStats({
          tools: tools.count || 0,
          blogs: blogs.count || 0,
          faqs: faqs.count || 0,
          categories: categories.count || 0,
          messages: messages.count || 0,
          unreadMessages: unread,
          users: profiles.count || 0,
          enabledTools: enabled,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { title: "Total Tools", value: stats.tools, sub: `${stats.enabledTools} enabled`, icon: Wrench, color: "text-blue-500" },
    { title: "Blog Posts", value: stats.blogs, icon: FileText, color: "text-green-500" },
    { title: "FAQs", value: stats.faqs, icon: HelpCircle, color: "text-purple-500" },
    { title: "Categories", value: stats.categories, icon: FolderOpen, color: "text-orange-500" },
    { title: "Messages", value: stats.messages, sub: `${stats.unreadMessages} unread`, icon: Mail, color: "text-red-500" },
    { title: "Users", value: stats.users, icon: Users, color: "text-cyan-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to VexaTool Admin Panel</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? "..." : card.value}</div>
              {card.sub && <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
