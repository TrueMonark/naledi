import { cn } from "@/lib/utils";

export function PageHero({ title, intro, image, eyebrow }: { title: string; intro?: string; image?: string; eyebrow?: string }) {
  return (
    <section className={cn("relative isolate overflow-hidden text-white", !image && "starfield")}>
      {image && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="absolute inset-0 -z-10 size-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-night/90 via-night/70 to-night/40" />
        </>
      )}
      <div className="container-page py-16 md:py-24">
        {eyebrow && <p className="mb-3 text-sm font-semibold tracking-widest text-gold uppercase">{eyebrow}</p>}
        <h1 className="max-w-3xl text-4xl font-semibold md:text-5xl">{title}</h1>
        {intro && <p className="mt-4 max-w-2xl text-lg text-white/80">{intro}</p>}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, intro, center }: { eyebrow?: string; title: string; intro?: string; center?: boolean }) {
  return (
    <div className={cn("mb-10 max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow && <p className="mb-2 text-sm font-semibold tracking-widest text-secondary-foreground/70 uppercase">{eyebrow}</p>}
      <h2 className="text-3xl font-semibold text-primary md:text-4xl">{title}</h2>
      {intro && <p className="mt-3 text-muted-foreground">{intro}</p>}
    </div>
  );
}

export function EmptyState({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-xl border border-dashed p-10 text-center">
      <div className="mb-3 grid size-12 place-items-center rounded-full bg-accent text-primary">{icon}</div>
      <h3 className="font-sans text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
