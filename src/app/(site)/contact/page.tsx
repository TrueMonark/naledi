import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHero } from "@/components/site/page-hero";
import { getContent } from "@/lib/content";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const [site, pages] = await Promise.all([getContent("site"), getContent("pages")]);
  const items = [
    site.phone && { icon: Phone, label: "Call us", value: [site.phone, site.phoneAlt].filter(Boolean).join(" · "), href: `tel:${site.phone.replace(/\s/g, "")}` },
    site.email && { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
    site.address && { icon: MapPin, label: "Visit", value: site.address },
    site.officeHours && { icon: Clock, label: "Office hours", value: site.officeHours },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[];

  return (
    <>
      <PageHero eyebrow="Contact" title="Get in touch" intro={pages.contactIntro} image={pages.contactImage} />
      <section className="container-page grid gap-10 py-16 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          {items.map((i) => (
            <Card key={i.label} className="gap-0 py-5">
              <CardContent className="flex gap-4">
                <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground"><i.icon className="size-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">{i.label}</p>
                  {i.href ? <a href={i.href} className="font-medium hover:text-primary">{i.value}</a> : <p className="font-medium whitespace-pre-line">{i.value}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
          {site.mapEmbedUrl?.startsWith("https://") && (
            <iframe src={site.mapEmbedUrl} className="aspect-[4/3] w-full rounded-xl border" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Map" />
          )}
        </div>
        <Card>
          <CardContent>
            <h2 className="mb-1 text-2xl font-semibold text-primary">Send us a message</h2>
            <p className="mb-6 text-sm text-muted-foreground">We usually reply within one working day.</p>
            <ContactForm />
          </CardContent>
        </Card>
      </section>
    </>
  );
}
