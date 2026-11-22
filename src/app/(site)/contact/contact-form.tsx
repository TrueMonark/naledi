"use client";
import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendContact, type ContactState } from "./actions";

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok) ref.current?.reset(); }, [state]);
  const err = (k: string) => state?.errors?.[k];

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-10 text-center">
        <CheckCircle2 className="size-12 text-emerald-600" />
        <p className="font-medium text-emerald-900">{state.message}</p>
        <Button variant="outline" onClick={() => location.reload()}>Send another message</Button>
      </div>
    );
  }

  return (
    <form ref={ref} action={action} className="grid gap-4 sm:grid-cols-2" noValidate>
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
      <Field label="Full name" name="name" error={err("name")} required />
      <Field label="Email" name="email" type="email" error={err("email")} required />
      <Field label="Phone (optional)" name="phone" type="tel" error={err("phone")} />
      <Field label="Subject" name="subject" error={err("subject")} placeholder="e.g. Grade 8 admission" />
      <div className="grid gap-2 sm:col-span-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" rows={6} required aria-invalid={!!err("message")} />
        {err("message") && <p className="text-sm text-destructive">{err("message")}</p>}
      </div>
      {state && !state.ok && <p className="text-sm text-destructive sm:col-span-2">{state.message}</p>}
      <div className="sm:col-span-2">
        <Button type="submit" size="lg" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : <Send />} Send message</Button>
      </div>
    </form>
  );
}

function Field({ label, name, error, ...rest }: { label: string; name: string; error?: string } & React.ComponentProps<"input">) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} aria-invalid={!!error} {...rest} />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
