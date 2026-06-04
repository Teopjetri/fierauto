"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { CarPhoto, PhotoOrientation } from "@/lib/types";
import { getAspectRatio, getObjectPosition, getPhotoOrientation } from "@/lib/imageUtils";

interface ShowroomStageProps {
  photo: CarPhoto;
  priority?: boolean;
  sizes?: string;
  className?: string;
  aspect?: "card" | "hero" | "detail" | "thumb" | "cinema" | "auto";
  orientation?: PhotoOrientation;
  interactive?: boolean;
  fillHeight?: boolean;
}

const presetAspect: Record<Exclude<ShowroomStageProps["aspect"], "auto" | undefined>, string> = {
  card: "aspect-[4/3]",
  hero: "aspect-[16/10] sm:aspect-[16/9]",
  detail: "aspect-[16/10] lg:aspect-[21/9]",
  thumb: "aspect-[4/3]",
  cinema: "aspect-[21/9] min-h-[280px] sm:min-h-[360px] lg:min-h-[480px]",
};

/** CS Motors Studio — ambiente fotografico premium unificato. Foto reali, nessun ritaglio. */
export function ShowroomStage({
  photo,
  priority = false,
  sizes = "100vw",
  className,
  aspect = "card",
  orientation,
  interactive = false,
  fillHeight = false,
}: ShowroomStageProps) {
  const resolvedOrientation = orientation ?? getPhotoOrientation(photo);
  const autoAspect = aspect === "auto";
  const aspectStyle = autoAspect ? { aspectRatio: getAspectRatio(resolvedOrientation) } : undefined;

  return (
    <div
      className={cn(
        "cs-motors-studio relative overflow-hidden isolate",
        !autoAspect && !fillHeight && presetAspect[aspect ?? "card"],
        fillHeight && "h-full min-h-[inherit]",
        interactive && "group/stage",
        className
      )}
      style={aspectStyle}
    >
      <div className="cs-motors-studio__backdrop" aria-hidden />
      <div className="cs-motors-studio__led-top" aria-hidden />
      <div className="cs-motors-studio__led-side" aria-hidden />
      <div className="cs-motors-studio__floor" aria-hidden />

      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        priority={priority}
        quality={94}
        sizes={sizes}
        className={cn(
          "object-cover cs-motors-studio__photo z-[1]",
          interactive && "transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/stage:scale-[1.015]"
        )}
        style={{ objectPosition: getObjectPosition(photo) }}
      />

      <div className="cs-motors-studio__reflection" aria-hidden />
      <div className="cs-motors-studio__vignette" aria-hidden />
    </div>
  );
}
