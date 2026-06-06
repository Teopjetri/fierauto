"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, GripVertical, Loader2, Save, Star, Check, ImageIcon } from "lucide-react";
import { ImageCropModal } from "@/components/admin/ImageCropModal";
import { ImageUploadPicker } from "@/components/upload/ImageUploadPicker";
import type { Listing, ListingImage, ListingStatus } from "@/lib/listings/types";
import {
  DETAIL_PHOTO_ASPECT,
  hasHomeCrop,
  HOME_PHOTO_ASPECT,
  LISTING_STATUS_LABELS,
  MAX_LISTING_IMAGES,
  sortImages,
} from "@/lib/listings/types";
import { cn } from "@/lib/utils";
import {
  revokeLocalImagePreviews,
  type LocalImagePreview,
} from "@/lib/upload/imageFile";
import { traceFileUpload } from "@/lib/upload/fileUploadTrace";

interface CropSession {
  imageId: string;
  file?: File;
  imageUrl?: string;
}

const UPLOAD_DIAG = "[UPLOAD-DIAG]";

/** Evita cache browser su crop sovrascritto allo stesso path (-home.jpg). */
function adminImageUrl(src: string, cacheKey: string): string {
  if (!cacheKey) return src;
  const sep = src.includes("?") ? "&" : "?";
  return `${src}${sep}v=${encodeURIComponent(cacheKey)}`;
}

interface ListingEditorProps {
  listing?: Listing;
  mode: "create" | "edit";
}

