import Link from "next/link";
import { ArrowRight, BookHeart, FileText, Images, Mail, Newspaper, PlayCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminHeader } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function Dashboard() {
  const [posts, photos, devotions, unread, video, recent] = await Promise.all([
    prisma.blogPost.count(),
    prisma.galleryImage.count(),
    prisma.devotion.count(),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.videoSetting.findUnique({ where: { id: "homepage" } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  const stats = [
    { label: "News posts", value: posts, icon: Newspaper, href: "/admin/news" },
    { label: "Gallery photos", value: photos, icon: Images, href: "/admin/gallery" },
    { label: "Devotions", value: devotions, icon: BookHeart, href: "/admin/devotions" },
    { label: "Unread messages", value: unread, icon: Mail, href: "/admin/messages" },
  ];
  const videoLive = !!(video?.enabled && video.url);

  return (
    <>
      <AdminHeader title="Dashboard" description="Everything on the website, in one place." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="gap-2 py-5 transition hover:shadow-md">
              <CardContent className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">{s.label}</p><p className="font-display text-3xl font-semibold text-primary">{s.value}</p></div>
                <div className="grid size-11 place-items-center rounded-lg bg-accent text-primary"><s.icon className="size-5" /></div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PlayCircle className="size-5 text-primary" /> Homepage video</CardTitle>
            <CardDescription>{videoLive ? `“${video!.title}” is showing on the home page.` : "No video is showing on the home page yet."}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-3">
            <Badge variant={videoLive ? "success" : "secondary"}>{videoLive ? "Live" : "Hidden"}</Badge>
            <Button asChild><Link href="/admin/video">Manage video <ArrowRight /></Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Common updates</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            <Button asChild variant="outline" className="justify-start"><Link href="/admin/news?new=1"><Newspaper /> Write a news post</Link></Button>
            <Button asChild variant="outline" className="justify-start"><Link href="/admin/gallery"><Images /> Add photos</Link></Button>
            <Button asChild variant="outline" className="justify-start"><Link href="/admin/devotions?new=1"><BookHeart /> Add a devotion</Link></Button>
            <Button asChild variant="outline" className="justify-start"><Link href="/admin/content"><FileText /> Edit page text & photos</Link></Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Recent messages</CardTitle><CardDescription>From the website contact form</CardDescription></CardHeader>
        <CardContent>
          {recent.length === 0 ? <p className="text-sm text-muted-foreground">No messages yet.</p> : (
            <ul className="divide-y">
              {recent.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{!m.read && <span className="mr-2 inline-block size-2 rounded-full bg-gold" />}{m.name} <span className="font-normal text-muted-foreground">· {m.subject || "No subject"}</span></p>
                    <p className="truncate text-sm text-muted-foreground">{m.message}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDate(m.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
          <Button asChild variant="link" className="mt-2 px-0"><Link href="/admin/messages">Open inbox <ArrowRight /></Link></Button>
        </CardContent>
      </Card>
    </>
  );
}
