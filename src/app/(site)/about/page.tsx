import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Eye, Target, Quote, Building2, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHero, SectionHeading } from "@/components/site/page-hero";
import { getContent } from "@/lib/content";
import { pairs } from "@/lib/content-schema";
import { lines } from "@/lib/utils";

export const metadata: Metadata = { title: "About Us" };

export default async function AboutPage() {
  const c = await getContent("about");
  const values = lines(c.values);
  const facilities = pairs(c.facilities);
  return (
    <>
      <PageHero eyebrow="About us" title="Who we are" intro={c.intro} image={c.heroImage} />

      <section className="container-page grid items-center gap-12 py-20 md:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Since day one" title={c.historyTitle} />
          <p className="-mt-4 leading-relaxed whitespace-pre-line text-muted-foreground">{c.history}</p>
        </div>
        {c.historyImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.historyImage} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover shadow-xl" />
        ) : (
          <div className="starfield grid aspect-[4/3] place-items-center rounded-2xl"><Star className="size-20 fill-gold text-gold" /></div>
        )}
      </section>

      <section className="bg-muted/60 py-20">
        <div className="container-page grid gap-6 md:grid-cols-2">
          <Card><CardContent className="space-y-3">
            <div className="grid size-11 place-items-center rounded-lg bg-primary text-primary-foreground"><Target className="size-5" /></div>
            <h3 className="text-2xl font-semibold text-primary">Our Mission</h3>
            <p className="leading-relaxed text-muted-foreground">{c.mission}</p>
          </CardContent></Card>
          <Card><CardContent className="space-y-3">
            <div className="grid size-11 place-items-center rounded-lg bg-secondary text-secondary-foreground"><Eye className="size-5" /></div>
            <h3 className="text-2xl font-semibold text-primary">Our Vision</h3>
            <p className="leading-relaxed text-muted-foreground">{c.vision}</p>
          </CardContent></Card>
        </div>
        {values.length > 0 && (
          <div className="container-page mt-14">
            <SectionHeading title="Our core values" center />
            <div className="flex flex-wrap justify-center gap-3">
              {values.map((v) => (
                <span key={v} className="flex items-center gap-2 rounded-full border bg-card px-5 py-2.5 font-medium shadow-xs">
                  <CheckCircle2 className="size-4 text-secondary-foreground/70" /> {v}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {c.headMessage && (
        <section className="container-page py-20">
          <div className="grid items-center gap-10 rounded-3xl border bg-card p-8 shadow-sm md:grid-cols-[260px_1fr] md:p-12">
            {c.headPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.headPhoto} alt={c.headName} className="mx-auto aspect-square w-56 rounded-full object-cover ring-4 ring-secondary/40" />
            ) : (
              <div className="starfield mx-auto grid aspect-square w-56 place-items-center rounded-full"><Quote className="size-14 text-gold" /></div>
            )}
            <div>
              <p className="mb-2 text-sm font-semibold tracking-widest text-secondary-foreground/70 uppercase">A word from our {c.headTitle || "Head Teacher"}</p>
              <blockquote className="font-display text-xl leading-relaxed text-primary md:text-2xl">&ldquo;{c.headMessage}&rdquo;</blockquote>
              {c.headName && <p className="mt-4 font-semibold">{c.headName} <span className="font-normal text-muted-foreground">· {c.headTitle}</span></p>}
            </div>
          </div>
        </section>
      )}

      {facilities.length > 0 && (
        <section className="bg-muted/60 py-20">
          <div className="container-page">
            <SectionHeading eyebrow="Campus" title="Our facilities" center />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {facilities.map((f) => (
                <Card key={f.title} className="gap-2"><CardContent className="flex gap-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-primary"><Building2 className="size-5" /></div>
                  <div><h3 className="font-sans font-semibold">{f.title}</h3><p className="text-sm text-muted-foreground">{f.text}</p></div>
                </CardContent></Card>
              ))}
            </div>
            <div className="mt-10 text-center"><Button asChild size="lg"><Link href="/contact">Book a school visit</Link></Button></div>
          </div>
        </section>
      )}
    </>
  );
}
