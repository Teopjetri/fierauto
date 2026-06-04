import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DETAIL_PHOTO_ASPECT, sortImages, type Listing } from "@/lib/listings/types";
import { cn } from "@/lib/utils";

const SPEC_ROWS = [
  { label: "Anno", key: "year" as const },
  { label: "Chilometri", key: "mileage" as const },
  { label: "Carburante", key: "fuel" as const },
];

export function ListingDetailView({ listing }: { listing: Listing }) {
  const images = sortImages(listing.images);
  const [hero, ...gallery] = images;
  const specs = SPEC_ROWS.map(({ label, key }) => ({
    label,
    value: listing[key]?.trim() ?? "",
  })).filter((row) => row.value);

  if (!hero) return null;

  return (
    <div className="min-h-screen bg-[#030304]">
      <div className="px-6 sm:px-10 md:px-14 pt-28 pb-8">
        <Link
          href="/#vetture"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.28em] uppercase text-muted hover:text-champagne transition-colors font-display"
        >
          <ArrowLeft size={14} />
          Torna alle vetture
        </Link>
      </div>

      <div className="relative w-full aspect-[4/3] max-h-[min(82vh,920px)] bg-[#070708]">
        <Image
          src={hero.src}
          alt={`${listing.brand} ${listing.model}`.trim()}
          fill
          priority
          sizes="100vw"
          className="object-contain"
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-10 md:px-14 py-14 md:py-20 space-y-10 md:space-y-12">
        <header>
          {listing.brand && (
            <p className="font-display text-[10px] tracking-[0.45em] uppercase text-champagne mb-5 md:mb-6">
              {listing.brand}
            </p>
          )}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light tracking-[-0.03em] text-white/92">
            {listing.model}
          </h1>
        </header>

        {listing.description && (
          <p className="text-white/45 font-light leading-[1.85] text-base md:text-lg max-w-2xl">
            {listing.description}
          </p>
        )}

        {specs.length > 0 && (
          <div className="max-w-xl border border-white/[0.08]">
            <table className="w-full text-sm md:text-base">
              <tbody>
                {specs.map((row, i) => (
                  <tr
                    key={row.label}
                    className={cn(i > 0 && "border-t border-white/[0.08]")}
                  >
                    <th
                      scope="row"
                      className="font-display font-normal text-left text-white/45 tracking-[0.08em] px-5 py-4 md:px-6 md:py-5 w-[42%]"
                    >
                      {row.label}
                    </th>
                    <td className="text-white/80 font-light px-5 py-4 md:px-6 md:py-5">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {listing.price?.trim() && (
          <div className="max-w-xs border border-white/[0.08] px-6 py-6 md:px-8 md:py-7">
            <p className="font-display text-[10px] tracking-[0.38em] uppercase text-champagne mb-3">
              Prezzo
            </p>
            <p className="font-display text-2xl md:text-3xl font-light text-white/90 tracking-wide">
              {listing.price.trim()}
            </p>
          </div>
        )}
      </div>

      {gallery.length > 0 && (
        <div className="space-y-1 pb-24">
          {gallery.map((img) => (
            <div
              key={img.id}
              className={cn("relative w-full bg-[#070708]", DETAIL_PHOTO_ASPECT, "max-h-[75vh]")}
            >
              <Image src={img.src} alt="" fill sizes="100vw" className="object-contain" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
