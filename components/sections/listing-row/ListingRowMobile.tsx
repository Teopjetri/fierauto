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

const MOBILE_DESC_FONT_SIZE = "0.875rem";
const MOBILE_DESC_LINE_HEIGHT = 1.5;
const MOBILE_DESC_LINES = 3;
const MOBILE_DESC_MAX_HEIGHT = `calc(${MOBILE_DESC_FONT_SIZE} * ${MOBILE_DESC_LINE_HEIGHT} * ${MOBILE_DESC_LINES})`;

const mobileDescriptionStyle = {
  display: "-webkit-box",
  WebkitBoxOrient: "vertical" as const,
  WebkitLineClamp: MOBILE_DESC_LINES,
  overflow: "hidden",
  textOverflow: "ellipsis",
  fontSize: MOBILE_DESC_FONT_SIZE,
  lineHeight: MOBILE_DESC_LINE_HEIGHT,
  maxHeight: MOBILE_DESC_MAX_HEIGHT,
  margin: 0,
};

const mobileDescriptionWrapStyle = {
  height: MOBILE_DESC_MAX_HEIGHT,
  maxHeight: MOBILE_DESC_MAX_HEIGHT,
  overflow: "hidden",
  flexShrink: 0,
  marginTop: "5pt",
  marginBottom: "0.5rem",
};

const MOBILE_PRICE_POSITION = {
  right: "calc(0.55rem - 6pt)",
  bottom: "calc(0.5rem - 7pt)",
} as const;

const MOBILE_BRAND_HERO_EFFECT = {
  color: "#ffffff",
  textShadow:
    "0 0 1px rgba(255, 0, 0, 1), 0 0 2px rgba(255, 0, 0, 1), 0 0 4px rgba(255, 0, 0, 0.88), 0 0 7px rgba(255, 0, 0, 0.48), 0 1px 3px rgba(0, 0, 0, 0.5)",
} as const;

export function ListingRowMobile({
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
  const version = listing.version?.trim();

  const alt = `${listing.brand} ${listing.model}`.trim();

  const mobileDescriptionWrapStyleWithVersion = {
    ...mobileDescriptionWrapStyle,
    marginTop: version ? "2pt" : mobileDescriptionWrapStyle.marginTop,
  };

  return (
    <article className="listing-row listing-row--mobile editorial-showcase__row flex md:hidden w-full flex-row flex-nowrap items-start">
      <div className="editorial-showcase__photo-col editorial-showcase__photo-col--left w-[48%] shrink-0 min-w-0">
        <div className="editorial-showcase__home-cover">
          <Image
            src={photoSrc}
            alt={alt}
            fill
            priority={index < 2}
            sizes="48vw"
            className="object-cover object-center editorial-showcase__photo"
          />
          {price && (
            <p
              className="listing-card-story__price-overlay listing-card-story__price-overlay--mobile"
              style={MOBILE_PRICE_POSITION}
            >
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
            <p
              className="listing-card-story__brand"
              style={{
                marginTop: "-15pt",
                ...MOBILE_BRAND_HERO_EFFECT,
              }}
            >
              {listing.brand}
            </p>
          )}

          {listing.model && (
            <h3
              className="listing-card-story__model"
              style={version ? { marginBottom: "0.35rem" } : undefined}
            >
              {listing.model}
            </h3>
          )}

          {version && (
            <p className="listing-card-story__version">{version}</p>
          )}

          {listing.description && (
            <div
              className="listing-row-mobile__description-wrap"
              style={mobileDescriptionWrapStyleWithVersion}
            >
              <p className="listing-row-mobile__description" style={mobileDescriptionStyle}>
                {listing.description}
              </p>
            </div>
          )}

        </div>
      </div>
    </article>
  );
}
