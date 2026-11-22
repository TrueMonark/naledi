import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

const get = (id: string) => prisma.devotion.findFirst({ where: { id, published: true } }).catch(() => null);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const d = await get((await params).id);
  return { title: d?.title ?? "Devotion" };
}

export default async function DevotionPage({ params }: { params: Promise<{ id: string }> }) {
  const d = await get((await params).id);
  if (!d) notFound();
  return (
    <article className="container-page max-w-3xl py-14">
      <Button asChild variant="ghost" size="sm" className="mb-6"><Link href="/devotions"><ArrowLeft /> All devotions</Link></Button>
      <p className="text-sm font-semibold tracking-widest text-secondary-foreground/70 uppercase">{formatDate(d.date)}</p>
      <h1 className="mt-2 text-4xl font-semibold text-primary">{d.title}</h1>
      {d.scripture && <p className="mt-6 border-l-4 border-gold bg-accent/60 py-3 pl-4 font-display text-xl italic">{d.scripture}</p>}
      <div className="mt-8 text-lg leading-relaxed whitespace-pre-line text-foreground/85">{d.content}</div>
      <div className="mt-10 flex items-center justify-between border-t pt-5 text-sm">
        <span className="text-muted-foreground">— {d.author}</span>
        {d.pdf && <a href={d.pdf} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 font-medium text-primary hover:underline"><FileDown className="size-4" /> Download PDF</a>}
      </div>
    </article>
  );
}
