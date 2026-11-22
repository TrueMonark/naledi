import type { Metadata } from "next";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: { default: "Naledi Day and Boarding School", template: "%s · Naledi School" },
  description: "Naledi Day and Boarding School — nurturing excellence, building future leaders.",
  metadataBase: new URL(process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://naledischool.org"),
  openGraph: { siteName: "Naledi Day and Boarding School", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
