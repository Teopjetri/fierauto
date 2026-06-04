"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { HeaderLogo } from "@/components/layout/HeaderLogo";
import { TradeInPanel } from "@/components/tradein/TradeInPanel";
import { cn } from "@/lib/utils";

interface NavbarProps {
  logo: { src: string | null; version: number };
}

const NAV_TOGGLE_ID = "site-nav-open";

function scrollToContattiSection() {
  const el = document.getElementById("contatti");
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
    return true;
  }
  return false;
}

export function Navbar({ logo }: NavbarProps) {
  const pathname = usePathname();
  const navToggleRef = useRef<HTMLInputElement>(null);
  const [tradeInOpen, setTradeInOpen] = useState(false);

  useEffect(() => {
    if (navToggleRef.current) {
      navToggleRef.current.checked = false;
    }

    setTradeInOpen(false);

    if (window.location.hash === "#contatti") {
      let attempts = 0;
      const tryScroll = () => {
        if (scrollToContattiSection() || attempts >= 24) return;
        attempts += 1;
        window.setTimeout(tryScroll, 50);
      };
      tryScroll();
    }
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = tradeInOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [tradeInOpen]);

  const isHome = pathname === "/";
  const isRitiriamoPage = pathname === "/ritiriamo";

  const openTradeInDesktop = () => {
    setTradeInOpen(true);
  };

  const closeTradeIn = () => {
    setTradeInOpen(false);
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .site-header__nav-toggle {
              position: fixed;
              opacity: 0;
              width: 1px;
              height: 1px;
              margin: -1px;
              padding: 0;
              overflow: hidden;
              clip: rect(0, 0, 0, 0);
              white-space: nowrap;
              border: 0;
              pointer-events: none;
            }
            .site-header nav > div:first-child {
              pointer-events: none !important;
            }
            .site-header__nav--desktop {
              display: none !important;
            }
            .site-header__menu-btn-wrap {
              display: flex !important;
              position: relative;
              z-index: 110;
              flex-shrink: 0;
              pointer-events: auto !important;
            }
            .site-header__menu-btn {
              display: inline-flex !important;
              align-items: center;
              justify-content: center;
              min-width: 44px;
              min-height: 44px;
              color: #141414;
              -webkit-tap-highlight-color: transparent;
              touch-action: manipulation;
              cursor: pointer;
              text-decoration: none;
              pointer-events: auto !important;
            }
            .site-header__menu-icon {
              display: block;
            }
            .site-header__close-icon {
              display: none;
            }
            .site-header__nav-toggle:checked ~ .site-header .site-header__menu-icon {
              display: none;
            }
            .site-header__nav-toggle:checked ~ .site-header .site-header__close-icon {
              display: block;
            }
            @media (min-width: 1024px) {
              .site-header__nav--desktop {
                display: flex !important;
              }
              .site-header__menu-btn-wrap {
                display: none !important;
              }
            }
            .site-header__mobile-menu {
              display: none;
              position: fixed;
              inset: 0;
              z-index: 150;
              background: #050505;
            }
            .site-header__nav-toggle:checked ~ .site-header__mobile-menu {
              display: flex;
              flex-direction: column;
            }
            @media (min-width: 1024px) {
              .site-header__mobile-menu {
                display: none !important;
              }
            }
            body:has(.site-header__nav-toggle:checked) {
              overflow: hidden;
            }
            .site-header__mobile-menu-nav {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              flex: 1;
              gap: 1.75rem;
              padding: 1.5rem;
            }
            .site-header__mobile-menu-nav a {
              -webkit-tap-highlight-color: rgba(255, 255, 255, 0.12);
              touch-action: manipulation;
              cursor: pointer;
              text-decoration: none;
              min-height: 44px;
              min-width: min(100%, 20rem);
              padding: 0 1rem;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              text-align: center;
            }
          `,
        }}
      />
      <input
        ref={navToggleRef}
        type="checkbox"
        id={NAV_TOGGLE_ID}
        className="site-header__nav-toggle"
        aria-hidden="true"
      />
      <header className="site-header relative z-[120] overflow-visible py-5 md:py-7">
        <nav className="max-w-7xl mx-auto px-5 sm:px-6 md:px-8 flex items-center justify-between gap-6 overflow-visible">
          <HeaderLogo src={logo.src} version={logo.version} />

          <ul className="site-header__nav--desktop items-center gap-8 xl:gap-10">
            <li>
              <Link
                href="/"
                className={cn(
                  "site-header__link relative py-1 text-[11px] tracking-[0.22em] uppercase font-display transition-colors duration-300",
                  isHome && "site-header__link--active"
                )}
              >
                Home
                {isHome && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-px bg-gold"
                  />
                )}
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={openTradeInDesktop}
                className="site-header__link relative py-1 text-[11px] tracking-[0.22em] uppercase font-display transition-colors duration-300"
              >
                Ritiriamo il tuo usato
              </button>
            </li>
            <li>
              <Link
                href="/#contatti"
                className="site-header__link relative py-1 text-[11px] tracking-[0.22em] uppercase font-display transition-colors duration-300"
              >
                Contatti
              </Link>
            </li>
          </ul>

          <div className="site-header__menu-btn-wrap">
            <label
              htmlFor={NAV_TOGGLE_ID}
              aria-label="Apri menu"
              className="site-header__menu-btn p-2 -mr-2"
            >
              <Menu size={22} strokeWidth={1.5} className="site-header__menu-icon" />
              <X size={22} strokeWidth={1.5} className="site-header__close-icon" />
            </label>
          </div>
        </nav>
      </header>

      <div className="site-header-divider" aria-hidden />

      <div className="site-header__mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">
        <nav className="site-header__mobile-menu-nav">
          <a
            href="/"
            className={cn(
              "font-display text-xl sm:text-2xl tracking-[0.14em] uppercase",
              isHome ? "text-gold" : "text-foreground"
            )}
          >
            Home
          </a>
          <a
            href="/ritiriamo"
            className={cn(
              "font-display text-xl sm:text-2xl tracking-[0.14em] uppercase",
              isRitiriamoPage ? "text-gold" : "text-foreground"
            )}
          >
            Ritiriamo il tuo usato
          </a>
          <a
            href="/contact"
            className="font-display text-xl sm:text-2xl tracking-[0.14em] uppercase text-foreground"
          >
            Contatti
          </a>
        </nav>
      </div>

      {!isRitiriamoPage && <TradeInPanel open={tradeInOpen} onClose={closeTradeIn} />}
    </>
  );
}
