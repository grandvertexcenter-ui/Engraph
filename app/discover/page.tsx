"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/supabase/client";

type ProfileType = "Individual" | "Company";
type FilterType = "All" | ProfileType;

type Profile = {
  id: string;
  full_name: string;
  headline: string | null;
  account_type: ProfileType;
  avatar_url: string | null;
};

type Connection = {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: string;
};

function Navigation() {
  const [email, setEmail] = useState<string | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();

      if (!mounted) return;

      setEmail(error ? null : data.user?.email ?? null);
      setAuthLoaded(true);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      setEmail(session?.user?.email ?? null);
      setAuthLoaded(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(`Gagal keluar: ${error.message}`);
      return;
    }

    window.location.href = "/discover";
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#080b12]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/profile" className="flex shrink-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-400/10 text-lg font-black text-sky-300">
            E
          </div>

          <div>
            <span className="text-lg font-bold tracking-[0.16em] text-white">
              ENGRAPH
            </span>

            <p className="hidden text-[10px] tracking-[0.12em] text-slate-500 sm:block">
              ENGINEERING CONNECTED
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/discover"
            className="rounded-lg border border-sky-400/20 bg-sky-400/10 px-2.5 py-2 text-xs font-medium text-sky-300 sm:px-4 sm:text-sm"
          >
            Discover
          </Link>

          <Link
            href="/network"
            className="rounded-lg px-2.5 py-2 text-xs text-slate-400 transition hover:bg-white/5 hover:text-white sm:px-4 sm:text-sm"
          >
            My Network
          </Link>

          <Link
            href="/identity"
            className="rounded-lg px-2.5 py-2 text-xs text-slate-400 transition hover:bg-white/5 hover:text-white sm:px-4 sm:text-sm"
          >
            Identity
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {!authLoaded ? (
            <span className="text-xs text-slate-400">Loading...</span>
          ) : email ? (
            <>
              <span
                className="hidden max-w-40 truncate text-xs text-sky-300 sm:block"
                title={email}
              >
                {email}
              </span>

              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5 hover:text-white sm:px-4 sm:text-sm"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5 hover:text-white sm:px-4 sm:text-sm"
              >
                Sign In
              </Link>

              <Link
                href="/signup"
                className="rounded-lg bg-sky-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-sky-300 sm:px-4 sm:text-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function getStatus(
  profileId: string,
  currentUserId: string | null,
  connections: Connection[],
) {
  if (!currentUserId) return "none";

  const connection = connections.find(
    (item) =>
      (item.requester_id === currentUserId &&
        item.recipient_id === profileId) ||
      (item.requester_id === profileId &&
        item.recipient_id === currentUserId),
  );

  if (!connection) return "none";

  if (connection.status === "accepted") {
    return "connected";
  }

  if (
    connection.status === "pending" &&
    connection.requester_id === currentUserId
  ) {
    return "outgoing";
  }

  if (
    connection.status === "pending" &&
    connection.recipient_id === currentUserId
  ) {
    return "incoming";
  }

  return "none";
}

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("All");

  const [loading, setLoading] = useState(true);
  const [connectionLoading, setConnectionLoading] = useState<string | null>(
    null,
  );

  const supabase = createClient();

  useEffect(() => {
    loadDirectory();
  }, []);

  async function loadDirectory() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setCurrentUserId(user?.id ?? null);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, headline, account_type, avatar_url")
      .order("full_name", { ascending: true });

    if (profileError) {
      console.error(profileError);
      alert(`Gagal memuat profil: ${profileError.message}`);
      setLoading(false);
      return;
    }

    setProfiles((profileData ?? []) as Profile[]);

    if (user) {
      const { data: connectionData, error: connectionError } = await supabase
        .from("connections")
        .select(
          "id, requester_id, recipient_id, status",
        )
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

      if (connectionError) {
        console.error(connectionError);
        alert(
          `Gagal memuat koneksi: ${connectionError.message}`,
        );
      } else {
        setConnections(connectionData ?? []);
      }
    } else {
      setConnections([]);
    }

    setLoading(false);
  }

  async function sendConnection(recipientId: string) {
    if (!currentUserId) {
      window.location.href = "/login";
      return;
    }

    if (currentUserId === recipientId) {
      return;
    }

    setConnectionLoading(recipientId);

    try {
      const existing = connections.find(
        (connection) =>
          (connection.requester_id === currentUserId &&
            connection.recipient_id === recipientId) ||
          (connection.requester_id === recipientId &&
            connection.recipient_id === currentUserId),
      );

      if (existing) {
        return;
      }

      const { data, error } = await supabase
        .from("connections")
        .insert({
          requester_id: currentUserId,
          recipient_id: recipientId,
          status: "pending",
        })
        .select("id, requester_id, recipient_id, status")
        .single();

      if (error) {
        console.error(error);

        if (error.code === "23505") {
          alert("Connection request sudah pernah dibuat.");
        } else {
          alert(`Gagal mengirim undangan: ${error.message}`);
        }

        return;
      }

      if (data) {
        setConnections((current) => [...current, data]);
      }
    } finally {
      setConnectionLoading(null);
    }
  }

  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return profiles.filter((profile) => {
      if (profile.id === currentUserId) {
        return false;
      }

      const matchesType =
        filter === "All" || profile.account_type === filter;

      const searchableText = [
        profile.full_name,
        profile.headline ?? "",
        profile.account_type,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        query.length === 0 || searchableText.includes(query);

      return matchesType && matchesSearch;
    });
  }, [profiles, search, filter, currentUserId]);

  const connectedCount = connections.filter(
    (connection) =>
      connection.status === "accepted" &&
      (connection.requester_id === currentUserId ||
        connection.recipient_id === currentUserId),
  ).length;

  const pendingIncomingCount = connections.filter(
    (connection) =>
      connection.status === "pending" &&
      connection.recipient_id === currentUserId,
  ).length;

  const individualCount = profiles.filter(
    (profile) => profile.account_type === "Individual",
  ).length;

  const companyCount = profiles.filter(
    (profile) => profile.account_type === "Company",
  ).length;

  return (
    <div className="min-h-screen bg-[#080b12] text-slate-100">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* ACCOUNT STATUS */}
        <section className="mb-6 rounded-2xl border border-sky-400/20 bg-sky-400/[0.05] p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    currentUserId
                      ? "bg-emerald-400"
                      : "bg-sky-400"
                  }`}
                />

                <p className="text-sm font-semibold text-sky-300">
                  {currentUserId ? "Signed In" : "Guest Mode"}
                </p>
              </div>

              <h2 className="mt-2 text-lg font-semibold text-white">
                {currentUserId
                  ? "Explore the engineering network."
                  : "Explore ENGRAPH without an account."}
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                {currentUserId
                  ? "Find engineers, researchers, innovators, and companies."
                  : "You can browse public profiles. Sign in to send connection requests."}
              </p>
            </div>

            {!currentUserId && (
              <div className="flex shrink-0 gap-2">
                <Link
                  href="/login"
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white transition hover:bg-white/5"
                >
                  Sign In
                </Link>

                <Link
                  href="/signup"
                  className="rounded-xl bg-sky-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#111b2d] via-[#0c1422] to-[#0a0e17] p-6 sm:p-9 lg:p-12">
          <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-sky-400/[0.10] blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/[0.08] px-3 py-1.5 text-xs font-medium text-sky-300">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                Engineering Network
              </div>

              <h1 className="mt-5 max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Discover people who{" "}
                <span className="text-sky-300">build the future.</span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                Connect with engineers, researchers, innovators, and
                technology companies across the engineering ecosystem.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
                <p className="text-xs text-slate-500">Individuals</p>

                <p className="mt-3 text-3xl font-semibold text-white">
                  {individualCount}
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
                <p className="text-xs text-slate-500">Companies</p>

                <p className="mt-3 text-3xl font-semibold text-white">
                  {companyCount}
                </p>
              </div>

              <div className="col-span-2 rounded-2xl border border-sky-400/15 bg-sky-400/[0.05] p-5">
                <p className="text-xs text-slate-400">
                  Your connections
                </p>

                <p className="mt-2 text-2xl font-semibold text-white">
                  {connectedCount}
                </p>

                {pendingIncomingCount > 0 && (
                  <Link
                    href="/network"
                    className="mt-2 inline-block text-xs text-amber-300 hover:text-amber-200"
                  >
                    {pendingIncomingCount} pending request
                    {pendingIncomingCount > 1 ? "s" : ""} →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* DIRECTORY */}
        <section className="mt-12" id="discover-profiles">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
              Explore the ecosystem
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
              Discover profiles
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Search registered ENGRAPH users and organizations.
            </p>
          </div>

          {/* SEARCH */}
          <div className="mt-6 flex flex-col gap-3 lg:flex-row">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search names, companies, or engineering fields..."
              className="w-full flex-1 rounded-xl border border-white/10 bg-[#0c111b] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-400/50"
            />

            <div className="flex gap-2">
              {(["All", "Individual", "Company"] as const).map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    className={`rounded-xl border px-4 py-3 text-sm transition ${
                      filter === item
                        ? "border-sky-400/30 bg-sky-400/10 text-sky-300"
                        : "border-white/10 bg-[#0c111b] text-slate-400 hover:text-white"
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {loading
                ? "Loading profiles..."
                : `${filteredProfiles.length} profiles found`}
            </p>

            {(search || filter !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilter("All");
                }}
                className="text-xs text-sky-300 hover:text-sky-200"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* PROFILE GRID */}
          {loading ? (
            <div className="mt-6 rounded-2xl border border-white/[0.08] bg-[#0c111b] p-10 text-center text-sm text-slate-500">
              Loading engineering network...
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-[#0c111b] p-10 text-center">
              <h3 className="text-lg font-semibold text-white">
                No profiles found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try another name, company, or account type.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredProfiles.map((profile) => {
                const status = getStatus(
                  profile.id,
                  currentUserId,
                  connections,
                );

                const initials = getInitials(profile.full_name);

                return (
                  <article
                    key={profile.id}
                    className="flex h-full flex-col rounded-2xl border border-white/[0.08] bg-[#0c111b] p-5 transition hover:-translate-y-1 hover:border-sky-400/25 hover:bg-[#101725] sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name}
                          className="h-14 w-14 rounded-2xl object-cover"
                        />
                      ) : (
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                            profile.account_type === "Company"
                              ? "bg-violet-500/20 text-violet-300"
                              : "bg-sky-500/20 text-sky-300"
                          } text-lg font-bold`}
                        >
                          {initials}
                        </div>
                      )}

                      <span
                        className={`rounded-lg px-2.5 py-1 text-[10px] ${
                          profile.account_type === "Company"
                            ? "border border-violet-400/20 bg-violet-400/10 text-violet-300"
                            : "border border-sky-400/20 bg-sky-400/10 text-sky-300"
                        }`}
                      >
                        {profile.account_type}
                      </span>
                    </div>

                    <div className="mt-5">
                      <h3 className="text-lg font-semibold text-white">
                        {profile.full_name}
                      </h3>

                      <p className="mt-2 text-sm text-slate-300">
                        {profile.headline || "Engineering professional"}
                      </p>
                    </div>

                    <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                      <p className="text-xs text-slate-500">
                        Portfolio valuation
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Portfolio data will appear here
                      </p>
                    </div>

                    <div className="mt-auto pt-6">
                      {!currentUserId ? (
                        <Link
                          href="/login"
                          className="flex w-full items-center justify-center rounded-xl bg-sky-400 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-sky-300"
                        >
                          Sign in to connect
                        </Link>
                      ) : status === "connected" ? (
                        <button
                          type="button"
                          disabled
                          className="w-full rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5 text-sm font-medium text-emerald-300"
                        >
                          ✓ Connected
                        </button>
                      ) : status === "outgoing" ? (
                        <button
                          type="button"
                          disabled
                          className="w-full rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-2.5 text-sm font-medium text-amber-300"
                        >
                          ◷ Request Sent
                        </button>
                      ) : status === "incoming" ? (
                        <Link
                          href="/network"
                          className="flex w-full items-center justify-center rounded-xl border border-sky-400/20 bg-sky-400/10 px-4 py-2.5 text-sm font-medium text-sky-300 transition hover:bg-sky-400/15"
                        >
                          View Request →
                        </Link>
                      ) : (
                        <button
                          type="button"
                          disabled={connectionLoading === profile.id}
                          onClick={() => sendConnection(profile.id)}
                          className="w-full rounded-xl bg-sky-400 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {connectionLoading === profile.id
                            ? "Sending..."
                            : "+ Connect"}
                        </button>
                      )}

                      <p className="mt-3 text-center text-[10px] text-slate-600">
                        Public ENGRAPH profile
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="mt-12 rounded-2xl border border-sky-400/15 bg-gradient-to-r from-sky-400/[0.08] to-violet-400/[0.04] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
                Your engineering identity
              </p>

              <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                Make your engineering identity visible.
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Build a profile that highlights your expertise, projects,
                research interests, and engineering ambitions.
              </p>
            </div>

            <Link
              href="/identity"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
            >
              Explore Identity →
            </Link>
          </div>
        </section>

        <footer className="mt-12 border-t border-white/[0.08] py-6">
          <p className="text-xs text-slate-500">
            <span className="font-semibold tracking-[0.14em] text-slate-300">
              ENGRAPH
            </span>{" "}
            — Engineering Connected
          </p>
        </footer>
      </main>
    </div>
  );
}