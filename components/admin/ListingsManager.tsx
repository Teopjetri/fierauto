"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Copy, Eye, EyeOff } from "lucide-react";
import type { Listing, ListingStatus } from "@/lib/listings/types";
import {
  coverImage,
  homeCropSrc,
  LISTING_STATUS_LABELS,
  normalizeStatus,
  HOME_PHOTO_ASPECT,
} from "@/lib/listings/types";
import { cn } from "@/lib/utils";

interface ListingsManagerProps {
  initialListings: Listing[];
}

export function ListingsManager({ initialListings }: ListingsManagerProps) {
  const router = useRouter();
  const [listings, setListings] = useState(initialListings);

  const setStatus = async (id: string, status: ListingStatus) => {
    const res = await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setListings((prev) => prev.map((l) => (l.id === id ? updated : l)));
      router.refresh();
    }
  };

  const duplicate = async (id: string) => {
    const res = await fetch(`/api/listings/${id}/duplicate`, { method: "POST" });
    if (res.ok) {
      router.push(`/admin/annunci/${(await res.json()).id}`);
      router.refresh();
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Eliminare questo annuncio?")) return;
    const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
    if (res.ok) {
      setListings((prev) => prev.filter((l) => l.id !== id));
      router.refresh();
    }
  };

  return (
    <div className="space-y-8">
      <Link
        href="/admin/annunci/new"
        className="inline-flex items-center gap-2 px-5 py-3 font-display text-[10px] tracking-[0.22em] uppercase bg-champagne/90 text-background hover:bg-champagne transition-colors"
      >
        <Plus size={16} />
        Aggiungi annuncio
      </Link>

      {listings.length === 0 ? (
        <p className="text-muted text-sm font-light py-8">Nessun annuncio creato.</p>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {listings.map((listing) => {
            const cover = coverImage(listing);
            const st = normalizeStatus(listing);
            return (
              <li key={listing.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 md:p-6">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className={cn(
                      "relative w-12 shrink-0 overflow-hidden bg-surface ring-1 ring-white/10",
                      HOME_PHOTO_ASPECT
                    )}
                  >
                    {cover && homeCropSrc(cover) && (
                      <img
                        src={homeCropSrc(cover)!}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-champagne mb-1">
                      {listing.brand || "—"}
                    </p>
                    <p className="font-display text-lg truncate">{listing.model || "Bozza"}</p>
                    <p className="text-muted text-xs mt-1">
                      {listing.images.length} foto ·{" "}
                      <span className={st === "published" ? "text-champagne/80" : ""}>
                        {LISTING_STATUS_LABELS[st]}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {st === "published" ? (
                    <button
                      type="button"
                      onClick={() => setStatus(listing.id, "hidden")}
                      className="p-2.5 border border-border hover:border-champagne/40 text-muted hover:text-champagne"
                      title="Nascondi"
                    >
                      <EyeOff size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setStatus(listing.id, "published")}
                      className="p-2.5 border border-border hover:border-champagne/40 text-muted hover:text-champagne"
                      title="Pubblica"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => duplicate(listing.id)}
                    className="p-2.5 border border-border hover:border-champagne/40 text-muted hover:text-champagne"
                    title="Duplica"
                  >
                    <Copy size={16} />
                  </button>
                  <Link
                    href={`/admin/annunci/${listing.id}`}
                    className="p-2.5 border border-border hover:border-champagne/40 text-muted hover:text-champagne"
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(listing.id)}
                    className="p-2.5 border border-border hover:border-red-400/50 text-muted hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
