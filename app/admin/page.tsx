import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Car } from "lucide-react";

export const metadata: Metadata = {
  title: "Gestione",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <section className="py-28 md:py-36 min-h-screen border-t border-border">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 md:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase text-muted hover:text-champagne transition-colors mb-10 font-display"
        >
          <ChevronLeft size={14} />
          Sito pubblico
        </Link>

        <span className="font-display text-[10px] tracking-[0.35em] uppercase text-champagne mb-4 block">
          Fierauto · Pannello admin
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-light tracking-[-0.02em] mb-4">
          Gestione
        </h1>
        <p className="text-muted font-light text-sm md:text-base mb-12 leading-relaxed">
          Crea gli annunci una volta sola. Compaiono in homepage con layout editoriale alternato.
        </p>

        <Link
          href="/admin/annunci"
          className="block p-6 md:p-8 border border-champagne/30 hover:border-champagne/50 bg-champagne/[0.03] transition-all duration-500 group"
        >
          <div className="flex items-start gap-4">
            <Car size={20} className="text-champagne mt-0.5 shrink-0" strokeWidth={1.25} />
            <div>
              <p className="font-display text-lg group-hover:text-champagne transition-colors duration-300 mb-2">
                Annunci auto
              </p>
              <p className="text-muted text-sm font-light leading-relaxed">
                Crea, modifica e pubblica gli annunci. La homepage si aggiorna automaticamente.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
