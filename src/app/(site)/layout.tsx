import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { getContent } from "@/lib/content";

// Content is edited live from the admin panel, so render on each request.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const site = await getContent("site");
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader name={site.shortName || site.schoolName} logo={site.logo} phone={site.phone} email={site.email} />
      <main className="flex-1">{children}</main>
      <SiteFooter site={site} />
    </div>
  );
}
