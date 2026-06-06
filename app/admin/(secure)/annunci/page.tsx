import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ListingsManager } from "@/components/admin/ListingsManager";
import { getAllListings } from "@/lib/listings/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Annunci",
  robots: { index: false, follow: false },
};

export default async function AdminAnnunciPage() {
  const listings = await getAllListings();

  return (
    <section className="py-28 md:py-36 min-h-screen border-t border-border">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 md:px-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase text-muted hover:text-champagne transition-colors mb-10 font-display"
        >
          <ChevronLeft size={14} />
          Pannello
        </Link>

        <span className="font-display text-[10px] tracking-[0.35em] uppercase text-champagne mb-3 block">
          Gestione
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-light tracking-[-0.02em] mb-3">
          Annunci auto
        </h1>
        <p className="text-muted font-light text-sm mb-12">
          Crea annunci una sola volta: compaiono automaticamente in homepage con layout editoriale.
        </p>

        <ListingsManager initialListings={listings} />
      </div>
    </section>
  );
}
