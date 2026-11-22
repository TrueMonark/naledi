import { AdminHeader } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/prisma";
import { DEFAULT_VIDEO } from "@/lib/content";
import { VideoForm } from "./video-form";

export default async function VideoAdminPage() {
  const v = (await prisma.videoSetting.findUnique({ where: { id: "homepage" } })) ?? DEFAULT_VIDEO;
  const { enabled, sourceType, url, poster, title, caption, autoplay, muted, loop } = v;
  return (
    <>
      <AdminHeader title="Homepage video" description="Choose the video that plays on the home page, and how it behaves." />
      <VideoForm initial={{ enabled, sourceType, url, poster, title, caption, autoplay, muted, loop }} />
    </>
  );
}
