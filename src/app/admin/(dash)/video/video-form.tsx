"use client";
import { useState, useTransition } from "react";
import { Eye, EyeOff, Link2, Loader2, Save, Upload, MonitorPlay } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaUpload } from "@/components/admin/media-upload";
import { FeatureVideo } from "@/components/site/feature-video";
import { saveVideo } from "@/lib/actions/admin";
import { youtubeId, type VideoConfig } from "@/lib/video";

export function VideoForm({ initial }: { initial: VideoConfig }) {
  const [v, setV] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [pending, start] = useTransition();
  const set = <K extends keyof VideoConfig>(k: K, val: VideoConfig[K]) => setV((p) => ({ ...p, [k]: val }));
  const dirty = JSON.stringify(v) !== JSON.stringify(saved);

  // Each source keeps its own URL so switching tabs doesn't lose what you typed.
  const [urls, setUrls] = useState<Record<string, string>>({ [initial.sourceType]: initial.url });
  const switchSource = (s: string) => { setUrls((u) => ({ ...u, [v.sourceType]: v.url })); setV((p) => ({ ...p, sourceType: s, url: urls[s] ?? "" })); };

  const ytValid = v.sourceType !== "youtube" || !v.url || !!youtubeId(v.url);
  const live = saved.enabled && !!saved.url;

  function submit() {
    start(async () => {
      const r = await saveVideo(v);
      if (r.ok) { setSaved(v); toast.success(r.message); } else toast.error(r.error);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Show on home page
              <Badge variant={live ? "success" : "secondary"}>{live ? <><Eye /> Live</> : <><EyeOff /> Hidden</>}</Badge>
            </CardTitle>
            <CardDescription>Turn this off to hide the video section without deleting anything.</CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex items-center gap-3">
              <Switch checked={v.enabled} onCheckedChange={(c) => set("enabled", c)} />
              <span className="text-sm font-medium">{v.enabled ? "Video section visible" : "Video section hidden"}</span>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>1. Video source</CardTitle>
            <CardDescription>Upload a file, or use a YouTube link (best for long or large videos).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={v.sourceType} onValueChange={switchSource}>
              <TabsList className="w-full">
                <TabsTrigger value="upload" className="flex-1"><Upload /> Upload</TabsTrigger>
                <TabsTrigger value="youtube" className="flex-1"><MonitorPlay /> YouTube</TabsTrigger>
                <TabsTrigger value="url" className="flex-1"><Link2 /> Link</TabsTrigger>
              </TabsList>
            </Tabs>
            {v.sourceType === "upload" && (
              <>
                <MediaUpload kind="video" value={v.url} onChange={(u) => set("url", u)} label="Upload a video (MP4 recommended)" />
                <p className="text-xs text-muted-foreground">MP4 (H.264) plays on every phone and browser. Keep files under ~200 MB; for longer videos use YouTube.</p>
              </>
            )}
            {v.sourceType === "youtube" && (
              <div className="grid gap-2">
                <Label htmlFor="yt">YouTube link</Label>
                <Input id="yt" placeholder="https://www.youtube.com/watch?v=…" value={v.url} onChange={(e) => set("url", e.target.value)} aria-invalid={!ytValid} />
                {!ytValid && <p className="text-sm text-destructive">That doesn&apos;t look like a YouTube video link.</p>}
              </div>
            )}
            {v.sourceType === "url" && (
              <div className="grid gap-2">
                <Label htmlFor="vurl">Direct video link (.mp4)</Label>
                <Input id="vurl" placeholder="https://…/video.mp4" value={v.url} onChange={(e) => set("url", e.target.value)} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>2. Title & caption</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2"><Label htmlFor="vt">Section heading</Label><Input id="vt" value={v.title} onChange={(e) => set("title", e.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="vc">Caption (optional)</Label><Textarea id="vc" rows={3} value={v.caption} onChange={(e) => set("caption", e.target.value)} placeholder="A short line about the video" /></div>
            <div className="grid gap-2">
              <Label>Cover image (optional)</Label>
              <MediaUpload kind="image" value={v.poster} onChange={(u) => set("poster", u)} label="Upload a cover image" />
              <p className="text-xs text-muted-foreground">Shown before the video plays. YouTube videos use their own thumbnail if empty.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>3. Playback</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Toggle label="Autoplay" hint="Starts playing automatically (browsers require it to be muted)." checked={v.autoplay} onChange={(c) => setV((p) => ({ ...p, autoplay: c, muted: c ? true : p.muted }))} />
            <Toggle label="Start muted" hint="Visitors can unmute with the controls." checked={v.autoplay || v.muted} disabled={v.autoplay} onChange={(c) => set("muted", c)} />
            <Toggle label="Loop" hint="Restart when the video ends." checked={v.loop} onChange={(c) => set("loop", c)} />
          </CardContent>
        </Card>
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>How the section will look on the home page.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="starfield rounded-xl p-5 text-center text-white">
              <p className="text-xs font-semibold tracking-widest text-gold uppercase">Watch</p>
              <h3 className="mt-1 text-xl font-semibold">{v.title || "Untitled"}</h3>
              {v.caption && <p className="mt-1 text-sm text-white/75">{v.caption}</p>}
              <div className="mt-4 text-left">
                {v.url && ytValid ? <FeatureVideo key={v.url + v.sourceType} video={{ ...v, autoplay: false }} /> : (
                  <div className="grid aspect-video place-items-center rounded-2xl border border-dashed border-white/25 text-sm text-white/60">No video selected yet</div>
                )}
              </div>
              {!v.enabled && <p className="mt-3 text-xs text-white/60">Hidden — switch on “Show on home page” to publish.</p>}
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">{dirty ? "You have unsaved changes" : "All changes saved"}</span>
              <Button size="lg" onClick={submit} disabled={pending || !dirty || !ytValid}>{pending ? <Loader2 className="animate-spin" /> : <Save />} Save video</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Toggle({ label, hint, checked, onChange, disabled }: { label: string; hint: string; checked: boolean; onChange: (c: boolean) => void; disabled?: boolean }) {
  return (
    <label className="flex items-start justify-between gap-4">
      <span><span className="block text-sm font-medium">{label}</span><span className="text-xs text-muted-foreground">{hint}</span></span>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </label>
  );
}
