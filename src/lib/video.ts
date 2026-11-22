/** Extracts a YouTube video id from any common URL form (watch, youtu.be, shorts, embed). */
export function youtubeId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      const m = u.pathname.match(/^\/(embed|shorts|live)\/([\w-]{6,})/);
      if (m) return m[2];
    }
  } catch {}
  return null;
}

export type VideoConfig = {
  enabled: boolean;
  sourceType: string;
  url: string;
  poster: string;
  title: string;
  caption: string;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
};
