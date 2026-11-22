"use client";
import { useState } from "react";
import { Play } from "lucide-react";
import { youtubeId, type VideoConfig } from "@/lib/video";

/** Renders the admin-configured homepage video: uploaded file, direct link, or YouTube. */
export function FeatureVideo({ video }: { video: VideoConfig }) {
  const yt = video.sourceType === "youtube" ? youtubeId(video.url) : null;
  const [playing, setPlaying] = useState(video.autoplay);
  // Browsers only allow autoplay when muted.
  const muted = video.autoplay ? true : video.muted;

  if (yt) {
    const params = new URLSearchParams({
      rel: "0", modestbranding: "1", playsinline: "1",
      autoplay: playing ? "1" : "0",
      mute: muted ? "1" : "0",
      ...(video.loop ? { loop: "1", playlist: yt } : {}),
    });
    const poster = video.poster || `https://img.youtube.com/vi/${yt}/maxresdefault.jpg`;
    return (
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-night shadow-2xl ring-1 ring-black/10">
        {playing ? (
          <iframe
            className="absolute inset-0 size-full"
            src={`https://www.youtube-nocookie.com/embed/${yt}?${params}`}
            title={video.title || "School video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button onClick={() => setPlaying(true)} className="group absolute inset-0 size-full cursor-pointer" aria-label={`Play video: ${video.title}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={poster} alt="" className="size-full object-cover opacity-90 transition group-hover:opacity-100" />
            <PlayBadge />
          </button>
        )}
      </div>
    );
  }

  if (!video.url) return null;
  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-night shadow-2xl ring-1 ring-black/10">
      <video
        key={video.url}
        className="absolute inset-0 size-full object-cover"
        src={video.url}
        poster={video.poster || undefined}
        controls
        playsInline
        preload="metadata"
        autoPlay={video.autoplay}
        muted={muted}
        loop={video.loop}
      />
    </div>
  );
}

function PlayBadge() {
  return (
    <span className="absolute inset-0 grid place-items-center">
      <span className="grid size-20 place-items-center rounded-full bg-gold text-night shadow-xl transition group-hover:scale-110">
        <Play className="ml-1 size-8 fill-current" />
      </span>
    </span>
  );
}
