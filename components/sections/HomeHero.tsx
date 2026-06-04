import Image from "next/image";
import { cn } from "@/lib/utils";

interface HomeHeroProps {
  initialSrc: string | null;
  initialVersion: number;
}

function heroDisplayUrl(src: string, version: number): string {
  return `${src}?v=${version}`;
}

export function HomeHero({ initialSrc, initialVersion }: HomeHeroProps) {
  const displayUrl = initialSrc ? heroDisplayUrl(initialSrc, initialVersion) : null;
  const hasImage = Boolean(displayUrl);

  return (
    <section className="site-below-header pt-[40pt] pb-6 md:pb-8">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .home-hero__copy--mobile {
              display: block;
            }
            .home-hero__copy--desktop {
              display: none;
            }
            .home-hero__scrim {
              background:
                linear-gradient(
                  to bottom,
                  rgba(0, 0, 0, 0.6) 0%,
                  rgba(0, 0, 0, 0.25) 35%,
                  rgba(0, 0, 0, 0) 70%
                ),
                linear-gradient(
                  to top,
                  rgba(0, 0, 0, 0.6) 0%,
                  rgba(0, 0, 0, 0.25) 35%,
                  rgba(0, 0, 0, 0) 70%
                ) !important;
            }
            .home-hero__copy .home-hero__headline {
              font-family: "Avilock", var(--font-display), sans-serif;
              font-weight: 700;
              line-height: 1;
              letter-spacing: -0.02em;
              color: #ffffff;
              text-shadow:
                0 0 1px rgba(0, 0, 0, 1),
                0 0 2px rgba(0, 0, 0, 1),
                0 0 4px rgba(0, 0, 0, 0.88),
                0 0 7px rgba(0, 0, 0, 0.48),
                0 1px 3px rgba(0, 0, 0, 0.5);
            }
            .home-hero__copy--mobile .home-hero__headline {
              transform: translate(-10pt, 15pt) !important;
            }
            .home-hero__copy--desktop .home-hero__headline {
              transform: translate(-5pt, 21pt) !important;
            }
            .home-hero__copy-bottom {
              left: 0 !important;
              right: 0 !important;
              width: 100% !important;
              max-width: none !important;
              text-align: center !important;
            }
            .home-hero__copy-bottom .home-hero__subheadline {
              margin-left: auto;
              margin-right: auto;
              text-align: center;
              max-width: 100%;
            }
            .home-hero__copy .home-hero__subheadline {
              font-family: var(--font-inter), system-ui, sans-serif;
              font-weight: 400;
              font-style: italic;
              line-height: 1.5;
              color: rgba(255, 255, 255, 0.9);
              margin-top: 0;
              max-width: 500px;
              transform: translateY(15pt);
              text-decoration: none;
              display: inline-block;
              animation: home-hero-subheadline-pulse 2.4s ease-in-out infinite;
            }
            .home-hero__copy .home-hero__subheadline::first-letter {
              text-transform: uppercase;
            }
            @keyframes home-hero-subheadline-pulse {
              0%, 100% {
                opacity: 0.48;
              }
              50% {
                opacity: 1;
              }
            }
            @media (hover: hover) and (pointer: fine) {
              .home-hero__copy--mobile {
                display: none !important;
              }
              .home-hero__copy--desktop {
                display: block !important;
              }
            }
          `,
        }}
      />
      <div className="px-6 sm:px-8 lg:px-10">
        <div
          className={cn(
            "relative w-full overflow-hidden",
            "rounded-[12px] md:rounded-[16px]",
            "border border-border/60",
            "shadow-[0_4px_24px_rgba(0,0,0,0.12)]",
            "aspect-[4/3] sm:aspect-[16/10] lg:aspect-[21/9]",
            !hasImage && "bg-card"
          )}
        >
          {hasImage && displayUrl && (
            <>
              <Image
                src={displayUrl}
                alt="Hero homepage"
                fill
                priority
                unoptimized
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1280px"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 pointer-events-none home-hero__scrim z-[1]" aria-hidden />
              <div className="absolute top-[calc(3rem-20pt)] left-[calc(3rem-20pt)] z-[2] max-w-[calc(100%-6rem)] sm:max-w-none pointer-events-none home-hero__copy home-hero__copy--mobile">
                <h1
                  className="home-hero__headline"
                  style={{
                    fontSize: "clamp(1.322rem, 2.755vw, 2.643rem)",
                    transform: "translate(-10pt, 15pt)",
                  }}
                >
                  La tua prossima auto
                  <br />
                  ti sta aspettando
                </h1>
              </div>
              <div className="absolute bottom-[calc(3rem-20pt)] inset-x-0 z-[2] w-full px-6 text-center home-hero__copy home-hero__copy-bottom home-hero__copy--mobile">
                <a
                  href="#vetture"
                  className="home-hero__subheadline pointer-events-auto"
                  style={{ fontSize: "clamp(0.648rem, 0.907vw, 0.777rem)" }}
                >
                  Scorri ed esplora il nostro showroom
                </a>
              </div>
              <div className="absolute top-[calc(3rem-20pt)] left-[calc(3rem-20pt)] z-[2] max-w-[calc(100%-6rem)] sm:max-w-none pointer-events-none home-hero__copy home-hero__copy--desktop">
                <h1
                  className="home-hero__headline"
                  style={{ fontSize: "clamp(2.04rem, 4.25vw, 4.08rem)" }}
                >
                  La tua prossima auto
                  <br />
                  ti sta aspettando
                </h1>
              </div>
              <div className="absolute bottom-[calc(3rem-20pt)] inset-x-0 z-[2] w-full px-6 text-center home-hero__copy home-hero__copy-bottom home-hero__copy--desktop">
                <a
                  href="#vetture"
                  className="home-hero__subheadline pointer-events-auto"
                  style={{ fontSize: "clamp(1rem, 1.4vw, 1.2rem)" }}
                >
                  Scorri ed esplora il nostro showroom
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
