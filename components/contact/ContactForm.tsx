"use client";

import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Button } from "@/components/ui/Button";
import { getDefaultWhatsAppMessage } from "@/lib/data/siteBrand";
import { getWhatsAppUrl } from "@/lib/utils";

export function ContactForm() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputClass =
    "w-full bg-surface border border-border px-4 py-3.5 text-sm text-foreground placeholder:text-muted/50 focus:border-gold/50 focus:outline-none transition-colors duration-300";

  return (
    <div className="glass p-8 md:p-10">
      <SectionTitle label="Scrivici" title="Modulo di Contatto" />

      {submitted ? (
        <div className="text-center py-12 -mt-8">
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-gold/30">
            <Send size={24} className="text-gold" />
          </div>
          <h3 className="font-display text-xl mb-3">Messaggio Inviato</h3>
          <p className="text-muted text-sm font-light">
            Grazie per averci contattato. Ti risponderemo entro 24 ore.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 -mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs tracking-widest uppercase text-muted mb-2">
                Nome
              </label>
              <input
                type="text"
                required
                value={formState.name}
                onChange={(e) =>
                  setFormState({ ...formState, name: e.target.value })
                }
                className={inputClass}
                placeholder="Il tuo nome"
              />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-muted mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formState.email}
                onChange={(e) =>
                  setFormState({ ...formState, email: e.target.value })
                }
                className={inputClass}
                placeholder="tua@email.it"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs tracking-widest uppercase text-muted mb-2">
                Telefono
              </label>
              <input
                type="tel"
                value={formState.phone}
                onChange={(e) =>
                  setFormState({ ...formState, phone: e.target.value })
                }
                className={inputClass}
                placeholder="+39 ..."
              />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-muted mb-2">
                Oggetto
              </label>
              <select
                required
                value={formState.subject}
                onChange={(e) =>
                  setFormState({ ...formState, subject: e.target.value })
                }
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option value="">Seleziona un argomento</option>
                <option value="purchase">Acquisto Veicolo</option>
                <option value="viewing">Prenota una Visita</option>
                <option value="financing">Richiesta Finanziamento</option>
                <option value="trade-in">Valutazione Permuta</option>
                <option value="workshop">Servizio Officina</option>
                <option value="other">Altro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-muted mb-2">
              Messaggio
            </label>
            <textarea
              required
              rows={5}
              value={formState.message}
              onChange={(e) =>
                setFormState({ ...formState, message: e.target.value })
              }
              className={`${inputClass} resize-none`}
              placeholder="Descrivi la tua richiesta..."
            />
          </div>

          <Button type="submit" className="w-full">
            Invia Messaggio
          </Button>
        </form>
      )}
    </div>
  );
}

export function WhatsAppButton() {
  return (
    <Button
      href={getWhatsAppUrl(getDefaultWhatsAppMessage())}
      variant="whatsapp"
      external
      size="lg"
    >
      <MessageCircle size={18} />
      Scrivici su WhatsApp
    </Button>
  );
}
