"use server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email"),
  phone: z.string().trim().max(30).optional().default(""),
  subject: z.string().trim().max(150).optional().default(""),
  message: z.string().trim().min(10, "Message should be at least 10 characters").max(5000),
  website: z.string().optional(), // honeypot
});

export type ContactState = { ok: boolean; message: string; errors?: Record<string, string> } | null;

export async function sendContact(_: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { ok: false, message: "Please check the highlighted fields.", errors };
  }
  const { website, ...data } = parsed.data;
  if (website) return { ok: true, message: "Thank you! We'll be in touch soon." }; // bot

  try {
    await prisma.contactMessage.create({ data });
  } catch (e) {
    console.error("[contact] save failed", e);
    return { ok: false, message: "Sorry, we couldn't send your message right now. Please call or email us instead." };
  }

  // Optional email notification
  if (process.env.SMTP_HOST && process.env.CONTACT_NOTIFY_EMAIL) {
    try {
      const nodemailer = await import("nodemailer");
      const t = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      });
      await t.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.CONTACT_NOTIFY_EMAIL,
        replyTo: data.email,
        subject: `Website enquiry: ${data.subject || "New message"} — ${data.name}`,
        text: `${data.message}\n\n— ${data.name}\n${data.email}\n${data.phone}`,
      });
    } catch (e) {
      console.error("[contact] email notification failed (message still saved)", e);
    }
  }
  return { ok: true, message: "Thank you! Your message has been sent — we'll get back to you soon." };
}
