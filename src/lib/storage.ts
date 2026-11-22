import "server-only";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Uploaded files are stored on local disk (UPLOAD_DIR, default ./uploads) and served at /uploads/...
 * by src/app/uploads/[...path]/route.ts. Swap these two functions for S3/R2/Vercel Blob if you
 * deploy somewhere without a persistent disk.
 */
export const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads"));

export const KINDS = {
  image: { dir: "images", mimes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"], maxMb: Number(process.env.MAX_IMAGE_MB || 20) },
  video: { dir: "videos", mimes: ["video/mp4", "video/webm", "video/quicktime", "video/ogg"], maxMb: Number(process.env.MAX_VIDEO_MB || 200) },
  pdf: { dir: "documents", mimes: ["application/pdf"], maxMb: 20 },
} as const;
export type UploadKind = keyof typeof KINDS;

const EXT: Record<string, string> = {
  "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif", "image/avif": ".avif",
  "video/mp4": ".mp4", "video/webm": ".webm", "video/quicktime": ".mov", "video/ogg": ".ogv",
  "application/pdf": ".pdf",
};

export async function saveUpload(file: File, kind: UploadKind): Promise<string> {
  const rule = KINDS[kind];
  if (!(rule.mimes as readonly string[]).includes(file.type)) {
    throw new Error(`That file type (${file.type || "unknown"}) isn't allowed here.`);
  }
  if (file.size > rule.maxMb * 1024 * 1024) {
    throw new Error(`File is too large — the limit is ${rule.maxMb} MB.`);
  }
  const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${EXT[file.type] ?? ""}`;
  const dir = path.join(UPLOAD_ROOT, rule.dir);
  await mkdir(dir, { recursive: true });
  let bytes: Buffer = Buffer.from(await file.arrayBuffer());
  if (kind === "image") bytes = await optimizeImage(bytes, file.type);
  await writeFile(path.join(dir, name), bytes);
  return `/uploads/${rule.dir}/${name}`;
}

const MAX_SIDE = 2048;

/**
 * Phone photos are often 5–12 MB. Shrink them to at most 2048px on the long side, apply the
 * phone's rotation, and re-compress, so pages load fast and they stay under Facebook's size limit.
 * If anything goes wrong the original file is kept.
 */
async function optimizeImage(input: Buffer, mime: string): Promise<Buffer> {
  if (mime === "image/gif") return input; // keep animations
  try {
    const sharp = (await import("sharp")).default;
    const img = sharp(input, { failOn: "none" }).rotate(); // .rotate() = honour EXIF orientation
    const meta = await img.metadata();
    const big = (meta.width ?? 0) > MAX_SIDE || (meta.height ?? 0) > MAX_SIDE;
    if (!big && input.length < 1.5 * 1024 * 1024 && (meta.orientation ?? 1) === 1) return input;
    const resized = img.resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true });
    const out =
      mime === "image/png" ? await resized.png({ compressionLevel: 9 }).toBuffer()
      : mime === "image/webp" ? await resized.webp({ quality: 82 }).toBuffer()
      : mime === "image/avif" ? await resized.avif({ quality: 60 }).toBuffer()
      : await resized.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    return out.length < input.length || big ? out : input;
  } catch (err) {
    console.warn("[upload] image optimisation skipped:", (err as Error).message);
    return input;
  }
}

/** Deletes a previously uploaded file. Ignores anything that isn't one of ours (e.g. /images/... or https://...). */
export async function deleteUpload(url: string | null | undefined) {
  if (!url || !url.startsWith("/uploads/")) return;
  const target = path.resolve(UPLOAD_ROOT, url.replace(/^\/uploads\//, ""));
  if (!target.startsWith(UPLOAD_ROOT + path.sep)) return;
  await unlink(target).catch(() => {});
}
