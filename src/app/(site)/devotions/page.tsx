import type { Metadata } from "next";
import Link from "next/link";
import { BookHeart, FileDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHero, EmptyState } from "@/components/site/page-hero";
import { getContent } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Devotions" };

export default async function DevotionsPage() {
  const [c, items] = await Promise.all([
    getContent("pages"),
    prisma.devotion.findMany({ where: { published: true }, orderBy: { date: "desc" } }).catch(() => []),
  ]);
  const [today, ...rest] = items;
  return (
    <>
      <PageHero eyebrow="Faith" title="Devotions" intro={c.devotionsIntro} image={c.devotionsImage} />
      <section className="container-page py-16">
        {!today ? (
          <EmptyState icon={<BookHeart />} title="No devotions yet" text="Daily reflections will be shared here." />
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
            <Card className="border-secondary/50">
              <CardContent className="space-y-4">
                <p className="text-sm font-semibold tracking-widest text-secondary-foreground/70 uppercase">Latest · {formatDate(today.date)}</p>
                <h2 className="text-3xl font-semibold text-primary">{today.title}</h2>
                {today.scripture && <p className="border-l-4 border-gold bg-accent/60 py-2 pl-4 font-display text-lg italic">{today.scripture}</p>}
                <p className="leading-relaxed whitespace-pre-line text-muted-foreground">{today.content}</p>
                <div className="flex items-center justify-between border-t pt-4 text-sm">
                  <span className="text-muted-foreground">— {today.author}</span>
                  {today.pdf && <a href={today.pdf} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 font-medium text-primary hover:underline"><FileDown className="size-4" /> Download PDF</a>}
                </div>
              </CardContent>
            </Card>
            {rest.length > 0 && (
              <div>
                <h3 className="mb-4 font-sans text-lg font-semibold">Earlier devotions</h3>
                <ul className="space-y-2">
                  {rest.map((d) => (
                    <li key={d.id}>
                      <Link href={`/devotions/${d.id}`} className="block rounded-lg border bg-card p-4 transition hover:border-primary/30 hover:bg-accent/50">
                        <p className="text-xs text-muted-foreground">{formatDate(d.date)}</p>
                        <p className="font-medium">{d.title}</p>
                        {d.scripture && <p className="mt-0.5 truncate text-sm text-muted-foreground italic">{d.scripture}</p>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}
