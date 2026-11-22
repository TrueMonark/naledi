import Link from "next/link";
import { Mail, MapPin, Phone, Clock, ExternalLink } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { NAV_LINKS } from "@/components/site/nav-links";
import type { ContentMap } from "@/lib/content-schema";

export function SiteFooter({ site }: { site: ContentMap }) {
  const LABELS = { facebook: "Facebook", instagram: "Instagram", youtube: "YouTube", tiktok: "TikTok" } as const;
  const socials = (Object.keys(LABELS) as (keyof typeof LABELS)[]).filter((k) => site[k]);
  return (
    <footer className="starfield text-white/80">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1.2fr]">
        <div className="space-y-4">
          <Logo src={site.logo} name={site.schoolName} light />
          <p className="max-w-sm text-sm leading-relaxed">{site.motto}</p>
          {socials.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {socials.map((s) => (
                <a key={s} href={site[s]} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-xs transition hover:bg-white/10 hover:text-white">
                  {LABELS[s]} <ExternalLink className="size-3" />
                </a>
              ))}
            </div>
          )}
        </div>
        <div>
          <h3 className="mb-4 font-sans text-sm font-semibold tracking-wider text-gold uppercase">Explore</h3>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}><Link href={l.href} className="hover:text-white">{l.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 font-sans text-sm font-semibold tracking-wider text-gold uppercase">Get in touch</h3>
          <ul className="space-y-3 text-sm">
            {site.address && <li className="flex gap-2.5"><MapPin className="mt-0.5 size-4 shrink-0 text-gold" /><span className="whitespace-pre-line">{site.address}</span></li>}
            {site.phone && <li className="flex gap-2.5"><Phone className="mt-0.5 size-4 shrink-0 text-gold" /><a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-white">{site.phone}</a></li>}
            {site.phoneAlt && <li className="flex gap-2.5"><Phone className="mt-0.5 size-4 shrink-0 text-gold" /><a href={`tel:${site.phoneAlt.replace(/\s/g, "")}`} className="hover:text-white">{site.phoneAlt}</a></li>}
            {site.email && <li className="flex gap-2.5"><Mail className="mt-0.5 size-4 shrink-0 text-gold" /><a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a></li>}
            {site.officeHours && <li className="flex gap-2.5"><Clock className="mt-0.5 size-4 shrink-0 text-gold" />{site.officeHours}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/55 sm:flex-row">
          <p>© {new Date().getFullYear()} {site.schoolName}. All rights reserved.</p>
          <Link href="/admin" className="hover:text-white">Staff login</Link>
        </div>
      </div>
    </footer>
  );
}
