import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StarMark } from "@/components/site/logo";

export default function NotFound() {
  return (
    <main className="starfield flex min-h-screen flex-col items-center justify-center gap-5 p-6 text-center text-white">
      <StarMark className="size-16" />
      <h1 className="text-5xl font-semibold">Page not found</h1>
      <p className="max-w-md text-white/75">The page you&apos;re looking for has moved or doesn&apos;t exist.</p>
      <Button asChild variant="gold" size="lg"><Link href="/">Back to home</Link></Button>
    </main>
  );
}
