"use client";
import { useRef, useState } from "react";
import { FileText, ImagePlus, Loader2, Trash2, UploadCloud, Video } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type UploadKind = "image" | "video" | "pdf";
const ACCEPT: Record<UploadKind, string> = {
  image: "image/jpeg,image/png,image/webp,image/gif,image/avif",
  video: "video/mp4,video/webm,video/quicktime,video/ogg",
  pdf: "application/pdf",
};

/** Uploads one file to /api/admin/upload with progress. Resolves with the stored URL. */
export function uploadFile(file: File, kind: UploadKind, onProgress?: (pct: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", kind);
    xhr.open("POST", "/api/admin/upload");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      let body: { url?: string; error?: string } = {};
      try { body = JSON.parse(xhr.responseText); } catch {}
      if (xhr.status >= 200 && xhr.status < 300 && body.url) resolve(body.url);
      else reject(new Error(body.error || (xhr.status === 413 ? "File is too large for the server." : `Upload failed (${xhr.status}).`)));
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(fd);
  });
}

export function MediaUpload({
  kind = "image", value, onChange, className, aspect = "aspect-video", label,
}: { kind?: UploadKind; value: string; onChange: (url: string) => void; className?: string; aspect?: string; label?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [drag, setDrag] = useState(false);

  async function handle(file?: File) {
    if (!file) return;
    setProgress(0);
    try {
      const url = await uploadFile(file, kind, setProgress);
      onChange(url);
      toast.success("Uploaded — remember to save.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  }

  const Icon = kind === "video" ? Video : kind === "pdf" ? FileText : ImagePlus;

  return (
    <div className={cn("space-y-2", className)}>
      <input ref={input} type="file" accept={ACCEPT[kind]} className="hidden" onChange={(e) => handle(e.target.files?.[0])} />
      {value && progress === null ? (
        <div className="group relative overflow-hidden rounded-lg border bg-muted">
          {kind === "image" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className={cn("w-full object-cover", aspect)} />
          )}
          {kind === "video" && <video src={value} className={cn("w-full bg-black object-contain", aspect)} controls preload="metadata" />}
          {kind === "pdf" && (
            <a href={value} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 text-sm font-medium hover:underline">
              <FileText className="size-8 text-primary" /> {value.split("/").pop()}
            </a>
          )}
          <div className="flex gap-2 border-t bg-background p-2">
            <Button type="button" size="sm" variant="outline" onClick={() => input.current?.click()}><UploadCloud /> Replace</Button>
            <Button type="button" size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => onChange("")}><Trash2 /> Remove</Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files?.[0]); }}
          disabled={progress !== null}
          className={cn(
            "flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center text-sm text-muted-foreground transition hover:border-primary/50 hover:bg-accent/40",
            kind !== "pdf" && aspect, drag && "border-primary bg-accent/60"
          )}
        >
          {progress !== null ? (
            <>
              <Loader2 className="size-6 animate-spin text-primary" />
              <span>Uploading… {progress}%</span>
              <span className="h-1.5 w-40 overflow-hidden rounded-full bg-muted"><span className="block h-full bg-primary transition-all" style={{ width: `${progress}%` }} /></span>
            </>
          ) : (
            <>
              <Icon className="size-7 text-primary/70" />
              <span className="font-medium text-foreground">{label ?? `Upload ${kind === "pdf" ? "PDF" : kind}`}</span>
              <span className="text-xs">Click or drag a file here</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
