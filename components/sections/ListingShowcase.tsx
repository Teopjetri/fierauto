import type { Listing } from "@/lib/listings/types";
import { ListingRow } from "@/components/sections/ListingRow";

interface ListingShowcaseProps {
  listings: Listing[];
  title?: string;
}

export function ListingShowcase({ listings, title = "Le nostre auto" }: ListingShowcaseProps) {
  const heading = title.trim() || "Le nostre auto";

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            #vetture.editorial-showcase {
              border-top: none !important;
            }
            #vetture .editorial-showcase__header {
              padding-top: calc(4rem - 20pt) !important;
            }
            @media (min-width: 768px) {
              #vetture .editorial-showcase__header {
                padding-top: calc(6rem - 20pt) !important;
              }
            }
            #vetture .editorial-showcase__title {
              position: relative !important;
              top: 2pt !important;
              font-size: 1.95rem !important;
            }
            @media (min-width: 768px) {
              #vetture .editorial-showcase__title {
                font-size: 2.926rem !important;
              }
            }
            @media (min-width: 1024px) {
              #vetture .editorial-showcase__title {
                font-size: 3.51rem !important;
              }
            }
            @media (hover: hover) and (pointer: fine) {
              #vetture .editorial-showcase__title {
                top: 2pt !important;
              }
            }
            #vetture .editorial-showcase__listings {
              margin-top: -20pt !important;
            }
            #vetture .editorial-showcase__listing-rule {
              height: 1px !important;
              width: 100vw !important;
              position: relative !important;
              left: 50% !important;
              margin-left: -50vw !important;
              margin-right: -50vw !important;
              margin-bottom: calc(2rem - 10pt) !important;
              background: linear-gradient(
                90deg,
                transparent 0%,
                color-mix(in srgb, #3f3f3f 50%, transparent) 6%,
                color-mix(in srgb, #3f3f3f 50%, transparent) 94%,
                transparent 100%
              ) !important;
            }
          `,
        }}
      />
      <section id="vetture" className="editorial-showcase bg-background relative scroll-mt-6">
        <div className="editorial-showcase__header px-6 sm:px-8 lg:px-10 pt-[calc(4rem-20pt)] md:pt-[calc(6rem-20pt)] pb-8 md:pb-10">
          <h2 className="editorial-showcase__title text-foreground">
            {heading}
          </h2>
      </div>

      {listings.length > 0 && (
        <div className="editorial-showcase__listings w-full pb-6 md:pb-40">
          {listings.map((listing, i) => (
            <ListingRow key={listing.id} listing={listing} index={i} />
          ))}
        </div>
      )}
    </section>
    </>
  );
}
