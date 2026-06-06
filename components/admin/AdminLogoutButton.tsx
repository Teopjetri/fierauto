"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLogoutButton({ displayName }: { displayName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 text-[10px] tracking-[0.18em] uppercase text-muted">
      <span className="hidden sm:inline font-light normal-case tracking-normal text-xs text-muted/80">
        {displayName}
      </span>
      <button
        type="button"
        onClick={logout}
        disabled={loading}
        className="text-muted hover:text-champagne transition-colors disabled:opacity-50"
      >
        {loading ? "Uscita…" : "Esci"}
      </button>
    </div>
  );
}
