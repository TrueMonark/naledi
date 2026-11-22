"use client";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, Star, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadFile } from "@/components/admin/media-upload";
import { cn } from "@/lib/utils";

/**
 * A post's photos: the cover (first) plus extra photos, up to `max` in total.
 * Pick or drop many files at once; they upload 3 at a time with a progress count.
 */
export function PhotoSetEditor({
  cover, photos, onChange, max = 50,
}: { cover: string; photos: string[]; onChange: (cover: string, photos: string[]) => void; max?: number }) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [drag, setDrag] = useState(false);
  const all = [cover, ...photos].filter(Boolean);
  const room = max - all.length;

  // Keep the latest value for async uploads that finish one by one.
  const latest = useRef({ cover, photos });
  latest.current = { cover, photos };
  const emit = (list: string[]) => onChange(list[0] ?? "", list.slice(1));

  async function addFiles(fileList: FileList | File[] | null) {
    const files = Array.from(fileList ?? []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    let chosen = files;
    if (files.length > room) {
      chosen = files.slice(0, Math.max(0, room));
      toast.warning(`A post can have ${max} photos. Only the first ${chosen.length} of the ${files.length} you picked were added.`);
    }
    if (!chosen.length) return;
    setProgress({ done: 0, total: chosen.length });
    const results: (string | null)[] = new Array(chosen.length).fill(null);
    let next = 0, failed = 0;
    const worker = async () => {
      while (next < chosen.length) {
        const i = next++;
        try { results[i] = await uploadFile(chosen[i], "image"); }
        catch (e) {
          // one retry, then give up on this file
          try { results[i] = await uploadFile(chosen[i], "image"); }
          catch { failed++; toast.error(`${chosen[i].name}: ${(e as Error).message}`); }
        }
        setProgress((p) => p && { ...p, done: p.done + 1 });
      }
    };
    await Promise.all([worker(), worker(), worker()]);
    const added = results.filter(Boolean) as string[];
    const cur = [latest.current.cover, ...latest.current.photos].filter(Boolean);
    emit([...cur, ...added].slice(0, max));
    setProgress(null);
    if (input.current) input.current.value = "";
    if (added.length) toast.success(`${added.length} photo${added.length > 1 ? "s" : ""} added${failed ? `, ${failed} failed` : ""} — remember to save.`);
  }

  const move = (i: number, d: number) => {
    const list = [...all];
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    emit(list);
  };
  const makeCover = (i: number) => { const list = [...all]; const [p] = list.splice(i, 1); emit([p, ...list]); };
  const remove = (i: number) => emit(all.filter((_, k) => k !== i));

  return (
    <div
      className={cn("rounded-lg border-2 border-dashed p-3 transition", drag && "border-primary bg-accent/50")}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
    >
      <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} data-testid="photo-set-input" />
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" onClick={() => input.current?.click()} disabled={!!progress || room <= 0}>
          {progress ? <><Loader2 className="animate-spin" /> Uploading {progress.done} of {progress.total}…</> : <><ImagePlus /> Add photos</>}
        </Button>
        <span className="text-sm text-muted-foreground">
          <span className={cn("font-medium", all.length >= max ? "text-destructive" : "text-foreground")}>{all.length}</span> / {max} photos
          <span className="hidden sm:inline"> · select many at once, or drag them here</span>
        </span>
        {progress && (
          <span className="h-1.5 w-full overflow-hidden rounded-full bg-muted sm:w-40">
            <span className="block h-full bg-primary transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
          </span>
        )}
      </div>

      {all.length === 0 ? (
        <button type="button" onClick={() => input.current?.click()} className="flex w-full cursor-pointer flex-col items-center gap-1 rounded-md py-8 text-sm text-muted-foreground hover:bg-accent/40">
          <ImagePlus className="size-7 text-primary/70" />
          <span className="font-medium text-foreground">Add photos for this post</span>
          <span className="text-xs">The first photo is the cover. Up to {max} photos.</span>
        </button>
      ) : (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6" data-testid="photo-set-grid">
          {all.map((src, i) => (
            <li key={src} className={cn("group relative overflow-hidden rounded-md border bg-muted", i === 0 && "ring-2 ring-gold")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="aspect-square w-full object-cover" loading="lazy" />
              {i === 0 && <span className="absolute top-1 left-1 rounded bg-gold px-1.5 py-0.5 text-[10px] font-semibold text-night">COVER</span>}
              <span className="absolute top-1 right-1 rounded bg-black/55 px-1 text-[10px] text-white">{i + 1}</span>
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 p-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                <span className="flex">
                  <IconBtn label="Move left" onClick={() => move(i, -1)} disabled={i === 0}><ChevronLeft /></IconBtn>
                  <IconBtn label="Move right" onClick={() => move(i, 1)} disabled={i === all.length - 1}><ChevronRight /></IconBtn>
                </span>
                <span className="flex">
                  {i !== 0 && <IconBtn label="Make cover" onClick={() => makeCover(i)}><Star /></IconBtn>}
                  <IconBtn label="Remove photo" onClick={() => remove(i)}><X /></IconBtn>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick} disabled={disabled}
      className="grid size-6 cursor-pointer place-items-center rounded text-white hover:bg-white/20 disabled:opacity-30 [&_svg]:size-3.5">
      {children}
    </button>
  );
}
