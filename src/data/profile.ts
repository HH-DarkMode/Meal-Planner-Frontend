export type ProfileData = {
  username: string;
  weight: number | null;
  height: number | null;
  mealsPerDay: number | null;
  gender: string;
  goal: string;
  diets: string[];
  calories: number | null;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
};

export const emptyProfile: ProfileData = {
  username: "",
  weight: null,
  height: null,
  mealsPerDay: null,
  gender: "",
  goal: "",
  diets: [],
  calories: null,
  protein: null,
  fat: null,
  carbs: null,
};

export function isProfileComplete(profile: ProfileData | null) {
  return Boolean(
    profile?.username.trim() &&
    profile.weight &&
    profile.height &&
    profile.gender &&
    profile.goal &&
    profile.calories !== null &&
    profile.protein !== null &&
    profile.fat !== null &&
    profile.carbs !== null,
  );
}
