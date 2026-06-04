"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Upload,
  Trash2,
  Star,
  GripVertical,
  ImageIcon,
  Loader2,
  Monitor,
  Smartphone,
  Square,
} from "lucide-react";
import type { CarMediaManifest, CarMediaPhoto } from "@/lib/media/types";
import { detectOrientation } from "@/lib/media/types";
import { cn } from "@/lib/utils";
import { describeFiles, traceFileUpload } from "@/lib/upload/fileUploadTrace";

interface CarMediaManagerProps {
  slug: string;
  carLabel: string;
  initialManifest: CarMediaManifest;
}

export function CarMediaManager({ slug, carLabel, initialManifest }: CarMediaManagerProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [manifest, setManifest] = useState(initialManifest);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const photos = [...manifest.photos].sort((a, b) => a.order - b.order);

  useEffect(() => {
    traceFileUpload("car-media-manager", "component-mount", { slug });
    return () => {
      traceFileUpload("car-media-manager", "component-unmount", { slug });
    };
  }, [slug]);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/cars/${slug}/media`);
    if (res.ok) setManifest(await res.json());
    router.refresh();
  }, [slug, router]);

  const detectClientOrientation = (file: File): Promise<CarMediaPhoto["orientation"]> =>
    new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(detectOrientation(img.naturalWidth, img.naturalHeight));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve("landscape");
      };
      img.src = url;
    });

  const uploadFiles = async (files: FileList | File[]) => {
    const incoming = Array.from(files);
    traceFileUpload("car-media-manager", "enqueue", {
      incomingLength: incoming.length,
      files: incoming.map((f) => ({ name: f.name, type: f.type || "(empty)", size: f.size })),
    });

    const rejected = incoming.filter((f) => !f.type.startsWith("image/"));
    const list = incoming.filter((f) => f.type.startsWith("image/"));

    if (rejected.length) {
      traceFileUpload("car-media-manager", "validation-reject", {
        filter: "file.type.startsWith('image/')",
        rejected: rejected.map((f) => ({
          name: f.name,
          type: f.type || "(empty)",
          size: f.size,
        })),
      });
    }

    if (list.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const orientations: Record<string, string> = {};
      await Promise.all(
        list.map(async (file) => {
          orientations[file.name] = await detectClientOrientation(file);
        })
      );

      const form = new FormData();
      list.forEach((file) => form.append("files", file));
      form.append("orientations", JSON.stringify(orientations));

      const res = await fetch(`/api/cars/${slug}/media`, { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload fallito");
      setManifest(await res.json());
      router.refresh();
    } catch {
      setError("Errore durante l'upload. Riprova.");
    } finally {
      setUploading(false);
    }
  };

  const setHero = async (photoId: string) => {
    const res = await fetch(`/api/cars/${slug}/media`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heroId: photoId }),
    });
    if (res.ok) {
      setManifest(await res.json());
      router.refresh();
    }
  };

  const setOrientation = async (photoId: string, orientation: CarMediaPhoto["orientation"]) => {
    const res = await fetch(`/api/cars/${slug}/media`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orientations: { [photoId]: orientation } }),
    });
    if (res.ok) setManifest(await res.json());
  };

  const removePhoto = async (photoId: string) => {
    if (!confirm("Eliminare questa immagine?")) return;
    const res = await fetch(`/api/cars/${slug}/media/${photoId}`, { method: "DELETE" });
    if (res.ok) {
      setManifest(await res.json());
      router.refresh();
    }
  };

  const reorder = async (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const ids = photos.map((p) => p.id);
    const fromIndex = ids.indexOf(fromId);
    const toIndex = ids.indexOf(toId);
    if (fromIndex < 0 || toIndex < 0) return;
    ids.splice(fromIndex, 1);
    ids.splice(toIndex, 0, fromId);

    const res = await fetch(`/api/cars/${slug}/media`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: ids }),
    });
    if (res.ok) setManifest(await res.json());
  };

  return (
    <div className="space-y-10">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          uploadFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative cursor-pointer border border-dashed rounded-none p-10 md:p-14 text-center transition-all duration-500",
          dragOver
            ? "border-champagne bg-champagne/5"
            : "border-white/15 hover:border-champagne/40 hover:bg-white/[0.02]"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={(e) => {
            traceFileUpload("car-media-manager", "input-change", describeFiles(e.target.files));
            if (e.target.files) uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <div className="flex flex-col items-center gap-4">
          {uploading ? (
            <Loader2 size={32} className="text-champagne animate-spin" />
          ) : (
            <Upload size={32} className="text-champagne/70" strokeWidth={1.25} />
          )}
          <div>
            <p className="font-display text-sm tracking-[0.2em] uppercase text-foreground mb-2">
              {uploading ? "Caricamento in corso…" : "Trascina le immagini qui"}
            </p>
            <p className="text-muted text-sm font-light">
              oppure clicca per selezionare · JPG, PNG, WebP · Hero + galleria
            </p>
          </div>
        </div>
      </div>

      {error && <p className="text-red-400/90 text-sm">{error}</p>}

      {/* Hero preview */}
      <div>
        <p className="font-display text-[10px] tracking-[0.32em] uppercase text-champagne mb-4">
          Anteprima hero · {carLabel}
        </p>
        <div className="relative min-h-[280px] md:min-h-[360px] ring-1 ring-white/[0.08] overflow-hidden cs-motors-hero__image-zone">
          {photos.find((p) => p.isHero) ? (
            <>
              <Image
                src={photos.find((p) => p.isHero)!.src}
                alt="Hero preview"
                fill
                className="object-cover object-[72%_58%] cs-motors-studio__photo"
              />
              <div className="absolute inset-0 cs-motors-hero__scrim pointer-events-none" />
              <div className="absolute bottom-8 left-8 z-[2]">
                <p className="font-display text-2xl font-light drop-shadow-lg">{carLabel}</p>
                <p className="text-[10px] tracking-[0.24em] uppercase text-champagne/80 mt-2">
                  Zona testo ottimizzata
                </p>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted text-sm font-light gap-2">
              <ImageIcon size={18} />
              Imposta un&apos;immagine hero dalla galleria sotto
            </div>
          )}
        </div>
      </div>

      {/* Gallery manager */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <p className="font-display text-[10px] tracking-[0.32em] uppercase text-champagne">
            Galleria · {photos.length} immagini
          </p>
          <button
            type="button"
            onClick={() => refresh()}
            className="text-[10px] tracking-[0.18em] uppercase text-muted hover:text-champagne transition-colors"
          >
            Aggiorna
          </button>
        </div>

        {photos.length === 0 ? (
          <p className="text-muted text-sm font-light py-12 text-center border border-border">
            Nessuna immagine caricata. Usa l&apos;area upload sopra.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {photos.map((photo) => (
              <div
                key={photo.id}
                draggable
                onDragStart={() => setDragId(photo.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragId) reorder(dragId, photo.id);
                  setDragId(null);
                }}
                className={cn(
                  "group relative ring-1 overflow-hidden transition-all duration-300",
                  photo.isHero ? "ring-champagne/50" : "ring-white/[0.08]",
                  dragId === photo.id && "opacity-50"
                )}
              >
                <div
                  className={cn(
                    "relative bg-[#0a0a0c]",
                    photo.orientation === "portrait" ? "aspect-[3/4]" : "aspect-[16/10]"
                  )}
                >
                  <Image src={photo.src} alt={photo.alt} fill className="object-cover" sizes="400px" />
                </div>

                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="p-1.5 bg-black/60 backdrop-blur-sm cursor-grab active:cursor-grabbing">
                    <GripVertical size={14} className="text-muted" />
                  </span>
                  {photo.isHero && (
                    <span className="px-2 py-1 bg-champagne/90 text-[9px] tracking-[0.15em] uppercase text-background font-display">
                      Hero
                    </span>
                  )}
                </div>

                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent flex items-end justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex gap-1">
                    {(["landscape", "portrait", "square"] as const).map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => setOrientation(photo.id, o)}
                        className={cn(
                          "p-1.5 bg-black/60 backdrop-blur-sm transition-colors",
                          photo.orientation === o ? "text-champagne" : "text-muted hover:text-foreground"
                        )}
                        title={o}
                      >
                        {o === "landscape" && <Monitor size={14} />}
                        {o === "portrait" && <Smartphone size={14} />}
                        {o === "square" && <Square size={14} />}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    {!photo.isHero && (
                      <button
                        type="button"
                        onClick={() => setHero(photo.id)}
                        className="p-1.5 bg-black/60 backdrop-blur-sm text-muted hover:text-champagne transition-colors"
                        title="Imposta hero"
                      >
                        <Star size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="p-1.5 bg-black/60 backdrop-blur-sm text-muted hover:text-red-400 transition-colors"
                      title="Elimina"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
