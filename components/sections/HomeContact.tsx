import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { WhatsAppButton } from "@/components/contact/ContactForm";

const ADDRESS_DISPLAY = "Gemonio (VA)\n21036";
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  "Via Ugo Foscolo 5, 21023 Besozzo VA"
)}`;

const contactInfo = [
  {
    icon: MapPin,
    label: "Indirizzo",
    value: ADDRESS_DISPLAY,
    href: MAPS_URL,
    external: true,
  },
  {
    icon: Phone,
    label: "Telefono",
    value: "+39 3423834947",
    href: "tel:+393423834947",
  },
  {
    icon: Mail,
    label: "Email",
    value: "Matteo_pjetri@libero.it",
    href: "mailto:Matteo_pjetri@libero.it",
  },
  {
    icon: Clock,
    label: "Orari",
    value: "Lun – Ven 9–19 · Sab 10–17",
  },
];

export function HomeContact() {
  return (
    <section id="contatti" className="home-contact border-t border-border bg-background scroll-mt-6">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 md:px-14 pt-8 pb-20 md:py-32 lg:py-40">
        <div className="home-contact__intro">
          <h2 className="editorial-showcase__title text-foreground mb-6">
            Contatti
          </h2>
          <p className="font-display text-3xl md:text-4xl font-light tracking-[-0.03em] text-foreground mb-6">
            Siamo a disposizione
          </p>
          <p className="text-muted font-light max-w-lg mb-14 leading-relaxed">
            Prenota una visita, richiedi informazioni o vieni a trovarci in showroom.
          </p>
        </div>

        <div className="max-w-xl space-y-8">
          {contactInfo.map((item) => (
            <div key={item.label} className="flex gap-5">
              <div className="w-11 h-11 flex items-center justify-center border border-champagne/30 shrink-0 bg-card">
                <item.icon size={18} className="text-champagne" strokeWidth={1.25} />
              </div>
              <div>
                <p className="font-display text-[10px] tracking-[0.25em] uppercase text-champagne/90 mb-2">
                  {item.label}
                </p>
                {item.href ? (
                  <a
                    href={item.href}
                    {...("external" in item && item.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="text-muted hover:text-foreground transition-colors whitespace-pre-line font-light text-sm"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="text-muted whitespace-pre-line font-light text-sm">{item.value}</p>
                )}
              </div>
            </div>
          ))}
          <WhatsAppButton />
        </div>
      </div>
    </section>
  );
}
