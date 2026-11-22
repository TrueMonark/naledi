"use client";
import { useMemo, useState, useTransition } from "react";
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, Pencil, Plus, Search, Newspaper, Send, PlugZap, Share2 } from "lucide-react";
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
import { PhotoSetEditor } from "@/components/admin/photo-set-editor";
import { ConfirmDelete } from "@/components/admin/confirm-button";
import { deletePost, savePost, testFacebookConnection, togglePost } from "@/lib/actions/admin";
import { FacebookShareDialog } from "./facebook-share-dialog";
import { formatDate } from "@/lib/utils";

type Post = { id: string; title: string; slug: string; excerpt: string; content: string; image: string; photos: string[]; author: string; category: string; published: boolean; createdAt: string;
  facebookPostId: string; facebookPostIds: string[]; facebookPostedAt: string | null; facebookError: string };
const EMPTY = { title: "", category: "News", excerpt: "", content: "", image: "", photos: [] as string[], author: "Naledi School", published: true };
type Sharing = { id: string; title: string } | null;
const SUGGESTED = ["News", "Events", "Academics", "Sports", "Achievements", "Announcements"];

export function NewsManager({ posts, openNew, facebookReady }: { posts: Post[]; openNew: boolean; facebookReady: boolean }) {
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Post | null | "new">(openNew ? "new" : null);
  const [sharing, setSharing] = useState<Sharing>(null);
  const filtered = useMemo(() => posts.filter((p) => (p.title + p.category).toLowerCase().includes(q.toLowerCase())), [posts, q]);

  return (
    <>
      <FacebookStatus ready={facebookReady} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search posts…" value={q} onChange={(e) => setQ(e.target.value)} className="bg-background pl-9" />
        </div>
        <Button className="ml-auto" onClick={() => setEditing("new")}><Plus /> New post</Button>
      </div>

      <Card className="py-0">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center text-muted-foreground">
            <Newspaper className="size-8" />
            <p>{posts.length ? "No posts match your search." : "No posts yet — write your first one."}</p>
          </div>
        ) : (
          <Table>
            <TableHeader><TableRow><TableHead>Post</TableHead><TableHead className="hidden md:table-cell">Category</TableHead><TableHead className="hidden sm:table-cell">Date</TableHead><TableHead>Visible</TableHead><TableHead>Facebook</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt="" className="size-12 shrink-0 rounded-md object-cover" />
                      ) : <div className="size-12 shrink-0 rounded-md bg-muted" />}
                      <span>
                        <span className="line-clamp-2 font-medium">{p.title}</span>
                        {p.photos.length > 0 && <span className="text-xs text-muted-foreground">{p.photos.length + (p.image ? 1 : 0)} photos</span>}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell"><Badge variant="secondary">{p.category}</Badge></TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">{formatDate(p.createdAt)}</TableCell>
                  <TableCell><PublishToggle id={p.id} published={p.published} /></TableCell>
                  <TableCell><FacebookCell post={p} ready={facebookReady} onShare={() => setSharing({ id: p.id, title: p.title })} /></TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {p.published && <Button asChild variant="ghost" size="icon" aria-label="View"><a href={`/news/${p.slug}`} target="_blank" rel="noreferrer"><ExternalLink /></a></Button>}
                    <Button variant="ghost" size="icon" onClick={() => setEditing(p)} aria-label="Edit"><Pencil /></Button>
                    <ConfirmDelete iconOnly title={`Delete “${p.title}”?`} onConfirm={() => deletePost(p.id)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {editing && (
        <PostDialog
          post={editing === "new" ? null : editing}
          facebookReady={facebookReady}
          onClose={() => setEditing(null)}
          onSavedAndShare={(id, title) => { setEditing(null); setSharing({ id, title }); }}
        />
      )}
      {sharing && <FacebookShareDialog postId={sharing.id} title={sharing.title} onClose={() => setSharing(null)} />}
    </>
  );
}

function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const [pending, start] = useTransition();
  return <Switch checked={published} disabled={pending} onCheckedChange={(c) => start(async () => { const r = await togglePost(id, c); if (r.ok) toast.success(r.message); })} aria-label="Visible on website" />;
}

