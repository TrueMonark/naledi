"use client";
import { useMemo, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Item = { id: string; title: string; description: string; image: string; category: string };

export function GalleryGrid({ items }: { items: Item[] }) {
  const categories = useMemo(() => ["All", ...Array.from(new Set(items.map((i) => i.category)))], [items]);
  const [cat, setCat] = useState("All");
  const shown = cat === "All" ? items : items.filter((i) => i.category === cat);
  const [open, setOpen] = useState<number | null>(null);

  const step = useCallback((d: number) => setOpen((o) => (o === null ? o : (o + d + shown.length) % shown.length)), [shown.length]);
  useEffect(() => {
    if (open === null) return;
    const k = (e: KeyboardEvent) => { if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, step]);
  const current = open !== null ? shown[open] : null;

  return (
    <>
      {categories.length > 2 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Button key={c} size="sm" variant={c === cat ? "default" : "outline"} className="rounded-full" onClick={() => setCat(c)}>{c}</Button>
          ))}
        </div>
      )}
      <div className="columns-2 gap-3 md:columns-3 lg:columns-4 [&>*]:mb-3">
        {shown.map((g, i) => (
          <button key={g.id} onClick={() => setOpen(i)} className="group relative block w-full cursor-zoom-in overflow-hidden rounded-lg break-inside-avoid">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.image} alt={g.title} loading="lazy" className="w-full transition duration-500 group-hover:scale-105" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-left text-sm font-medium text-white opacity-0 transition group-hover:opacity-100">{g.title}</span>
          </button>
        ))}
      </div>
      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-5xl border-0 bg-black p-0 text-white sm:max-w-5xl">
          {current && (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={current.image} alt={current.title} className="max-h-[78vh] w-full object-contain" />
              <div className="p-4">
                <DialogTitle className="text-white">{current.title}</DialogTitle>
                <DialogDescription className={cn("text-white/70", !current.description && "sr-only")}>{current.description || current.title}</DialogDescription>
              </div>
              {shown.length > 1 && (
                <>
                  <Button size="icon" variant="glass" className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full" onClick={() => step(-1)} aria-label="Previous"><ChevronLeft /></Button>
                  <Button size="icon" variant="glass" className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full" onClick={() => step(1)} aria-label="Next"><ChevronRight /></Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
