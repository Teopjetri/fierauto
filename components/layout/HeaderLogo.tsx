interface HeaderLogoProps {
  src: string | null;
  version: number;
}

function logoDisplayUrl(src: string, version: number): string {
  return `${src}?v=${version}`;
}

export function HeaderLogo({ src, version }: HeaderLogoProps) {
  if (!src) return null;

  return (
    <div className="flex items-center min-w-0 shrink-0 h-8 md:h-10 overflow-visible">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoDisplayUrl(src, version)}
        alt="Fierauto"
        className="relative top-[7pt] -left-[30pt] h-full w-auto max-w-[200px] sm:max-w-[240px] object-contain object-left origin-left scale-[4.42]"
      />
    </div>
  );
}
