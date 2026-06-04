import Link from "next/link";
import { EditorialShowroomList } from "@/components/showroom/EditorialShowroomList";
import { getFeaturedCars } from "@/lib/data/cars";
import { getAllCarsWithMedia } from "@/lib/data/carWithMedia";

export async function FeaturedCars() {
  const featured = getFeaturedCars();
  const featuredWithMedia = await getAllCarsWithMedia(featured);

  return (
    <section id="showroom-preview" className="py-20 md:py-32 border-t border-white/[0.05] bg-[#060608]">
      <EditorialShowroomList cars={featuredWithMedia} />
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-8 mt-16 text-center">
        <Link
          href="/inventory"
          className="inline-flex font-display text-[10px] tracking-[0.28em] uppercase text-champagne hover:text-champagne-light transition-colors duration-500"
        >
          Vedi tutto lo showroom →
        </Link>
      </div>
    </section>
  );
}
