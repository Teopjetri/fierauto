"use client";

import { useRef } from "react";
import { Upload, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildLocalImagePreviews,
  isImageFile,
  type LocalImagePreview,
} from "@/lib/upload/imageFile";
import { describeFiles, traceFileUpload } from "@/lib/upload/fileUploadTrace";

export interface ImageUploadPickerProps {
  traceSource?: string;
  label?: string;
  uploadHint?: string;
  maxFiles: number;
  /** Totale immagini già presenti (server + locali in coda). */
  selectedCount: number;
  previews: LocalImagePreview[];
  onPreviewsAdded: (items: LocalImagePreview[]) => void;
  onValidationError?: (message: string) => void;
  disabled?: boolean;
  inputId?: string;
  className?: string;
  showEmptyHint?: boolean;
}

export function ImageUploadPicker({
  traceSource = "image-upload-picker",
  label = "Foto",
  uploadHint = "Tocca per caricare le foto",
  maxFiles,
  selectedCount,
  previews,
  onPreviewsAdded,
  onValidationError,
  disabled = false,
  inputId = "image-upload-picker-input",
  className,
  showEmptyHint = true,
}: ImageUploadPickerProps) {
  const previewGridRef = useRef<HTMLDivElement>(null);

  const room = Math.max(0, maxFiles - selectedCount);

  const addFiles = (incoming: File[]) => {
    traceFileUpload(traceSource, "enqueue", {
      incomingLength: incoming.length,
      files: incoming.map((f) => ({ name: f.name, type: f.type || "(empty)", size: f.size })),
    });

    if (!incoming.length || disabled) return;

    const accepted = incoming.filter(isImageFile);
    const rejected = incoming.filter((f) => !isImageFile(f));

    if (!accepted.length) {
      traceFileUpload(traceSource, "validation-reject", {
        rejected: rejected.map((f) => ({
          name: f.name,
          type: f.type || "(empty)",
          size: f.size,
        })),
      });
      onValidationError?.(
        "Formato foto non riconosciuto. Seleziona un'immagine dalla galleria (JPG, PNG, WEBP o HEIC)."
      );
      return;
    }

    const nextFiles = accepted.slice(0, room);
    if (!nextFiles.length) return;

    const items = buildLocalImagePreviews(nextFiles, { startIndex: previews.length });
    traceFileUpload(traceSource, "state-update", {
      added: items.length,
      selectedCount: selectedCount + items.length,
    });
    onPreviewsAdded(items);

    window.requestAnimationFrame(() => {
      previewGridRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    traceFileUpload(traceSource, "input-change", describeFiles(e.target.files));
    const list = Array.from(e.target.files ?? []);
    window.setTimeout(() => {
      e.target.value = "";
    }, 300);
    if (list.length) addFiles(list);
  };

  return (
    <div className={className}>
      {label ? (
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted mb-2 block">{label}</span>
      ) : null}

      <div className="border border-dashed border-white/15 p-4 sm:p-5">
        {previews.length > 0 && (
          <>
            <p className="mb-3 text-xs text-champagne/90 font-light">
              {previews.length} foto in anteprima
            </p>
            <div ref={previewGridRef} className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {previews.map((photo, index) => (
                <div
                  key={photo.id}
                  className="h-[120px] w-full overflow-hidden ring-1 ring-white/10 bg-black/40"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.previewUrl}
                    alt={`Anteprima foto ${index + 1}`}
                    className="block h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </>
        )}

        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (disabled) return;
            addFiles(Array.from(e.dataTransfer.files));
          }}
          className={cn(
            "relative block w-full min-h-[120px] cursor-pointer border border-dashed border-white/10 hover:border-champagne/35 text-center transition-colors touch-manipulation overflow-hidden",
            previews.length > 0 ? "py-4 px-3" : "py-8 px-4 border-transparent hover:border-champagne/35",
            disabled && "pointer-events-none opacity-60"
          )}
        >
          <input
            id={inputId}
            type="file"
            accept="image/*,.heic,.heif"
            multiple
            disabled={disabled || room <= 0}
            onChange={onFileInputChange}
            className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-[0.01]"
          />
          <div className="pointer-events-none relative z-10">
            <Upload
              size={previews.length > 0 ? 20 : 24}
              className="mx-auto text-champagne/60 mb-2"
              strokeWidth={1.25}
            />
            <p className="font-display text-[10px] tracking-[0.2em] uppercase text-muted">
              {room <= 0
                ? `Limite raggiunto (${maxFiles})`
                : previews.length > 0
                  ? `Aggiungi altre foto (${selectedCount}/${maxFiles})`
                  : uploadHint}
            </p>
            {previews.length === 0 && room > 0 && (
              <p className="text-xs text-muted/70 mt-2">Max {maxFiles} foto · JPG · PNG · WEBP · HEIC</p>
            )}
          </div>
        </label>
      </div>

      {showEmptyHint && previews.length === 0 && room > 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted/60">
          <ImagePlus size={14} />
          <span>Aggiungi almeno una fotografia</span>
        </div>
      )}
    </div>
  );
}
