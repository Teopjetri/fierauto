import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { CarMediaManager } from "@/components/admin/CarMediaManager";
import { getCarBySlug } from "@/lib/data/cars";
import { readCarMedia } from "@/lib/media/carMediaStore";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const car = getCarBySlug(slug);
  return {
    title: car ? `Foto · ${car.model}` : "Gestione Foto",
    robots: { index: false, follow: false },
  };
}

export default async function CarMediaAdminPage({ params }: PageProps) {
  const { slug } = await params;
  const car = getCarBySlug(slug);
  if (!car) notFound();

  const manifest = await readCarMedia(slug);

  return (
    <section className="py-28 md:py-36 min-h-screen border-t border-border">
      <div className="max-w-5xl mx-auto px-5 sm:px-6 md:px-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase text-muted hover:text-champagne transition-colors mb-10 font-display"
        >
          <ChevronLeft size={14} />
          Tutte le vetture
        </Link>

        <span className="font-display text-[10px] tracking-[0.35em] uppercase text-champagne mb-3 block">
          {car.brand} · {car.year}
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-light tracking-[-0.02em] mb-3">
          {car.model}
        </h1>
        <p className="text-muted font-light text-sm mb-12">
          Hero principale + galleria dinamica · Drag &amp; drop · Preview live
        </p>

        <CarMediaManager
          slug={slug}
          carLabel={car.model}
          initialManifest={manifest}
        />
      </div>
    </section>
  );
}
