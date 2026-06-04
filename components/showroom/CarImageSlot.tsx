"use client";

import Image from "next/image";
import { ImagePlus } from "lucide-react";
import type { Car } from "@/lib/types";
import type { CarMediaPhoto } from "@/lib/media/types";
import { mediaToCarPhoto } from "@/lib/media/photoUtils";
import { ShowroomStage } from "@/components/showroom/ShowroomStage";
import { cn } from "@/lib/utils";
import type { SlotOrientation } from "@/lib/showroomLayouts";

interface CarImageSlotProps {
  orientation: SlotOrientation;
  photo: CarMediaPhoto | null;
  car: Car;
  priority?: boolean;
  sizes?: string;
  className?: string;
  /** Admin: abilita upload inline */
  editable?: boolean;
  onUploadClick?: () => void;
}

/** Slot immagine showroom — placeholder premium o foto caricata. */
export function CarImageSlot({
  orientation,
  photo,
  car,
  priority = false,
  sizes = "100vw",
  className,
  editable = false,
  onUploadClick,
}: CarImageSlotProps) {
  const isVertical = orientation === "vertical";

  if (photo) {
    return (
      <div className={cn("relative overflow-hidden cs-showroom-slot", className)}>
        <ShowroomStage
          photo={mediaToCarPhoto(photo, car)}
          aspect="auto"
          orientation={isVertical ? "portrait" : "landscape"}
          priority={priority}
          sizes={sizes}
          fillHeight
          className={cn(
            "absolute inset-0 h-full w-full",
            isVertical ? "min-h-[420px] md:min-h-[560px]" : "min-h-[280px] md:min-h-[420px]"
          )}
        />
      </div>
    );
  }

  const Wrapper = editable ? "button" : "div";

  return (
    <Wrapper
      type={editable ? "button" : undefined}
      onClick={editable ? onUploadClick : undefined}
      className={cn(
        "cs-showroom-slot cs-showroom-slot--empty group relative flex items-center justify-center overflow-hidden",
        isVertical ? "min-h-[420px] md:min-h-[560px]" : "min-h-[280px] md:min-h-[420px]",
        editable && "cursor-pointer",
        className
      )}
    >
      <div className="absolute inset-0 bg-[#08080a]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(ellipse_at_center,rgba(196,176,138,0.06)_0%,transparent_70%)]" />
      <div className="absolute inset-4 md:inset-6 border border-white/[0.08] group-hover:border-champagne/25 transition-colors duration-500 pointer-events-none" />

      <div className="relative z-[1] flex flex-col items-center gap-4 px-6 text-center">
        <div className="w-11 h-11 flex items-center justify-center border border-white/10 group-hover:border-champagne/30 transition-colors duration-500">
          <ImagePlus
            size={18}
            strokeWidth={1.25}
            className="text-muted group-hover:text-champagne transition-colors duration-500"
          />
        </div>
        <p className="font-display text-[10px] tracking-[0.32em] uppercase text-muted group-hover:text-champagne/80 transition-colors duration-500">
          Aggiungi fotografia
        </p>
      </div>

      <div className="cs-motors-studio__led-top opacity-40" aria-hidden />
    </Wrapper>
  );
}

interface CarImageUploadProps extends Omit<CarImageSlotProps, "editable" | "onUploadClick"> {
  onSelectFiles?: (files: FileList) => void;
}

/** Slot con upload — per pannello admin. */
export function CarImageUpload({
  onSelectFiles,
  ...props
}: CarImageUploadProps) {
  const handleClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp,image/avif";
    input.multiple = true;
    input.onchange = () => {
      if (input.files?.length && onSelectFiles) onSelectFiles(input.files);
    };
    input.click();
  };

  return <CarImageSlot {...props} editable onUploadClick={handleClick} />;
}

/** Anteprima slot con src diretto (admin hero preview) */
export function CarImageSlotPreview({
  src,
  orientation,
  className,
}: {
  src: string;
  orientation: SlotOrientation;
  className?: string;
}) {
  const isVertical = orientation === "vertical";
  return (
    <div
      className={cn(
        "relative overflow-hidden cs-showroom-slot",
        isVertical ? "min-h-[200px]" : "min-h-[140px]",
        className
      )}
    >
      <Image src={src} alt="" fill className="object-cover cs-motors-studio__photo" sizes="400px" />
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
    </div>
  );
}
