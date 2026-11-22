import { AdminHeader } from "@/components/admin/admin-shell";
import { getAllContent } from "@/lib/content";
import { CONTENT_SCHEMA } from "@/lib/content-schema";
import { ContentEditor } from "./content-editor";

export default async function ContentAdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [values, { tab }] = await Promise.all([getAllContent(), searchParams]);
  return (
    <>
      <AdminHeader title="Site content" description="Edit the text and photos on each page. Changes go live as soon as you save." />
      <ContentEditor schema={CONTENT_SCHEMA} values={values} initialTab={tab ?? CONTENT_SCHEMA[0].page} />
    </>
  );
}
