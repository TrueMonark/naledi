"use client";
import { useActionState } from "react";
import Link from "next/link";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/actions/auth";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="next" value={next} />
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required autoFocus={!state} defaultValue={state?.email} key={state?.email} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required autoFocus={!!state} />
      </div>
      {state?.error && <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>}
      <Button type="submit" size="lg" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : <LogIn />} Sign in</Button>
      <Link href="/" className="text-center text-sm text-muted-foreground hover:text-foreground">← Back to website</Link>
    </form>
  );
}
