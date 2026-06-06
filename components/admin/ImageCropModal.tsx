"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Loader2, ZoomIn } from "lucide-react";
import {
  CROP_ASPECT,
  computeBaseScale,
  renderCropToCanvas,
  type CropTransform,
} from "@/lib/images/cropImage";
import { cn } from "@/lib/utils";

interface ImageCropModalProps {
  file: File;
  onConfirm: (blob: Blob) => Promise<void>;
  onCancel: () => void;
}

export function ImageCropModal({ file, onConfirm, onCancel }: ImageCropModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [loadError, setLoadError] = useState("");
  const [cropSize, setCropSize] = useState({ width: 320, height: 400 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [baseScale, setBaseScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  useEffect(() => {
    let active = true;
    let revoke: (() => void) | undefined;
    setLoadError("");
    setImage(null);

    if (!file.size) {
      setLoadError("Il file immagine è vuoto.");
      return;
    }

    const url = URL.createObjectURL(file);
    revoke = () => URL.revokeObjectURL(url);
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (!active) return;
      if (!img.naturalWidth || !img.naturalHeight) {
        setLoadError("Impossibile leggere le dimensioni dell'immagine.");
        return;
      }
      setImage(img);
    };
    img.onerror = () => {
      if (active) setLoadError("Impossibile caricare l'immagine per il ritaglio.");
    };
    img.src = url;

    return () => {
      active = false;
      revoke?.();
      setImage(null);
    };
  }, [file]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const width = el.clientWidth;
      setCropSize({ width, height: Math.round(width / CROP_ASPECT) });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!image || !cropSize.width) return;
    setBaseScale(computeBaseScale(image.naturalWidth, image.naturalHeight, cropSize.width, cropSize.height));
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [image, cropSize.width, cropSize.height]);

  const clampOffset = useCallback(
    (x: number, y: number, nextZoom: number) => {
      if (!image) return { x, y };
      const scale = baseScale * nextZoom;
      const imgW = image.naturalWidth * scale;
      const imgH = image.naturalHeight * scale;
      const maxX = Math.max(0, (imgW - cropSize.width) / 2);
      const maxY = Math.max(0, (imgH - cropSize.height) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, x)),
        y: Math.min(maxY, Math.max(-maxY, y)),
      };
    },
    [baseScale, cropSize.height, cropSize.width, image]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset(clampOffset(dragStart.current.ox + dx, dragStart.current.oy + dy, zoom));
  };

  const onPointerUp = () => setDragging(false);

  const transform: CropTransform = {
    baseScale,
    zoom,
    offsetX: offset.x,
    offsetY: offset.y,
  };

  const displayScale = baseScale * zoom;
  const displayW = image ? image.naturalWidth * displayScale : 0;
  const displayH = image ? image.naturalHeight * displayScale : 0;

  const handleConfirm = async () => {
    if (!image || saving) return;
    setSaving(true);
    try {
      const canvas = renderCropToCanvas(image, cropSize.width, cropSize.height, transform);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Esportazione fallita"))),
          "image/jpeg",
          0.92
        );
      });
      await onConfirm(blob);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/90 p-0 sm:p-6">
      <div className="w-full max-w-lg bg-[#0a0a0c] border border-white/10 shadow-2xl max-h-[100dvh] sm:max-h-[92vh] flex flex-col">
        <div className="px-6 py-5 border-b border-white/10 shrink-0">
          <h3 className="font-display text-xl font-light tracking-wide text-white/95">
            Inquadratura homepage
          </h3>
          <p className="text-sm text-muted font-light mt-1.5 leading-relaxed">
            Trascina e zooma per definire l&apos;anteprima verticale 4:5. La scheda vettura userà
            la foto originale.
          </p>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div
            ref={containerRef}
            className={cn(
              "relative w-full max-w-sm mx-auto overflow-hidden bg-black touch-none select-none ring-1 ring-white/15",
              dragging ? "cursor-grabbing" : "cursor-grab"
            )}
            style={{ aspectRatio: "4/5" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {loadError ? (
              <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
                <p className="text-sm text-red-400 font-light">{loadError}</p>
              </div>
            ) : !image ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="animate-spin text-champagne" />
              </div>
            ) : (
              <>
                <img
                  src={image.src}
                  alt=""
                  draggable={false}
                  className="absolute max-w-none pointer-events-none"
                  style={{
                    width: displayW,
                    height: displayH,
                    left: "50%",
                    top: "50%",
                    transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                  }}
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/25 pointer-events-none" />
              </>
            )}
          </div>

          <label className="block max-w-sm mx-auto w-full">
            <span className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-muted mb-2">
              <ZoomIn size={12} />
              Zoom
            </span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => {
                const next = parseFloat(e.target.value);
                setZoom(next);
                setOffset((prev) => clampOffset(prev.x, prev.y, next));
              }}
              className="w-full accent-champagne"
            />
          </label>
        </div>

        <div className="shrink-0 border-t border-white/10 bg-[#0a0a0c] px-6 py-5 space-y-3">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!image || saving}
            className="w-full py-4 font-display text-[11px] tracking-[0.24em] uppercase bg-champagne text-background hover:bg-champagne/90 disabled:opacity-50 inline-flex items-center justify-center gap-2 transition-colors"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            Salva inquadratura
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="w-full py-3 text-sm text-muted hover:text-white/80 transition-colors disabled:opacity-50"
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
}
