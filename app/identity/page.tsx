"use client";

import { useState } from "react";
import {
  createIdentity,
  getAvatarCategories,
  saveLocalIdentity,
  type ProfileType,
  type AvatarCategory,
  type EngraphIdentity,
} from "@/lib/identity-engine";

export default function IdentityPage() {
  const [profileType, setProfileType] =
    useState<ProfileType>("individual");

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("Indonesia");

  const [avatarCategory, setAvatarCategory] =
    useState<AvatarCategory>("engineering");

  const [avatarVariant, setAvatarVariant] = useState(1);
  const [identity, setIdentity] =
    useState<EngraphIdentity | null>(null);

  const [error, setError] = useState("");

  const categories = getAvatarCategories(profileType);

  function changeProfileType(type: ProfileType) {
    setProfileType(type);

    setAvatarCategory(
      type === "individual" ? "engineering" : "industrial_company",
    );

    setIdentity(null);
    setError("");
  }

  function handleCreateIdentity() {
    setError("");

    try {
      const newIdentity = createIdentity({
        profileType,
        displayName,
        username,
        bio,
        country,
        avatarCategory,
        avatarVariant,
      });

      saveLocalIdentity(newIdentity);
      setIdentity(newIdentity);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Identity creation failed.",
      );
    }
  }

  async function copyIdentity() {
    if (!identity) return;

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(identity, null, 2),
      );
      alert("Identity berhasil disalin.");
    } catch {
      setError(
        "Clipboard tidak tersedia. Silakan gunakan tombol unduh.",
      );
    }
  }

  function downloadIdentityFile() {
    if (!identity) return;

    const content = JSON.stringify(identity, null, 2);
    const blob = new Blob([content], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${identity.profileId}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  const categoryLabels: Record<string, string> = {
    engineering: "Engineering",
    executive: "Executive",
    researcher: "Researcher",
    designer: "Designer / Artist",
    technology: "Technology",
    industrial_company: "Industrial Company",
    technology_company: "Technology Company",
    energy_company: "Energy Company",
    research_institution: "Research Institution",
    architecture_company: "Architecture Company",
  };

  return (
    <main className="identity-page">
      <header className="identity-header">
        <a href="/" className="brand">
          <span className="brand-mark">E</span>
          <span>
            <strong>ENGRAPH</strong>
            <small>ENGINEERING NETWORK & INNOVATION INDEX</small>
          </span>
        </a>

        <span className="header-status">
          <span className="status-dot" />
          IDENTITY SYSTEM / V1.0
        </span>
      </header>

      <section className="identity-layout">
        <div className="identity-intro">
          <div className="eyebrow">
            <span>01</span>
            DIGITAL IDENTITY PROTOCOL
          </div>

          <h1>
            Your identity.
            <br />
            Your <span>innovation.</span>
          </h1>

          <p>
            Establish your identity within an engineering network
            built for innovators, researchers, executives, and
            companies shaping the future.
          </p>

          <div className="intro-divider" />

          <div className="feature-row">
            <span className="feature-number">01</span>
            <div>
              <strong>Unique Profile ID</strong>
              <p>A generated identifier for your ENGRAPH profile.</p>
            </div>
          </div>

          <div className="feature-row">
            <span className="feature-number">02</span>
            <div>
              <strong>Engineered Identity</strong>
              <p>Choose your professional category and avatar style.</p>
            </div>
          </div>

          <div className="feature-row">
            <span className="feature-number">03</span>
            <div>
              <strong>Local Identity Storage</strong>
              <p>Save your profile identity in this browser.</p>
            </div>
          </div>
        </div>

        <div className="identity-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">IDENTITY REGISTRATION</span>
              <h2>Create your profile</h2>
            </div>

            <span className="version-tag">EIE / 01</span>
          </div>

          <div className="field-label">PROFILE TYPE</div>

          <div className="type-selector">
            <button
              type="button"
              className={
                profileType === "individual" ? "type-option active" : "type-option"
              }
              onClick={() => changeProfileType("individual")}
            >
              <span className="type-icon">◈</span>
              <span>
                <strong>Individual</strong>
                <small>Personal identity</small>
              </span>
              <span className="type-check">
                {profileType === "individual" ? "●" : "○"}
              </span>
            </button>

            <button
              type="button"
              className={
                profileType === "company" ? "type-option active" : "type-option"
              }
              onClick={() => changeProfileType("company")}
            >
              <span className="type-icon">▦</span>
              <span>
                <strong>Company</strong>
                <small>Organization identity</small>
              </span>
              <span className="type-check">
                {profileType === "company" ? "●" : "○"}
              </span>
            </button>
          </div>

          <div className="form-grid">
            <label className="form-field full-width">
              <span>DISPLAY NAME</span>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={
                  profileType === "individual"
                    ? "Your professional name"
                    : "Your company name"
                }
                maxLength={80}
              />
            </label>

            <label className="form-field full-width">
              <span>USERNAME</span>
              <div className="input-prefix">
                <span>@</span>
                <input
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9_.-]/g, ""),
                    )
                  }
                  placeholder="yourusername"
                  maxLength={30}
                />
              </div>
            </label>

            <label className="form-field full-width">
              <span>PROFESSIONAL BIO</span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your expertise, vision, or organization..."
                rows={3}
                maxLength={300}
              />
              <small className="character-count">{bio.length}/300</small>
            </label>

            <label className="form-field full-width">
              <span>COUNTRY / REGION</span>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Indonesia"
                maxLength={80}
              />
            </label>
          </div>

          <div className="form-section">
            <div className="field-label">IDENTITY CATEGORY</div>

            <div className="category-grid">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={
                    avatarCategory === category
                      ? "category-option selected"
                      : "category-option"
                  }
                  onClick={() => setAvatarCategory(category)}
                >
                  <span className="category-symbol">
                    {category === "engineering" && "⚙"}
                    {category === "executive" && "◆"}
                    {category === "researcher" && "⚛"}
                    {category === "designer" && "◇"}
                    {category === "technology" && "▦"}
                    {category === "industrial_company" && "▥"}
                    {category === "technology_company" && "▦"}
                    {category === "energy_company" && "ϟ"}
                    {category === "research_institution" && "⚛"}
                    {category === "architecture_company" && "⌂"}
                  </span>

                  <span>{categoryLabels[category]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <div className="field-label">AVATAR VARIANT</div>

            <div className="avatar-variants">
              {[1, 2, 3, 4, 5].map((variant) => (
                <button
                  key={variant}
                  type="button"
                  className={
                    avatarVariant === variant
                      ? "variant-button selected"
                      : "variant-button"
                  }
                  onClick={() => setAvatarVariant(variant)}
                  aria-label={`Avatar variant ${variant}`}
                >
                  <span>{variant}</span>
                  <small>VAR-{variant}</small>
                </button>
              ))}
            </div>

            <p className="helper-text">
              Avatar variations are currently represented by selectable
              variants. The actual generated avatar artwork will be
              implemented in the next stage.
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          {!identity ? (
            <button
              type="button"
              className="create-button"
              onClick={handleCreateIdentity}
            >
              <span>Generate ENGRAPH Identity</span>
              <span>↗</span>
            </button>
          ) : (
            <div className="identity-result">
              <div className="result-status">
                <span className="status-dot" />
                IDENTITY GENERATED SUCCESSFULLY
              </div>

              <div className="result-profile">
                <div className="result-avatar">
                  {profileType === "company" ? "▦" : "◈"}
                </div>

                <div>
                  <strong>{identity.displayName}</strong>
                  <p>@{identity.username}</p>
                </div>
              </div>

              <span className="field-label">YOUR PROFILE ID</span>

              <div className="profile-id">
                {identity.profileId}
              </div>

              <p className="helper-text">
                Your identity is saved in this browser. Download the
                identity file to keep a portable copy.
              </p>

              <button
                type="button"
                className="create-button"
                onClick={downloadIdentityFile}
              >
                Download Identity File <span>↓</span>
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={copyIdentity}
              >
                Copy Identity Data
              </button>

              <button
                type="button"
                className="text-button"
                onClick={() => setIdentity(null)}
              >
                Create another identity
              </button>
            </div>
          )}

          <div className="card-footer">
            <span>ENGRAPH EIE</span>
            <span>DESIGNED FOR ENGINEERING INNOVATION</span>
          </div>
        </div>
      </section>

      <footer className="identity-footer">
        <span>ENGRAPH © 2026</span>
        <span>CONNECTING VISION · BUILDING LEGACY</span>
        <a href="/">RETURN TO MAIN PLATFORM ↗</a>
      </footer>
    </main>
  );
}