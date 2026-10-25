import type { Meal, RecipeDetails } from "./mealPlan";
import type { ProfileData } from "./profile";

const recipeApi = `${import.meta.env.VITE_BACKEND_URL}/api/recipes`;

// Ateria, jonka reseptin tiedot tulevat backendiltä. Meal-tyyppiin lisätään tunniste ja
// varoitustiedot ruokavaliosopivuudesta.
export type SuggestedMeal = Meal & {
  recipeId: number;
  url: string;
  dietWarning: boolean;
  unmatchedIngredients: string[];
};

export type BackendRecipe = {
  recipeId: number;
  name: string;
  url: string;
  prepTimeMin: number | null;
  cookTimeMin: number | null;
  caloriesPerServing: number;
  proteinPerServing: number;
  fatPerServing: number;
  carbsPerServing: number;
  unmatchedIngredients: string[];
  dietWarning: boolean;
};

type BackendDayPlan = {
  breakfast: BackendRecipe[];
  lunch: BackendRecipe[];
  snack: BackendRecipe[];
  dinner: BackendRecipe[];
};

const mealSlots = [
  { key: "breakfast", type: "Breakfast", icon: "🥣" },
  { key: "lunch", type: "Lunch", icon: "🥗" },
  { key: "snack", type: "Snack", icon: "🍎" },
  { key: "dinner", type: "Dinner", icon: "🍝" },
] as const;

export function toMeal(recipe: BackendRecipe, type: string, icon: string): SuggestedMeal {
  return {
    icon,
    type,
    name: recipe.name,
    calories: Math.round(recipe.caloriesPerServing),
    protein: Math.round(recipe.proteinPerServing),
    carbs: Math.round(recipe.carbsPerServing),
    fat: Math.round(recipe.fatPerServing),
    // Valmistusaika = esivalmistelu + kypsennys. 0 tarkoittaa, ettei aikaa tiedetä.
    time: (recipe.prepTimeMin ?? 0) + (recipe.cookTimeMin ?? 0),
    recipeId: recipe.recipeId,
    url: recipe.url,
    dietWarning: recipe.dietWarning,
    unmatchedIngredients: recipe.unmatchedIngredients,
  };
}

// Hakee päivän ateriaehdotukset profiilin tavoitteiden ja ruokavalioiden perusteella
// (yksi resepti aamiaiselle, lounaalle ja päivälliselle).
export async function getDayPlan(profile: ProfileData): Promise<SuggestedMeal[]> {
  const params = new URLSearchParams({ optionsPerMeal: "1" });
  if (profile.calories !== null) params.set("calories", String(profile.calories));
  if (profile.protein !== null) params.set("protein", String(profile.protein));
  if (profile.fat !== null) params.set("fat", String(profile.fat));
  if (profile.carbs !== null) params.set("carbs", String(profile.carbs));
  if (profile.diets.length > 0) params.set("diets", profile.diets.join(","));

  const response = await fetch(`${recipeApi}/plan?${params}`);
  if (!response.ok) {
    throw new Error("Recipe loading failed");
  }

  const plan = (await response.json()) as BackendDayPlan;
  return mealSlots.flatMap((slot) => plan[slot.key].map((recipe) => toMeal(recipe, slot.type, slot.icon)));
}

// Hakee yhden reseptin ainekset ja valmistusohjeet.
export async function getRecipeDetails(recipeId: number): Promise<RecipeDetails> {
  const response = await fetch(`${recipeApi}/${recipeId}`);
  if (!response.ok) {
    throw new Error("Recipe details loading failed");
  }

  const data = (await response.json()) as RecipeDetails;
  return { ingredients: data.ingredients, instructions: data.instructions };
}
