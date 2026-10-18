
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/supabase/client";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (fullName.trim().length < 2) {
      setMessage("Please enter your full name.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
  email: email.trim(),
  password,
  options: {
    data: {
      full_name: fullName.trim(),
    },
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
});
      if (error) {
        setMessage(error.message);
        return;
      }

      if (data.session) {
        router.replace("/discover");
        router.refresh();
      } else {
        setMessage(
          "Account created! Check your email for a confirmation link before signing in."
        );
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080b12] px-4 py-10 text-slate-100">
      <div className="w-full max-w-md">
        <Link
          href="/discover"
          className="text-sm text-slate-400 transition hover:text-sky-300"
        >
          ← Back to Discover
        </Link>

        <div className="mt-6 rounded-3xl border border-white/10 bg-[#0c111b] p-7 sm:p-9">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-400/10 text-xl font-black text-sky-300">
            E
          </div>

          <h1 className="mt-6 text-3xl font-semibold text-white">
            Join ENGRAPH
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Create your account and connect with the engineering ecosystem.
          </p>

          <form onSubmit={handleSignup} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Full name
              </label>

              <input
                id="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your full name"
                className="w-full rounded-xl border border-white/10 bg-[#080b12] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-400/50"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-[#080b12] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-400/50"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-white/10 bg-[#080b12] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-400/50"
              />
            </div>

            {message && (
              <div
                role="status"
                className="rounded-xl border border-sky-400/20 bg-sky-400/5 p-3 text-sm leading-6 text-sky-200"
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-sky-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-sky-300 hover:text-sky-200"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-5 text-center text-xs text-slate-600">
          ENGRAPH · Engineering Connected
        </p>
      </div>
    </main>
  );
}

