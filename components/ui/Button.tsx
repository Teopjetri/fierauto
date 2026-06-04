import Link from "next/link";
import { type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "whatsapp" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  external?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-champagne text-background hover:bg-champagne-light border border-champagne/25",
  secondary:
    "bg-transparent text-foreground border border-white/15 hover:border-champagne/40 hover:text-champagne",
  ghost: "bg-transparent text-muted hover:text-foreground",
  whatsapp:
    "bg-[#25D366] text-white hover:bg-[#20bd5a] border border-[#25D366]/20",
  outline:
    "bg-transparent text-champagne border border-champagne/35 hover:bg-champagne/8 hover:border-champagne/55",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-5 py-2.5 text-xs tracking-widest",
  md: "px-8 py-3.5 text-sm tracking-widest",
  lg: "px-10 py-4 text-sm tracking-[0.2em]",
};

export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  type = "button",
  external = false,
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-display font-medium uppercase transition-all duration-500 ease-out";

  const combined = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={combined}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={combined}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={combined}>
      {children}
    </button>
  );
}
