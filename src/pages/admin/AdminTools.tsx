import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

const db = supabase as any;

interface Tool {
  id: string; name: string; slug: string; description: string | null;
  icon: string | null; route_path: string; is_enabled: boolean;
  is_featured: boolean; sort_order: number; seo_title: string | null;
  seo_description: string | null; seo_keywords: string | null; category_id: string | null;
}

const emptyTool = {
  name: "", slug: "", description: "", icon: "", route_path: "",
  is_enabled: true, is_featured: false, sort_order: 0,
  seo_title: "", seo_description: "", seo_keywords: "", category_id: null as string | null,
};

const AdminTools = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Tool | null>(null);
  const [form, setForm] = useState(emptyTool);
  const [loading, setLoading] = useState(true);

  const fetchTools = async () => {
    const { data } = await db.from("admin_tools").select("*").order("sort_order");
    setTools(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTools(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.slug || !form.route_path) {
      toast({ title: "Required fields missing", variant: "destructive" }); return;
    }
    if (editing) {
      const { error } = await db.from("admin_tools").update(form).eq("id", editing.id);
      if (error) { toast({ title: "Update failed", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Tool updated" });
    } else {
      const { error } = await db.from("admin_tools").insert(form);
      if (error) { toast({ title: "Insert failed", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Tool created" });
    }
    setIsOpen(false); setEditing(null); setForm(emptyTool); fetchTools();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tool?")) return;
    await db.from("admin_tools").delete().eq("id", id);
    toast({ title: "Tool deleted" }); fetchTools();
  };

  const handleToggle = async (id: string, field: string, value: boolean) => {
    await db.from("admin_tools").update({ [field]: value }).eq("id", id);
    fetchTools();
  };

  const openEdit = (tool: Tool) => { setEditing(tool); setForm({ ...tool }); setIsOpen(true); };
  const openNew = () => { setEditing(null); setForm(emptyTool); setIsOpen(true); };

  const filtered = tools.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Tools</h1><p className="text-muted-foreground">Manage all {tools.length} tools</p></div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild><Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Add Tool</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit Tool" : "Add New Tool"}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Slug *</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
              <div className="space-y-2"><Label>Route Path *</Label><Input value={form.route_path} onChange={(e) => setForm({ ...form, route_path: e.target.value })} placeholder="/tool-name" /></div>
              <div className="space-y-2"><Label>Icon</Label><Input value={form.icon || ""} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></div>
              <div className="col-span-2 space-y-2"><Label>Description</Label><Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="space-y-2"><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
              <div className="flex items-center gap-6 pt-6">
                <div className="flex items-center gap-2"><Switch checked={form.is_enabled} onCheckedChange={(v) => setForm({ ...form, is_enabled: v })} /><Label>Enabled</Label></div>
                <div className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} /><Label>Featured</Label></div>
              </div>
              <div className="col-span-2 space-y-2"><Label>SEO Title</Label><Input value={form.seo_title || ""} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} /></div>
              <div className="col-span-2 space-y-2"><Label>SEO Description</Label><Textarea value={form.seo_description || ""} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} /></div>
              <div className="col-span-2 space-y-2"><Label>SEO Keywords</Label><Input value={form.seo_keywords || ""} onChange={(e) => setForm({ ...form, seo_keywords: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search tools..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Route</TableHead><TableHead>Enabled</TableHead>
            <TableHead>Featured</TableHead><TableHead>Order</TableHead><TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.map((tool) => (
              <TableRow key={tool.id}>
                <TableCell className="font-medium">{tool.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{tool.route_path}</TableCell>
                <TableCell><Switch checked={tool.is_enabled} onCheckedChange={(v) => handleToggle(tool.id, "is_enabled", v)} /></TableCell>
                <TableCell><Switch checked={tool.is_featured} onCheckedChange={(v) => handleToggle(tool.id, "is_featured", v)} /></TableCell>
                <TableCell>{tool.sort_order}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(tool)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(tool.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{loading ? "Loading..." : "No tools found"}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
};

export default AdminTools;
