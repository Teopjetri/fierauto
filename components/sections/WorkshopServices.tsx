import { SectionTitle } from "@/components/ui/SectionTitle";
import { FadeIn } from "@/components/ui/FadeIn";

const services = [
  {
    title: "Tagliando programmato",
    description: "Manutenzione per Mercedes-Benz, BMW e Audi.",
  },
  {
    title: "Diagnostica ufficiale",
    description: "Strumentazione originale e report dettagliato.",
  },
  {
    title: "Preparazione estetica",
    description: "Detailing e trattamenti protettivi pre-consegna.",
  },
  {
    title: "Perizia pre-acquisto",
    description: "Valutazione completa prima della decisione.",
  },
];

export function WorkshopServices() {
  return (
    <section className="py-20 md:py-32 lg:py-36 border-t border-border">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">
          <div>
            <SectionTitle
              label="Servizi"
              title="Officina e preparazione"
              subtitle="Ogni vettura passa per la nostra officina interna prima della presentazione in showroom."
            />
            <FadeIn delay={0.15}>
              <p className="text-muted text-sm font-light leading-relaxed -mt-10 max-w-md">
                Standard elevati, processi documentati, nessuna sorpresa.
                La qualità si vede prima ancora di salire a bordo.
              </p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {services.map((service, i) => (
              <FadeIn key={service.title} delay={0.08 * i} className="glass p-6 hover:border-champagne/20 transition-colors duration-500">
                <div className="w-6 h-px bg-champagne/50 mb-4" />
                <h3 className="font-display text-sm tracking-wide mb-2">{service.title}</h3>
                <p className="text-muted text-xs sm:text-sm leading-relaxed font-light">{service.description}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
