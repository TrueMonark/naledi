import type { Metadata } from "next";
import Link from "next/link";
import { BedDouble, Check, Download, FileText, Sun, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageHero, SectionHeading } from "@/components/site/page-hero";
import { getContent } from "@/lib/content";
import { pairs } from "@/lib/content-schema";
import { lines } from "@/lib/utils";

export const metadata: Metadata = { title: "Admissions & Requirements" };

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2.5 sm:grid-cols-2">
      {items.map((i) => (
        <li key={i} className="flex gap-2.5 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />{i}</li>
      ))}
    </ul>
  );
}

export default async function AdmissionsPage() {
  const c = await getContent("admissions");
  const steps = pairs(c.steps);
  const faq = pairs(c.faq);
  const downloads = [
    { label: "Application form", url: c.applicationForm },
    { label: "Fees schedule", url: c.feesSchedule },
    { label: "Full requirements list", url: c.requirementsList },
  ].filter((d) => d.url);

  return (
    <>
      <PageHero eyebrow="Admissions" title="Join the Naledi family" intro={c.intro} image={c.heroImage} />

      <section className="container-page py-20">
        <SectionHeading eyebrow="Step by step" title="How to apply" />
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {steps.map((s, i) => (
            <li key={i} className="relative rounded-xl border bg-card p-5 shadow-xs">
              <span className="mb-3 grid size-9 place-items-center rounded-full bg-primary font-display font-semibold text-primary-foreground">{i + 1}</span>
              <h3 className="font-sans font-semibold">{s.title}</h3>
              {s.text && <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>}
            </li>
          ))}
        </ol>
        {downloads.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            {downloads.map((d) => (
              <Button key={d.label} asChild variant={d.label === "Application form" ? "gold" : "outline"}>
                <a href={d.url} target="_blank" rel="noreferrer" download><Download /> {d.label}</a>
              </Button>
            ))}
          </div>
        )}
      </section>

      <section className="bg-muted/60 py-20">
        <div className="container-page grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <Card>
            <CardHeader><CardTitle className="font-display text-2xl text-primary">Requirements</CardTitle></CardHeader>
            <CardContent>
              <Tabs defaultValue="documents">
                <TabsList className="mb-4">
                  <TabsTrigger value="documents"><FileText /> Documents</TabsTrigger>
                  <TabsTrigger value="boarding"><BedDouble /> Boarders</TabsTrigger>
                  <TabsTrigger value="day"><Sun /> Day scholars</TabsTrigger>
                </TabsList>
                <TabsContent value="documents"><Checklist items={lines(c.documents)} /></TabsContent>
                <TabsContent value="boarding"><Checklist items={lines(c.boardingItems)} /></TabsContent>
                <TabsContent value="day"><Checklist items={lines(c.dayItems)} /></TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <Card className="h-fit">
            <CardHeader><CardTitle className="flex items-center gap-2 font-display text-2xl text-primary"><Wallet className="size-5" /> School fees</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">{c.feesNote}</p>
              <div className="flex flex-wrap gap-2">
                {c.feesSchedule && <Button asChild variant="outline"><a href={c.feesSchedule} target="_blank" rel="noreferrer"><Download /> Fees schedule</a></Button>}
                <Button asChild><Link href="/contact">Ask the office</Link></Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {faq.length > 0 && (
        <section className="container-page max-w-3xl py-20">
          <SectionHeading title="Frequently asked questions" center />
          <Accordion type="single" collapsible className="rounded-xl border bg-card px-6">
            {faq.map((f, i) => (
              <AccordionItem key={i} value={`q${i}`}>
                <AccordionTrigger>{f.title}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.text}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}
    </>
  );
}
