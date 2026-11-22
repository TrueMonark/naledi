"use client";
import { useState, useTransition } from "react";
import { Inbox as InboxIcon, Mail, MailOpen, Phone, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDelete } from "@/components/admin/confirm-button";
import { deleteMessage, setMessageRead } from "@/lib/actions/admin";
import { cn } from "@/lib/utils";

type M = { id: string; name: string; email: string; phone: string; subject: string; message: string; read: boolean; createdAt: string };
const fmt = (d: string) => new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function Inbox({ messages }: { messages: M[] }) {
  const [selected, setSelected] = useState<string | null>(messages[0]?.id ?? null);
  const [, start] = useTransition();
  const current = messages.find((m) => m.id === selected) ?? null;

  const open = (m: M) => {
    setSelected(m.id);
    if (!m.read) start(() => { setMessageRead(m.id, true); });
  };

  if (!messages.length) {
    return <Card className="items-center p-12 text-center text-muted-foreground"><InboxIcon className="size-8" /><p>No messages yet. Messages from the Contact page will appear here.</p></Card>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
      <Card className="max-h-[70vh] gap-0 overflow-y-auto py-0">
        {messages.map((m) => (
          <button key={m.id} onClick={() => open(m)} className={cn("flex w-full cursor-pointer flex-col gap-0.5 border-b px-4 py-3 text-left transition last:border-0 hover:bg-muted/60", m.id === selected && "bg-accent")}>
            <span className="flex items-center gap-2">
              {!m.read && <span className="size-2 shrink-0 rounded-full bg-gold" />}
              <span className={cn("flex-1 truncate", !m.read && "font-semibold")}>{m.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
            </span>
            <span className="truncate text-sm">{m.subject || "No subject"}</span>
            <span className="truncate text-xs text-muted-foreground">{m.message}</span>
          </button>
        ))}
      </Card>
      {current && (
        <Card>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{current.subject || "No subject"}</h2>
                <p className="text-sm text-muted-foreground">{current.name} · {fmt(current.createdAt)}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => start(() => { setMessageRead(current.id, !current.read); })}>
                  {current.read ? <><Mail /> Mark unread</> : <><MailOpen /> Mark read</>}
                </Button>
                <ConfirmDelete title="Delete this message?" onConfirm={async () => { const r = await deleteMessage(current.id); setSelected(null); return r; }} />
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <a href={`mailto:${current.email}`} className="flex items-center gap-1.5 text-primary hover:underline"><Mail className="size-4" /> {current.email}</a>
              {current.phone && <a href={`tel:${current.phone}`} className="flex items-center gap-1.5 text-primary hover:underline"><Phone className="size-4" /> {current.phone}</a>}
            </div>
            <p className="rounded-lg bg-muted/60 p-4 leading-relaxed whitespace-pre-line">{current.message}</p>
            <Button asChild><a href={`mailto:${current.email}?subject=${encodeURIComponent("Re: " + (current.subject || "Your enquiry"))}`}><Reply /> Reply by email</a></Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
