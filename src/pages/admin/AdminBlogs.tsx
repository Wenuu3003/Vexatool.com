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
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Eye, EyeOff } from "lucide-react";

const db = supabase as any;

interface Blog {
  id: string; title: string; slug: string; content: string | null;
  excerpt: string | null; author: string | null; is_published: boolean;
  seo_title: string | null; seo_description: string | null; tags: string[]; created_at: string;
}

const emptyBlog = {
  title: "", slug: "", content: "", excerpt: "", author: "VexaTool Team",
  is_published: false, seo_title: "", seo_description: "", tags: [] as string[],
};

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [form, setForm] = useState(emptyBlog);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    const { data } = await db.from("admin_blogs").select("*").order("created_at", { ascending: false });
    setBlogs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBlogs(); }, []);

  const handleSave = async () => {
    if (!form.title || !form.slug) { toast({ title: "Title and slug required", variant: "destructive" }); return; }
    const payload = { ...form, tags: form.tags };
    if (editing) {
      const { error } = await db.from("admin_blogs").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Update failed", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Blog updated" });
    } else {
      const { error } = await db.from("admin_blogs").insert(payload);
      if (error) { toast({ title: "Insert failed", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Blog created" });
    }
    setIsOpen(false); setEditing(null); setForm(emptyBlog); fetchBlogs();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    await db.from("admin_blogs").delete().eq("id", id);
    toast({ title: "Blog deleted" }); fetchBlogs();
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] }); setTagInput("");
    }
  };

  const openEdit = (blog: Blog) => {
    setEditing(blog);
    setForm({
      title: blog.title, slug: blog.slug, content: blog.content || "",
      excerpt: blog.excerpt || "", author: blog.author || "VexaTool Team",
      is_published: blog.is_published, seo_title: blog.seo_title || "",
      seo_description: blog.seo_description || "", tags: (blog.tags as string[]) || [],
    });
    setIsOpen(true);
  };

  const filtered = blogs.filter((b) => b.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Blogs</h1><p className="text-muted-foreground">Manage blog posts</p></div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setForm(emptyBlog); setIsOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Add Blog</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit Blog" : "New Blog Post"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div className="space-y-2"><Label>Slug *</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Excerpt</Label><Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} /></div>
              <div className="space-y-2"><Label>Content</Label><Textarea value={form.content || ""} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={12} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Author</Label><Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div>
                <div className="flex items-center gap-2 pt-6"><Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} /><Label>Published</Label></div>
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="Add tag" />
                  <Button type="button" variant="outline" onClick={addTag}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => setForm({ ...form, tags: form.tags.filter(t => t !== tag) })}>{tag} ×</Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2"><Label>SEO Title</Label><Input value={form.seo_title || ""} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} /></div>
              <div className="space-y-2"><Label>SEO Description</Label><Textarea value={form.seo_description || ""} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} rows={2} /></div>
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
        <Input placeholder="Search blogs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Title</TableHead><TableHead>Author</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.map((blog) => (
              <TableRow key={blog.id}>
                <TableCell className="font-medium">{blog.title}</TableCell>
                <TableCell className="text-muted-foreground">{blog.author}</TableCell>
                <TableCell>
                  <Badge variant={blog.is_published ? "default" : "secondary"}>
                    {blog.is_published ? <><Eye className="w-3 h-3 mr-1" />Published</> : <><EyeOff className="w-3 h-3 mr-1" />Draft</>}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{new Date(blog.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(blog)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(blog.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{loading ? "Loading..." : "No blogs found"}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
};

export default AdminBlogs;
