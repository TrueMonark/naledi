"use client";
import { useState, useTransition } from "react";
import { BookHeart, FileText, Loader2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MediaUpload } from "@/components/admin/media-upload";
import { ConfirmDelete } from "@/components/admin/confirm-button";
import { deleteDevotion, saveDevotion } from "@/lib/actions/admin";
import { formatDate } from "@/lib/utils";

type D = { id: string; title: string; scripture: string; content: string; author: string; pdf: string; date: string; published: boolean };

export function DevotionManager({ items, openNew }: { items: D[]; openNew: boolean }) {
  const [editing, setEditing] = useState<D | "new" | null>(openNew ? "new" : null);
  return (
    <>
      <div className="mb-4 flex justify-end"><Button onClick={() => setEditing("new")}><Plus /> New devotion</Button></div>
      <Card className="py-0">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-muted-foreground"><BookHeart className="size-8" /><p>No devotions yet.</p></div>
        ) : (
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Title</TableHead><TableHead className="hidden md:table-cell">Scripture</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {items.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="text-sm whitespace-nowrap text-muted-foreground">{formatDate(d.date)}</TableCell>
                  <TableCell className="font-medium">{d.title} {d.pdf && <FileText className="ml-1 inline size-3.5 text-muted-foreground" />}</TableCell>
                  <TableCell className="hidden max-w-xs truncate text-sm text-muted-foreground italic md:table-cell">{d.scripture}</TableCell>
                  <TableCell>{d.published ? <Badge variant="success">Published</Badge> : <Badge variant="secondary">Draft</Badge>}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(d)} aria-label="Edit"><Pencil /></Button>
                    <ConfirmDelete iconOnly title={`Delete “${d.title}”?`} onConfirm={() => deleteDevotion(d.id)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
      {editing && <DevotionDialog item={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function DevotionDialog({ item, onClose }: { item: D | null; onClose: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [f, setF] = useState(item ? { ...item } : { title: "", scripture: "", content: "", author: "School Chaplain", pdf: "", date: today, published: true });
  const [pending, start] = useTransition();
  const set = (k: string, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>{item ? "Edit devotion" : "New devotion"}</DialogTitle><DialogDescription>Optionally attach a PDF for download.</DialogDescription></DialogHeader>
        <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); start(async () => { const r = await saveDevotion(item?.id ?? null, f); if (r.ok) { toast.success(r.message); onClose(); } else toast.error(r.error); }); }}>
          <div className="grid gap-4 sm:grid-cols-[1fr_170px]">
            <div className="grid gap-2"><Label htmlFor="dt">Title</Label><Input id="dt" value={f.title} onChange={(e) => set("title", e.target.value)} required /></div>
            <div className="grid gap-2"><Label htmlFor="dd">Date</Label><Input id="dd" type="date" value={f.date} onChange={(e) => set("date", e.target.value)} required /></div>
          </div>
          <div className="grid gap-2"><Label htmlFor="ds">Scripture</Label><Input id="ds" value={f.scripture} onChange={(e) => set("scripture", e.target.value)} placeholder="e.g. “Let your light shine before others…” — Matthew 5:16" /></div>
          <div className="grid gap-2"><Label htmlFor="dc">Reflection</Label><Textarea id="dc" rows={8} value={f.content} onChange={(e) => set("content", e.target.value)} required /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid content-start gap-2"><Label htmlFor="da">Author</Label><Input id="da" value={f.author} onChange={(e) => set("author", e.target.value)} />
              <label className="mt-2 flex items-center justify-between rounded-md border p-3 text-sm font-medium">Published <Switch checked={f.published} onCheckedChange={(c) => set("published", c)} /></label>
            </div>
            <div className="grid content-start gap-2"><Label>PDF (optional)</Label><MediaUpload kind="pdf" value={f.pdf} onChange={(u) => set("pdf", u)} /></div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending && <Loader2 className="animate-spin" />}{item ? "Save changes" : "Publish"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
