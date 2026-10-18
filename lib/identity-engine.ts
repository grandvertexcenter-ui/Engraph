// ENGRAPH Identity Engine (EIE)
// Version 1.0

export type ProfileType = "individual" | "company";

export type IndividualCategory =
  | "engineering"
  | "executive"
  | "researcher"
  | "designer"
  | "technology";

export type CompanyCategory =
  | "industrial_company"
  | "technology_company"
  | "energy_company"
  | "research_institution"
  | "architecture_company";

export type AvatarCategory = IndividualCategory | CompanyCategory;

export interface EngraphIdentity {
  format: "ENGRAPH-IDENTITY";
  version: 1;
  profileId: string;
  profileType: ProfileType;
  displayName: string;
  username: string;
  bio: string;
  country: string;
  avatarCategory: AvatarCategory;
  avatarVariant: number;
  createdAt: string;
}

const INDIVIDUAL_CATEGORIES: IndividualCategory[] = [
  "engineering",
  "executive",
  "researcher",
  "designer",
  "technology",
];

const COMPANY_CATEGORIES: CompanyCategory[] = [
  "industrial_company",
  "technology_company",
  "energy_company",
  "research_institution",
  "architecture_company",
];

function randomCharacters(length: number): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const random = new Uint8Array(length);

  crypto.getRandomValues(random);

  return Array.from(
    random,
    (value) => alphabet[value % alphabet.length],
  ).join("");
}

export function generateProfileId(): string {
  return "ENG-" + randomCharacters(4) + "-" + randomCharacters(4);
}

export function generateRecoveryCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));

  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function getAvatarCategories(
  profileType: ProfileType,
): AvatarCategory[] {
  if (profileType === "individual") {
    return [...INDIVIDUAL_CATEGORIES];
  }

  return [...COMPANY_CATEGORIES];
}

export function createIdentity(input: {
  profileType: ProfileType;
  displayName: string;
  username: string;
  bio?: string;
  country?: string;
  avatarCategory: AvatarCategory;
  avatarVariant: number;
}): EngraphIdentity {
  if (!input.displayName.trim()) {
    throw new Error("Display name cannot be empty.");
  }

  if (!input.username.trim()) {
    throw new Error("Username cannot be empty.");
  }

  if (
    !Number.isInteger(input.avatarVariant) ||
    input.avatarVariant < 1 ||
    input.avatarVariant > 5
  ) {
    throw new Error("Avatar variant must be between 1 and 5.");
  }

  const allowedCategories = getAvatarCategories(input.profileType);

  if (!allowedCategories.includes(input.avatarCategory)) {
    throw new Error("Avatar category does not match profile type.");
  }

  return {
    format: "ENGRAPH-IDENTITY",
    version: 1,
    profileId: generateProfileId(),
    profileType: input.profileType,
    displayName: input.displayName.trim(),
    username: input.username.trim().toLowerCase(),
    bio: input.bio?.trim() ?? "",
    country: input.country?.trim() || "Indonesia",
    avatarCategory: input.avatarCategory,
    avatarVariant: input.avatarVariant,
    createdAt: new Date().toISOString(),
  };
}

export function exportIdentity(
  identity: EngraphIdentity,
): string {
  return JSON.stringify(identity, null, 2);
}

export function downloadIdentity(
  identity: EngraphIdentity,
): void {
  const content = exportIdentity(identity);

  const blob = new Blob([content], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = identity.profileId + ".json";

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

export function saveLocalIdentity(
  identity: EngraphIdentity,
): void {
  localStorage.setItem(
    "engraph:identity:" + identity.profileId,
    exportIdentity(identity),
  );

  localStorage.setItem(
    "engraph:active-profile",
    identity.profileId,
  );
}

export function loadLocalIdentity(): EngraphIdentity | null {
  const profileId = localStorage.getItem("engraph:active-profile");

  if (!profileId) {
    return null;
  }

  const stored = localStorage.getItem(
    "engraph:identity:" + profileId,
  );

  if (!stored) {
    return null;
  }

  try {
    const identity: unknown = JSON.parse(stored);

    if (
      typeof identity === "object" &&
      identity !== null &&
      "format" in identity &&
      identity.format === "ENGRAPH-IDENTITY" &&
      "profileId" in identity &&
      identity.profileId === profileId
    ) {
      return identity as EngraphIdentity;
    }

    return null;
  } catch {
    return null;
  }
}