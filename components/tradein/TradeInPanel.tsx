"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TradeInForm } from "@/components/tradein/TradeInForm";

interface TradeInPanelProps {
  open: boolean;
  onClose: () => void;
}

function useIsDesktopPanel() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return isDesktop;
}

export function TradeInPanel({ open, onClose }: TradeInPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const isDesktop = useIsDesktopPanel();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = () => {
    onClose();
    window.setTimeout(() => setFormKey((key) => key + 1), 300);
  };

  const panelMotion = isDesktop
    ? {
        initial: { x: "100%" },
        animate: { x: 0 },
        exit: { x: "100%" },
      }
    : {
        initial: { y: "100%" },
        animate: { y: 0 },
        exit: { y: "100%" },
      };

  const content = (
    <AnimatePresence>
      {open && (
        <>
          <style
            dangerouslySetInnerHTML={{
              __html: `
                .trade-in-panel__overlay {
                  position: fixed;
                  inset: 0;
                  z-index: 200;
                  background: rgba(0, 0, 0, 0.7);
                  backdrop-filter: blur(4px);
                  -webkit-backdrop-filter: blur(4px);
                }
                .trade-in-panel__sheet {
                  position: fixed;
                  z-index: 210;
                  background: #0a0a0c;
                  overflow-y: auto;
                  -webkit-overflow-scrolling: touch;
                }
                .trade-in-panel__sheet--mobile {
                  inset: 0;
                  width: 100%;
                  max-width: none;
                  border: 0;
                  padding-bottom: env(safe-area-inset-bottom, 0px);
                }
                .trade-in-panel__sheet--desktop {
                  top: 0;
                  right: 0;
                  bottom: 0;
                  width: 100%;
                  max-width: 28rem;
                  border-left: 1px solid rgba(255, 255, 255, 0.08);
                }
                .trade-in-panel__close-btn {
                  min-width: 44px;
                  min-height: 44px;
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  -webkit-tap-highlight-color: transparent;
                  touch-action: manipulation;
                }
                .trade-in-form__upload {
                  -webkit-tap-highlight-color: transparent;
                  touch-action: manipulation;
                }
                .trade-in-form__upload input[type="file"] {
                  position: absolute !important;
                  inset: 0 !important;
                  width: 100% !important;
                  height: 100% !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  opacity: 0 !important;
                  cursor: pointer;
                  z-index: 20;
                  font-size: 0 !important;
                  line-height: 0 !important;
                  color: transparent !important;
                  border: none !important;
                  background: transparent !important;
                  appearance: none;
                  -webkit-appearance: none;
                  text-indent: -9999px;
                }
                .trade-in-form__upload input[type="file"]::-webkit-file-upload-button {
                  visibility: hidden;
                  width: 0;
                  height: 0;
                  margin: 0;
                  padding: 0;
                  border: 0;
                  font-size: 0;
                  appearance: none;
                  -webkit-appearance: none;
                }
                .trade-in-form__upload input[type="file"]::file-selector-button {
                  visibility: hidden;
                  width: 0;
                  height: 0;
                  margin: 0;
                  padding: 0;
                  border: 0;
                  font-size: 0;
                  appearance: none;
                }
                .trade-in-form__upload label:has(> input[type="file"]) {
                  overflow: hidden;
                  font-size: 0;
                }
              `,
            }}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="trade-in-panel__overlay"
            onClick={() => {
              if (document.body.dataset.tradeInPickerOpen) return;
              handleClose();
            }}
          />
          <motion.aside
            {...panelMotion}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className={cn(
              "trade-in-panel__sheet",
              isDesktop ? "trade-in-panel__sheet--desktop" : "trade-in-panel__sheet--mobile"
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="trade-in-panel-title"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 border-b border-white/[0.06] bg-[#0a0a0c]/95 backdrop-blur-md">
              <div>
                <p className="font-display text-[10px] tracking-[0.35em] uppercase text-champagne mb-1">
                  Valutazione
                </p>
                <h2
                  id="trade-in-panel-title"
                  className="font-display text-lg font-light tracking-[-0.02em]"
                >
                  Ritiriamo il tuo usato
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="trade-in-panel__close-btn p-2 text-muted hover:text-foreground transition-colors"
                aria-label="Chiudi"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 sm:p-6 md:p-8">
              <TradeInForm
                key={formKey}
                variant="panel"
                uploadHint={isDesktop ? "Click o drag & drop" : "Tocca per caricare le foto"}
                onClose={handleClose}
              />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(content, document.body);
}
