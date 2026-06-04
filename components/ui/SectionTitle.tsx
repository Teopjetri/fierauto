import { FadeIn } from "./FadeIn";

interface SectionTitleProps {
  label?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  light?: boolean;
}

export function SectionTitle({
  label,
  title,
  subtitle,
  align = "left",
  light = false,
}: SectionTitleProps) {
  const alignClass = align === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <FadeIn className={`flex flex-col gap-4 mb-16 md:mb-20 ${alignClass}`}>
      {label && (
        <span className="font-display text-xs tracking-[0.3em] uppercase text-champagne">
          {label}
        </span>
      )}
      <div className="line-accent" />
      <h2
        className={`font-display text-3xl md:text-4xl lg:text-5xl font-light tracking-tight leading-tight ${
          light ? "text-foreground" : "text-foreground"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted text-base md:text-lg max-w-2xl leading-relaxed font-light">
          {subtitle}
        </p>
      )}
    </FadeIn>
  );
}
