import { Inter, Space_Grotesk } from "next/font/google";
import type { Metadata } from "next";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { CustomFontFaces } from "@/components/fonts/CustomFontFaces";
import { getSiteLogo } from "@/lib/logo/store";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://fierauto.it";
const SITE_NAME = "Fierauto";
const DEFAULT_TITLE = "Fierauto · Vetture selezionate · Milano";
const DEFAULT_DESCRIPTION =
  "Selezione esclusiva di vetture usate premium su Fierauto.it. Ispezionate, documentate e presentate nel nostro showroom.";

export async function generateMetadata(): Promise<Metadata> {
  const logo = await getSiteLogo();
  const shareImages = logo.src
    ? [
        {
          url: `${logo.src}?v=${Math.floor(logo.version)}`,
          alt: SITE_NAME,
        },
      ]
    : [];

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: DEFAULT_TITLE,
      template: "%s · Fierauto",
    },
    description: DEFAULT_DESCRIPTION,
    openGraph: {
      type: "website",
      locale: "it_IT",
      url: SITE_URL,
      siteName: SITE_NAME,
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      images: shareImages,
    },
    twitter: {
      card: "summary_large_image",
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      images: shareImages.map((image) => image.url),
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const logo = await getSiteLogo();

  return (
    <html lang="it" className={`${inter.variable} ${spaceGrotesk.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <CustomFontFaces />
        <SiteChrome logo={logo}>{children}</SiteChrome>
      </body>
    </html>
  );
}
