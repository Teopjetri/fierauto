import { SectionTitle } from "@/components/ui/SectionTitle";
import { TestimonialCard } from "@/components/ui/TestimonialCard";
import { StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { testimonials } from "@/lib/data/testimonials";

export function Testimonials() {
  return (
    <section className="py-20 md:py-32 lg:py-36 border-t border-border">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-8">
        <SectionTitle
          label="Clienti"
          title="Esperienze"
          subtitle="La fiducia si costruisce con trasparenza e coerenza — prima, durante e dopo l'acquisto."
          align="center"
        />

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {testimonials.map((testimonial) => (
            <StaggerItem key={testimonial.id}>
              <TestimonialCard testimonial={testimonial} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
