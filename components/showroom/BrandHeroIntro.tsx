"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { siteBrand } from "@/lib/data/siteBrand";
import { cn } from "@/lib/utils";

interface BrandHeroIntroProps {
  /** Altezza sezione */
  size?: "full" | "tall";
  /** Etichetta CTA */
  ctaLabel?: string;
  /** Link CTA */
  ctaHref?: string;
  /** Mostra hint scroll */
  showScrollHint?: boolean;
  className?: string;
}

function HeroBackdrop({ imageLoaded }: { imageLoaded: boolean }) {
  return (
    <>
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-[1200ms]",
          imageLoaded ? "opacity-100" : "opacity-0"
        )}
        aria-hidden
      >
        <div className="absolute inset-0 bg-[#070708]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_70%_40%,rgba(196,176,138,0.07)_0%,transparent_60%)]" />
        <div className="absolute top-[15%] bottom-[20%] right-[10%] w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />
      </div>
      {!imageLoaded && <div className="absolute inset-0 brand-hero__placeholder" aria-hidden />}
    </>
  );
}

/**
 * Hero intro brand — identica su home, showroom e dettaglio.
 * Zero dati vettura. Solo atmosfera CS Motors.
 */
export function BrandHeroIntro({
  size = "full",
  ctaLabel = "Scopri il parco auto",
  ctaHref = "/inventory",
  showScrollHint = true,
  className,
}: BrandHeroIntroProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const minH = size === "full" ? "min-h-[100svh]" : "min-h-[88svh]";

  return (
    <section
      className={cn(
        "relative flex items-center overflow-hidden bg-[#050506]",
        minH,
        className
      )}
    >
      <div className="absolute inset-0">
        {!imageFailed && (
          <Image
            src={siteBrand.heroImage}
            alt={siteBrand.heroImageAlt}
            fill
            priority
            quality={95}
            sizes="100vw"
            className={cn(
              "object-cover object-[center_42%] brand-hero__photo transition-opacity duration-[1400ms]",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageFailed(true)}
          />
        )}
        <HeroBackdrop imageLoaded={imageLoaded && !imageFailed} />
        <div className="absolute inset-0 brand-hero__scrim pointer-events-none z-[2]" />
        <div className="absolute inset-0 bg-black/35 pointer-events-none z-[2]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-6 md:px-8 py-28 md:py-32">
        <div className="max-w-xl md:max-w-2xl brand-hero__copy">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-[10px] sm:text-[11px] tracking-[0.45em] uppercase text-champagne/90 mb-8 md:mb-10"
          >
            Fierauto • Milano
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[2.25rem] sm:text-[3rem] md:text-[3.75rem] lg:text-[4rem] font-light tracking-[-0.03em] leading-[1.06] mb-7 md:mb-9"
          >
            Selezione esclusiva
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.36 }}
            className="text-muted/90 text-base md:text-lg font-light leading-relaxed mb-12 md:mb-14 max-w-md"
          >
            Auto selezionate, fotografate e presentate con standard professionali.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.48 }}
          >
            <Button href={ctaHref} size="lg" className="min-w-[220px]">
              {ctaLabel}
            </Button>
          </motion.div>
        </div>
      </div>

      {showScrollHint && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2"
          aria-hidden
        >
          <span className="text-[9px] tracking-[0.38em] uppercase text-muted/50">Scorri</span>
          <div className="w-px h-12 bg-gradient-to-b from-champagne/30 to-transparent" />
        </motion.div>
      )}
    </section>
  );
}
