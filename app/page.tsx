"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createClient } from "@/utils/supabase/supabase/client";

type ProfileType = "Individual" | "Company";

type ValuationStatus =
  | "Creator-Declared"
  | "Estimated"
  | "Market-Verified"
  | "Transaction-Verified";

type Project = {
  id: number;
  title: string;
  author: string;
  sector: string;
  description: string;
  value: number;
  valuationStatus: ValuationStatus;
  category: "Innovation" | "Product" | "Service";
  likes: number;
};

type DatabaseProfile = {
  full_name: string | null;
  headline: string | null;
  account_type: "Individual" | "Company";
};

const sectors = [
  { name: "Mechanical Engineering", count: 1280 },
  { name: "Robotics & Automation", count: 940 },
  { name: "Aerospace Engineering", count: 720 },
  { name: "Civil Engineering", count: 650 },
  { name: "Electrical Engineering", count: 580 },
  { name: "Software Engineering", count: 510 },
];

const initialProjects: Project[] = [
  {
    id: 1,
    title: "Adaptive Robotic CNC Machine",
    author: "Delphian",
    sector: "Mechanical Engineering",
    description:
      "A multi-axis robotic CNC machine concept for flexible machining operations.",
    value: 25000,
    valuationStatus: "Creator-Declared",
    category: "Innovation",
    likes: 128,
  },
  {
    id: 2,
    title: "Hydraulic Robotic Arm",
    author: "Engineering Researcher",
    sector: "Robotics & Automation",
    description:
      "An engineering concept exploring hydraulic actuators and mechanical movement.",
    value: 12000,
    valuationStatus: "Estimated",
    category: "Innovation",
    likes: 96,
  },
  {
    id: 3,
    title: "Reusable Spacecraft Concept",
    author: "Aerospace Design Team",
    sector: "Aerospace Engineering",
    description:
      "A spacecraft concept focused on reusable architecture and engineering integration.",
    value: 18000,
    valuationStatus: "Creator-Declared",
    category: "Product",
    likes: 84,
  },
];

