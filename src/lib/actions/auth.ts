"use server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/session";

export type LoginState = { error: string; email: string } | null;

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/admin");
  if (!email || !password) return { error: "Enter your email and password.", email };

  let user;
  try {
    user = await prisma.user.findUnique({ where: { email } });
  } catch {
    return { error: "Can't reach the database right now. Please try again shortly.", email };
  }
  if (!user || !(await bcrypt.compare(password, user.password))) return { error: "Incorrect email or password.", email };

  const token = await signSession({ sub: user.id, email: user.email, name: user.name, role: user.role });
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}
