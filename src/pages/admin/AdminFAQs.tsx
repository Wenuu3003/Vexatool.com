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

interface FAQ { id: string; tool_slug: string | null; question: string; answer: string; sort_order: number; is_published: boolean; }

const emptyFAQ = { tool_slug: "", question: "", answer: "", sort_order: 0, is_published: true };

const AdminFAQs = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [form, setForm] = useState(emptyFAQ);
  const [loading, setLoading] = useState(true);

  const fetchFAQs = async () => {
    const { data } = await db.from("admin_faqs").select("*").order("sort_order");
    setFaqs(data || []); setLoading(false);
  };

  useEffect(() => { fetchFAQs(); }, []);

  const handleSave = async () => {
    if (!form.question || !form.answer) { toast({ title: "Question and answer required", variant: "destructive" }); return; }
    const payload = { ...form, tool_slug: form.tool_slug || null };
    if (editing) {
      const { error } = await db.from("admin_faqs").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Update failed", variant: "destructive" }); return; }
      toast({ title: "FAQ updated" });
    } else {
      const { error } = await db.from("admin_faqs").insert(payload);
      if (error) { toast({ title: "Insert failed", variant: "destructive" }); return; }
      toast({ title: "FAQ created" });
    }
    setIsOpen(false); setEditing(null); setForm(emptyFAQ); fetchFAQs();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    await db.from("admin_faqs").delete().eq("id", id);
    toast({ title: "FAQ deleted" }); fetchFAQs();
  };

  const openEdit = (faq: FAQ) => {
    setEditing(faq);
    setForm({ tool_slug: faq.tool_slug || "", question: faq.question, answer: faq.answer, sort_order: faq.sort_order, is_published: faq.is_published });
    setIsOpen(true);
  };

  const filtered = faqs.filter((f) => f.question.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">FAQs</h1><p className="text-muted-foreground">Manage frequently asked questions</p></div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setForm(emptyFAQ); setIsOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Add FAQ</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>{editing ? "Edit FAQ" : "New FAQ"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Tool Slug (optional)</Label><Input value={form.tool_slug} onChange={(e) => setForm({ ...form, tool_slug: e.target.value })} placeholder="e.g. unlock-pdf" /></div>
              <div className="space-y-2"><Label>Question *</Label><Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} /></div>
              <div className="space-y-2"><Label>Answer *</Label><Textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={4} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
                <div className="flex items-center gap-2 pt-6"><Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} /><Label>Published</Label></div>
              </div>
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
        <Input placeholder="Search FAQs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Question</TableHead><TableHead>Tool</TableHead><TableHead>Published</TableHead><TableHead>Order</TableHead><TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.map((faq) => (
              <TableRow key={faq.id}>
                <TableCell className="font-medium max-w-xs truncate">{faq.question}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{faq.tool_slug || "General"}</TableCell>
                <TableCell><Switch checked={faq.is_published} onCheckedChange={(v) => { db.from("admin_faqs").update({ is_published: v }).eq("id", faq.id).then(() => fetchFAQs()); }} /></TableCell>
                <TableCell>{faq.sort_order}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(faq)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(faq.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{loading ? "Loading..." : "No FAQs found"}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
};

export default AdminFAQs;
