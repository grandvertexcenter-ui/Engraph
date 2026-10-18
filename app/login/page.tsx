"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/utils/supabase/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();

      // 1. Login ke Supabase
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (authError) {
        setMessage(authError.message);
        return;
      }

      const user = authData.user;

      if (!user) {
        setMessage("Pengguna tidak ditemukan.");
        return;
      }

      // 2. Periksa profil berdasarkan UID akun
      const { data: existingProfile, error: profileError } =
        await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

      if (profileError) {
        console.error("Profile lookup error:", profileError);
        setMessage(
          "Login berhasil, tetapi profil gagal diperiksa. " +
          profileError.message
        );
        return;
      }

      // 3. Buat profil dasar jika belum tersedia
      if (!existingProfile) {
        const metadataName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          "";

        const fallbackName =
          metadataName.trim() ||
          user.email?.split("@")[0] ||
          "New User";

        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            full_name: fallbackName,
            headline: "",
            account_type: "Individual",
            avatar_url: null,
          });

        if (insertError) {
  console.error(
    "Profile creation error:",
    JSON.stringify(insertError, null, 2),
    {
      message: insertError.message,
      code: insertError.code,
      details: insertError.details,
      hint: insertError.hint,
    }
  );

  setMessage(
    `Login berhasil, tetapi profil gagal dibuat: ${
      insertError.message || insertError.code || "Penyebab belum diketahui"
    }`
  );

  return;
}
      }

      // 4. Masuk ke halaman Discover
      window.location.replace("/discover");
    } catch (error) {
      console.error("Login error:", error);
      setMessage(
        "Tidak dapat terhubung ke Supabase. Periksa konfigurasi."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-6 py-12 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-8 shadow-2xl">
        <Link
          href="/"
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Kembali ke beranda
        </Link>

        <div className="mt-8">
          <p className="text-sm font-semibold tracking-[0.25em] text-cyan-400">
            ENGRAPH
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Masuk untuk melanjutkan perjalanan engineering-mu.
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm">
              Email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm">
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-400"
              placeholder="Masukkan password"
            />
          </div>

          {message && (
            <p role="alert" className="text-sm text-red-400">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          ENGRAPH · Engineering Network
        </p>
      </section>
    </main>
  );
}