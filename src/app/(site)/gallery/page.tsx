import type { Metadata } from "next";
import { Images } from "lucide-react";
import { PageHero, EmptyState } from "@/components/site/page-hero";
import { getContent } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { GalleryGrid } from "@/components/site/gallery-grid";

export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const [c, items] = await Promise.all([
    getContent("pages"),
    prisma.galleryImage.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }).catch(() => []),
  ]);
  return (
    <>
      <PageHero eyebrow="Gallery" title="Life at Naledi" intro={c.galleryIntro} image={c.galleryImage} />
      <section className="container-page py-16">
        {items.length ? <GalleryGrid items={items} /> : <EmptyState icon={<Images />} title="Photos coming soon" text="Check back shortly for pictures from around the school." />}
      </section>
    </>
  );
}
