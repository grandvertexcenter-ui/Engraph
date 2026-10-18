"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/supabase/client";

type Profile = {
  id: string;
  full_name: string;
  headline: string | null;
  account_type: "Individual" | "Company";
  avatar_url: string | null;
};

type Connection = {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: "pending" | "accepted";
  created_at: string;
  profile: Profile;
};

export default function MyNetworkPage() {
  const [incoming, setIncoming] = useState<Connection[]>([]);
  const [connected, setConnected] = useState<Connection[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadNetwork = useCallback(async () => {
    setLoaded(false);
    setError("");

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        setIncoming([]);
        setConnected([]);
        setError("Silakan login untuk melihat jaringan kamu.");
        return;
      }

      const { data: rows, error: queryError } = await supabase
        .from("connections")
        .select(
          "id, requester_id, recipient_id, status, created_at",
        )
        .or(
          `requester_id.eq.${user.id},recipient_id.eq.${user.id}`,
        );

      if (queryError) throw queryError;

      const connections = rows ?? [];

      const profileIds = [
        ...new Set(
          connections.map((connection) =>
            connection.requester_id === user.id
              ? connection.recipient_id
              : connection.requester_id,
          ),
        ),
      ];

      let profileMap = new Map<string, Profile>();

      if (profileIds.length > 0) {
        const { data: profileRows, error: profileError } =
          await supabase
            .from("profiles")
            .select(
              "id, full_name, headline, account_type, avatar_url",
            )
            .in("id", profileIds);

        if (profileError) throw profileError;

        profileMap = new Map(
          (profileRows ?? []).map((profile) => [
            profile.id,
            profile as Profile,
          ]),
        );
      }

      const mapped: Connection[] = connections.flatMap(
        (connection) => {
          const otherUserId =
            connection.requester_id === user.id
              ? connection.recipient_id
              : connection.requester_id;

          const profile = profileMap.get(otherUserId);

          if (!profile) return [];

          return [
            {
              ...connection,
              status: connection.status as Connection["status"],
              profile,
            },
          ];
        },
      );

      setIncoming(
        mapped.filter(
          (connection) =>
            connection.status === "pending" &&
            connection.recipient_id === user.id,
        ),
      );

      setConnected(
        mapped.filter(
          (connection) => connection.status === "accepted",
        ),
      );
    } catch (err) {
      console.error("Failed to load network:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat jaringan.",
      );
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void loadNetwork();
  }, [loadNetwork]);

  async function handleRequest(
    connection: Connection,
    action: "accept" | "reject",
  ) {
    setBusyId(connection.id);
    setError("");
    setNotice("");

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user || connection.recipient_id !== user.id) {
        throw new Error(
          "Hanya penerima permintaan yang dapat memprosesnya.",
        );
      }

      if (action === "accept") {
        const { data, error: updateError } = await supabase
          .from("connections")
          .update({ status: "accepted" })
          .eq("id", connection.id)
          .eq("recipient_id", user.id)
          .eq("status", "pending")
          .select("id");

        if (updateError) throw updateError;

        if (!data?.length) {
          throw new Error(
            "Permintaan tidak ditemukan atau sudah diproses. Muat ulang halaman.",
          );
        }

        setNotice(
          `Kamu sekarang terhubung dengan ${connection.profile.full_name}.`,
        );
      } else {
        const { data, error: deleteError } = await supabase
          .from("connections")
          .delete()
          .eq("id", connection.id)
          .eq("recipient_id", user.id)
          .eq("status", "pending")
          .select("id");

        if (deleteError) throw deleteError;

        if (!data?.length) {
          throw new Error(
            "Permintaan tidak ditemukan atau sudah diproses. Muat ulang halaman.",
          );
        }

        setNotice(
          `Permintaan dari ${connection.profile.full_name} ditolak.`,
        );
      }

      await loadNetwork();
    } catch (err) {
      console.error("Failed to process request:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memproses permintaan.",
      );
    } finally {
      setBusyId(null);
    }
  }

  function ProfileCard({
    connection,
    showActions = false,
  }: {
    connection: Connection;
    showActions?: boolean;
  }) {
    const profile = connection.profile;
    const initials =
      profile.full_name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "U";

    return (
      <article className="rounded-2xl border border-white/10 bg-[#0c111b] p-5">
        <div className="flex items-start gap-4">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="h-12 w-12 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 font-bold text-white">
              {initials}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white">
              {profile.full_name}
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              {profile.headline || profile.account_type}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {profile.account_type}
            </p>
          </div>
        </div>

        {showActions && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={busyId === connection.id}
              onClick={() => void handleRequest(connection, "accept")}
              className="rounded-xl bg-sky-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busyId === connection.id ? "Processing..." : "Accept"}
            </button>

            <button
              type="button"
              disabled={busyId === connection.id}
              onClick={() => void handleRequest(connection, "reject")}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        )}
      </article>
    );
  }

  return (
    <main className="min-h-screen bg-[#080b12] text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#080b12]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/discover" className="text-lg font-bold tracking-widest">
            <span className="text-white">ENGRAPH</span>
            <span className="ml-2 text-sky-300">NETWORK</span>
          </Link>

          <nav className="flex gap-2 text-sm">
            <Link
              href="/discover"
              className="rounded-lg px-3 py-2 text-slate-400 hover:bg-white/5 hover:text-white"
            >
              Discover
            </Link>

            <Link
              href="/network"
              className="rounded-lg bg-sky-400/10 px-3 py-2 text-sky-300"
            >
              My Network
            </Link>

            <Link
              href="/identity"
              className="rounded-lg px-3 py-2 text-slate-400 hover:bg-white/5 hover:text-white"
            >
              Identity
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
          Your Engineering Ecosystem
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          My Network
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          Manage your engineering connections and connection requests.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300"
          >
            {notice}
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#0c111b] p-5">
            <p className="text-sm text-slate-400">Connected</p>
            <p className="mt-3 text-3xl font-semibold text-emerald-300">
              {loaded ? connected.length : "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0c111b] p-5">
            <p className="text-sm text-slate-400">Incoming Requests</p>
            <p className="mt-3 text-3xl font-semibold text-amber-300">
              {loaded ? incoming.length : "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0c111b] p-5">
            <p className="text-sm text-slate-400">Network Status</p>
            <p className="mt-3 text-lg font-semibold text-white">
              {loaded ? "Synchronized" : "Loading..."}
            </p>
          </div>
        </div>

        {!loaded ? (
          <p className="mt-10 text-sm text-slate-400">
            Loading your network...
          </p>
        ) : (
          <>
            <section className="mt-10">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-white">
                  Incoming Requests
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  People who want to connect with you.
                </p>
              </div>

              {incoming.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {incoming.map((connection) => (
                    <ProfileCard
                      key={connection.id}
                      connection={connection}
                      showActions
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-[#0c111b] p-6 text-sm text-slate-400">
                  You have no incoming requests.
                </div>
              )}
            </section>

            <section className="mt-10">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-white">
                  Your Connections
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Accounts connected to your profile.
                </p>
              </div>

              {connected.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {connected.map((connection) => (
                    <ProfileCard
                      key={connection.id}
                      connection={connection}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#0c111b] p-8 text-center">
                  <h3 className="font-medium text-white">
                    No connections yet
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    Visit Discover to connect with engineers or companies.
                  </p>

                  <Link
                    href="/discover"
                    className="mt-5 inline-flex rounded-xl bg-sky-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-300"
                  >
                    Explore Discover
                  </Link>
                </div>
              )}
            </section>
          </>
        )}

        <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
          <p className="text-xs leading-5 text-slate-500">
            Your connections are synchronized with your ENGRAPH account.
          </p>

          <button
            type="button"
            disabled={!loaded}
            onClick={() => void loadNetwork()}
            className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>
    </main>
  );
}