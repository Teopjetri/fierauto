"use client";

import Link from "next/link";
import { MessageCircle, Check, ArrowLeft } from "lucide-react";
import type { CarWithMedia } from "@/lib/data/carWithMedia";
import { formatPrice, formatMileage, getWhatsAppUrl } from "@/lib/utils";
import { SITE_NAME } from "@/lib/data/siteBrand";
import { toSlotOrientation } from "@/lib/showroomLayouts";
import { BrandHeroIntro } from "@/components/showroom/BrandHeroIntro";
import { CarImageSlot } from "@/components/showroom/CarImageSlot";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";

interface CarDetailViewProps {
  car: CarWithMedia;
}

/** Pagina vettura — hero brand + presentazione editoriale + scheda minimal. */
export function CarDetailView({ car }: CarDetailViewProps) {
  const whatsappMessage = `Buongiorno ${SITE_NAME}, sono interessato alla ${car.brand} ${car.model} (${car.year}). Potete darmi maggiori informazioni?`;
  const allPhotos = car.media.photos;
  const heroPhoto = car.heroPhoto;
  const galleryPhotos = car.galleryPhotos;

  return (
    <>
      <BrandHeroIntro
        size="tall"
        ctaLabel="Torna alle vetture"
        ctaHref="/#vetture"
        showScrollHint={false}
      />

      {/* Presentazione editoriale vettura */}
      <section id="vettura" className="border-t border-white/[0.05] bg-[#060608]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-8 pt-12 md:pt-16">
          <Link
            href="/#vetture"
            className="inline-flex items-center gap-2 text-[10px] tracking-[0.28em] uppercase text-muted hover:text-champagne transition-colors mb-16 font-display"
          >
            <ArrowLeft size={14} />
            Torna allo showroom
          </Link>
        </div>

        {/* Spread principale */}
        <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-8 pb-20 md:pb-28">
          <FadeIn>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start mb-20 md:mb-28">
              <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-8">
                <p className="font-display text-[10px] tracking-[0.42em] uppercase text-champagne">
                  {car.brand}
                </p>
                <h2 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] font-light tracking-[-0.03em] leading-[1.08]">
                  {car.model}
                </h2>
                <p className="text-muted font-light leading-relaxed text-base md:text-lg">
                  {car.description}
                </p>
                <div className="pt-4 space-y-1">
                  <p className="font-display text-2xl text-champagne">{formatPrice(car.price)}</p>
                  <p className="text-[10px] tracking-[0.22em] uppercase text-muted">
                    {car.year} · {formatMileage(car.mileage)} · {car.fuel}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button href={getWhatsAppUrl(whatsappMessage)} variant="whatsapp" external>
                    <MessageCircle size={17} />
                    Richiedi info
                  </Button>
                  <Button href="/#contatti" variant="secondary">
                    Prenota visita
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-7">
                <CarImageSlot
                  orientation="horizontal"
                  photo={heroPhoto}
                  car={car}
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
              </div>
            </div>
          </FadeIn>

          {/* Galleria slot — layout alternato */}
          {galleryPhotos.length > 0 && (
            <div className="space-y-12 md:space-y-16 border-t border-white/[0.05] pt-16 md:pt-20">
              <p className="font-display text-[10px] tracking-[0.38em] uppercase text-champagne">
                Servizio fotografico · CS Motors Studio
              </p>
              <div className="grid grid-cols-12 gap-6 md:gap-8">
                {galleryPhotos.map((photo, i) => {
                  const vertical = toSlotOrientation(photo.orientation) === "vertical";
                  const wide = !vertical && i % 2 === 0;
                  return (
                    <FadeIn
                      key={photo.id}
                      className={wide ? "col-span-12 md:col-span-8" : vertical ? "col-span-12 md:col-span-4" : "col-span-12 md:col-span-6"}
                    >
                      <CarImageSlot
                        orientation={vertical ? "vertical" : "horizontal"}
                        photo={photo}
                        car={car}
                        sizes="50vw"
                      />
                    </FadeIn>
                  );
                })}
              </div>
            </div>
          )}

          {allPhotos.length === 0 && (
            <FadeIn className="border-t border-white/[0.05] pt-16">
              <CarImageSlot orientation="horizontal" photo={null} car={car} />
              <p className="text-muted text-xs font-light mt-6 tracking-wide text-center">
                Carica le fotografie dal{" "}
                <Link href={`/admin/cars/${car.slug}/media`} className="text-champagne hover:underline">
                  pannello gestione
                </Link>
              </p>
            </FadeIn>
          )}
        </div>
      </section>

      {/* Scheda tecnica minimal — in fondo, non in hero */}
      <section className="py-20 md:py-28 border-t border-border section-gradient">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            <FadeIn>
              <span className="font-display text-[10px] tracking-[0.38em] uppercase text-champagne mb-4 block">
                Specifiche
              </span>
              <div className="line-accent mb-10" />
              <div className="divide-y divide-border">
                {Object.entries(car.specifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-4">
                    <span className="text-muted text-sm">{key}</span>
                    <span className="font-display text-sm">{value}</span>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <span className="font-display text-[10px] tracking-[0.38em] uppercase text-champagne mb-4 block">
                Dotazioni
              </span>
              <div className="line-accent mb-10" />
              <ul className="space-y-3">
                {car.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-muted font-light">
                    <Check size={15} className="text-champagne mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
