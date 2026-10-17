"use client";

import { useMemo, useState, type FormEvent } from "react";

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
  const [activeTab, setActiveTab] = useState("Discover");
  const [search, setSearch] = useState("");
  const [projectList, setProjectList] =
    useState<Project[]>(initialProjects);

  const [showForm, setShowForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [profileType, setProfileType] =
    useState<ProfileType>("Individual");
  const [profileName, setProfileName] = useState("Delphian");
  const [profileHeadline, setProfileHeadline] = useState(
    "Independent Engineering Innovator"
  );
  const [profileBio, setProfileBio] = useState(
    "Exploring engineering, technology, manufacturing, and innovation."
  );
  const [profileSector, setProfileSector] = useState(
    "Mechanical Engineering"
  );

  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("Delphian");
  const [newSector, setNewSector] = useState(sectors[0].name);
  const [newDescription, setNewDescription] = useState("");
  const [newValue, setNewValue] = useState("1000");
  const [newStatus, setNewStatus] =
    useState<"Creator-Declared" | "Estimated">(
      "Creator-Declared"
    );
  const [newCategory, setNewCategory] =
    useState<Project["category"]>("Innovation");

  const filteredProjects = useMemo(() => {
    const query = search.toLowerCase();

    return projectList.filter((project) => {
      const searchableText = [
        project.title,
        project.author,
        project.sector,
        project.category,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [projectList, search]);

  const profileProjects = useMemo(() => {
    return projectList.filter(
      (project) =>
        project.author.toLowerCase() === profileName.trim().toLowerCase()
    );
  }, [projectList, profileName]);

  const portfolioValue = profileProjects.reduce(
    (total, project) => total + project.value,
    0
  );

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profileName.trim()) {
      return;
    }

    setProfileName(profileName.trim());
    setNewAuthor(profileName.trim());
    setShowProfile(false);
  }

  function publishProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedValue = Number(newValue);

    if (
      !newTitle.trim() ||
      !newAuthor.trim() ||
      !newDescription.trim() ||
      !Number.isFinite(parsedValue) ||
      parsedValue < 0
    ) {
      return;
    }

    const newProject: Project = {
      id: Date.now(),
      title: newTitle.trim(),
      author: newAuthor.trim(),
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
  }

  return (
    <main className="min-h-screen bg-[#080b12] text-white">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-5 md:px-10">
        <div>
          <h1 className="text-3xl font-bold tracking-widest text-cyan-400">
            ENGRAPH
          </h1>

          <p className="mt-1 text-xs text-gray-400">
            Engineering Network & Innovation Index
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm transition hover:border-cyan-400 hover:text-cyan-300"
          >
            {showProfile ? "Close Profile" : "My Profile"}
          </button>

          <button
            onClick={() =>
              alert(
                "Google authentication will be implemented in a future stage."
              )
            }
            className="rounded-lg border border-cyan-400 px-5 py-2 text-sm transition hover:bg-cyan-400 hover:text-black"
          >
            Continue with Google
          </button>
        </div>
      </header>

      {showProfile && (
        <section className="border-b border-white/10 bg-[#0d131e] px-6 py-8 md:px-10">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6">
              <p className="text-xs font-semibold tracking-widest text-cyan-400">
                PROFILE SETTINGS
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Create Your Engineering Profile
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                Set up your identity and showcase your engineering
                portfolio on ENGRAPH.
              </p>
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
                  <button
                    type="button"
                    onClick={() => setProfileType("Individual")}
                    className={
                      "rounded-lg border px-4 py-3 text-sm transition " +
                      (profileType === "Individual"
                        ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                        : "border-white/10 text-gray-400 hover:border-white/30")
                    }
                  >
                    Individual
                  </button>

                  <button
                    type="button"
                    onClick={() => setProfileType("Company")}
                    className={
                      "rounded-lg border px-4 py-3 text-sm transition " +
                      (profileType === "Company"
                        ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                        : "border-white/10 text-gray-400 hover:border-white/30")
                    }
                  >
                    Company
                  </button>
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
                  {sectors.map((sector) => (
                    <option key={sector.name} value={sector.name}>
                      {sector.name}
                    </option>
                  ))}
                </select>
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
                    Calculated from projects whose creator name matches
                    this profile. This is portfolio value, not personal
                    income or company valuation.
                  </p>
                </div>

                <button
                  type="submit"
                  className="rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 md:grid-cols-[230px_1fr] md:px-10">
        <aside>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
            Main Menu
          </p>

          <nav className="space-y-2">
            {[
              "Discover",
              "Engineering Sectors",
              "Projects",
              "Companies",
              "Analytics",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={
                  "block w-full rounded-lg px-4 py-3 text-left text-sm transition " +
                  (activeTab === tab
                    ? "bg-cyan-400/10 text-cyan-300"
                    : "text-gray-400 hover:bg-white/5 hover:text-white")
                }
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="font-semibold">Global Network</p>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              Connect engineers, independent innovators, and companies
              in one engineering platform.
            </p>
          </div>
        </aside>

        <section className="min-w-0 space-y-8">
          <div>
            <p className="text-sm font-medium tracking-widest text-cyan-400">
              ENGINEERING CONNECTED
            </p>

            <h2 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">
              Discover ideas.
              <br />
              Build the future.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-400 md:text-base">
              Explore engineering innovations, connect with professionals,
              discover companies, and track registered engineering
              portfolio values.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-gray-400">
                Registered Projects
              </p>

              <p className="mt-3 text-3xl font-bold">
                {projectList.length}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-gray-400">
                Engineering Sectors
              </p>

              <p className="mt-3 text-3xl font-bold">
                {sectors.length}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-gray-400">
                Registered Project Value
              </p>

              <p className="mt-3 text-2xl font-bold text-cyan-400">
                {formatUSD(
                  projectList.reduce(
                    (total, project) => total + project.value,
                    0
                  )
                )}
              </p>
            </div>
          </div>

          <section className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.04] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-widest text-cyan-400">
                  MY ENGINEERING PROFILE
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  {profileName}
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  {profileHeadline || "Engineering Community Member"}
                </p>

                <p className="mt-3 text-xs text-gray-500">
                  {profileType} · {profileSector}
                </p>
              </div>

              <div className="min-w-[180px] rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="text-xs text-gray-400">
                  My Portfolio Value
                </p>

                <p className="mt-2 text-2xl font-bold text-cyan-300">
                  {formatUSD(portfolioValue)}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {profileProjects.length} registered projects
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-3xl text-sm leading-6 text-gray-400">
              {profileBio}
            </p>

            <button
              onClick={() => setShowProfile(true)}
              className="mt-5 rounded-lg border border-cyan-400/50 px-4 py-2 text-sm text-cyan-300 transition hover:bg-cyan-400/10"
            >
              Edit Profile
            </button>
          </section>

          <section>
            <h3 className="mb-2 text-xl font-bold">
              Engineering Activity
            </h3>

            <p className="mb-5 text-sm text-gray-400">
              Demonstration activity by engineering sector.
            </p>

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
                        className="h-full rounded-full bg-cyan-400"
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

          <section>
            <div className="mb-5">
              <h3 className="text-xl font-bold">
                Explore Engineering Portfolio
              </h3>

              <p className="mt-1 text-sm text-gray-400">
                Discover innovations, products, and services.
              </p>

              <button
                onClick={() => setShowForm(!showForm)}
                className="mt-4 rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300"
              >
                {showForm ? "Cancel" : "+ Publish Project"}
              </button>
            </div>

            {showForm && (
              <form
                onSubmit={publishProject}
                className="mb-6 space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-5"
              >
                <h4 className="text-lg font-semibold">
                  Publish to ENGRAPH
                </h4>

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
                    required
                    value={newAuthor}
                    onChange={(event) =>
                      setNewAuthor(event.target.value)
                    }
                    placeholder="Individual or company name"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan-400"
                  />

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Use the exact profile name to include this project's
                    value in that profile's portfolio total.
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

                    <option value="Estimated">
                      Estimated
                    </option>
                  </select>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Verified statuses are reserved for values reviewed
                    against supporting evidence. This prototype does
                    not yet perform verification.
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

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search projects, people, or sectors..."
              className="mb-5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
            />

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

      <footer className="border-t border-white/10 px-6 py-6 text-center text-xs text-gray-500">
        ENGRAPH | Engineering Network & Innovation Index
      </footer>
    </main>
  );
}