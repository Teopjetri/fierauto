export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-8 py-8 md:py-10">
        <p className="text-[11px] text-muted tracking-wide uppercase text-center">
          © {new Date().getFullYear()} FIERAUTO • P.IVA 04148730122
        </p>
      </div>
    </footer>
  );
}
