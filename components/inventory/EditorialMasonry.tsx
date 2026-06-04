import type { CarWithMedia } from "@/lib/data/carWithMedia";
import { EditorialCarCard } from "@/components/ui/CarCard";
import { StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { getLayoutClasses, getLayoutForIndex } from "@/lib/imageUtils";

interface EditorialMasonryProps {
  cars: CarWithMedia[];
  priorityCount?: number;
}

export function EditorialMasonry({ cars, priorityCount = 3 }: EditorialMasonryProps) {
  return (
    <StaggerContainer className="grid grid-cols-12 gap-x-5 gap-y-14 md:gap-x-7 md:gap-y-20 auto-rows-auto">
      {cars.map((car, i) => {
        const layout = getLayoutForIndex(i);
        return (
          <StaggerItem key={car.id} className={getLayoutClasses(layout)}>
            <EditorialCarCard
              car={car}
              index={i}
              layout={layout}
              priority={i < priorityCount}
            />
          </StaggerItem>
        );
      })}
    </StaggerContainer>
  );
}
