"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookHeart, ExternalLink, FileText, Images, LayoutDashboard, LogOut, Mail, Menu, Newspaper, PlayCircle, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { StarMark } from "@/components/site/logo";
import { logout } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/video", label: "Homepage Video", icon: PlayCircle },
  { href: "/admin/content", label: "Site Content", icon: FileText },
  { href: "/admin/news", label: "News", icon: Newspaper },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/devotions", label: "Devotions", icon: BookHeart },
  { href: "/admin/messages", label: "Messages", icon: Mail, badge: true },
  { href: "/admin/account", label: "Account & Users", icon: UserCog },
];

function NavList({ unread, onNavigate }: { unread: number; onNavigate?: boolean }) {
  const path = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((n) => {
        const active = n.href === "/admin" ? path === "/admin" : path.startsWith(n.href);
        const link = (
          <Link
            href={n.href}
            className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors", active ? "bg-white/12 text-white" : "text-white/70 hover:bg-white/8 hover:text-white")}
          >
            <n.icon className={cn("size-4", active && "text-gold")} />
            <span className="flex-1">{n.label}</span>
            {n.badge && unread > 0 && <Badge variant="gold" className="h-5 min-w-5 rounded-full px-1.5">{unread}</Badge>}
          </Link>
        );
        return onNavigate ? <SheetClose asChild key={n.href}>{link}</SheetClose> : <div key={n.href}>{link}</div>;
      })}
    </nav>
  );
}

function SidebarBody({ unread, user, mobile, logo }: { unread: number; user: { name: string; email: string }; mobile?: boolean; logo?: string }) {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link href="/admin" className="flex items-center gap-2.5 px-2 pt-1">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" className="size-9 rounded-full bg-white object-cover" />
        ) : <StarMark className="size-9" />}
        <div className="leading-tight"><p className="font-display font-semibold text-white">Naledi</p><p className="text-xs text-white/60">Website admin</p></div>
      </Link>
      <NavList unread={unread} onNavigate={mobile} />
      <div className="mt-auto space-y-2 border-t border-white/10 pt-4">
        <Button asChild variant="glass" size="sm" className="w-full justify-start"><a href="/" target="_blank"><ExternalLink /> View website</a></Button>
        <div className="px-2 py-1 text-xs text-white/60"><p className="font-medium text-white/85">{user.name}</p><p className="truncate">{user.email}</p></div>
        <form action={logout}><Button type="submit" variant="ghost" size="sm" className="w-full justify-start text-white/70 hover:bg-white/10 hover:text-white"><LogOut /> Sign out</Button></form>
      </div>
    </div>
  );
}

export function AdminShell({ children, unread, user, logo }: { children: React.ReactNode; unread: number; user: { name: string; email: string }; logo?: string }) {
  return (
    <div className="min-h-screen bg-muted/40 lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="sticky top-0 hidden h-screen bg-night lg:block"><SidebarBody unread={unread} user={user} logo={logo} /></aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-night px-4 text-white lg:hidden">
          <Sheet>
            <SheetTrigger asChild><Button size="icon" variant="ghost" className="hover:bg-white/10 hover:text-white" aria-label="Menu"><Menu /></Button></SheetTrigger>
            <SheetContent side="left" className="w-72 border-0 bg-night p-0 text-white">
              <SheetTitle className="sr-only">Admin menu</SheetTitle>
              <SidebarBody unread={unread} user={user} logo={logo} mobile />
            </SheetContent>
          </Sheet>
          <span className="font-display font-semibold">Naledi admin</span>
        </header>
        <main className="mx-auto w-full max-w-6xl p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export function AdminHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-primary md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
