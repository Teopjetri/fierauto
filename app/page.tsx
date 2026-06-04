import { HomeHero } from "@/components/sections/HomeHero";
import { HomeContact } from "@/components/sections/HomeContact";
import { ListingShowcase } from "@/components/sections/ListingShowcase";
import { getHeroImage } from "@/lib/hero/store";
import { getPublishedListings } from "@/lib/listings/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [hero, listings] = await Promise.all([getHeroImage(), getPublishedListings()]);

  return (
    <>
      <HomeHero initialSrc={hero.src} initialVersion={hero.version} />
      <ListingShowcase listings={listings} title="Le nostre auto" />
      <HomeContact />
    </>
  );
}