export function ListingEditor({ listing, mode }: ListingEditorProps) {
  const router = useRouter();
  const pendingPreviewsRef = useRef<LocalImagePreview[]>([]);
  const brandRef = useRef<HTMLInputElement>(null);
  const modelRef = useRef<HTMLInputElement>(null);
  const versionRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const powerCvRef = useRef<HTMLInputElement>(null);
  const fuelRef = useRef<HTMLInputElement>(null);
  const uploadProcessingRef = useRef(false);
  const [data, setData] = useState<Listing | null>(listing ?? null);
  const [brand, setBrand] = useState(listing?.brand ?? "");
  const [model, setModel] = useState(listing?.model ?? "");
  const [version, setVersion] = useState(listing?.version ?? "");
  const [year, setYear] = useState(listing?.year ?? "");
  const [powerCv, setPowerCv] = useState(listing?.powerCv ?? "");
  const [fuel, setFuel] = useState(listing?.fuel ?? "");
  const [mileage, setMileage] = useState(listing?.mileage ?? "");
  const [price, setPrice] = useState(listing?.price ?? "");
  const [description, setDescription] = useState(listing?.description ?? "");
  const [status, setStatus] = useState<ListingStatus>(listing?.status ?? "draft");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileQueue, setFileQueue] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<LocalImagePreview[]>([]);
  const [cropSession, setCropSession] = useState<CropSession | null>(null);
  const [cropPreviewNonce, setCropPreviewNonce] = useState(0);
  const [cropSavedToast, setCropSavedToast] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const photos = sortImages(data?.images ?? []);
  const cover = photos[0] ?? null;
  const cropPreviewKey = `${data?.updatedAt ?? "0"}:${cropPreviewNonce}`;
  const totalSelected = photos.length + pendingPreviews.length;
  const canUpload = Boolean(data) && totalSelected < MAX_LISTING_IMAGES;

  useEffect(() => {
    pendingPreviewsRef.current = pendingPreviews;
  }, [pendingPreviews]);

  useEffect(() => {
    traceFileUpload("listing-editor", "component-mount", { mode, listingId: data?.id ?? null });
  }, [mode, data?.id]);

  useEffect(() => {
    return () => {
      traceFileUpload("listing-editor", "component-unmount", {
        mode,
        listingId: pendingPreviewsRef.current.length ? data?.id ?? null : null,
      });
      revokeLocalImagePreviews(pendingPreviewsRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shiftPendingPreview = () => {
    setPendingPreviews((prev) => {
      const [first, ...rest] = prev;
      if (first) URL.revokeObjectURL(first.previewUrl);
      return rest;
    });
  };

  const payload = () => ({
    brand,
    model,
    version,
    year,
    powerCv,
    fuel,
    mileage,
    price,
    description,
    status,
  });

  const save = async () => {
    if (!data) return;
    if (!brand.trim() || !model.trim() || !year.trim()) {
      setError("Inserisci marca, modello e anno.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/listings/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload()),
      });
      if (!res.ok) throw new Error("Salvataggio fallito");
      setData(await res.json());
      router.refresh();
    } catch {
      setError("Errore durante il salvataggio.");
    } finally {
      setSaving(false);
    }
  };

  const uploadOriginal = async (file: File): Promise<string> => {
    if (!data) throw new Error("Annuncio non pronto");
    console.log(UPLOAD_DIAG, "upload:request:start", {
      listingId: data.id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
    const form = new FormData();
    form.append("files", file);
    const res = await fetch(`/api/listings/${data.id}/images`, { method: "POST", body: form });
    console.log(UPLOAD_DIAG, "upload:request:response", {
      ok: res.ok,
      status: res.status,
      listingId: data.id,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Upload fallito");
    const listing = json as Listing;
    const previousIds = new Set(data.images.map((i) => i.id));
    const added = sortImages(listing.images).find((img) => !previousIds.has(img.id));
    if (!added) throw new Error("Immagine non registrata");
    console.log(UPLOAD_DIAG, "upload:request:ok", { imageId: added.id, src: added.src });
    setData(listing);
    return added.id;
  };

  const uploadHomeCrop = async (imageId: string, blob: Blob) => {
    if (!data) return;
    setUploading(true);
    setError("");
    const form = new FormData();
    form.append("crop", new File([blob], "home-crop.jpg", { type: "image/jpeg" }));
    try {
      const res = await fetch(`/api/listings/${data.id}/images/${imageId}/crop`, {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Salvataggio ritaglio fallito");
      setData(json as Listing);
      setCropPreviewNonce((n) => n + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Salvataggio ritaglio fallito");
      throw e;
    } finally {
      setUploading(false);
    }
  };

  const enqueuePreviews = (items: LocalImagePreview[]) => {
    if (!data || !items.length) {
      traceFileUpload("listing-editor", "validation-reject", { reason: "listing-not-ready" });
      return;
    }

    const files = items.map((item) => item.file);
    console.log(UPLOAD_DIAG, "enqueue:click", {
      received: files.length,
      queueBefore: fileQueue.length,
      listingId: data.id,
    });

    setError("");
    setPendingPreviews((prev) => [...prev, ...items]);
    setFileQueue((prev) => [...prev, ...files]);
  };

  useEffect(() => {
    if (!data || fileQueue.length === 0 || uploadProcessingRef.current) return;

    const file = fileQueue[0];
    const listingId = data.id;
    uploadProcessingRef.current = true;

    console.log(UPLOAD_DIAG, "queue:process:start", {
      fileName: file.name,
      queueLength: fileQueue.length,
      listingId,
    });

    void (async () => {
      setUploading(true);
      setError("");
      try {
        await uploadOriginal(file);
        console.log(UPLOAD_DIAG, "queue:process:upload-complete", { fileName: file.name });
        setFileQueue((prev) => prev.slice(1));
        shiftPendingPreview();
      } catch (e) {
        console.error(UPLOAD_DIAG, "queue:process:error", e);
        setError(e instanceof Error ? e.message : "Upload fallito");
        setFileQueue((prev) => prev.slice(1));
      } finally {
        uploadProcessingRef.current = false;
        console.log(UPLOAD_DIAG, "queue:process:done", {
          fileName: file.name,
          setUploadingFalse: true,
        });
        setUploading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileQueue, data?.id]);

  const onCropConfirm = async (blob: Blob) => {
    if (!cropSession) return;
    try {
      await uploadHomeCrop(cropSession.imageId, blob);
      setCropSession(null);
      setCropSavedToast(true);
      window.setTimeout(() => setCropSavedToast(false), 2000);
    } catch {
      /* error already set */
    }
  };

  const openCoverCrop = () => {
    if (!cover) return;
    const imageUrl = hasHomeCrop(cover)
      ? adminImageUrl(cover.cropSrc!, cropPreviewKey)
      : adminImageUrl(cover.src, `${cover.id}:${cover.createdAt}`);
    setCropSession({ imageId: cover.id, imageUrl });
  };

  const removePhoto = async (imageId: string) => {
    if (!data || !confirm("Eliminare questa immagine?")) return;
    const res = await fetch(`/api/listings/${data.id}/images/${imageId}`, { method: "DELETE" });
    if (res.ok) {
      setData(await res.json());
      router.refresh();
    }
  };

  const reorder = async (fromId: string, toId: string) => {
    if (!data || fromId === toId) return;
    const ids = photos.map((p) => p.id);
    const from = ids.indexOf(fromId);
    const to = ids.indexOf(toId);
    ids.splice(from, 1);
    ids.splice(to, 0, fromId);
    const res = await fetch(`/api/listings/${data.id}/images`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: ids }),
    });
    if (res.ok) setData(await res.json());
  };

  return (
    <div className="space-y-10">
      <Field
        label="Marca *"
        value={brand}
        onChange={setBrand}
        placeholder="Es. Fiat"
        inputRef={brandRef}
        nextRef={modelRef}
      />
      <Field
        label="Modello *"
        value={model}
        onChange={setModel}
        placeholder="Es. Panda"
        inputRef={modelRef}
        nextRef={versionRef}
      />
      <Field
        label="Versione"
        value={version}
        onChange={setVersion}
        placeholder="Es. 1.0 Hybrid"
        inputRef={versionRef}
        nextRef={yearRef}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Anno *"
          value={year}
          onChange={setYear}
          placeholder="Es. 2020"
          inputRef={yearRef}
          nextRef={powerCvRef}
          inputMode="numeric"
        />
        <Field
          label="Potenza cv"
          value={powerCv}
          onChange={setPowerCv}
          placeholder="Es. 120"
          inputRef={powerCvRef}
          nextRef={fuelRef}
          inputMode="numeric"
        />
      </div>
      <Field
        label="Alimentazione"
        value={fuel}
        onChange={setFuel}
        placeholder="Es. Benzina"
        inputRef={fuelRef}
        enterKeyHint="done"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Chilometri" value={mileage} onChange={setMileage} placeholder="Es. 48.000 km" />
        <Field label="Prezzo" value={price} onChange={setPrice} placeholder="Es. € 32.900" />
      </div>

      <Field label="Descrizione" value={description} onChange={setDescription} multiline />

      <section className="space-y-5 border-t border-border pt-10">
        <div>
          <h3 className="font-display text-lg font-light mb-1">Immagini</h3>
          <p className="text-muted text-sm font-light">
            Massimo {MAX_LISTING_IMAGES} foto. La prima è la copertina dell&apos;annuncio.
          </p>
        </div>

        {!data ? (
          <p className="text-sm text-muted font-light">Annuncio non disponibile. Ricarica la pagina.</p>
        ) : (
          <>
            {canUpload && (
              <ImageUploadPicker
                traceSource="listing-editor"
                label=""
                uploadHint="Trascina le foto qui o tocca per selezionare"
                maxFiles={MAX_LISTING_IMAGES}
                selectedCount={totalSelected}
                previews={pendingPreviews}
                onPreviewsAdded={enqueuePreviews}
                onValidationError={setError}
                disabled={uploading || !data}
                inputId="listing-photo-upload"
                showEmptyHint={false}
              />
            )}

            {uploading && (
              <p className="inline-flex items-center gap-2 text-xs text-champagne/90 font-light">
                <Loader2 size={14} className="animate-spin" />
                Caricamento in corso…
              </p>
            )}

            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((photo, i) => (
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
                      "relative overflow-hidden ring-1 ring-white/10 group",
                      DETAIL_PHOTO_ASPECT
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.src}
                      alt=""
                      className="absolute inset-0 h-full w-full object-contain bg-black"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <GripVertical size={14} className="text-white/60 cursor-grab" />
                      {i === 0 && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-champagne/90 text-[8px] uppercase tracking-wider text-background font-display">
                          <Star size={10} className="fill-current" />
                          Copertina
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {cover && data && (
        <HomepageCoverSection
          cover={cover}
          cropDisplaySrc={
            hasHomeCrop(cover) ? adminImageUrl(cover.cropSrc!, cropPreviewKey) : null
          }
          placeholderSrc={adminImageUrl(cover.src, `${cover.id}:${cover.createdAt}`)}
          previewKey={cropPreviewKey}
          cropSaved={cropSavedToast}
          onCustomize={openCoverCrop}
        />
      )}

      <label className="block">
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted mb-2 block">Stato annuncio</span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ListingStatus)}
          className="w-full bg-surface border border-border px-4 py-3 text-sm focus:border-champagne/40 focus:outline-none"
        >
          {(Object.keys(LISTING_STATUS_LABELS) as ListingStatus[]).map((s) => (
            <option key={s} value={s}>
              {LISTING_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="button"
        disabled={saving || !data}
        onClick={save}
        className="inline-flex items-center gap-2 px-6 py-3.5 font-display text-[10px] tracking-[0.2em] uppercase bg-champagne/90 text-background hover:bg-champagne disabled:opacity-50 transition-colors"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        Salva annuncio
      </button>

      {cropSession && (
        <ImageCropModal
          file={cropSession.file}
          imageUrl={cropSession.imageUrl}
          onConfirm={onCropConfirm}
          onCancel={() => setCropSession(null)}
        />
      )}
    </div>
  );
}

function HomepageCoverSection({
  cover,
  cropDisplaySrc,
  placeholderSrc,
  previewKey,
  cropSaved,
  onCustomize,
}: {
  cover: ListingImage;
  cropDisplaySrc: string | null;
  placeholderSrc: string;
  previewKey: string;
  cropSaved: boolean;
  onCustomize: () => void;
}) {
  const hasCrop = Boolean(cropDisplaySrc);

  return (
    <section className="border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6 md:p-8 space-y-6">
      <div>
        <p className="font-display text-[11px] tracking-[0.28em] uppercase text-champagne mb-2">
          Copertina homepage
        </p>
        <p className="text-sm text-muted font-light leading-relaxed max-w-lg">
          Anteprima verticale 4:5 mostrata nella homepage del sito. La scheda vettura userà la foto
          originale.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        <div
          className={cn(
            "relative w-full max-w-[300px] shrink-0 overflow-hidden ring-1 bg-black",
            hasCrop ? "ring-champagne/30" : "ring-white/15",
            HOME_PHOTO_ASPECT
          )}
        >
          {hasCrop ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={`crop-preview-${previewKey}`}
              src={cropDisplaySrc!}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={`crop-placeholder-${cover.id}`}
                src={placeholderSrc}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-35 blur-[1px]"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center bg-black/40">
                <ImageIcon size={28} className="text-white/40" />
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/55 font-display">
                  Anteprima da configurare
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-4 flex-1 w-full md:pt-2">
          <button
            type="button"
            onClick={onCustomize}
            className="w-full md:w-auto inline-flex items-center justify-center px-8 py-4 font-display text-[11px] tracking-[0.22em] uppercase bg-champagne text-background hover:bg-champagne/90 transition-colors"
          >
            {hasCrop ? "Regola inquadratura homepage" : "Personalizza anteprima homepage"}
          </button>

          {cropSaved && (
            <p className="inline-flex items-center gap-2 text-sm text-champagne font-light">
              <Check size={16} />
              Anteprima homepage aggiornata
            </p>
          )}

          {!hasCrop && (
            <p className="text-sm text-muted font-light max-w-md">
              Configura l&apos;inquadratura per pubblicare l&apos;annuncio in homepage.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
  placeholder,
  inputRef,
  nextRef,
  enterKeyHint = "next",
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  nextRef?: React.RefObject<HTMLInputElement | null>;
  enterKeyHint?: "next" | "done" | "search";
  inputMode?: "text" | "numeric" | "search";
}) {
  const cls =
    "w-full bg-surface border border-border px-4 py-3 text-base focus:border-champagne/40 focus:outline-none";

  const goNext = () => {
    window.requestAnimationFrame(() => nextRef?.current?.focus());
  };

  return (
    <label className="block">
      <span className="text-[10px] tracking-[0.2em] uppercase text-muted mb-2 block">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          placeholder={placeholder}
          className={cn(cls, "resize-none text-sm")}
        />
      ) : (
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          inputMode={inputMode}
          enterKeyHint={enterKeyHint}
          onKeyDown={(e) => {
            if (e.key === "Enter" && nextRef) {
              e.preventDefault();
              goNext();
            }
          }}
          className={cls}
        />
      )}
    </label>
  );
}
