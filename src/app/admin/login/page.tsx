import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { StarMark } from "@/components/site/logo";
import { LoginForm } from "./login-form";
import { getContent } from "@/lib/content";

export const metadata = { title: "Staff login" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getCurrentUser().catch(() => null)) redirect("/admin");
  const [{ next }, site] = await Promise.all([searchParams, getContent("site")]);
  return (
    <main className="starfield flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          {site.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={site.logo} alt="" className="mb-3 size-14 rounded-full object-cover" />
          ) : <StarMark className="mb-3 size-14" />}
          <h1 className="text-2xl font-semibold text-primary">Naledi admin</h1>
          <p className="text-sm text-muted-foreground">Sign in to manage the school website</p>
        </div>
        <LoginForm next={next ?? "/admin"} />
      </div>
    </main>
  );
}
