import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { GalleryGrid } from "@/components/site/gallery-grid";
import { formatDate } from "@/lib/utils";

async function getPost(slug: string) {
  return prisma.blogPost.findFirst({ where: { slug, published: true } }).catch(() => null);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = await getPost((await params).slug);
  return post ? { title: post.title, description: post.excerpt, openGraph: { images: post.image ? [post.image] : [] } } : { title: "Not found" };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  const more = await prisma.blogPost.findMany({ where: { published: true, NOT: { id: post.id } }, orderBy: { createdAt: "desc" }, take: 3 }).catch(() => []);

  return (
    <article>
      <header className="starfield text-white">
        <div className="container-page max-w-4xl py-14">
          <Button asChild variant="glass" size="sm" className="mb-6"><Link href="/news"><ArrowLeft /> All news</Link></Button>
          <Badge variant="gold" className="mb-3">{post.category}</Badge>
          <h1 className="text-3xl font-semibold md:text-5xl">{post.title}</h1>
          <div className="mt-4 flex flex-wrap gap-5 text-sm text-white/75">
            <span className="flex items-center gap-1.5"><CalendarDays className="size-4" /> {formatDate(post.createdAt)}</span>
            <span className="flex items-center gap-1.5"><User className="size-4" /> {post.author}</span>
          </div>
        </div>
      </header>
      <div className="container-page max-w-4xl py-12">
        {post.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.image} alt="" className="-mt-20 mb-10 aspect-[16/9] w-full rounded-2xl object-cover shadow-xl" />
        )}
        <div className="prose prose-lg max-w-none whitespace-pre-line prose-headings:text-primary">{post.content}</div>
        {post.photos.length > 0 && (
          <section className="mt-12" aria-label="Photos">
            <h2 className="mb-4 text-2xl font-semibold text-primary">Photos <span className="text-base font-normal text-muted-foreground">({post.photos.length + (post.image ? 1 : 0)})</span></h2>
            <GalleryGrid
              items={[post.image, ...post.photos].filter(Boolean).map((src, i) => ({ id: src, image: src, title: `${post.title} — photo ${i + 1}`, description: "", category: "Photos" }))}
            />
          </section>
        )}
        {more.length > 0 && (
          <aside className="mt-16 border-t pt-10">
            <h2 className="mb-5 text-2xl font-semibold text-primary">More news</h2>
            <ul className="grid gap-4 sm:grid-cols-3">
              {more.map((m) => (
                <li key={m.id}><Link href={`/news/${m.slug}`} className="block rounded-lg border p-4 transition hover:bg-muted">
                  <p className="text-xs text-muted-foreground">{formatDate(m.createdAt)}</p>
                  <p className="mt-1 font-medium">{m.title}</p>
                </Link></li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </article>
  );
}
