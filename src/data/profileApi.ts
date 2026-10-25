import axios from "axios";
import { emptyProfile, type ProfileData } from "./profile";

const profileApi = `${import.meta.env.VITE_BACKEND_URL}/api/profile`;

function normalizeProfile(data: Partial<ProfileData>): ProfileData {
  return {
    ...emptyProfile,
    ...data,
    username: data.username ?? "",
    gender: data.gender ?? "",
    goal: data.goal ?? "",
    diets: data.diets ?? [],
  };
}

export async function getProfile(): Promise<ProfileData> {
  try {
    const response = await axios.get(profileApi, { withCredentials: true });
    return normalizeProfile(response.data as Partial<ProfileData>);
  } catch (error) {
    throw new Error("Profile loading failed", {
      cause: error,
    });
  }
}

export async function saveProfile(profile: ProfileData): Promise<ProfileData> {
  try {
    const response = await axios.put(profileApi, profile, { withCredentials: true });
    return normalizeProfile(response.data as Partial<ProfileData>);
  } catch (error) {
    throw new Error("Profile saving failed", {
      cause: error,
    });
  }
}
