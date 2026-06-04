import { BrandHeroIntro } from "@/components/showroom/BrandHeroIntro";

/** Homepage — delega alla hero brand condivisa. */
export function Hero() {
  return (
    <BrandHeroIntro
      size="full"
      ctaLabel="Scopri il parco auto"
      ctaHref="/inventory"
      showScrollHint
    />
  );
}
