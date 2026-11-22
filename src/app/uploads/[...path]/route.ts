import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { UPLOAD_ROOT } from "@/lib/storage";

export const runtime = "nodejs";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif", ".avif": "image/avif",
  ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime", ".ogv": "video/ogg", ".pdf": "application/pdf",
};

// Serves uploaded media. Supports HTTP Range requests so videos stream and can be scrubbed.
export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path;
  const file = path.resolve(UPLOAD_ROOT, ...parts);
  if (!file.startsWith(UPLOAD_ROOT + path.sep)) return new Response("Not found", { status: 404 });

  let size: number;
  try {
    const s = await stat(file);
    if (!s.isFile()) throw new Error();
    size = s.size;
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const type = TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream";
  const headers: Record<string, string> = {
    "Content-Type": type,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  const range = req.headers.get("range");
  const m = range?.match(/bytes=(\d*)-(\d*)/);
  if (m) {
    let start = m[1] ? parseInt(m[1], 10) : size - parseInt(m[2], 10);
    let end = m[1] && m[2] ? parseInt(m[2], 10) : size - 1;
    start = Math.max(0, start);
    end = Math.min(end, size - 1);
    if (start > end || isNaN(start)) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    const stream = Readable.toWeb(createReadStream(file, { start, end })) as ReadableStream;
    return new Response(stream, {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) },
    });
  }

  const stream = Readable.toWeb(createReadStream(file)) as ReadableStream;
  return new Response(stream, { headers: { ...headers, "Content-Length": String(size) } });
}
