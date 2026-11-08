import type { Meal, RecipeDetails } from "./mealPlan";
import { apiFetch } from "./apiClient";

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

// Hakee yhden reseptin ainekset ja valmistusohjeet.
export async function getRecipeDetails(recipeId: number): Promise<RecipeDetails> {
  const response = await apiFetch(`${recipeApi}/${recipeId}`, { credentials: "include" });
  if (!response.ok) {
    throw new Error("Recipe details loading failed");
  }

  const data = (await response.json()) as RecipeDetails;
  return { ingredients: data.ingredients, instructions: data.instructions };
}
