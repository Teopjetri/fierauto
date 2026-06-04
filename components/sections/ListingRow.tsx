"use client";

import type { Listing } from "@/lib/listings/types";
import { coverImage } from "@/lib/listings/types";
import { ListingRowDesktop } from "@/components/sections/listing-row/ListingRowDesktop";
import { ListingRowMobile } from "@/components/sections/listing-row/ListingRowMobile";

export { ListingRowDesktop } from "@/components/sections/listing-row/ListingRowDesktop";
export { ListingRowMobile } from "@/components/sections/listing-row/ListingRowMobile";

export function ListingRow({ listing, index }: { listing: Listing; index: number }) {
  const cover = coverImage(listing);
  if (!cover?.src) return null;

  return (
    <div className="listing-row-pair">
      <div className="editorial-showcase__listing-rule" aria-hidden />
      <ListingRowDesktop listing={listing} index={index} />
      <ListingRowMobile listing={listing} index={index} />
    </div>
  );
}
