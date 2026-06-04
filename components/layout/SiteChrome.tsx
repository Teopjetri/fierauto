"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

interface SiteChromeProps {
  children: React.ReactNode;
  logo: { src: string | null; version: number };
}

export function SiteChrome({ children, logo }: SiteChromeProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isRitiriamo = pathname === "/ritiriamo";

  if (isAdmin) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Navbar logo={logo} />
      <main className={cn("flex-1", isRitiriamo && "bg-[#0a0a0c]")}>{children}</main>
      {!isRitiriamo && <Footer />}
    </>
  );
}
