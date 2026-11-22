import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { saveUpload, KINDS, type UploadKind } from "@/lib/storage";

export const runtime = "nodejs";

// POST multipart { file, kind: "image" | "video" | "pdf" } → { url }
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get("file");
    const kind = String(form.get("kind") || "image") as UploadKind;
    if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "No file received." }, { status: 400 });
    if (!(kind in KINDS)) return NextResponse.json({ error: "Unknown upload type." }, { status: 400 });
    const url = await saveUpload(file, kind);
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "Upload failed." }, { status: 400 });
  }
}
