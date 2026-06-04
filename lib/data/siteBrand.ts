export const SITE_NAME = "Fierauto";

export const siteBrand = {
  heroImage: "/brand/hero.jpg",
  heroImageAlt: `Interni premium — ${SITE_NAME}`,
  tagline: "Milano · Since 2025",
} as const;

export function getDefaultWhatsAppMessage(): string {
  return `Buongiorno ${SITE_NAME}, vorrei informazioni sul vostro parco auto.`;
}
