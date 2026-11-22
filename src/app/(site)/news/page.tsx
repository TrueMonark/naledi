import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHero, EmptyState } from "@/components/site/page-hero";
import { getContent } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "News" };

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const [c, posts, cats] = await Promise.all([
    getContent("pages"),
    prisma.blogPost.findMany({ where: { published: true, ...(category ? { category } : {}) }, orderBy: { createdAt: "desc" } }).catch(() => []),
    prisma.blogPost.findMany({ where: { published: true }, distinct: ["category"], select: { category: true } }).catch(() => []),
  ]);
  const [featured, ...rest] = posts;

  return (
    <>
      <PageHero eyebrow="News & stories" title="School news" intro={c.blogIntro} image={c.blogImage} />
      <section className="container-page py-16">
        {cats.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <Link href="/news"><Badge variant={!category ? "default" : "outline"} className="px-3 py-1 text-sm">All</Badge></Link>
            {cats.map((x) => (
              <Link key={x.category} href={`/news?category=${encodeURIComponent(x.category)}`}>
                <Badge variant={category === x.category ? "default" : "outline"} className="px-3 py-1 text-sm">{x.category}</Badge>
              </Link>
            ))}
          </div>
        )}
        {!featured ? (
          <EmptyState icon={<Newspaper />} title="No news yet" text="Stories and announcements will appear here." />
        ) : (
          <>
            <Link href={`/news/${featured.slug}`} className="group mb-10 grid overflow-hidden rounded-2xl border bg-card shadow-sm md:grid-cols-2">
              <div className="aspect-[16/10] overflow-hidden bg-muted md:aspect-auto">
                {featured.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={featured.image} alt="" className="size-full object-cover transition duration-500 group-hover:scale-105" />
                ) : <div className="starfield grid size-full min-h-60 place-items-center"><BookOpen className="size-12 text-gold" /></div>}
              </div>
              <div className="flex flex-col justify-center gap-3 p-8">
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Badge variant="gold">{featured.category}</Badge>{formatDate(featured.createdAt)}</div>
                <h2 className="text-2xl font-semibold text-primary group-hover:underline md:text-3xl">{featured.title}</h2>
                <p className="text-muted-foreground">{featured.excerpt}</p>
                <span className="text-sm font-medium text-primary">Read story →</span>
              </div>
            </Link>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p) => (
                <Link key={p.id} href={`/news/${p.slug}`} className="group">
                  <Card className="h-full gap-0 overflow-hidden py-0 transition group-hover:shadow-md">
                    <div className="aspect-[16/10] overflow-hidden bg-muted">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt="" className="size-full object-cover transition duration-500 group-hover:scale-105" />
                      ) : <div className="starfield grid size-full place-items-center"><BookOpen className="size-10 text-gold" /></div>}
                    </div>
                    <CardContent className="space-y-2 py-5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Badge variant="gold">{p.category}</Badge>{formatDate(p.createdAt)}</div>
                      <h3 className="font-sans text-lg leading-snug font-semibold group-hover:text-primary">{p.title}</h3>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
