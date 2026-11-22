"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Slide = { image: string; title: string; subtitle: string };

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 6000, stopOnInteraction: false, stopOnMouseEnter: true })]);
  const [index, setIndex] = useState(0);
  const onSelect = useCallback(() => embla && setIndex(embla.selectedScrollSnap()), [embla]);
  useEffect(() => {
    if (!embla) return;
    onSelect();
    embla.on("select", onSelect);
    return () => { embla.off("select", onSelect); };
  }, [embla, onSelect]);

  return (
    <section className="relative isolate overflow-hidden" aria-roledescription="carousel">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((s, i) => (
            <div key={i} className="relative min-w-0 flex-[0_0_100%]" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}`}>
              <div className={cn("relative flex min-h-[78vh] items-center md:min-h-[86vh]", !s.image && "starfield")}>
                {s.image && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.image} alt="" className="absolute inset-0 size-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
                    <div className="absolute inset-0 bg-gradient-to-r from-night/90 via-night/60 to-night/20" />
                  </>
                )}
                <div className="container-page relative py-20 text-white">
                  <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-widest text-gold uppercase backdrop-blur">
                    ✦ Naledi · Shine like a star
                  </p>
                  <h1 className="max-w-3xl text-4xl leading-[1.05] font-semibold text-balance sm:text-5xl md:text-6xl">{s.title}</h1>
                  <p className="mt-5 max-w-xl text-lg text-white/85 md:text-xl">{s.subtitle}</p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button asChild size="lg" variant="gold"><Link href="/admissions">Apply for admission</Link></Button>
                    <Button asChild size="lg" variant="glass"><Link href="/about">Discover Naledi</Link></Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {slides.length > 1 && (
        <div className="container-page pointer-events-none absolute inset-x-0 bottom-6 flex items-center justify-between">
          <div className="pointer-events-auto flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => embla?.scrollTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn("h-1.5 rounded-full transition-all cursor-pointer", i === index ? "w-8 bg-gold" : "w-3 bg-white/50 hover:bg-white/80")}
              />
            ))}
          </div>
          <div className="pointer-events-auto flex gap-2">
            <Button size="icon" variant="glass" className="rounded-full" onClick={() => embla?.scrollPrev()} aria-label="Previous slide"><ChevronLeft /></Button>
            <Button size="icon" variant="glass" className="rounded-full" onClick={() => embla?.scrollNext()} aria-label="Next slide"><ChevronRight /></Button>
          </div>
        </div>
      )}
    </section>
  );
}
