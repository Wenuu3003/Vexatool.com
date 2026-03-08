import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

const db = supabase as any;

interface Message { id: string; name: string; email: string; subject: string | null; message: string; is_read: boolean; created_at: string; }

const AdminMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data } = await db.from("contact_messages").select("*").order("created_at", { ascending: false });
    setMessages(data || []); setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const markRead = async (id: string) => {
    await db.from("contact_messages").update({ is_read: true }).eq("id", id); fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    await db.from("contact_messages").delete().eq("id", id);
    toast({ title: "Message deleted" }); setSelected(null); fetchData();
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Messages</h1><p className="text-muted-foreground">{messages.length} total • {unreadCount} unread</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>From</TableHead><TableHead>Subject</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
            <TableBody>
              {messages.map((msg) => (
                <TableRow key={msg.id} className={`cursor-pointer ${!msg.is_read ? "font-semibold bg-primary/5" : ""}`}
                  onClick={() => { setSelected(msg); if (!msg.is_read) markRead(msg.id); }}>
                  <TableCell>{msg.name}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{msg.subject || "No subject"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(msg.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {messages.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">{loading ? "Loading..." : "No messages"}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent></Card>

        {selected && (
          <Card><CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{selected.subject || "No subject"}</h3>
                <p className="text-sm text-muted-foreground">From: {selected.name} &lt;{selected.email}&gt;</p>
                <p className="text-xs text-muted-foreground">{new Date(selected.created_at).toLocaleString()}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(selected.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
            </div>
            <div className="border-t border-border pt-4"><p className="whitespace-pre-wrap text-sm">{selected.message}</p></div>
          </CardContent></Card>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
