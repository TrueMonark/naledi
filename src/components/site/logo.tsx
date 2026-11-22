import { cn } from "@/lib/utils";

/** Eight-point star emblem ("Naledi" means star). Used when no logo has been uploaded. */
export function StarMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={cn("size-10", className)}>
      <circle cx="24" cy="24" r="23" fill="var(--night)" />
      <path d="M24 6l3.6 12.1L39.6 14l-7.2 10 7.2 10-12-4.1L24 42l-3.6-12.1L8.4 34l7.2-10-7.2-10 12 4.1z" fill="var(--gold)" />
      <circle cx="24" cy="24" r="4" fill="var(--night)" />
    </svg>
  );
}

export function Logo({ src, name, className, light }: { src?: string; name: string; className?: string; light?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-10 rounded-full object-cover" />
      ) : (
        <StarMark />
      )}
      <span className={cn("font-display text-lg leading-tight font-semibold", light ? "text-white" : "text-primary")}>{name}</span>
    </span>
  );
}
