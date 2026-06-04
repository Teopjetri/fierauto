"use client";

import { useState, useMemo } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { EditorialMasonry } from "@/components/inventory/EditorialMasonry";
import { FadeIn } from "@/components/ui/FadeIn";
import type { CarWithMedia } from "@/lib/data/carWithMedia";
import {
  getAllBrands,
  getAllYears,
  getAllFuelTypes,
} from "@/lib/data/cars";

interface InventoryGridProps {
  cars: CarWithMedia[];
}

export function InventoryGrid({ cars }: InventoryGridProps) {
  const [brand, setBrand] = useState("");
  const [year, setYear] = useState("");
  const [fuel, setFuel] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const brands = getAllBrands();
  const years = getAllYears();
  const fuelTypes = getAllFuelTypes();

  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      if (brand && car.brand !== brand) return false;
      if (year && car.year !== Number(year)) return false;
      if (fuel && car.fuel !== fuel) return false;
      return true;
    });
  }, [cars, brand, year, fuel]);

  const hasFilters = brand || year || fuel;

  const clearFilters = () => {
    setBrand("");
    setYear("");
    setFuel("");
  };

  const selectClass =
    "w-full bg-surface border border-border px-4 py-3 text-sm text-foreground appearance-none cursor-pointer hover:border-gold/30 focus:border-gold/50 focus:outline-none transition-colors duration-300";

  return (
    <section className="py-28 md:py-36">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-8">
        <SectionTitle
          label="Parco auto"
          title="Vetture disponibili"
          subtitle="Presentate nello studio CS Motors — carica le foto dal pannello gestione."
        />

        <FadeIn className="mb-12">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="md:hidden flex items-center gap-2 text-sm tracking-widest uppercase font-display text-gold mb-6"
          >
            <SlidersHorizontal size={16} />
            Filtri
            {hasFilters && <span className="w-2 h-2 rounded-full bg-gold" />}
          </button>

          <div className={`${filtersOpen ? "block" : "hidden"} md:block glass p-6 md:p-8 mb-12`}>
            <div className="flex items-center justify-between mb-6">
              <span className="font-display text-xs tracking-[0.3em] uppercase text-gold">
                Filtra per
              </span>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-xs tracking-widest uppercase text-muted hover:text-foreground transition-colors"
                >
                  <X size={14} />
                  Cancella Tutto
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs tracking-widest uppercase text-muted mb-2">Marca</label>
                <select value={brand} onChange={(e) => setBrand(e.target.value)} className={selectClass}>
                  <option value="">Tutte le Marche</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase text-muted mb-2">Anno</label>
                <select value={year} onChange={(e) => setYear(e.target.value)} className={selectClass}>
                  <option value="">Tutti gli Anni</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase text-muted mb-2">Alimentazione</label>
                <select value={fuel} onChange={(e) => setFuel(e.target.value)} className={selectClass}>
                  <option value="">Tutte</option>
                  {fuelTypes.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </FadeIn>

        <p className="text-muted text-sm mb-8 font-light">
          {filteredCars.length} di {cars.length} veicoli disponibili
        </p>

        {filteredCars.length > 0 ? (
          <EditorialMasonry key={`${brand}-${year}-${fuel}`} cars={filteredCars} priorityCount={3} />
        ) : (
          <FadeIn className="text-center py-24">
            <p className="text-muted text-lg font-light mb-6">
              Nessun veicolo corrisponde ai filtri selezionati.
            </p>
            <button
              onClick={clearFilters}
              className="font-display text-sm tracking-[0.2em] uppercase text-gold hover:text-gold-light transition-colors"
            >
              Cancella Filtri
            </button>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
