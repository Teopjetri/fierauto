import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ListingImageGallery } from "@/components/listings/ListingImageGallery";
import { sortImages, type Listing } from "@/lib/listings/types";
import { cn } from "@/lib/utils";

const SPEC_ROWS = [
  { label: "Anno", key: "year" as const },
  { label: "Potenza CV", key: "powerCv" as const },
  { label: "Alimentazione", key: "fuel" as const },
  { label: "Chilometri", key: "mileage" as const },
] as const;

function formatSpecValue(key: (typeof SPEC_ROWS)[number]["key"], value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (key === "powerCv" && !/cv/i.test(trimmed)) return `${trimmed} CV`;
  if (key === "mileage" && !/km/i.test(trimmed)) return `${trimmed} km`;
  return trimmed;
}

export function ListingDetailView({ listing }: { listing: Listing }) {
  const images = sortImages(listing.images);
  const title = [listing.brand, listing.model].map((part) => part?.trim()).filter(Boolean).join(" ");
  const version = listing.version?.trim() ?? "";
  const imageAlt = title || "Veicolo";
  const specs = SPEC_ROWS.map(({ label, key }) => ({
    label,
    value: formatSpecValue(key, listing[key] ?? ""),
  })).filter((row) => row.value);

  if (images.length === 0) return null;

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

      <ListingImageGallery images={images} alt={imageAlt} />

      <div className="max-w-4xl mx-auto px-6 sm:px-10 md:px-14 py-14 md:py-20 space-y-10 md:space-y-12">
        <header>
          {title && (
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light tracking-[-0.03em] text-white/92">
              {title}
            </h1>
          )}
          {version && (
            <p className="mt-4 md:mt-5 text-white/55 font-light text-lg md:text-xl tracking-[-0.02em]">
              {version}
            </p>
          )}
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
    </div>
  );
}
