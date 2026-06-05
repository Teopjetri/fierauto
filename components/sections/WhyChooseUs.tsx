import { Shield, Award, Wrench, Handshake } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";

const reasons = [
  {
    icon: Shield,
    title: "Ispezione documentata",
    description:
      "Controllo strutturato su ogni vettura. Storia, condizioni e provenienza verificabili.",
  },
  {
    icon: Award,
    title: "Selezione rigorosa",
    description:
      "Accettiamo solo esemplari che rispettano i nostri standard di qualità e presentazione.",
  },
  {
    icon: Wrench,
    title: "Officina interna",
    description:
      "Preparazione e manutenzione eseguite da tecnici specializzati in marche premium.",
  },
  {
    icon: Handshake,
    title: "Consulenza dedicata",
    description:
      "Un interlocutore unico dalla prima visita alla consegna. Trasparenza in ogni fase.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-20 md:py-32 lg:py-36 section-gradient">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-8">
        <SectionTitle
          label="Il nostro standard"
          title="Perché Fierauto"
          subtitle="Un approccio ordinato, professionale e coerente — come ci si aspetta da un autosalone serio."
          align="center"
        />

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {reasons.map((reason) => (
            <StaggerItem key={reason.title}>
              <FadeIn className="glass p-7 md:p-8 h-full hover:border-champagne/20 transition-all duration-500 group">
                <div className="w-10 h-10 flex items-center justify-center border border-champagne/25 mb-5 group-hover:border-champagne/45 transition-colors duration-500">
                  <reason.icon size={18} className="text-champagne" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-base tracking-[-0.01em] mb-2.5">{reason.title}</h3>
                <p className="text-muted text-sm leading-relaxed font-light">{reason.description}</p>
              </FadeIn>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
