import { toMeal, type BackendRecipe, type SuggestedMeal } from "./recipeApi";

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
  const response = await fetch(`${mealPlanApi}/selections`);
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
  const response = await fetch(`${mealPlanApi}/selections`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mealType, recipeId }),
  });
  if (!response.ok) {
    throw new Error("Could not add recipe to meal plan");
  }
}
