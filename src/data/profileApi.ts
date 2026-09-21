import { emptyProfile, type ProfileData } from "./profile";

const profileApi = "http://localhost:8080/api/profile";

function normalizeProfile(data: Partial<ProfileData>): ProfileData {
  return {
    ...emptyProfile,
    ...data,
    diets: data.diets ?? [],
  };
}

export async function getProfile(): Promise<ProfileData> {
  const response = await fetch(profileApi);
  if (!response.ok) {
    throw new Error("Profile loading failed");
  }

  return normalizeProfile(await response.json() as Partial<ProfileData>);
}

export async function saveProfile(profile: ProfileData): Promise<ProfileData> {
  const response = await fetch(profileApi, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    throw new Error("Profile saving failed");
  }

  return normalizeProfile(await response.json() as Partial<ProfileData>);
}