function PostDialog({ post, onClose, onSavedAndShare, facebookReady }: { post: Post | null; onClose: () => void; onSavedAndShare: (id: string, title: string) => void; facebookReady: boolean }) {
  const [f, setF] = useState(post ? { title: post.title, category: post.category, excerpt: post.excerpt, content: post.content, image: post.image, photos: post.photos, author: post.author, published: post.published } : EMPTY);
  const [pending, start] = useTransition();
  const canShare = facebookReady && !post?.facebookPostId;
  const [share, setShare] = useState(canShare && !post);
  const set = (k: keyof typeof f, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const r = await savePost(post?.id ?? null, f);
      if (!r.ok) { toast.error(r.error); return; }
      toast.success(r.message);
      if (share && f.published && r.id) onSavedAndShare(r.id, f.title);
      else onClose();
    });
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader><DialogTitle>{post ? "Edit post" : "New post"}</DialogTitle><DialogDescription>Posts appear on the News page and the latest three on the home page.</DialogDescription></DialogHeader>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-[1fr_240px]">
          <div className="grid content-start gap-4">
            <div className="grid gap-2"><Label htmlFor="t">Title</Label><Input id="t" value={f.title} onChange={(e) => set("title", e.target.value)} required /></div>
            <div className="grid gap-2"><Label htmlFor="c">Story</Label><Textarea id="c" rows={12} value={f.content} onChange={(e) => set("content", e.target.value)} required placeholder="Write the full story. Leave a blank line between paragraphs." /></div>
            <div className="grid gap-2"><Label htmlFor="x">Short summary <span className="font-normal text-muted-foreground">(optional — auto-generated if empty)</span></Label><Textarea id="x" rows={2} value={f.excerpt} onChange={(e) => set("excerpt", e.target.value)} /></div>
          </div>
          <div className="grid gap-2 md:order-last md:col-span-2">
            <Label>Photos <span className="font-normal text-muted-foreground">— the first is the cover; all of them show on the article and go to Facebook when shared</span></Label>
            <PhotoSetEditor cover={f.image} photos={f.photos} onChange={(image, photos) => setF((p) => ({ ...p, image, photos }))} />
          </div>
          <div className="grid content-start gap-4">
            <div className="grid gap-2">
              <Label htmlFor="cat">Category</Label>
              <Input id="cat" list="cats" value={f.category} onChange={(e) => set("category", e.target.value)} />
              <datalist id="cats">{SUGGESTED.map((s) => <option key={s} value={s} />)}</datalist>
            </div>
            <div className="grid gap-2"><Label htmlFor="a">Author</Label><Input id="a" value={f.author} onChange={(e) => set("author", e.target.value)} /></div>
            <label className="flex items-center justify-between rounded-md border p-3 text-sm font-medium">Visible on website <Switch checked={f.published} onCheckedChange={(c) => set("published", c)} /></label>
            {canShare && (
              <label className="flex items-start justify-between gap-3 rounded-md border border-[#1877F2]/30 bg-[#1877F2]/5 p-3 text-sm">
                <span><span className="block font-medium">Also share on Facebook</span><span className="text-xs text-muted-foreground">Posts the story{f.image ? ` with ${[f.image, ...f.photos].filter(Boolean).length} photo${f.photos.length ? "s" : ""}` : ""} to the school&apos;s Facebook Page.</span></span>
                <Switch checked={share && f.published} disabled={!f.published} onCheckedChange={setShare} />
              </label>
            )}
            {post?.facebookPostId && (
              <a href={`https://www.facebook.com/${post.facebookPostId}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-md border p-3 text-sm text-[#1877F2] hover:underline">
                <CheckCircle2 className="size-4" /> Already on Facebook — view post
              </a>
            )}
          </div>
          <DialogFooter className="md:order-last md:col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending && <Loader2 className="animate-spin" />}{post ? (share && f.published ? "Save & share" : "Save changes") : share && f.published ? "Publish & share" : "Publish post"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FacebookStatus({ ready }: { ready: boolean }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  if (!ready) {
    return (
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-dashed bg-background p-4 text-sm">
        <Share2 className="size-5 shrink-0 text-muted-foreground" />
        <span className="flex-1 text-muted-foreground">
          <span className="font-medium text-foreground">Facebook sharing isn&apos;t set up yet.</span> Add your Page ID and Page access token to <code className="rounded bg-muted px-1">.env</code> and restart — step-by-step guide in <code className="rounded bg-muted px-1">docs/facebook-setup.md</code>.
        </span>
      </div>
    );
  }
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border bg-background p-4 text-sm">
      <Share2 className="size-5 shrink-0 text-[#1877F2]" />
      <span className="flex-1">
        <span className="font-medium">Facebook sharing is on.</span>{" "}
        {result ? <span className={result.ok ? "text-emerald-700" : "text-destructive"}>{result.text}</span> : <span className="text-muted-foreground">Use the Share button on any post, or switch it on when publishing.</span>}
      </span>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => start(async () => { const r = await testFacebookConnection(); setResult(r.ok ? { ok: true, text: r.message ?? "Connected." } : { ok: false, text: r.error }); })}>
        {pending ? <Loader2 className="animate-spin" /> : <PlugZap />} Test connection
      </Button>
    </div>
  );
}

function FacebookCell({ post, ready, onShare }: { post: Post; ready: boolean; onShare: () => void }) {
  if (post.facebookPostId) {
    const parts = post.facebookPostIds.length;
    return (
      <span className="flex items-center gap-1">
        <a href={`https://www.facebook.com/${post.facebookPostId}`} target="_blank" rel="noreferrer" title={post.facebookPostedAt ? `Shared ${formatDate(post.facebookPostedAt)}` : "Shared"}>
          <Badge className="bg-[#1877F2] text-white"><CheckCircle2 /> Shared{parts > 1 ? ` · ${parts} posts` : ""}</Badge>
        </a>
        {post.facebookError && <span title={post.facebookError}><AlertCircle className="size-4 text-amber-600" /></span>}
      </span>
    );
  }
  if (!ready) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <span className="flex items-center gap-1">
      <Button size="sm" variant="outline" disabled={!post.published} title={post.published ? "Share on Facebook" : "Make the post visible first"} onClick={onShare}>
        <Send /> Share
      </Button>
      {post.facebookError && <span title={post.facebookError}><AlertCircle className="size-4 text-destructive" /></span>}
    </span>
  );
}

