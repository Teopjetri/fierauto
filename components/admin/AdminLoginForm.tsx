"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputCls =
    "w-full bg-surface border border-border px-4 py-3 text-sm focus:border-champagne/40 focus:outline-none";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Accesso non riuscito");
      router.replace(nextPath.startsWith("/admin") ? nextPath : "/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore di accesso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <label className="block">
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted mb-2 block">
          Username
        </span>
        <input
          required
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={inputCls}
          placeholder="admin"
        />
      </label>

      <label className="block">
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted mb-2 block">
          Password
        </span>
        <input
          required
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputCls}
        />
      </label>

      {error && <p className="text-sm text-red-400/90">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className={cn(
          "w-full py-3.5 font-display text-[10px] tracking-[0.25em] uppercase",
          "bg-champagne/90 text-background hover:bg-champagne transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "inline-flex items-center justify-center gap-2"
        )}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Accesso…
          </>
        ) : (
          "Accedi"
        )}
      </button>
    </form>
  );
}
