"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Logo } from "@/components/site/logo";
import { NAV_LINKS } from "@/components/site/nav-links";
import { cn } from "@/lib/utils";

export function SiteHeader({ name, logo, phone, email }: { name: string; logo: string; phone: string; email: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40">
      {(phone || email) && (
        <div className="bg-night text-white/80 hidden text-xs sm:block">
          <div className="container-page flex h-8 items-center justify-end gap-6">
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:text-white">
                <Phone className="size-3" /> {phone}
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="flex items-center gap-1.5 hover:text-white">
                <Mail className="size-3" /> {email}
              </a>
            )}
          </div>
        </div>
      )}
      <div className={cn("border-b bg-background/90 backdrop-blur transition-shadow", scrolled && "shadow-sm")}>
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link href="/" aria-label={`${name} home`}>
            <Logo src={logo} name={name} />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive(l.href) ? "text-primary bg-accent" : "text-foreground/75"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="gold" className="hidden sm:inline-flex">
              <Link href="/admissions">Apply now</Link>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="p-6">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <Logo src={logo} name={name} />
                <nav className="mt-4 flex flex-col gap-1" aria-label="Mobile">
                  {NAV_LINKS.map((l) => (
                    <SheetClose asChild key={l.href}>
                      <Link
                        href={l.href}
                        className={cn("rounded-md px-3 py-2.5 text-base font-medium", isActive(l.href) ? "bg-accent text-primary" : "hover:bg-muted")}
                      >
                        {l.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                <SheetClose asChild>
                  <Button asChild variant="gold" className="mt-2">
                    <Link href="/admissions">Apply now</Link>
                  </Button>
                </SheetClose>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
