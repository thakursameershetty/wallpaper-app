import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteNav } from "@/components/studio/SiteNav";
import { Work } from "@/components/studio/Work";
import { Contact } from "@/components/studio/Contact";
import { WORK, slugOf } from "@/components/desk/data";

type Params = { medium?: string[] };

/** The medium a URL names ("digital-arts" → "Digital Arts"), or null for the whole desk. Undefined if there is no such medium. */
function mediumOf(segments?: string[]) {
  if (!segments || segments.length === 0) return null;
  if (segments.length > 1) return undefined;
  return WORK.find((c) => slugOf(c.title) === segments[0])?.title;
}

export function generateStaticParams(): Params[] {
  return [{ medium: [] }, ...WORK.map((c) => ({ medium: [slugOf(c.title)] }))];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const medium = mediumOf((await params).medium);
  if (medium === undefined) return {};
  const title = medium ? `${medium} — Fresh off the desk` : "Fresh off the desk";
  return {
    title,
    description: medium ? `${medium} by Abishek: a few favourites, pinned to the wall.` : "Graphite, charcoal, ink, watercolour and pixels: a few favourites by Abishek, pinned to the wall.",
    alternates: { canonical: medium ? `/desk/${slugOf(medium)}` : "/desk" },
  };
}

export default async function DeskPage({ params }: { params: Promise<Params> }) {
  const medium = mediumOf((await params).medium);
  if (medium === undefined) notFound();

  return (
    <div className="desk studio">
      <SiteNav />
      <main className="pt-16">
        <Work initialFilter={medium ?? undefined} syncUrl>
          <div className="mt-12">
            <Link href="/" className="btn-ghost inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium">
              <ArrowLeft size={16} /> Back home
            </Link>
          </div>
        </Work>
        <Contact />
      </main>
    </div>
  );
}
