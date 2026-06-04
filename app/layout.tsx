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

export const metadata: Metadata = {
  title: {
    default: "CS Motors · Vetture selezionate · Milano",
    template: "%s · CS Motors",
  },
  description:
    "Selezione esclusiva di vetture usate premium. Ispezionate, documentate e presentate nel nostro showroom a Milano.",
};

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
