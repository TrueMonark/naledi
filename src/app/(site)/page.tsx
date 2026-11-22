import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Images, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeroSlider } from "@/components/site/hero-slider";
import { FeatureVideo } from "@/components/site/feature-video";
import { SectionHeading } from "@/components/site/page-hero";
import { getContent, getVideo } from "@/lib/content";
import { pairs } from "@/lib/content-schema";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try { return await p; } catch { return fallback; }
}

export default async function HomePage() {
  const [hero, home, video, posts, photos, devotion] = await Promise.all([
    getContent("hero"),
    getContent("home"),
    getVideo(),
    safe(prisma.blogPost.findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, take: 3 }), []),
    safe(prisma.galleryImage.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], take: 6 }), []),
    safe(prisma.devotion.findFirst({ where: { published: true }, orderBy: { date: "desc" } }), null),
  ]);

  const slides = [1, 2, 3]
    .map((n) => ({ image: hero[`slide${n}Image`], title: hero[`slide${n}Title`], subtitle: hero[`slide${n}Subtitle`] }))
    .filter((s) => s.title);
  const stats = [1, 2, 3].map((n) => ({ value: home[`stat${n}Value`], label: home[`stat${n}Label`] })).filter((s) => s.value);
  const pillars = pairs(home.pillars);
  const showVideo = video.enabled && !!video.url;

  return (
    <>
      <HeroSlider slides={slides} />

      {/* Welcome */}
      <section className="container-page grid items-center gap-12 py-20 md:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-semibold tracking-widest text-secondary-foreground/70 uppercase">Welcome</p>
          <h2 className="text-3xl font-semibold text-primary md:text-4xl">{home.welcomeTitle}</h2>
          <div className="mt-5 space-y-4 leading-relaxed text-muted-foreground">
            {home.welcomeParagraph1 && <p>{home.welcomeParagraph1}</p>}
            {home.welcomeParagraph2 && <p>{home.welcomeParagraph2}</p>}
          </div>
          <Button asChild className="mt-7" size="lg"><Link href="/about">Learn more about us <ArrowRight /></Link></Button>
        </div>
        <div className="relative">
          {home.welcomeImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={home.welcomeImage} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover shadow-xl" />
          ) : (
            <div className="starfield grid aspect-[4/3] w-full place-items-center rounded-2xl shadow-xl">
              <Star className="size-24 fill-gold text-gold" />
            </div>
          )}
          {stats.length > 0 && (
            <div className="relative z-10 -mt-10 mx-4 grid grid-cols-3 divide-x rounded-xl border bg-card shadow-lg">
              {stats.map((s) => (
                <div key={s.label} className="p-4 text-center">
                  <div className="font-display text-lg leading-tight font-semibold text-primary md:text-xl">{s.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Feature video — controlled from Admin → Homepage Video */}
      {showVideo && (
        <section id="video" className="starfield py-20 text-white">
          <div className="container-page">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <p className="mb-2 text-sm font-semibold tracking-widest text-gold uppercase">Watch</p>
              <h2 className="text-3xl font-semibold md:text-4xl">{video.title}</h2>
              {video.caption && <p className="mt-3 text-white/75">{video.caption}</p>}
            </div>
            <div className="mx-auto max-w-5xl"><FeatureVideo video={video} /></div>
          </div>
        </section>
      )}

      {/* Why Naledi */}
      {pillars.length > 0 && (
        <section className={showVideo ? "bg-background py-20" : "bg-muted/60 py-20"}>
          <div className="container-page">
            <SectionHeading eyebrow="Why Naledi" title={home.pillarsTitle} center />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {pillars.map((p, i) => (
                <Card key={i} className="gap-3 transition hover:-translate-y-1 hover:shadow-md">
                  <CardContent className="space-y-3">
                    <div className="grid size-11 place-items-center rounded-lg bg-accent text-primary"><Sparkles className="size-5" /></div>
                    <h3 className="font-sans text-lg font-semibold">{p.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{p.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest news */}
      {posts.length > 0 && (
        <section className="container-page py-20">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="News" title="Latest from the school" />
            <Button asChild variant="outline" className="mb-10"><Link href="/news">All news <ArrowRight /></Link></Button>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.id} href={`/news/${p.slug}`} className="group">
                <Card className="h-full gap-0 overflow-hidden py-0 transition group-hover:shadow-md">
                  <div className="aspect-[16/10] overflow-hidden bg-muted">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" className="size-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="starfield grid size-full place-items-center"><BookOpen className="size-10 text-gold" /></div>
                    )}
                  </div>
                  <CardContent className="space-y-2 py-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="gold">{p.category}</Badge>{formatDate(p.createdAt)}
                    </div>
                    <h3 className="font-sans text-lg leading-snug font-semibold group-hover:text-primary">{p.title}</h3>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Gallery strip + devotion */}
      {(photos.length > 0 || devotion) && (
        <section className="bg-muted/60 py-20">
          <div className="container-page grid gap-10 lg:grid-cols-[1.6fr_1fr]">
            {photos.length > 0 && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-primary md:text-3xl">Life at Naledi</h2>
                  <Button asChild variant="link"><Link href="/gallery"><Images /> View gallery</Link></Button>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {photos.map((g) => (
                    <Link key={g.id} href="/gallery" className="group overflow-hidden rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={g.image} alt={g.title} className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {devotion && (
              <Card className="h-fit border-secondary/50 bg-card">
                <CardContent className="space-y-3">
                  <Badge variant="gold"><CalendarDays /> Devotion · {formatDate(devotion.date)}</Badge>
                  <h3 className="text-2xl font-semibold text-primary">{devotion.title}</h3>
                  {devotion.scripture && <p className="border-l-2 border-gold pl-3 text-sm italic text-muted-foreground">{devotion.scripture}</p>}
                  <p className="line-clamp-5 text-sm leading-relaxed text-muted-foreground">{devotion.content}</p>
                  <Button asChild variant="outline"><Link href={`/devotions/${devotion.id}`}>Read devotion <ArrowRight /></Link></Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-page py-20">
        <div className="starfield relative overflow-hidden rounded-3xl px-6 py-14 text-center text-white md:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold md:text-4xl">{home.ctaTitle}</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">{home.ctaText}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="gold"><Link href="/admissions">Admission requirements</Link></Button>
            <Button asChild size="lg" variant="glass"><Link href="/contact">Contact us</Link></Button>
          </div>
        </div>
      </section>
    </>
  );
}
