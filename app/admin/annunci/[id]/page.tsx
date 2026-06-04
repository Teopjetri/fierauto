import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ListingEditor } from "@/components/admin/ListingEditor";
import { getListingById } from "@/lib/listings/store";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingById(id);
  return { title: listing ? `${listing.brand} ${listing.model}` : "Annuncio" };
}

export default async function EditListingPage({ params }: PageProps) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) notFound();
  return (
    <section className="py-28 md:py-36 min-h-screen border-t border-border">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 md:px-8">
        <Link
          href="/admin/annunci"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase text-muted hover:text-champagne transition-colors mb-10 font-display"
        >
          <ChevronLeft size={14} />
          Annunci
        </Link>
        <h1 className="font-display text-3xl font-light mb-2">Modifica annuncio</h1>
        <p className="text-muted text-sm mb-10">
          {listing.brand} {listing.model}
        </p>
        <ListingEditor mode="edit" listing={listing} />
      </div>
    </section>
  );
}
