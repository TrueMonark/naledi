import { AdminHeader } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/prisma";
import { facebookConfig } from "@/lib/facebook";
import { NewsManager } from "./news-manager";

export default async function NewsAdminPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const [posts, { new: isNew }] = await Promise.all([prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } }), searchParams]);
  return (
    <>
      <AdminHeader title="News" description="Stories, announcements and achievements shown on the News page and home page." />
      <NewsManager
        posts={posts.map((p) => ({ ...p, createdAt: p.createdAt.toISOString(), facebookPostedAt: p.facebookPostedAt?.toISOString() ?? null }))}
        openNew={!!isNew}
        facebookReady={!!facebookConfig()}
      />
    </>
  );
}
