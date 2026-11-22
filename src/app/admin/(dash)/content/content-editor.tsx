"use client";
import { useState, useTransition } from "react";
import { ExternalLink, Loader2, Save, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MediaUpload } from "@/components/admin/media-upload";
import { saveContent } from "@/lib/actions/admin";
import type { PageDef, ContentMap, FieldDef } from "@/lib/content-schema";

const VIEW_LINK: Record<string, string> = { site: "/contact", hero: "/", home: "/", about: "/about", admissions: "/admissions", pages: "/gallery" };

export function ContentEditor({ schema, values, initialTab }: { schema: PageDef[]; values: Record<string, ContentMap>; initialTab: string }) {
  const [tab, setTab] = useState(schema.some((s) => s.page === initialTab) ? initialTab : schema[0].page);
  const [data, setData] = useState(values);
  const [saved, setSaved] = useState(values);
  const [pending, start] = useTransition();
  const page = schema.find((p) => p.page === tab)!;
  const dirtyPages = schema.filter((p) => JSON.stringify(data[p.page]) !== JSON.stringify(saved[p.page])).map((p) => p.page);
  const dirty = dirtyPages.includes(tab);

  const change = (section: string, value: string) => setData((d) => ({ ...d, [tab]: { ...d[tab], [section]: value } }));
  const save = () => start(async () => {
    const r = await saveContent(tab, data[tab]);
    if (r.ok) { setSaved((s) => ({ ...s, [tab]: data[tab] })); toast.success(r.message); } else toast.error(r.error);
  });

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[220px_1fr]">
      {/* Section picker: dropdown on mobile, list on desktop */}
      <div className="lg:hidden">
        <Select value={tab} onValueChange={setTab}>
          <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
          <SelectContent>{schema.map((p) => <SelectItem key={p.page} value={p.page}>{p.title}{dirtyPages.includes(p.page) ? " •" : ""}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <nav className="hidden flex-col gap-1 lg:flex">
        {schema.map((p) => (
          <button
            key={p.page}
            onClick={() => setTab(p.page)}
            className={`flex items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium transition cursor-pointer ${p.page === tab ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            {p.title}
            {dirtyPages.includes(p.page) && <span className="size-2 rounded-full bg-gold" title="Unsaved changes" />}
          </button>
        ))}
      </nav>

      <Card className="min-w-0">
        <CardHeader className="border-b pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-xl">{page.title}</CardTitle>
              <CardDescription>{page.description}</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm"><a href={VIEW_LINK[tab] ?? "/"} target="_blank" rel="noreferrer"><ExternalLink /> View page</a></Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          {page.fields.map((f) => (
            <Field key={f.section} field={f} value={data[tab]?.[f.section] ?? ""} onChange={(v) => change(f.section, v)} />
          ))}
        </CardContent>
        <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-3 rounded-b-xl border-t bg-card/95 px-6 py-4 backdrop-blur">
          {dirty && <span className="mr-auto text-sm text-muted-foreground">Unsaved changes</span>}
          <Button variant="ghost" disabled={!dirty || pending} onClick={() => setData((d) => ({ ...d, [tab]: saved[tab] }))}><Undo2 /> Discard</Button>
          <Button onClick={save} disabled={!dirty || pending}>{pending ? <Loader2 className="animate-spin" /> : <Save />} Save {page.title.toLowerCase()}</Button>
        </div>
      </Card>
    </div>
  );
}

function Field({ field, value, onChange }: { field: FieldDef; value: string; onChange: (v: string) => void }) {
  const id = `f-${field.section}`;
  const wide = field.type !== "text";
  return (
    <div className={`grid content-start gap-2 ${wide ? "md:col-span-2" : ""}`}>
      <Label htmlFor={id}>{field.label}</Label>
      {field.type === "text" && <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} />}
      {field.type === "textarea" && <Textarea id={id} rows={4} value={value} onChange={(e) => onChange(e.target.value)} />}
      {field.type === "list" && <Textarea id={id} rows={Math.max(4, value.split("\n").length + 1)} value={value} onChange={(e) => onChange(e.target.value)} className="font-mono text-sm" />}
      {field.type === "image" && <div className="max-w-md"><MediaUpload kind="image" value={value} onChange={onChange} /></div>}
      {field.type === "file" && <div className="max-w-md"><MediaUpload kind="pdf" value={value} onChange={onChange} /></div>}
      {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
    </div>
  );
}
