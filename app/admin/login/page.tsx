import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Accesso admin",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <section className="py-28 md:py-36 min-h-screen border-t border-border">
      <div className="max-w-md mx-auto px-5 sm:px-6 md:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase text-muted hover:text-champagne transition-colors mb-10 font-display"
        >
          <ChevronLeft size={14} />
          Sito pubblico
        </Link>

        <span className="font-display text-[10px] tracking-[0.35em] uppercase text-champagne mb-4 block">
          Fierauto · Admin
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-light tracking-[-0.02em] mb-4">
          Accesso riservato
        </h1>
        <p className="text-muted font-light text-sm md:text-base mb-10 leading-relaxed">
          Inserisci le credenziali per accedere al pannello di gestione.
        </p>

        <Suspense fallback={<p className="text-muted text-sm">Caricamento…</p>}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </section>
  );
}
