"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";

export function FinalCTA() {
  return (
    <section className="py-20 md:py-32 lg:py-36">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-8">
        <FadeIn>
          <motion.div
            whileHover={{ scale: 1.002 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden glass p-10 md:p-14 lg:p-20 text-center showroom-ambient"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-champagne/50 to-transparent" />

            <span className="inline-block font-display text-[10px] tracking-[0.35em] uppercase text-champagne mb-5">
              Showroom · Milano
            </span>
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-light tracking-[-0.02em] mb-5 max-w-2xl mx-auto">
              Prenota una visita privata
            </h2>
            <p className="text-muted text-sm md:text-base font-light max-w-md mx-auto mb-9 leading-relaxed">
              Vieni a vedere le vetture nel nostro showroom. Consulenza senza impegno,
              in un ambiente riservato e professionale.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button href="/inventory" size="lg">
                Parco auto
              </Button>
              <Button href="/contact" variant="secondary" size="lg">
                Contatti
              </Button>
            </div>
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
}
