"use client";

import { cn } from "@/lib/utils";

interface StudioPlaceholderProps {
  className?: string;
  label?: string;
  variant?: "hero" | "card" | "gallery";
}

/** Placeholder premium CS Motors Studio — nessuna foto hardcoded. */
export function StudioPlaceholder({
  className,
  label = "CS Motors Studio",
  variant = "card",
}: StudioPlaceholderProps) {
  return (
    <div
      className={cn(
        "cs-motors-studio relative overflow-hidden isolate flex items-center justify-center",
        className
      )}
    >
      <div className="cs-motors-studio__backdrop" aria-hidden />
      <div className="cs-motors-studio__led-top" aria-hidden />
      <div className="cs-motors-studio__led-side" aria-hidden />
      <div className="cs-motors-studio__led-vertical" aria-hidden />
      <div className="cs-motors-studio__floor" aria-hidden />
      <div className="cs-motors-studio__reflection" aria-hidden />
      <div className="cs-motors-studio__vignette" aria-hidden />

      <div
        className={cn(
          "relative z-[2] text-center px-6",
          variant === "hero" && "max-w-md"
        )}
      >
        <div className="w-12 h-px bg-champagne/50 mx-auto mb-5" />
        <p className="font-display text-[10px] tracking-[0.38em] uppercase text-champagne mb-2">
          {label}
        </p>
        <p className="text-muted text-xs font-light tracking-wide">
          {variant === "hero"
            ? "Carica l'immagine hero dal pannello gestione foto"
            : "Immagine in attesa di upload"}
        </p>
      </div>
    </div>
  );
}
