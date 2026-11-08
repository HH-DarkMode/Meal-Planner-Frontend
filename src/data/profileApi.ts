import axios from "axios";
import { emptyProfile, type ProfileData } from "./profile";
import { authorizationHeaders, notifyAuthSessionExpired } from "./apiClient";
import { toDateString } from "./mealPlanApi";

const profileApi = `${import.meta.env.VITE_BACKEND_URL}/api/profile`;

export class ProfileApiError extends Error {
  readonly status: number | undefined;
  readonly isNetworkError: boolean;

  constructor(message: string, cause: unknown) {
    super(message, { cause });
    this.name = "ProfileApiError";
    this.status = axios.isAxiosError(cause) ? cause.response?.status : undefined;
    this.isNetworkError = axios.isAxiosError(cause) && cause.response === undefined;
  }
}

export function normalizeProfile(data: Partial<ProfileData>): ProfileData {
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
    const response = await axios.get(profileApi, {
      withCredentials: true,
      headers: authorizationHeaders(),
    });
    return normalizeProfile(response.data as Partial<ProfileData>);
  } catch (error) {
    handleUnauthorized(error);
    throw new ProfileApiError("Profile loading failed", error);
  }
}

export async function saveProfile(profile: ProfileData): Promise<ProfileData> {
  try {
    const response = await axios.put(profileApi, profile, {
      withCredentials: true,
      headers: authorizationHeaders(),
      // Tämä päivä selaimen aikavyöhykkeellä. Jos kalorit, makrot, ateriamäärä tai ruokavaliot
      // muuttuvat, backend poistaa ehdotukset tästä päivästä alkaen ja viikkonäkymä luo uudet.
      params: { today: toDateString(new Date()) },
    });
    return normalizeProfile(response.data as Partial<ProfileData>);
  } catch (error) {
    handleUnauthorized(error);
    throw new ProfileApiError("Profile saving failed", error);
  }
}

function handleUnauthorized(error: unknown): void {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    notifyAuthSessionExpired();
  }
}
