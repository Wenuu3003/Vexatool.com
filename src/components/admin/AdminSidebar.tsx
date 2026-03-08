import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Wrench, FileText, HelpCircle, FolderOpen,
  Settings, Users, Mail, BarChart3, Image, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { title: "Tools", path: "/admin/tools", icon: Wrench },
  { title: "Blogs", path: "/admin/blogs", icon: FileText },
  { title: "FAQs", path: "/admin/faqs", icon: HelpCircle },
  { title: "Categories", path: "/admin/categories", icon: FolderOpen },
  { title: "Messages", path: "/admin/messages", icon: Mail },
  { title: "Users", path: "/admin/users", icon: Users },
  { title: "Settings", path: "/admin/settings", icon: Settings },
  { title: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { title: "Media", path: "/admin/media", icon: Image },
];

export const AdminSidebar = () => {
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">VexaTool Admin</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== "/admin" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border space-y-2">
        <Link to="/" className="block">
          <Button variant="outline" size="sm" className="w-full justify-start gap-2">
            <Wrench className="w-4 h-4" /> View Site
          </Button>
        </Link>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start gap-2 text-destructive">
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>
    </aside>
  );
};
