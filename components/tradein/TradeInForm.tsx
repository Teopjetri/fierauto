"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Upload, Loader2, Check, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { describeFiles, traceFileUpload } from "@/lib/upload/fileUploadTrace";

interface PhotoItem {
  id: string;
  file: File;
  preview: string;
}

interface TradeInFormProps {
  uploadHint?: string;
  variant?: "page" | "panel";
  onClose?: () => void;
}

function isImageFile(file: File) {
  if (file.type.startsWith("image/")) return true;
  if (/\.(heic|heif|jpe?g|png|webp|avif|gif)$/i.test(file.name)) return true;
  if (file.size > 0 && (!file.type || file.type === "application/octet-stream")) return true;
  return false;
}

export function TradeInForm({
  uploadHint = "Tocca per caricare le foto",
  variant = "page",
  onClose,
}: TradeInFormProps) {
  const previewGridRef = useRef<HTMLDivElement>(null);
  const previewUrlsRef = useRef<string[]>([]);

  const [email, setEmail] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const inputCls =
    "w-full bg-surface border border-border px-4 py-3 text-sm focus:border-champagne/40 focus:outline-none";

  useEffect(() => {
    traceFileUpload("trade-in-form", "component-mount", { variant });
    const onVisibility = () => {
      traceFileUpload("trade-in-form", "visibility-change", {
        hidden: document.hidden,
        visibilityState: document.visibilityState,
      });
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      traceFileUpload("trade-in-form", "component-unmount", { variant });
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current = [];
      delete document.body.dataset.tradeInPickerOpen;
    };
  }, [variant]);

  const addFiles = useCallback((incoming: File[]) => {
    traceFileUpload("trade-in-form", "enqueue", {
      incomingLength: incoming.length,
      files: incoming.map((f) => ({ name: f.name, type: f.type || "(empty)", size: f.size })),
    });

    if (!incoming.length) return;

    const accepted = incoming.filter(isImageFile);
    const rejected = incoming.filter((f) => !isImageFile(f));
    if (!accepted.length) {
      traceFileUpload("trade-in-form", "validation-reject", {
        rejected: rejected.map((f) => ({
          name: f.name,
          type: f.type || "(empty)",
          size: f.size,
          isImageFile: false,
        })),
      });
      setError("Formato foto non riconosciuto. Seleziona un'immagine dalla galleria.");
      return;
    }

    let scheduled: PhotoItem[] = [];

    setPhotos((prev) => {
      const room = Math.max(0, 8 - prev.length);
      const nextFiles = accepted.slice(0, room);
      if (!nextFiles.length) return prev;

      const stamp = Date.now();
      scheduled = nextFiles.map((file, index) => {
        const preview = URL.createObjectURL(file);
        previewUrlsRef.current.push(preview);
        return {
          id: `${stamp}-${index}-${file.name}-${file.size}`,
          file,
          preview,
        };
      });

      const next = [...prev, ...scheduled].slice(0, 8);
      traceFileUpload("trade-in-form", "state-update", {
        prevLength: prev.length,
        nextLength: next.length,
      });
      return next;
    });

    if (!scheduled.length) return;

    setError("");
    window.requestAnimationFrame(() => {
      previewGridRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }, []);

  const markPickerOpen = () => {
    document.body.dataset.tradeInPickerOpen = "1";
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const described = describeFiles(e.target.files);
    traceFileUpload("trade-in-form", "input-change", {
      inputId: e.target.id || "(none)",
      ...described,
    });

    const list = Array.from(e.target.files ?? []);
    delete document.body.dataset.tradeInPickerOpen;
    window.setTimeout(() => {
      e.target.value = "";
    }, 300);
    if (list.length) addFiles(list);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData();
    form.append("email", email);
    form.append("brand", brand);
    form.append("model", model);
    form.append("year", year);
    photos.forEach(({ file }) => form.append("photos", file));

    try {
      const res = await fetch("/api/trade-in", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invio non riuscito");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante l'invio");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 mx-auto mb-6 flex items-center justify-center border border-champagne/35">
          <Check size={22} className="text-champagne" />
        </div>
        <h3 className="font-display text-xl mb-3">Richiesta inviata</h3>
        <p className="text-muted text-sm font-light leading-relaxed">
          Riceverai una mail non appena la valutazione sarà visionata dal nostro team.
        </p>
        {variant === "panel" ? (
          <button
            type="button"
            onClick={onClose}
            className="mt-8 text-[10px] tracking-[0.25em] uppercase text-champagne hover:text-champagne-light"
          >
            Chiudi
          </button>
        ) : (
          <Link
            href="/"
            className="mt-8 inline-block text-[10px] tracking-[0.25em] uppercase text-champagne hover:text-champagne-light"
          >
            Torna alla home
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      <p className="text-muted text-sm font-light leading-relaxed mb-8">
        Carica le foto della tua auto, inserisci marca, modello e anno. Ti ricontattiamo via email
        appena visionata la richiesta.
      </p>

      <form onSubmit={submit} className="space-y-5">
        <label className="block">
          <span className="text-[10px] tracking-[0.2em] uppercase text-muted mb-2 block">
            La tua email *
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="tua@email.it"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-[10px] tracking-[0.2em] uppercase text-muted mb-2 block">
              Marca *
            </span>
            <input
              required
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className={inputCls}
              placeholder="Es. BMW"
            />
          </label>
          <label className="block">
            <span className="text-[10px] tracking-[0.2em] uppercase text-muted mb-2 block">
              Anno *
            </span>
            <input
              required
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className={inputCls}
              placeholder="Es. 2020"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-[10px] tracking-[0.2em] uppercase text-muted mb-2 block">
            Modello *
          </span>
          <input
            required
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className={inputCls}
            placeholder="Es. Serie 5"
          />
        </label>

        <div>
          <span className="text-[10px] tracking-[0.2em] uppercase text-muted mb-2 block">
            Foto del veicolo *
          </span>
          <div className="trade-in-form__upload border border-dashed border-white/15 p-4 sm:p-5">
            {photos.length > 0 && (
              <>
                <p className="mb-3 text-xs text-champagne/90 font-light">
                  {photos.length} foto selezionate
                </p>
                <div ref={previewGridRef} className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {photos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className="h-[120px] w-full overflow-hidden ring-1 ring-white/10 bg-black/40"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.preview}
                        alt={`Anteprima foto ${index + 1}`}
                        className="block h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            <label
              onPointerDown={markPickerOpen}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                addFiles(Array.from(e.dataTransfer.files));
              }}
              className={cn(
                "relative block w-full min-h-[120px] cursor-pointer border border-dashed border-white/10 hover:border-champagne/35 text-center transition-colors touch-manipulation overflow-hidden",
                photos.length > 0
                  ? "py-4 px-3"
                  : "py-8 px-4 border-transparent hover:border-champagne/35"
              )}
            >
              <input
                type="file"
                accept="image/*,.heic,.heif"
                multiple
                onChange={onFileInputChange}
                className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-[0.01]"
              />
              <div className="pointer-events-none relative z-10">
                <Upload
                  size={photos.length > 0 ? 20 : 24}
                  className="mx-auto text-champagne/60 mb-2"
                  strokeWidth={1.25}
                />
                <p className="font-display text-[10px] tracking-[0.2em] uppercase text-muted">
                  {photos.length > 0
                    ? `Aggiungi altre foto (${photos.length}/8)`
                    : uploadHint}
                </p>
                {photos.length === 0 && (
                  <p className="text-xs text-muted/70 mt-2">Max 8 foto</p>
                )}
              </div>
            </label>
          </div>

          {photos.length === 0 && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted/60">
              <ImagePlus size={14} />
              <span>Aggiungi almeno una fotografia</span>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-400/90">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full py-3.5 font-display text-[10px] tracking-[0.25em] uppercase",
            "bg-champagne/90 text-background hover:bg-champagne transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "inline-flex items-center justify-center gap-2"
          )}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Invio in corso…
            </>
          ) : (
            "Invia per valutazione"
          )}
        </button>
      </form>
    </>
  );
}
