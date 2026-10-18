"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/supabase/client";

type Profile = {
  id: string;
  full_name: string | null;
  headline: string | null;
  account_type: "Individual" | "Company";
  avatar_url: string | null;
  created_at: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function loadProfile() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (userError || !user) {
        setEmail(null);
        setProfile(null);
        setErrorMessage("Kamu belum login.");
        setLoading(false);
        return;
      }

      setEmail(user.email ?? null);

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, headline, account_type, avatar_url, created_at",
        )
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        setErrorMessage(error.message);
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(data as Profile | null);
      setLoading(false);
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSignOut() {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(`Gagal keluar: ${error.message}`);
      return;
    }

    window.location.href = "/login";
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080b12] px-4 text-slate-100">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-sky-400/20 border-t-sky-400" />
          <p className="mt-4 text-sm text-slate-400">
            Loading your profile...
          </p>
        </div>
      </main>
    );
  }

  if (!email) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080b12] px-4 text-slate-100">
        <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0c111b] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-2xl font-black text-sky-300">
            E
          </div>

          <h1 className="mt-5 text-2xl font-semibold text-white">
            Sign in required
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Login terlebih dahulu untuk melihat profil akunmu.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex rounded-xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080b12] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/discover"
            className="flex items-center gap-3 text-slate-300 transition hover:text-white"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-400/10 font-black text-sky-300">
              E
            </div>

            <span className="font-bold tracking-[0.14em]">
              ENGRAPH
            </span>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            Sign Out
          </button>
        </div>

        {/* PROFILE */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c111b]">
          <div className="h-32 bg-gradient-to-r from-sky-400/20 via-blue-500/10 to-violet-500/20" />

          <div className="px-6 pb-8 sm:px-8">
            <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div
                className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-[#0c111b] bg-gradient-to-br from-sky-500 to-violet-500 text-2xl font-bold text-white"
              >
                {profile?.full_name
                  ? profile.full_name
                      .split(" ")
                      .map((name) => name[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "U"}
              </div>

              <Link
                href="/identity"
                className="rounded-xl border border-sky-400/20 bg-sky-400/10 px-4 py-2.5 text-sm font-medium text-sky-300 transition hover:bg-sky-400/15"
              >
                Edit Identity
              </Link>
            </div>

            <div className="mt-6">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                  {profile?.full_name || "Unnamed Engineer"}
                </h1>

                {profile?.account_type && (
                  <span className="rounded-lg border border-sky-400/20 bg-sky-400/10 px-2.5 py-1 text-xs text-sky-300">
                    {profile.account_type}
                  </span>
                )}
              </div>

              <p className="mt-2 text-base text-slate-300">
                {profile?.headline || "Engineering professional"}
              </p>

              <p className="mt-3 text-sm text-slate-500">
                {email}
              </p>
            </div>

            {errorMessage && (
              <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
                {errorMessage}
              </div>
            )}

            {!profile && !errorMessage && (
              <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-300">
                Akun berhasil login, tetapi data profil belum dibuat.
              </div>
            )}
          </div>
        </section>

        {/* ACCOUNT INFORMATION */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c111b] p-6">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
              Account
            </p>

            <p className="mt-3 break-all text-sm text-white">
              {email}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0c111b] p-6">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
              Account Type
            </p>

            <p className="mt-3 text-sm text-white">
              {profile?.account_type || "Not configured"}
            </p>
          </div>
        </section>

        {/* EMPTY / FUTURE PROFILE */}
        <section className="mt-6 rounded-2xl border border-white/[0.08] bg-[#0c111b] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-sky-300">
            Engineering Identity
          </p>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Your engineering profile
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Di sinilah nanti project, skills, experience, research,
            connections, dan informasi engineering milik akun yang sedang
            login akan ditampilkan.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
              <p className="text-xs text-slate-500">Projects</p>
              <p className="mt-2 text-lg font-semibold text-white">0</p>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
              <p className="text-xs text-slate-500">Skills</p>
              <p className="mt-2 text-lg font-semibold text-white">0</p>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
              <p className="text-xs text-slate-500">Connections</p>
              <p className="mt-2 text-lg font-semibold text-white">0</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}