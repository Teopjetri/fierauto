"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageUploadPicker } from "@/components/upload/ImageUploadPicker";
import {
  revokeLocalImagePreviews,
  type LocalImagePreview,
} from "@/lib/upload/imageFile";
import { traceFileUpload } from "@/lib/upload/fileUploadTrace";

const MAX_TRADE_IN_PHOTOS = 8;

interface TradeInFormProps {
  uploadHint?: string;
  variant?: "page" | "panel";
  onClose?: () => void;
}

export function TradeInForm({
  uploadHint = "Tocca per caricare le foto",
  variant = "page",
  onClose,
}: TradeInFormProps) {
  const photosRef = useRef<LocalImagePreview[]>([]);

  const [email, setEmail] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [version, setVersion] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [fuel, setFuel] = useState("");
  const [powerCv, setPowerCv] = useState("");
  const [requestedPrice, setRequestedPrice] = useState("");
  const [photos, setPhotos] = useState<LocalImagePreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const inputCls =
    "w-full bg-surface border border-border px-4 py-3 text-sm focus:border-champagne/40 focus:outline-none";

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

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
      revokeLocalImagePreviews(photosRef.current);
      delete document.body.dataset.tradeInPickerOpen;
    };
  }, [variant]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData();
    form.append("email", email);
    form.append("brand", brand);
    form.append("model", model);
    form.append("version", version);
    form.append("year", year);
    form.append("mileage", mileage);
    form.append("fuel", fuel);
    form.append("powerCv", powerCv);
    form.append("requestedPrice", requestedPrice);
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

        <label className="block">
          <span className="text-[10px] tracking-[0.2em] uppercase text-muted mb-2 block">
            Versione / Allestimento
          </span>
          <input
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className={inputCls}
            placeholder="Es. S-Line S-Tronic"
          />
        </label>

        <label className="block">
          <span className="text-[10px] tracking-[0.2em] uppercase text-muted mb-2 block">
            Chilometri *
          </span>
          <input
            required
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            className={inputCls}
            placeholder="Es. 85.000"
            inputMode="numeric"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-[10px] tracking-[0.2em] uppercase text-muted mb-2 block">
              Alimentazione
            </span>
            <input
              value={fuel}
              onChange={(e) => setFuel(e.target.value)}
              className={inputCls}
              placeholder="Es. Diesel"
            />
          </label>
          <label className="block">
            <span className="text-[10px] tracking-[0.2em] uppercase text-muted mb-2 block">
              Potenza CV
            </span>
            <input
              value={powerCv}
              onChange={(e) => setPowerCv(e.target.value)}
              className={inputCls}
              placeholder="Es. 190"
              inputMode="numeric"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-[10px] tracking-[0.2em] uppercase text-muted mb-2 block">
            Prezzo richiesto
          </span>
          <input
            value={requestedPrice}
            onChange={(e) => setRequestedPrice(e.target.value)}
            className={inputCls}
            placeholder="Es. 18.500"
            inputMode="decimal"
          />
        </label>

        <ImageUploadPicker
          traceSource="trade-in-form"
          label="Foto del veicolo *"
          uploadHint={uploadHint}
          maxFiles={MAX_TRADE_IN_PHOTOS}
          selectedCount={photos.length}
          previews={photos}
          onPreviewsAdded={(items) => {
            setError("");
            setPhotos((prev) => [...prev, ...items].slice(0, MAX_TRADE_IN_PHOTOS));
          }}
          onValidationError={setError}
          className="trade-in-form__upload"
          inputId="trade-in-photo-upload"
        />

        {error && <p className="text-sm text-red-400/90">{error}</p>}

        <button
          type="submit"
          disabled={loading || photos.length === 0}
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
