import axios from "axios";
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
  try {
    const response = await axios.post(profileApi, {});
    return normalizeProfile(response.data as Partial<ProfileData>);
  } catch (error) {
    throw new Error("Profile loading failed");
  }
}

export async function saveProfile(profile: ProfileData): Promise<ProfileData> {
  try {
    const response = await axios.put(profileApi, profile);
    return normalizeProfile(response.data as Partial<ProfileData>);
  } catch (error) {
    throw new Error("Profile saving failed");
  }
}
