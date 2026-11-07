import { toMeal, type BackendRecipe, type SuggestedMeal } from "./recipeApi";
import { apiFetch } from "./apiClient";

const mealPlanApi = `${import.meta.env.VITE_BACKEND_URL}/api/meal-plan`;

export const MEAL_TYPES = ["Breakfast", "Lunch", "Snack", "Dinner"] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export const mealTypeIcons: Record<MealType, string> = {
  Breakfast: "🥣",
  Lunch: "🥗",
  Snack: "🍎",
  Dinner: "🍝",
};

// Hakee tämän päivän reseptisivulla hyväksytyt ateriavalinnat. Puuttuva avain
// tarkoittaa, ettei kyseiselle ateriatyypille ole vielä hyväksytty reseptiä.
export async function getTodaysSelections(): Promise<Partial<Record<MealType, SuggestedMeal>>> {
  const response = await apiFetch(`${mealPlanApi}/selections`, { credentials: "include" });
  if (!response.ok) {
    throw new Error("Meal plan loading failed");
  }

  const data = (await response.json()) as Partial<Record<MealType, BackendRecipe>>;
  const result: Partial<Record<MealType, SuggestedMeal>> = {};
  for (const type of MEAL_TYPES) {
    const recipe = data[type];
    if (recipe) result[type] = toMeal(recipe, type, mealTypeIcons[type]);
  }
  return result;
}

// Hyväksyy reseptin tietylle ateriatyypille tämän päivän ateriasuunnitelmaan.
// Korvaa mahdollisen aiemman hyväksynnän samalle ateriatyypille.
export async function approveMeal(mealType: string, recipeId: number): Promise<void> {
  const response = await apiFetch(`${mealPlanApi}/selections`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mealType, recipeId }),
  });
  if (!response.ok) {
    throw new Error("Could not add recipe to meal plan");
  }
}

// Yksi ateriasuunnitelman rivi: päivä (YYYY-MM-DD), ateriatyyppi, syöty-tila ja resepti.
export type PlanEntry = {
  date: string;
  mealType: MealType;
  eaten: boolean;
  meal: SuggestedMeal;
};

// Backendin palauttama rivi (MealPlanEntryDto).
type BackendPlanEntry = {
  date: string;
  mealType: string;
  eaten: boolean;
  recipe: BackendRecipe;
};

// Muuttaa päivän muotoon YYYY-MM-DD selaimen paikallisen ajan mukaan.
// toISOString() ei kelpaa, koska se käyttää UTC-aikaa ja päivä voisi vaihtua väärin.
export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Hakee valitut ateriat aikaväliltä from-to (molemmat päivät mukana, muoto YYYY-MM-DD).
// Rivit, joiden ateriatyyppi on tuntematon, ohitetaan.
export async function getSelections(from: string, to: string): Promise<PlanEntry[]> {
  const params = new URLSearchParams({ from, to });
  const response = await apiFetch(`${mealPlanApi}/selections?${params}`, { credentials: "include" });
  if (!response.ok) {
    throw new Error("Meal plan loading failed");
  }

  const data = (await response.json()) as BackendPlanEntry[];
  return data
    .filter((entry) => (MEAL_TYPES as readonly string[]).includes(entry.mealType))
    .map((entry) => {
      const mealType = entry.mealType as MealType;
      return {
        date: entry.date,
        mealType,
        eaten: entry.eaten,
        meal: toMeal(entry.recipe, mealType, mealTypeIcons[mealType]),
      };
    });
}

// Merkitsee tietyn päivän aterian syödyksi tai syömättömäksi.
export async function setEaten(date: string, mealType: MealType, eaten: boolean): Promise<void> {
  const response = await apiFetch(`${mealPlanApi}/selections/eaten`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, mealType, eaten }),
  });
  if (!response.ok) {
    throw new Error("Could not save eaten state");
  }
}
