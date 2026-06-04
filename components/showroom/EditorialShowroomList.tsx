"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { CarWithMedia } from "@/lib/data/carWithMedia";
import { formatMileage, formatPrice } from "@/lib/utils";
import { mediaToCarPhoto } from "@/lib/media/photoUtils";
import { ShowroomStage } from "@/components/showroom/ShowroomStage";
import { FadeIn } from "@/components/ui/FadeIn";
import { cn } from "@/lib/utils";

interface EditorialShowroomListProps {
  cars: CarWithMedia[];
  section?: { eyebrow: string; title: string };
}

const PHOTO_WIDTH =
  "w-full max-w-[300px] sm:max-w-[320px] md:max-w-[360px] xl:max-w-[420px]";

function EditorialCarPhoto({
  car,
  photo,
  priority,
}: {
  car: CarWithMedia;
  photo: CarWithMedia["heroPhoto"];
  priority?: boolean;
}) {
  return (
    <div
      className={cn(
        "editorial-car__frame relative aspect-[3/4] overflow-hidden shrink-0",
        PHOTO_WIDTH
      )}
    >
      {photo ? (
        <ShowroomStage
          photo={mediaToCarPhoto(photo, car)}
          aspect="auto"
          orientation="portrait"
          priority={priority}
          sizes="(max-width:768px) 300px, 420px"
          className="absolute inset-0 h-full w-full !min-h-0"
          fillHeight
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-[#070708]" />
          <div className="editorial-car__frame-border opacity-35" />
        </>
      )}
      {photo && <div className="editorial-car__frame-border" />}
    </div>
  );
}

function EditorialCarContent({ car }: { car: CarWithMedia }) {
  return (
    <div className="editorial-car__content max-w-3xl xl:max-w-4xl">
      <p className="font-display text-[10px] tracking-[0.42em] uppercase text-champagne mb-5 md:mb-6">
        {car.brand}
      </p>
      <h3 className="font-display font-light tracking-[-0.03em] leading-[1.06] text-[clamp(1.75rem,3.2vw,2.75rem)] text-white/92 mb-6 md:mb-8">
        {car.model}
      </h3>
      <p className="text-white/42 font-light leading-[1.8] text-sm md:text-base mb-8 md:mb-10 max-w-2xl">
        {car.description}
      </p>
      <dl className="flex flex-wrap gap-x-12 gap-y-5 pt-6 md:pt-8 border-t border-white/[0.08] mb-8 md:mb-10">
        <div>
          <dt className="font-display text-[9px] tracking-[0.35em] uppercase text-white/25 mb-1.5">
            Anno
          </dt>
          <dd className="text-white/70 font-light text-sm">{car.year}</dd>
        </div>
        <div>
          <dt className="font-display text-[9px] tracking-[0.35em] uppercase text-white/25 mb-1.5">
            Kilometraggio
          </dt>
          <dd className="text-white/70 font-light text-sm">{formatMileage(car.mileage)}</dd>
        </div>
        <div>
          <dt className="font-display text-[9px] tracking-[0.35em] uppercase text-white/25 mb-1.5">
            Alimentazione
          </dt>
          <dd className="text-white/70 font-light text-sm">{car.fuel}</dd>
        </div>
        <div>
          <dt className="font-display text-[9px] tracking-[0.35em] uppercase text-white/25 mb-1.5">
            Prezzo
          </dt>
          <dd className="text-champagne/90 font-display text-base">{formatPrice(car.price)}</dd>
        </div>
      </dl>
      <Link
        href={`/inventory/${car.slug}`}
        className="inline-flex font-display text-[10px] tracking-[0.35em] uppercase text-champagne border-b border-champagne/35 pb-1 hover:text-champagne-light hover:border-champagne transition-colors"
      >
        Scopri
      </Link>
    </div>
  );
}

function EditorialCarRow({ car, index }: { car: CarWithMedia; index: number }) {
  const imageLeft = index % 2 === 0;
  const photo = car.heroPhoto;

  return (
    <FadeIn>
      <article
        className={cn(
          "editorial-car border-t border-white/[0.04]",
          index === 0 && "border-t-0"
        )}
      >
        <div
          className={cn(
            "flex flex-col lg:flex-row lg:items-center w-full",
            !imageLeft && "lg:flex-row-reverse"
          )}
        >
          {/* Foto ~30–32% — appoggiata al bordo esterno */}
          <div
            className={cn(
              "editorial-car__photo-col lg:w-[32%] xl:w-[30%] shrink-0 flex mb-12 lg:mb-0",
              imageLeft ? "justify-start" : "justify-end"
            )}
          >
            <div className={cn(imageLeft ? "pl-6 sm:pl-8 lg:pl-10" : "pr-6 sm:pr-8 lg:pr-10")}>
              <EditorialCarPhoto car={car} photo={photo} priority={index < 2} />
            </div>
          </div>

          {/* Testo ~68–70% — area protagonista */}
          <div className="editorial-car__text-col lg:w-[68%] xl:w-[70%] lg:flex-1 min-w-0">
            <div
              className={cn(
                "px-6 sm:px-8 md:px-10 py-2 lg:py-16 xl:py-20",
                imageLeft
                  ? "lg:pl-10 lg:pr-12 xl:pl-14 xl:pr-20 2xl:pr-28"
                  : "lg:pr-10 lg:pl-12 xl:pr-14 xl:pl-20 2xl:pl-28"
              )}
            >
              <EditorialCarContent car={car} />
            </div>
          </div>
        </div>
      </article>
    </FadeIn>
  );
}

/** Sequenza editoriale vetture — foto 3:4 sul bordo, testo dominante. */
export function EditorialShowroomList({ cars, section }: EditorialShowroomListProps) {
  const title = section?.title?.trim() || "Le nostre auto";

  if (cars.length === 0) {
    return (
      <div className="py-32 text-center px-6">
        <p className="text-muted font-light text-sm tracking-wide">Showroom in allestimento.</p>
      </div>
    );
  }

  return (
    <div className="editorial-cars relative w-full">
      <div className="px-6 sm:px-8 lg:px-10 pt-8 pb-16 md:pb-20 md:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {section?.eyebrow && (
            <p className="font-display text-[10px] tracking-[0.42em] uppercase text-champagne/70 mb-4">
              {section.eyebrow}
            </p>
          )}
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-light tracking-[0.12em] uppercase text-white/90">
            {title}
          </h2>
        </motion.div>
      </div>

      <div className="w-full">
        {cars.map((car, i) => (
          <EditorialCarRow key={car.id} car={car} index={i} />
        ))}
      </div>
    </div>
  );
}
