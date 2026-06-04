"use client";

import { motion } from "framer-motion";
import type { Testimonial } from "@/lib/types";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <motion.blockquote
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="glass p-7 md:p-8 h-full flex flex-col justify-between group hover:border-champagne/20 transition-colors duration-500"
    >
      <div>
        <div className="flex gap-1 mb-6">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <svg
              key={i}
              className="w-4 h-4 text-champagne"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <p className="text-foreground/90 text-base md:text-lg leading-relaxed font-light italic">
          &ldquo;{testimonial.quote}&rdquo;
        </p>
      </div>
      <footer className="mt-8 pt-6 border-t border-border">
        <cite className="not-italic">
          <p className="font-display text-sm tracking-wide text-foreground">
            {testimonial.name}
          </p>
          <p className="text-xs tracking-widest uppercase text-muted mt-1">
            {testimonial.role}
          </p>
        </cite>
      </footer>
    </motion.blockquote>
  );
}
