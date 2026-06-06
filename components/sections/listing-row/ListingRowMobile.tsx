"use client";

import Image from "next/image";
import Link from "next/link";
import { coverImage, homeCropSrc, type Listing } from "@/lib/listings/types";
import { formatPrice, cn } from "@/lib/utils";

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

const MOBILE_PRICE_FILL = {
  color: "rgb(0, 255, 110)",
  WebkitTextFillColor: "rgb(0, 255, 110)",
  WebkitTextStroke: "0",
  textShadow: "none",
} as const;

const MOBILE_CTA_FILL = {
  color: "rgb(255, 0, 0)",
  WebkitTextFillColor: "rgb(255, 0, 0)",
  WebkitTextStroke: "0",
  textShadow: "none",
} as const;

const MOBILE_BRAND_HERO_EFFECT = {
  color: "#ffffff",
  textShadow:
    "0 0 1px rgba(255, 0, 0, 1), 0 0 2px rgba(255, 0, 0, 1), 0 0 4px rgba(255, 0, 0, 0.88), 0 0 7px rgba(255, 0, 0, 0.48), 0 1px 3px rgba(0, 0, 0, 0.5)",
} as const;

const MOBILE_PANEL_COMPACT = {
  padding: "0.35rem 0.85rem",
  lineHeight: 1,
  alignSelf: "start" as const,
};

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

  const alt = `${listing.brand} ${listing.model}`.trim();

  return (
    <article className="listing-row listing-row--mobile editorial-showcase__row w-full flex flex-row flex-nowrap items-start">
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
        </div>
        <div
          className={cn(
            "editorial-showcase__photo-actions",
            price &&
              "editorial-showcase__photo-actions--paired grid grid-cols-2 gap-3 w-[calc(200%+0.75rem)]"
          )}
        >
          {price && (
            <div
              className="listing-card-story__panel listing-card-story__panel--left listing-card-story__panel--price"
              style={MOBILE_PANEL_COMPACT}
            >
              <p
                className="listing-card-story__price"
                style={{
                  fontSize: "clamp(2.13rem, 7.08vw, 2.76rem)",
                  letterSpacing: "0.1em",
                  ...MOBILE_PRICE_FILL,
                }}
              >
                {formatListingPrice(price)}
              </p>
            </div>
          )}
          <Link
            href={`/inventory/${listing.slug}`}
            className="listing-card-story__panel listing-card-story__panel--left listing-card-story__panel--cta listing-card-story__cta-card"
            style={{
              fontSize: "clamp(2.3rem, 7.38vw, 2.88rem)",
              ...MOBILE_PANEL_COMPACT,
              ...MOBILE_CTA_FILL,
            }}
          >
            Scopri
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
            <h3 className="listing-card-story__model">{listing.model}</h3>
          )}

          {listing.description && (
            <div
              className="listing-row-mobile__description-wrap"
              style={mobileDescriptionWrapStyle}
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
