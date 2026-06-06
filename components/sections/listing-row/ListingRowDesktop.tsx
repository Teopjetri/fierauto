"use client";

import Image from "next/image";
import Link from "next/link";
import { coverImage, homeCropSrc, type Listing } from "@/lib/listings/types";
import { formatPrice } from "@/lib/utils";

function formatListingPrice(price: string): string {
  const trimmed = price.trim();
  if (!trimmed) return "";
  if (trimmed.includes("€")) return trimmed;
  const num = Number(trimmed.replace(/\./g, "").replace(",", "."));
  if (!Number.isNaN(num)) return formatPrice(num);
  return trimmed;
}

const DESKTOP_DESC_FONT_SIZE = "1.1rem";
const DESKTOP_DESC_LINE_HEIGHT = 1.8;
const DESKTOP_DESC_LINES = 6;
const DESKTOP_DESC_MAX_HEIGHT = `calc(${DESKTOP_DESC_FONT_SIZE} * ${DESKTOP_DESC_LINE_HEIGHT} * ${DESKTOP_DESC_LINES})`;

const desktopDescriptionWrapStyle = {
  paddingTop: "130pt",
  flexShrink: 0,
  overflow: "hidden",
};

const desktopDescriptionStyle = {
  display: "-webkit-box",
  WebkitBoxOrient: "vertical" as const,
  WebkitLineClamp: DESKTOP_DESC_LINES,
  overflow: "hidden",
  textOverflow: "ellipsis",
  fontSize: DESKTOP_DESC_FONT_SIZE,
  lineHeight: DESKTOP_DESC_LINE_HEIGHT,
  maxHeight: DESKTOP_DESC_MAX_HEIGHT,
  margin: 0,
  marginBottom: "2rem",
};

export function ListingRowDesktop({
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
    <>
      {index === 0 && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @media (min-width: 768px) {
                .listing-row--desktop .listing-row-desktop__description-wrap {
                  padding-top: 130pt !important;
                  overflow: hidden !important;
                }
                .listing-row--desktop .listing-row-desktop__description {
                  display: -webkit-box !important;
                  -webkit-box-orient: vertical !important;
                  -webkit-line-clamp: 6 !important;
                  line-clamp: 6 !important;
                  overflow: hidden !important;
                  text-overflow: ellipsis !important;
                  max-height: calc(1.1rem * 1.8 * 6) !important;
                  margin: 0 0 2rem !important;
                }
              }
            `,
          }}
        />
      )}
      <article className="listing-row listing-row--desktop editorial-showcase__row hidden md:flex w-full flex-row items-start">
      <div className="editorial-showcase__photo-col editorial-showcase__photo-col--left w-[48%] shrink-0 min-w-0">
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
        <div className="editorial-showcase__photo-actions editorial-showcase__photo-actions--full">
          <Link
            href={`/inventory/${listing.slug}`}
            className="listing-card-story__panel listing-card-story__panel--left listing-card-story__panel--cta listing-card-story__cta-card"
          >
            <span>Vedi dettagli</span>
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
      <div className="editorial-showcase__text-col w-[52%] min-w-0 flex items-start">
        <div className="listing-card-story">
          {listing.brand && (
            <p className="listing-card-story__brand" style={{ transform: "translateY(-31pt)" }}>
              {listing.brand}
            </p>
          )}

          {listing.model && (
            <h3 className="listing-card-story__model">{listing.model}</h3>
          )}

          {listing.description && (
            <div
              className="listing-row-desktop__description-wrap"
              style={desktopDescriptionWrapStyle}
            >
              <p className="listing-row-desktop__description" style={desktopDescriptionStyle}>
                {listing.description}
              </p>
            </div>
          )}

        </div>
      </div>
    </article>
    </>
  );
}
