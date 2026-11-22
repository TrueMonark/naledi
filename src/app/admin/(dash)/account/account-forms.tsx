"use client";
import { useState, useTransition } from "react";
import { KeyRound, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDelete } from "@/components/admin/confirm-button";
import { changePassword, createUser, deleteUser } from "@/lib/actions/admin";

type U = { id: string; name: string; email: string; createdAt: string };

export function AccountForms({ meId, users }: { meId: string; users: U[] }) {
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [nu, setNu] = useState({ name: "", email: "", password: "" });
  const [p1, s1] = useTransition();
  const [p2, s2] = useTransition();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><KeyRound className="size-5" /> Change password</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={(e) => {
            e.preventDefault();
            if (pw.next !== pw.confirm) return toast.error("New passwords don't match.");
            s1(async () => { const r = await changePassword(pw.current, pw.next); if (r.ok) { toast.success(r.message); setPw({ current: "", next: "", confirm: "" }); } else toast.error(r.error); });
          }}>
            <div className="grid gap-2"><Label htmlFor="cp">Current password</Label><Input id="cp" type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required /></div>
            <div className="grid gap-2"><Label htmlFor="np">New password</Label><Input id="np" type="password" autoComplete="new-password" minLength={8} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required /></div>
            <div className="grid gap-2"><Label htmlFor="np2">Confirm new password</Label><Input id="np2" type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required /></div>
            <Button type="submit" disabled={p1} className="w-fit">{p1 && <Loader2 className="animate-spin" />} Update password</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Admin users</CardTitle><CardDescription>Everyone here can edit the whole website.</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <ul className="divide-y rounded-lg border">
            {users.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0"><p className="truncate font-medium">{u.name} {u.id === meId && <Badge variant="secondary" className="ml-1">You</Badge>}</p><p className="truncate text-sm text-muted-foreground">{u.email}</p></div>
                {u.id !== meId && <ConfirmDelete iconOnly title={`Remove ${u.name}?`} description="They will no longer be able to sign in." onConfirm={() => deleteUser(u.id)} />}
              </li>
            ))}
          </ul>
          <form className="grid gap-3 rounded-lg border border-dashed p-4" onSubmit={(e) => {
            e.preventDefault();
            s2(async () => { const r = await createUser(nu); if (r.ok) { toast.success(r.message); setNu({ name: "", email: "", password: "" }); } else toast.error(r.error); });
          }}>
            <p className="flex items-center gap-2 text-sm font-medium"><UserPlus className="size-4" /> Add an admin</p>
            <Input placeholder="Full name" value={nu.name} onChange={(e) => setNu({ ...nu, name: e.target.value })} required />
            <Input placeholder="Email" type="email" value={nu.email} onChange={(e) => setNu({ ...nu, email: e.target.value })} required />
            <Input placeholder="Temporary password (8+ characters)" type="password" autoComplete="new-password" value={nu.password} onChange={(e) => setNu({ ...nu, password: e.target.value })} required minLength={8} />
            <Button type="submit" variant="outline" disabled={p2} className="w-fit">{p2 && <Loader2 className="animate-spin" />} Add user</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