function formatUSD(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Home() {
  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("Discover");
  const [search, setSearch] = useState("");
  const [projectList, setProjectList] =
    useState<Project[]>(initialProjects);

  const [showForm, setShowForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const [profileType, setProfileType] =
    useState<ProfileType>("Individual");
  const [profileName, setProfileName] = useState("Guest");
  const [profileHeadline, setProfileHeadline] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profileSector, setProfileSector] =
    useState("Not specified");

  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newSector, setNewSector] = useState(sectors[0].name);
  const [newDescription, setNewDescription] = useState("");
  const [newValue, setNewValue] = useState("1000");

  const [newStatus, setNewStatus] =
    useState<"Creator-Declared" | "Estimated">(
      "Creator-Declared"
    );

  const [newCategory, setNewCategory] =
    useState<Project["category"]>("Innovation");

  // AUTHENTICATION AND PROFILE
  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function loadCurrentUser() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (authError || !user) {
          setUserId(null);
          setUserEmail(null);
          setProfileName("Guest");
          setProfileHeadline("");
          setProfileBio("");
          setProfileSector("Not specified");
          setProfileType("Individual");
          setNewAuthor("");
          setAuthLoading(false);
          return;
        }

        setUserId(user.id);
        setUserEmail(user.email ?? null);

        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, headline, account_type")
          .eq("id", user.id)
          .maybeSingle();

        if (!mounted) return;

        if (profileError) {
          console.error(
            "Failed to load profile:",
            profileError.message
          );
        }

        const profile = data as DatabaseProfile | null;

        const metadataName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          "";

        const accountName =
          profile?.full_name?.trim() ||
          metadataName.trim() ||
          user.email?.split("@")[0] ||
          "User";

        setProfileName(accountName);
        setNewAuthor(accountName);

        setProfileHeadline(profile?.headline || "");

        setProfileType(
          profile?.account_type === "Company"
            ? "Company"
            : "Individual"
        );

        setAuthLoading(false);
      } catch (error) {
        console.error("Authentication check failed:", error);

        if (!mounted) return;

        setUserId(null);
        setUserEmail(null);
        setProfileName("Guest");
        setProfileHeadline("");
        setProfileBio("");
        setProfileSector("Not specified");
        setProfileType("Individual");
        setNewAuthor("");
        setAuthLoading(false);
      }
    }

    void loadCurrentUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadCurrentUser();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const isLoggedIn = Boolean(userId);

  // PROJECT SEARCH
  const filteredProjects = useMemo(() => {
    const query = search.toLowerCase().trim();

    return projectList.filter((project) => {
      const searchableText = [
        project.title,
        project.author,
        project.sector,
        project.category,
        project.description,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [projectList, search]);

  // PROFILE PROJECTS
  const profileProjects = useMemo(() => {
    if (!isLoggedIn) return [];

    return projectList.filter(
      (project) =>
        project.author.trim().toLowerCase() ===
        profileName.trim().toLowerCase()
    );
  }, [projectList, profileName, isLoggedIn]);

  const portfolioValue = profileProjects.reduce(
    (total, project) => total + project.value,
    0
  );

  const totalProjectValue = projectList.reduce(
    (total, project) => total + project.value,
    0
  );

  // REQUIRE LOGIN FOR PROTECTED ACTIONS
  function requireLogin() {
    if (authLoading) {
      alert("Sedang memeriksa sesi akun. Coba lagi sebentar.");
      return false;
    }

    if (!isLoggedIn) {
      window.location.href = "/login";
      return false;
    }

    return true;
  }

  // SAVE PROFILE TO SUPABASE
  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!requireLogin()) return;

    if (!profileName.trim()) {
      setProfileMessage("Nama profil wajib diisi.");
      return;
    }

    setSavingProfile(true);
    setProfileMessage("");

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user || user.id !== userId) {
        setProfileMessage(
          "Sesi akun tidak valid. Silakan login kembali."
        );
        return;
      }

      const updatedProfile = {
        id: user.id,
        full_name: profileName.trim(),
        headline: profileHeadline.trim(),
        account_type: profileType,
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(updatedProfile, { onConflict: "id" });

      if (error) {
        console.error("Profile save error:", error.message);
        setProfileMessage(
          `Gagal menyimpan profil: ${error.message}`
        );
        return;
      }

      setProfileName(profileName.trim());
      setNewAuthor(profileName.trim());
      setShowProfile(false);
      setProfileMessage("");

      alert(
        "Profil berhasil disimpan. Nama, headline, dan tipe akun telah diperbarui."
      );
    } catch (error) {
      console.error("Save profile error:", error);
      setProfileMessage(
        "Terjadi kesalahan saat menyimpan profil."
      );
    } finally {
      setSavingProfile(false);
    }
  }

  // PUBLISH PROJECT
  function publishProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!requireLogin()) return;

    const parsedValue = Number(newValue);

    if (
      !newTitle.trim() ||
      !newDescription.trim() ||
      !Number.isFinite(parsedValue) ||
      parsedValue < 0
    ) {
      alert("Periksa kembali data proyek yang kamu masukkan.");
      return;
    }

    const newProject: Project = {
      id: Date.now(),
      title: newTitle.trim(),
      author: profileName,
      sector: newSector,
      description: newDescription.trim(),
      value: parsedValue,
      valuationStatus: newStatus,
      category: newCategory,
      likes: 0,
    };

    setProjectList((previousProjects) => [
      newProject,
      ...previousProjects,
    ]);

    setNewTitle("");
    setNewAuthor(profileName);
    setNewSector(sectors[0].name);
    setNewDescription("");
    setNewValue("1000");
    setNewStatus("Creator-Declared");
    setNewCategory("Innovation");
    setSearch("");
    setShowForm(false);

    alert(
      "Proyek ditambahkan ke daftar demonstrasi halaman ini. Penyimpanan proyek ke database belum diimplementasikan."
    );
  }

  // SIGN OUT
  async function handleSignOut() {
    const confirmed = window.confirm(
      "Yakin ingin keluar dari akun ENGRAPH?"
    );

    if (!confirmed) return;

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(`Gagal keluar: ${error.message}`);
      return;
    }

    setUserId(null);
    setUserEmail(null);
    setProfileName("Guest");
    setProfileHeadline("");
    setProfileBio("");
    setProfileSector("Not specified");
    setProfileType("Individual");
    setNewAuthor("");
    setShowProfile(false);
    setShowForm(false);

    window.location.replace("/");
  }

  // NAVIGATION
  function handleNavigation(tab: string) {
    if (tab === "Discover Network") {
      window.location.href = "/discover";
      return;
    }

    if (tab === "Identity System") {
      window.location.href = "/identity";
      return;
    }

    setActiveTab(tab);

    if (tab === "Projects") {
      document
        .getElementById("projects-section")
        ?.scrollIntoView({ behavior: "smooth" });
    } else if (tab === "Engineering Sectors") {
      document
        .getElementById("sectors-section")
        ?.scrollIntoView({ behavior: "smooth" });
    } else if (tab === "Analytics") {
      document
        .getElementById("analytics-section")
        ?.scrollIntoView({ behavior: "smooth" });
    } else if (tab === "Companies") {
      document
        .getElementById("companies-section")
        ?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const menuItems = [
    "Discover",
    "Discover Network",
    "Engineering Sectors",
    "Projects",
    "Companies",
    "Analytics",
    "Identity System",
  ];

  return (
    <main className="min-h-screen bg-[#080b12] text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#080b12]/95 px-6 py-5 backdrop-blur-xl md:px-10">
        <a href="/" className="group">
          <h1 className="text-3xl font-bold tracking-widest text-cyan-400 transition group-hover:text-cyan-300">
            ENGRAPH
          </h1>

          <p className="mt-1 text-xs text-gray-400">
            Engineering Network & Innovation Index
          </p>
        </a>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/discover"
            className="rounded-lg border border-cyan-400/40 bg-cyan-400/5 px-4 py-2 text-sm text-cyan-300 transition hover:border-cyan-400 hover:bg-cyan-400/10"
          >
            <span className="mr-2">⌕</span>
            Discover Network
            <span className="ml-2">↗</span>
          </a>

          <a
            href="/identity"
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-gray-300 transition hover:border-cyan-400 hover:text-cyan-300"
          >
            ◈ Identity System
          </a>

          <button
            type="button"
            onClick={() => {
              if (!requireLogin()) return;

              setProfileMessage("");
              setShowProfile(!showProfile);
            }}
            disabled={authLoading}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm transition hover:border-cyan-400 hover:text-cyan-300 disabled:opacity-50"
          >
            {authLoading
              ? "Loading..."
              : showProfile
                ? "Close Profile"
                : isLoggedIn
                  ? "My Profile"
                  : "Guest Profile"}
          </button>

          {authLoading ? (
            <span className="rounded-lg border border-white/10 px-5 py-2 text-sm text-gray-400">
              Checking session...
            </span>
          ) : isLoggedIn ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-lg border border-red-400/40 px-5 py-2 text-sm text-red-300 transition hover:bg-red-400/10"
            >
              Sign Out
            </button>
          ) : (
            <a
              href="/login"
              className="rounded-lg border border-cyan-400 px-5 py-2 text-sm text-cyan-300 transition hover:bg-cyan-400 hover:text-black"
            >
              Sign In
            </a>
          )}
        </div>
      </header>

      {/* ACCOUNT STATUS */}
      <div className="border-b border-white/5 bg-white/[0.02] px-6 py-3 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-gray-400">
            Account status:{" "}
            <span className={isLoggedIn ? "text-cyan-300" : "text-gray-300"}>
              {authLoading
                ? "Checking..."
                : isLoggedIn
                  ? "Authenticated"
                  : "Guest"}
            </span>
          </span>

          {isLoggedIn && userEmail && (
            <span className="text-gray-500">
              Signed in as {userEmail}
            </span>
          )}
        </div>
      </div>

      {/* PROFILE SETTINGS */}
      {showProfile && isLoggedIn && (
        <section className="border-b border-white/10 bg-[#0d131e] px-6 py-8 md:px-10">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6">
              <p className="text-xs font-semibold tracking-widest text-cyan-400">
                PROFILE SETTINGS
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Your Engineering Profile
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                Update your professional identity on ENGRAPH.
              </p>

              <p className="mt-2 text-xs text-gray-500">
                Signed in as {userEmail}
              </p>

              <a
                href="/identity"
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-cyan-400/40 px-4 py-2 text-sm text-cyan-300 transition hover:bg-cyan-400/10"
              >
                Open Identity Registration <span>↗</span>
              </a>
            </div>

            <form
              onSubmit={saveProfile}
              className="grid gap-5 rounded-xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-2"
            >
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-gray-300">
                  Profile Type
                </label>

                <div className="grid grid-cols-2 gap-3">
                  {(["Individual", "Company"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setProfileType(type)}
                      className={
                        "rounded-lg border px-4 py-3 text-sm transition " +
                        (profileType === type
                          ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                          : "border-white/10 text-gray-400 hover:border-white/30")
                      }
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  {profileType === "Individual"
                    ? "Full Name"
                    : "Company Name"}
                </label>

                <input
                  required
                  value={profileName}
                  onChange={(event) =>
                    setProfileName(event.target.value)
                  }
                  placeholder={
                    profileType === "Individual"
                      ? "Enter your name"
                      : "Enter company name"
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Engineering Sector
                </label>

                <select
                  value={profileSector}
                  onChange={(event) =>
                    setProfileSector(event.target.value)
                  }
                  className="w-full rounded-lg border border-white/10 bg-[#111722] px-4 py-3 text-sm outline-none focus:border-cyan-400"
                >
                  <option value="Not specified">Not specified</option>

                  {sectors.map((sector) => (
                    <option key={sector.name} value={sector.name}>
                      {sector.name}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs text-gray-500">
                  Sector belum disimpan ke tabel profiles.
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-gray-300">
                  {profileType === "Individual"
                    ? "Professional Headline"
                    : "Company Tagline"}
                </label>

                <input
                  value={profileHeadline}
                  onChange={(event) =>
                    setProfileHeadline(event.target.value)
                  }
                  placeholder="Engineering, technology, and innovation"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-gray-300">
                  {profileType === "Individual"
                    ? "About You"
                    : "About the Company"}
                </label>

                <textarea
                  value={profileBio}
                  onChange={(event) =>
                    setProfileBio(event.target.value)
                  }
                  placeholder="Describe your background, focus, and goals..."
                  rows={4}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan-400"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Bio belum disimpan ke tabel profiles.
                </p>
              </div>

              <div className="md:col-span-2">
                <div className="mb-4 rounded-lg border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-gray-400">
                    Current Portfolio Value
                  </p>

                  <p className="mt-2 text-3xl font-bold text-cyan-300">
                    {formatUSD(portfolioValue)}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Calculated from demonstration projects whose creator
                    name matches this profile. This is not personal
                    income or company valuation.
                  </p>
                </div>

                {profileMessage && (
                  <p
                    role="alert"
                    className="mb-4 text-sm text-red-400"
                  >
                    {profileMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingProfile ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* MAIN LAYOUT */}
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 md:grid-cols-[230px_1fr] md:px-10">
        {/* SIDEBAR */}
        <aside>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
            Main Menu
          </p>

          <nav className="space-y-2">
            {menuItems.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleNavigation(tab)}
                className={
                  "block w-full rounded-lg px-4 py-3 text-left text-sm transition " +
                  (tab === "Discover Network" ||
                  tab === "Identity System"
                    ? "border border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300 hover:border-cyan-400/50 hover:bg-cyan-400/10"
                    : activeTab === tab
                      ? "bg-cyan-400/10 text-cyan-300"
                      : "text-gray-400 hover:bg-white/5 hover:text-white")
                }
              >
                <span className="mr-3">
                  {tab === "Discover" && "⌂"}
                  {tab === "Discover Network" && "⌕"}
                  {tab === "Engineering Sectors" && "◫"}
                  {tab === "Projects" && "◇"}
                  {tab === "Companies" && "▦"}
                  {tab === "Analytics" && "⌁"}
                  {tab === "Identity System" && "◈"}
                </span>

                {tab}

                {(tab === "Discover Network" ||
                  tab === "Identity System") && (
                  <span className="float-right">↗</span>
                )}
              </button>
            ))}
          </nav>

          {/* DISCOVER NETWORK PROMO */}
          <div className="mt-6 rounded-xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/[0.09] to-transparent p-4">
            <div className="flex items-center gap-2">
              <span className="text-xl text-cyan-300">⌕</span>
              <p className="font-semibold">Discover Network</p>
            </div>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              Find engineers, inventors, researchers, and engineering
              companies. Build your professional network.
            </p>

            <a
              href="/discover"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-400/30 px-3 py-2 text-sm text-cyan-300 transition hover:bg-cyan-400/10"
            >
              Explore Network <span>↗</span>
            </a>
          </div>

          {/* IDENTITY PROMO CARD */}
          <div className="mt-4 rounded-xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/[0.08] to-transparent p-4">
            <div className="flex items-center gap-2">
              <span className="text-xl text-cyan-300">◈</span>
              <p className="font-semibold">Identity Protocol</p>
            </div>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              Establish your professional identity and obtain a unique
              ENGRAPH Profile ID.
            </p>

            <a
              href="/identity"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-400/30 px-3 py-2 text-sm text-cyan-300 transition hover:bg-cyan-400/10"
            >
              Create Identity <span>↗</span>
            </a>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="font-semibold">Global Network</p>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              Connect engineers, independent innovators, and companies
              in one engineering platform.
            </p>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <section className="min-w-0 space-y-8">
          {/* HERO */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#101d2d] via-[#0b111c] to-[#080b12] p-6 md:p-9">
            <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative">
              <p className="text-sm font-medium tracking-widest text-cyan-400">
                ENGINEERING CONNECTED
              </p>

              <h2 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">
                Discover ideas.
                <br />
                <span className="text-cyan-300">
                  Build the future.
                </span>
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-400 md:text-base">
                Explore engineering innovations, connect with
                professionals, discover companies, and track registered
                engineering portfolio values.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/discover"
                  className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300"
                >
                  Discover Network <span>↗</span>
                </a>

                <a
                  href="/identity"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-3 text-sm text-gray-300 transition hover:border-cyan-400 hover:text-cyan-300"
                >
                  ◈ Establish Your Identity
                </a>
              </div>
            </div>
          </div>

          {/* OVERVIEW STATISTICS */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-gray-400">
                Registered Projects
              </p>

              <p className="mt-3 text-3xl font-bold">
                {projectList.length}
              </p>

              <p className="mt-2 text-xs text-gray-500">
                Current project directory
              </p>
            </div>

            <div
              id="analytics-section"
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
            >
              <p className="text-sm text-gray-400">
                Engineering Sectors
              </p>

              <p className="mt-3 text-3xl font-bold">
                {sectors.length}
              </p>

              <p className="mt-2 text-xs text-gray-500">
                Engineering disciplines
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-gray-400">
                Registered Project Value
              </p>

              <p className="mt-3 text-2xl font-bold text-cyan-400">
                {formatUSD(totalProjectValue)}
              </p>

              <p className="mt-2 text-xs text-gray-500">
                Declared and estimated values
              </p>
            </div>
          </div>

          {/* PROFILE SUMMARY */}
          <section className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.04] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-widest text-cyan-400">
                  {isLoggedIn
                    ? "MY ENGINEERING PROFILE"
                    : "GUEST MODE"}
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  {authLoading ? "Loading profile..." : profileName}
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  {profileHeadline ||
                    (isLoggedIn
                      ? "Engineering Community Member"
                      : "Explore ENGRAPH without signing in")}
                </p>

                <p className="mt-3 text-xs text-gray-500">
                  {profileType} · {profileSector}
                </p>

                {isLoggedIn && userEmail && (
                  <p className="mt-2 text-xs text-gray-500">
                    {userEmail}
                  </p>
                )}
              </div>

              <div className="min-w-[180px] rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="text-xs text-gray-400">
                  My Portfolio Value
                </p>

                <p className="mt-2 text-2xl font-bold text-cyan-300">
                  {formatUSD(portfolioValue)}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {profileProjects.length} matching demo projects
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-3xl text-sm leading-6 text-gray-400">
              {profileBio ||
                (isLoggedIn
                  ? "Add a biography to describe your background, focus, and engineering goals."
                  : "You can explore engineering sectors and demonstration projects. Sign in to manage your profile.")}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => {
                    setProfileMessage("");
                    setShowProfile(true);
                    document
                      .querySelector("header")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="rounded-lg border border-cyan-400/50 px-4 py-2 text-sm text-cyan-300 transition hover:bg-cyan-400/10"
                >
                  Edit Profile
                </button>
              ) : (
                <a
                  href="/login"
                  className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-300"
                >
                  Sign In to Manage Profile
                </a>
              )}

              <a
                href="/discover"
                className="rounded-lg border border-white/15 px-4 py-2 text-sm text-gray-300 transition hover:border-cyan-400 hover:text-cyan-300"
              >
                Discover Network ↗
              </a>

              <a
                href="/identity"
                className="rounded-lg border border-white/15 px-4 py-2 text-sm text-gray-300 transition hover:border-cyan-400 hover:text-cyan-300"
              >
                Identity System ↗
              </a>
            </div>
          </section>

          {/* ENGINEERING SECTORS */}
          <section id="sectors-section" className="scroll-mt-24">
            <div className="mb-5">
              <p className="text-xs font-semibold tracking-widest text-cyan-400">
                ENGINEERING LANDSCAPE
              </p>

              <h3 className="mt-2 text-xl font-bold">
                Engineering Activity
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Demonstration activity by engineering sector.
              </p>
            </div>

            <div className="space-y-5 rounded-xl border border-white/10 bg-white/[0.03] p-5">
              {sectors.map((sector) => {
                const percentage = (sector.count / 1280) * 100;

                return (
                  <div key={sector.name}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span>{sector.name}</span>

                      <span className="text-cyan-300">
                        {sector.count.toLocaleString("en-US")}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-cyan-400 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              <p className="border-t border-white/10 pt-3 text-xs leading-5 text-gray-500">
                Demonstration data, not verified global engineering
                statistics.
              </p>
            </div>
          </section>

          {/* COMPANIES */}
          <section
            id="companies-section"
            className="scroll-mt-24 rounded-xl border border-white/10 bg-white/[0.03] p-5"
          >
            <p className="text-xs font-semibold tracking-widest text-cyan-400">
              ORGANIZATION NETWORK
            </p>

            <h3 className="mt-2 text-xl font-bold">
              Discover Engineering Companies
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              Explore industrial organizations, technology companies,
              energy innovators, research institutions, and architecture
              firms through the ENGRAPH network directory.
            </p>

            <a
              href="/discover"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300"
            >
              Explore Individual & Company Profiles <span>↗</span>
            </a>

            <p className="mt-3 text-xs leading-5 text-gray-500">
              The directory currently uses demonstration profiles until
              a shared user database is connected.
            </p>
          </section>

          {/* PROJECT PORTFOLIO */}
          <section id="projects-section" className="scroll-mt-24">
            <div className="mb-5">
              <p className="text-xs font-semibold tracking-widest text-cyan-400">
                PROJECT DIRECTORY
              </p>

              <h3 className="mt-2 text-xl font-bold">
                Explore Engineering Portfolio
              </h3>

              <p className="mt-1 text-sm text-gray-400">
                Discover innovations, products, and services.
              </p>

              <button
                type="button"
                disabled={authLoading}
                onClick={() => {
                  if (!requireLogin()) return;

                  setNewAuthor(profileName);
                  setShowForm(!showForm);
                }}
                className="mt-4 rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:opacity-50"
              >
                {showForm ? "Cancel" : "+ Publish Project"}
              </button>

              {!isLoggedIn && !authLoading && (
                <p className="mt-2 text-xs text-gray-500">
                  Guest users can explore projects. Sign in to access
                  the project publishing form.
                </p>
              )}
            </div>

            {/* PUBLISH PROJECT FORM */}
            {showForm && isLoggedIn && (
              <form
                onSubmit={publishProject}
                className="mb-6 space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-5"
              >
                <h4 className="text-lg font-semibold">
                  Publish to ENGRAPH
                </h4>

                <p className="text-sm text-gray-400">
                  Publishing currently adds the project to the local
                  demonstration list. Database publishing has not yet
                  been implemented.
                </p>

                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Project or Offering Name
                  </label>

                  <input
                    required
                    value={newTitle}
                    onChange={(event) =>
                      setNewTitle(event.target.value)
                    }
                    placeholder="Enter project, product, or service name"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Creator or Owner Name
                  </label>

                  <input
                    value={profileName}
                    readOnly
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-400 outline-none"
                  />

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    The creator name is taken from your signed-in profile.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Category
                  </label>

                  <select
                    value={newCategory}
                    onChange={(event) =>
                      setNewCategory(
                        event.target.value as Project["category"]
                      )
                    }
                    className="w-full rounded-lg border border-white/10 bg-[#111722] px-4 py-3 text-sm outline-none focus:border-cyan-400"
                  >
                    <option value="Innovation">Innovation</option>
                    <option value="Product">Product</option>
                    <option value="Service">Service</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Engineering Sector
                  </label>

                  <select
                    value={newSector}
                    onChange={(event) =>
                      setNewSector(event.target.value)
                    }
                    className="w-full rounded-lg border border-white/10 bg-[#111722] px-4 py-3 text-sm outline-none focus:border-cyan-400"
                  >
                    {sectors.map((sector) => (
                      <option key={sector.name} value={sector.name}>
                        {sector.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Estimated or Declared Value (USD)
                  </label>

                  <div className="flex overflow-hidden rounded-lg border border-white/10 bg-white/5 focus-within:border-cyan-400">
                    <span className="flex items-center border-r border-white/10 px-4 text-sm text-cyan-300">
                      USD $
                    </span>

                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={newValue}
                      onChange={(event) =>
                        setNewValue(event.target.value)
                      }
                      className="w-full bg-transparent px-4 py-3 text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Valuation Status
                  </label>

                  <select
                    value={newStatus}
                    onChange={(event) =>
                      setNewStatus(
                        event.target.value as
                          | "Creator-Declared"
                          | "Estimated"
                      )
                    }
                    className="w-full rounded-lg border border-white/10 bg-[#111722] px-4 py-3 text-sm outline-none focus:border-cyan-400"
                  >
                    <option value="Creator-Declared">
                      Creator-Declared
                    </option>

                    <option value="Estimated">Estimated</option>
                  </select>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Verified statuses are reserved for values reviewed
                    against supporting evidence.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Description
                  </label>

                  <textarea
                    required
                    value={newDescription}
                    onChange={(event) =>
                      setNewDescription(event.target.value)
                    }
                    placeholder="Describe the concept, function, or value offered..."
                    rows={4}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300"
                >
                  Publish Project
                </button>
              </form>
            )}

            {/* PROJECT SEARCH */}
            <div className="mb-5">
              <label
                htmlFor="project-search"
                className="mb-2 block text-sm text-gray-400"
              >
                Search the project directory
              </label>

              <input
                id="project-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search projects, people, descriptions, or sectors..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
              />
            </div>

            {/* PROJECT CARDS */}
            <div className="space-y-4">
              {filteredProjects.map((project) => (
                <article
                  key={project.id}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-cyan-400/50"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
                      {project.sector}
                    </span>

                    <span className="text-xs text-gray-500">
                      {project.likes} appreciations
                    </span>
                  </div>

                  <h4 className="mt-4 text-lg font-semibold">
                    {project.title}
                  </h4>

                  <p className="mt-1 text-sm text-gray-500">
                    By {project.author}
                  </p>

                  <p className="mt-3 text-xs text-gray-400">
                    Category: {project.category}
                  </p>

                  <p className="mt-4 text-sm leading-6 text-gray-400">
                    {project.description}
                  </p>

                  <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-4">
                    <div>
                      <p className="text-xs text-gray-500">
                        Registered Project Value
                      </p>

                      <p className="mt-1 text-2xl font-bold text-cyan-300">
                        {formatUSD(project.value)}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={
                          "inline-block rounded-full px-3 py-1 text-xs " +
                          (project.valuationStatus ===
                          "Transaction-Verified"
                            ? "bg-green-400/10 text-green-300"
                            : project.valuationStatus ===
                                "Market-Verified"
                              ? "bg-blue-400/10 text-blue-300"
                              : project.valuationStatus === "Estimated"
                                ? "bg-yellow-400/10 text-yellow-300"
                                : "bg-white/10 text-gray-300")
                        }
                      >
                        {project.valuationStatus}
                      </span>

                      <p className="mt-2 text-xs text-gray-500">
                        {project.valuationStatus === "Creator-Declared"
                          ? "Declared by creator"
                          : project.valuationStatus === "Estimated"
                            ? "Estimated value"
                            : "Verification status"}
                      </p>
                    </div>
                  </div>
                </article>
              ))}

              {filteredProjects.length === 0 && (
                <div className="rounded-xl border border-white/10 p-6 text-sm text-gray-400">
                  No projects found. Try a different search.
                </div>
              )}
            </div>
          </section>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-gray-500">
        <p>
          ENGRAPH | Engineering Network & Innovation Index
        </p>

        <div className="mt-3 flex flex-wrap justify-center gap-5">
          <a
            href="/discover"
            className="text-cyan-400 transition hover:text-cyan-300"
          >
            Discover Network
          </a>

          <a
            href="/identity"
            className="text-cyan-400 transition hover:text-cyan-300"
          >
            Identity System
          </a>

          {!isLoggedIn && (
            <a
              href="/login"
              className="text-cyan-400 transition hover:text-cyan-300"
            >
              Sign In
            </a>
          )}
        </div>
      </footer>
    </main>
  );
}