"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { CarWithMedia } from "@/lib/data/carWithMedia";
import { formatPrice, formatMileage } from "@/lib/utils";
import { mediaToCarPhoto } from "@/lib/media/photoUtils";
import { ShowroomStage } from "@/components/showroom/ShowroomStage";
import { StudioPlaceholder } from "@/components/showroom/StudioPlaceholder";
import {
  getCardImageHeight,
  getLayoutForIndex,
  getPhotoOrientation,
  type EditorialLayout,
} from "@/lib/imageUtils";
import { cn } from "@/lib/utils";

interface EditorialCarCardProps {
  car: CarWithMedia;
  index?: number;
  layout?: EditorialLayout;
  priority?: boolean;
}

export function EditorialCarCard({
  car,
  index = 0,
  layout,
  priority = false,
}: EditorialCarCardProps) {
  const resolvedLayout = layout ?? getLayoutForIndex(index);
  const coverPhoto = car.heroPhoto ? mediaToCarPhoto(car.heroPhoto, car, { hero: true }) : null;
  const orientation = coverPhoto ? getPhotoOrientation(coverPhoto) : "landscape";
  const isHero = resolvedLayout === "hero";

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="group h-full"
    >
      <Link href={`/inventory/${car.slug}`} className="block h-full">
        <div
          className={cn(
            "relative overflow-hidden mb-5 ring-1 ring-white/[0.06] group-hover:ring-champagne/30 transition-all duration-700",
            getCardImageHeight(resolvedLayout, orientation)
          )}
        >
          {coverPhoto ? (
            <ShowroomStage
              photo={coverPhoto}
              aspect="auto"
              orientation={orientation}
              priority={priority}
              fillHeight
              sizes={
                isHero
                  ? "(max-width: 1024px) 100vw, 66vw"
                  : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              }
              interactive
              className="absolute inset-0 h-full"
            />
          ) : (
            <StudioPlaceholder
              variant="card"
              className="absolute inset-0 h-full"
            />
          )}

          <div className="absolute inset-x-0 bottom-0 z-[2] p-5 sm:p-6 bg-gradient-to-t from-black/80 via-black/35 to-transparent pointer-events-none">
            <p className="text-[10px] tracking-[0.32em] uppercase text-champagne font-display mb-2">
              {car.brand}
            </p>
            <h3
              className={cn(
                "font-display font-light tracking-[-0.02em] text-foreground group-hover:text-champagne-light transition-colors duration-500",
                isHero ? "text-2xl sm:text-3xl lg:text-4xl" : "text-xl sm:text-2xl"
              )}
            >
              {car.model}
            </h3>
          </div>
        </div>

        <div className="flex items-end justify-between gap-4 px-0.5">
          <div>
            <p className="font-display text-lg sm:text-xl">{formatPrice(car.price)}</p>
            <p className="text-[10px] text-muted mt-1 tracking-[0.12em] uppercase">
              {car.year} · {car.fuel} · {formatMileage(car.mileage)}
            </p>
          </div>
          <span className="text-[10px] tracking-[0.2em] uppercase text-muted group-hover:text-champagne transition-colors duration-500 shrink-0 pb-1">
            Scheda →
          </span>
        </div>
      </Link>
    </motion.article>
  );
}

export function CarCard({
  car,
  priority = false,
}: {
  car: CarWithMedia;
  priority?: boolean;
}) {
  return <EditorialCarCard car={car} priority={priority} layout="standard" />;
}
