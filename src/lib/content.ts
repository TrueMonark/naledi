import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { CONTENT_SCHEMA, type ContentMap } from "@/lib/content-schema";
import type { VideoConfig } from "@/lib/video";

/**
 * Loads all CMS content once per request, merged over the defaults.
 * If the database is unreachable the site still renders with default copy — never blank.
 */
export const getAllContent = cache(async (): Promise<Record<string, ContentMap>> => {
  const result: Record<string, ContentMap> = {};
  for (const p of CONTENT_SCHEMA) result[p.page] = Object.fromEntries(p.fields.map((f) => [f.section, f.value]));
  try {
    const rows = await prisma.pageContent.findMany();
    for (const r of rows) {
      result[r.page] ??= {};
      result[r.page][r.section] = r.value;
    }
  } catch (err) {
    console.error("[content] falling back to defaults:", (err as Error).message);
  }
  return result;
});

export async function getContent(page: string): Promise<ContentMap> {
  return (await getAllContent())[page] ?? {};
}

export const DEFAULT_VIDEO: VideoConfig = {
  enabled: false, sourceType: "upload", url: "", poster: "", title: "See Naledi in Action", caption: "", autoplay: false, muted: true, loop: false,
};

export const getVideo = cache(async (): Promise<VideoConfig> => {
  try {
    const v = await prisma.videoSetting.findUnique({ where: { id: "homepage" } });
    return v ?? DEFAULT_VIDEO;
  } catch {
    return DEFAULT_VIDEO;
  }
});
