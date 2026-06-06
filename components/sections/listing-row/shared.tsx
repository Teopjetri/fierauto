"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { coverImage, homeCropSrc, type Listing } from "@/lib/listings/types";
import { formatPrice, cn } from "@/lib/utils";

export function formatListingPrice(price: string): string {
  const trimmed = price.trim();
  if (!trimmed) return "";
  if (trimmed.includes("€")) return trimmed;
  const num = Number(trimmed.replace(/\./g, "").replace(",", "."));
  if (!Number.isNaN(num)) return formatPrice(num);
  return trimmed;
}

export function formatListingMileage(mileage: string): string {
  const trimmed = mileage.trim();
  if (!trimmed) return "";
  if (/km/i.test(trimmed)) return trimmed;
  return `${trimmed} km`;
}

export function ListingStory({ listing }: { listing: Listing }) {
  const metaItems = [
    listing.year?.trim(),
    listing.mileage?.trim() ? formatListingMileage(listing.mileage) : null,
    listing.fuel?.trim(),
  ].filter(Boolean) as string[];

  return (
    <div className="listing-card-story">
      {listing.brand && (
        <p className="listing-card-story__brand">{listing.brand}</p>
      )}

      {listing.model && (
        <h3 className="listing-card-story__model">{listing.model}</h3>
      )}

      {listing.version?.trim() && (
        <p className="listing-card-story__version">{listing.version.trim()}</p>
      )}

      {listing.description && (
        <p className="listing-card-story__description">{listing.description}</p>
      )}

      {metaItems.length > 0 && (
        <div className="listing-card-story__meta">
          {metaItems.map((item, index) => (
            <Fragment key={`${item}-${index}`}>
              {index > 0 && (
                <span className="listing-card-story__meta-dot" aria-hidden>
                  ·
                </span>
              )}
              <span>{item}</span>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

export function ListingCtaCard({ slug }: { slug: string }) {
  return (
    <Link
      href={`/inventory/${slug}`}
      className="listing-card-story__panel listing-card-story__panel--left listing-card-story__panel--cta listing-card-story__cta-card"
    >
      <span>Vedi dettagli</span>
      <span aria-hidden>→</span>
    </Link>
  );
}

export function ListingPhoto({
  listing,
  index,
}: {
  listing: Listing;
  index: number;
}) {
  const cover = coverImage(listing);
  const photoSrc = cover ? homeCropSrc(cover) : null;
  if (!photoSrc) return null;

  const price = listing.price?.trim();
  const alt = `${listing.brand} ${listing.model}`.trim();

  return (
    <div className="editorial-showcase__home-cover">
      <Image
        src={photoSrc}
        alt={alt}
        fill
        priority={index < 2}
        sizes="(max-width: 1023px) 48vw, 52vw"
        className="object-cover object-center editorial-showcase__photo"
      />
      {price && (
        <p className="listing-card-story__price-overlay">
          {formatListingPrice(price)}
        </p>
      )}
    </div>
  );
}

export function ListingRowLayout({
  listing,
  index,
  variant,
}: {
  listing: Listing;
  index: number;
  variant: "desktop" | "mobile";
}) {
  const isDesktop = variant === "desktop";

  return (
    <article
      className={cn(
        "listing-row editorial-showcase__row w-full flex-row items-start",
        isDesktop
          ? "listing-row--desktop hidden md:flex"
          : "listing-row--mobile flex md:hidden"
      )}
    >
      <div className="editorial-showcase__photo-col editorial-showcase__photo-col--left w-[48%] shrink-0 min-w-0">
        <ListingPhoto listing={listing} index={index} />
        <div className="editorial-showcase__photo-actions editorial-showcase__photo-actions--full">
          <ListingCtaCard slug={listing.slug} />
        </div>
      </div>
      <div className="editorial-showcase__text-col w-[52%] min-w-0 flex items-start">
        <ListingStory listing={listing} />
      </div>
    </article>
  );
}
