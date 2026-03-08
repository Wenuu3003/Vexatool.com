import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

const db = supabase as any;

interface Category { id: string; name: string; slug: string; description: string | null; icon: string | null; sort_order: number; is_active: boolean; }

const emptyCategory = { name: "", slug: "", description: "", icon: "", sort_order: 0, is_active: true };

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyCategory);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data } = await db.from("admin_categories").select("*").order("sort_order");
    setCategories(data || []); setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.slug) { toast({ title: "Name and slug required", variant: "destructive" }); return; }
    if (editing) {
      const { error } = await db.from("admin_categories").update(form).eq("id", editing.id);
      if (error) { toast({ title: "Update failed", variant: "destructive" }); return; }
      toast({ title: "Category updated" });
    } else {
      const { error } = await db.from("admin_categories").insert(form);
      if (error) { toast({ title: "Insert failed", variant: "destructive" }); return; }
      toast({ title: "Category created" });
    }
    setIsOpen(false); setEditing(null); setForm(emptyCategory); fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await db.from("admin_categories").delete().eq("id", id);
    toast({ title: "Category deleted" }); fetchData();
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || "", icon: cat.icon || "", sort_order: cat.sort_order, is_active: cat.is_active });
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Categories</h1><p className="text-muted-foreground">Manage tool categories</p></div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setForm(emptyCategory); setIsOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Category" : "New Category"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Slug *</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Icon</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></div>
                <div className="space-y-2"><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label>Active</Label></div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead>Active</TableHead><TableHead>Order</TableHead><TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                <TableCell><Switch checked={cat.is_active} onCheckedChange={(v) => { db.from("admin_categories").update({ is_active: v }).eq("id", cat.id).then(() => fetchData()); }} /></TableCell>
                <TableCell>{cat.sort_order}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{loading ? "Loading..." : "No categories"}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
};

export default AdminCategories;
