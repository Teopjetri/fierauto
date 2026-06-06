"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { ListingImage } from "@/lib/listings/types";
import { cn } from "@/lib/utils";

const GALLERY_TRANSITION = {
  duration: 0.3,
  ease: [0.33, 1, 0.68, 1] as [number, number, number, number],
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
  }),
  center: {
    x: 0,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
  }),
};

function GalleryNavButton({
  direction,
  onClick,
  className,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  className: string;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  const label = direction === "prev" ? "Foto precedente" : "Foto successiva";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-1/2 z-10 flex -translate-y-1/2 items-center justify-center",
        "h-12 w-12 sm:h-11 sm:w-11",
        "rounded-full border border-white/10 bg-black/45 text-white",
        "backdrop-blur-[2px] transition-colors duration-200",
        "hover:bg-black/58 active:bg-black/65",
        "touch-manipulation",
        className
      )}
    >
      <Icon size={22} strokeWidth={1.75} aria-hidden />
    </button>
  );
}

export function ListingImageGallery({
  images,
  alt,
}: {
  images: ListingImage[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const current = images[index];
  if (!current) return null;

  const hasMultiple = images.length > 1;
  const canGoPrev = index > 0;
  const canGoNext = index < images.length - 1;

  const goPrev = () => {
    if (!canGoPrev) return;
    setDirection(-1);
    setIndex((currentIndex) => currentIndex - 1);
  };

  const goNext = () => {
    if (!canGoNext) return;
    setDirection(1);
    setIndex((currentIndex) => currentIndex + 1);
  };

  return (
    <div className="relative w-full aspect-[4/3] max-h-[min(82vh,920px)] overflow-hidden bg-[#070708]">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={GALLERY_TRANSITION}
          className="absolute inset-0"
        >
          <Image
            src={current.src}
            alt={index === 0 ? alt : ""}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-contain"
          />
        </motion.div>
      </AnimatePresence>

      {hasMultiple && canGoPrev && (
        <GalleryNavButton direction="prev" onClick={goPrev} className="left-3 sm:left-4" />
      )}

      {hasMultiple && canGoNext && (
        <GalleryNavButton direction="next" onClick={goNext} className="right-3 sm:right-4" />
      )}
    </div>
  );
}
