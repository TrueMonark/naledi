import { AdminHeader } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/prisma";
import { GalleryManager } from "./gallery-manager";

export default async function GalleryAdminPage() {
  const items = await prisma.galleryImage.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return (
    <>
      <AdminHeader title="Gallery" description="Upload several photos at once, group them into albums, and set their order." />
      <GalleryManager items={items.map((i) => ({ ...i, createdAt: i.createdAt.toISOString() }))} />
    </>
  );
}
