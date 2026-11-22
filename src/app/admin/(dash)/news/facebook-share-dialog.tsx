"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { finishFacebookShare, prepareFacebookShare, shareToFacebook, uploadFacebookPhoto } from "@/lib/actions/admin";
import { cn } from "@/lib/utils";

type PhotoState = "waiting" | "sending" | "done" | "failed";
type Phase = "preparing" | "uploading" | "posting" | "done" | "error" | "cancelled";

/**
 * Shares a news post to Facebook with live progress:
 * each photo is sent one by one (3 at a time), then the post is created.
 */
export function FacebookShareDialog({ postId, title, onClose }: { postId: string; title: string; onClose: () => void }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("preparing");
  const [images, setImages] = useState<string[]>([]);
  const [states, setStates] = useState<PhotoState[]>([]);
  const [message, setMessage] = useState("");
  const cancelled = useRef(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return; // guard against React strict-mode double run
    started.current = true;
    (async () => {
      const prep = await prepareFacebookShare(postId);
      if (!prep.ok) { setPhase("error"); setMessage(prep.error); return; }

      if (prep.images.length === 0) {
        setPhase("posting");
        const r = await shareToFacebook(postId);
        finish(r.ok ? "done" : "error", r.ok ? r.message ?? "Shared on Facebook." : r.error);
        return;
      }

      setImages(prep.images);
      setStates(prep.images.map(() => "waiting"));
      setPhase("uploading");
      const ids: (string | null)[] = new Array(prep.images.length).fill(null);
      let next = 0;
      let fatal: string | null = null;
      const set = (i: number, s: PhotoState) => setStates((prev) => prev.map((x, k) => (k === i ? s : x)));
      const worker = async () => {
        while (next < prep.images.length && !cancelled.current && !fatal) {
          const i = next++;
          set(i, "sending");
          let r = await uploadFacebookPhoto(postId, prep.images[i]);
          if (!r.ok && !/token|permission|set up/i.test(r.error)) r = await uploadFacebookPhoto(postId, prep.images[i]); // one retry
          if (r.ok) { ids[i] = r.photoId; set(i, "done"); }
          else { set(i, "failed"); if (/token|permission|set up|couldn't find that page/i.test(r.error)) fatal = r.error; else toast.error(`Photo ${i + 1}: ${r.error}`); }
        }
      };
      await Promise.all([worker(), worker(), worker()]);

      if (cancelled.current) { finish("cancelled", "Stopped. Nothing was posted on Facebook."); return; }
      if (fatal) { finish("error", fatal); return; }
      const sent = ids.filter(Boolean) as string[];
      if (!sent.length) { finish("error", "None of the photos could be sent to Facebook."); return; }

      setPhase("posting");
      const r = await finishFacebookShare(postId, sent);
      const skipped = prep.images.length - sent.length;
      if (r.ok) {
        if (r.warning) toast.warning(r.warning, { duration: 15000 });
        finish("done", (r.message ?? "Shared on Facebook.") + (skipped ? ` ${skipped} photo${skipped > 1 ? "s" : ""} couldn't be sent and ${skipped > 1 ? "were" : "was"} left out.` : ""));
      } else finish("error", r.error);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  function finish(p: Phase, text: string) {
    setPhase(p);
    setMessage(text);
    if (p === "done") toast.success(text);
    router.refresh();
  }

  const done = states.filter((s) => s === "done").length;
  const busy = phase === "preparing" || phase === "uploading" || phase === "posting";
  const pct = images.length ? Math.round((done / images.length) * 100) : phase === "done" ? 100 : 0;

  return (
    <Dialog open onOpenChange={(o) => { if (!o && !busy) onClose(); }}>
      <DialogContent showClose={!busy} className="sm:max-w-xl" onInteractOutside={(e) => busy && e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Sharing to Facebook</DialogTitle>
          <DialogDescription className="line-clamp-1">“{title}”</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium" role="status" aria-live="polite">
            {busy && <Loader2 className="size-4 animate-spin text-[#1877F2]" />}
            {phase === "done" && <CheckCircle2 className="size-4 text-emerald-600" />}
            {(phase === "error" || phase === "cancelled") && <AlertCircle className="size-4 text-destructive" />}
            <span data-testid="fb-share-status">
              {phase === "preparing" && "Getting ready…"}
              {phase === "uploading" && `Sending photo ${Math.min(done + 1, images.length)} of ${images.length}…`}
              {phase === "posting" && "Creating the Facebook post…"}
              {(phase === "done" || phase === "error" || phase === "cancelled") && message}
            </span>
          </div>
          {images.length > 0 && (
            <>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className={cn("h-full transition-all", phase === "error" ? "bg-destructive" : "bg-[#1877F2]")} style={{ width: `${pct}%` }} />
              </div>
              <ul className="grid max-h-56 grid-cols-8 gap-1.5 overflow-y-auto sm:grid-cols-10">
                {images.map((src, i) => (
                  <li key={src} className="relative overflow-hidden rounded">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className={cn("aspect-square w-full object-cover", states[i] !== "done" && "opacity-40")} />
                    {states[i] === "sending" && <Loader2 className="absolute inset-0 m-auto size-4 animate-spin text-white drop-shadow" />}
                    {states[i] === "done" && <CheckCircle2 className="absolute right-0.5 bottom-0.5 size-3.5 rounded-full bg-white text-emerald-600" />}
                    {states[i] === "failed" && <AlertCircle className="absolute right-0.5 bottom-0.5 size-3.5 rounded-full bg-white text-destructive" />}
                  </li>
                ))}
              </ul>
              {phase === "uploading" && <p className="text-xs text-muted-foreground">Keep this window open. Large sets take a minute or two.</p>}
            </>
          )}
        </div>

        <DialogFooter>
          {phase === "uploading" && <Button variant="outline" onClick={() => { cancelled.current = true; }}>Stop</Button>}
          {!busy && <Button onClick={onClose}>Close</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
