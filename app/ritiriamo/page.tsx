"use client";

import Link from "next/link";
import { TradeInForm } from "@/components/tradein/TradeInForm";

export default function RitiriamoPage() {
  return (
    <div className="trade-in-page min-h-screen bg-[#0a0a0c] text-foreground">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .trade-in-form__upload {
              -webkit-tap-highlight-color: transparent;
              touch-action: manipulation;
            }
            .trade-in-page {
              padding-bottom: env(safe-area-inset-bottom, 0px);
            }
          `,
        }}
      />
      <div className="max-w-lg mx-auto px-5 sm:px-6 py-8 sm:py-10">
        <Link
          href="/"
          className="inline-flex items-center text-[10px] tracking-[0.25em] uppercase text-muted hover:text-foreground transition-colors mb-8"
        >
          ← Torna alla home
        </Link>

        <header className="mb-8 pb-6 border-b border-white/[0.08]">
          <p className="font-display text-[10px] tracking-[0.35em] uppercase text-champagne mb-2">
            Valutazione
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-light tracking-[-0.02em]">
            Ritiriamo il tuo usato
          </h1>
        </header>

        <TradeInForm uploadHint="Tocca per caricare le foto" />
      </div>
    </div>
  );
}
