"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Images, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MediaUpload, uploadFile } from "@/components/admin/media-upload";
import { ConfirmDelete } from "@/components/admin/confirm-button";
import { addGalleryImages, deleteGalleryImage, saveGalleryImage } from "@/lib/actions/admin";

type Item = { id: string; title: string; description: string; image: string; category: string; sortOrder: number };

export function GalleryManager({ items }: { items: Item[] }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [album, setAlbum] = useState("General");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState<Item | null>(null);
  const albums = Array.from(new Set(items.map((i) => i.category)));
  const shown = filter === "All" ? items : items.filter((i) => i.category === filter);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    setProgress({ done: 0, total: list.length });
    const ok: { image: string; title: string }[] = [];
    for (const file of list) {
      try {
        const url = await uploadFile(file, "image");
        ok.push({ image: url, title: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ") });
      } catch (e) { toast.error(`${file.name}: ${(e as Error).message}`); }
      setProgress((p) => p && { ...p, done: p.done + 1 });
    }
    if (ok.length) {
      const r = await addGalleryImages(ok, album);
      if (r.ok) toast.success(r.message); else toast.error(r.error);
      router.refresh();
    }
    setProgress(null);
    if (input.current) input.current.value = "";
  }

  return (
    <>
      <Card className="mb-6">
        <CardHeader><CardTitle>Add photos</CardTitle><CardDescription>Select one or many photos — they&apos;ll be added to the album you choose.</CardDescription></CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="grid gap-2">
            <Label htmlFor="album">Album</Label>
            <Input id="album" list="albums" value={album} onChange={(e) => setAlbum(e.target.value)} className="w-56" />
            <datalist id="albums">{["General", "Sports", "Academics", "Events", "Boarding", ...albums].filter((v, i, a) => a.indexOf(v) === i).map((a) => <option key={a} value={a} />)}</datalist>
          </div>
          <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
          <Button onClick={() => input.current?.click()} disabled={!!progress}>
            {progress ? <><Loader2 className="animate-spin" /> Uploading {progress.done}/{progress.total}…</> : <><ImagePlus /> Choose photos</>}
          </Button>
        </CardContent>
      </Card>

      {albums.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {["All", ...albums].map((a) => <Button key={a} size="sm" variant={a === filter ? "default" : "outline"} className="rounded-full" onClick={() => setFilter(a)}>{a} <span className="opacity-60">{a === "All" ? items.length : items.filter((i) => i.category === a).length}</span></Button>)}
        </div>
      )}

      {shown.length === 0 ? (
        <Card className="items-center p-12 text-center text-muted-foreground"><Images className="size-8" /><p>No photos yet.</p></Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((g) => (
            <div key={g.id} className="group overflow-hidden rounded-xl border bg-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.image} alt={g.title} className="aspect-square w-full object-cover" />
              <div className="flex items-center gap-1 p-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{g.title}</p>
                  <Badge variant="secondary" className="mt-0.5">{g.category}</Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setEditing(g)} aria-label="Edit"><Pencil /></Button>
                <ConfirmDelete iconOnly title="Remove this photo?" onConfirm={() => deleteGalleryImage(g.id)} />
              </div>
            </div>
          ))}
        </div>
      )}
      {editing && <EditPhoto item={editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function EditPhoto({ item, onClose }: { item: Item; onClose: () => void }) {
  const [f, setF] = useState({ title: item.title, description: item.description, image: item.image, category: item.category, sortOrder: item.sortOrder });
  const [pending, start] = useTransition();
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit photo</DialogTitle><DialogDescription>Lower order numbers appear first.</DialogDescription></DialogHeader>
        <MediaUpload kind="image" value={f.image} onChange={(image) => setF({ ...f, image })} />
        <div className="grid gap-2"><Label htmlFor="pt">Title</Label><Input id="pt" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
        <div className="grid gap-2"><Label htmlFor="pd">Caption</Label><Textarea id="pd" rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2"><Label htmlFor="pc">Album</Label><Input id="pc" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} /></div>
          <div className="grid gap-2"><Label htmlFor="po">Order</Label><Input id="po" type="number" value={f.sortOrder} onChange={(e) => setF({ ...f, sortOrder: Number(e.target.value) })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={pending} onClick={() => start(async () => { const r = await saveGalleryImage(item.id, f); if (r.ok) { toast.success(r.message); onClose(); } else toast.error(r.error); })}>
            {pending && <Loader2 className="animate-spin" />} Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
