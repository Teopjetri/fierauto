import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingDetailView } from "@/components/listings/ListingDetailView";
import { getListingBySlug, getPublishedListings } from "@/lib/listings/store";
import { normalizeStatus } from "@/lib/listings/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const listings = await getPublishedListings();
  return listings.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return { title: "Veicolo non trovato" };
  return { title: `${listing.brand} ${listing.model}` };
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing || normalizeStatus(listing) !== "published") notFound();

  return <ListingDetailView listing={listing} />;
}
