import { ALL_MEAL_TYPES, toDateString, type MealType, type PlanEntry } from "./mealPlanApi";
import { weekRange } from "./calendarLogic";
import type { SuggestedMeal } from "./recipeApi";

// Rivin tunniste "päivä|ateria" (esim. "2026-11-09|Lunch"). Käytetään mm. Vaihda-napin odotustilassa.
export function entryKey(date: string, mealType: MealType): string {
  return `${date}|${mealType}`;
}

// Diet-varoituksen teksti (sama kuin aiemmin Recipes-sivulla).
export function dietWarningText(meal: SuggestedMeal): string {
  return `Diet suitability cannot be guaranteed. Unknown ingredients: ${meal.unmatchedIngredients.join(", ")}`;
}

// Päivämäärät ovat muodossa YYYY-MM-DD, joten niitä voi vertailla suoraan merkkijonoina.

// Viikon maanantai annetun päivän ympäriltä (käyttää kalenterin valmista weekRange-funktiota).
export function mondayOf(date: Date): string {
  return weekRange(date).from;
}

// Lisää päiviä. Lasketaan paikallisessa ajassa (ei UTC), jotta päivä ei siirry väärin.
export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  return toDateString(new Date(year, month - 1, day + days));
}

// Viikon 7 päivää maanantaista sunnuntaihin.
export function weekDays(start: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

// Päivän otsikko, esim. { weekday: "Monday", short: "9 Nov" }.
export function dayTitle(date: string): { weekday: string; short: string } {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(year, month - 1, day);
  return {
    weekday: value.toLocaleDateString("en-GB", { weekday: "long" }),
    short: value.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
  };
}

// Päivän ateriat näytettävässä järjestyksessä: käyttäjän ateriat (myös tyhjät paikat) ja lisäksi
// päivän muut rivit (esim. vanha "Snack" ajalta ennen 4 aterian muutosta), jotta mitään ei katoa.
export function dayMealTypes(mealTypes: readonly MealType[], dayEntries: readonly PlanEntry[]): MealType[] {
  const types = new Set<MealType>([...mealTypes, ...dayEntries.map((entry) => entry.mealType)]);
  return ALL_MEAL_TYPES.filter((type) => types.has(type));
}

// Vaihda: vain ehdotukselle ja vain tänään tai tulevaisuudessa.
export function canReroll(entry: PlanEntry, today: string): boolean {
  return entry.status === "SUGGESTED" && entry.date >= today;
}

// Syöty: vain hyväksytylle ja vain tänään tai menneenä päivänä.
export function canMarkEaten(entry: PlanEntry, today: string): boolean {
  return entry.status === "ACCEPTED" && entry.date <= today;
}

// Syötyä ateriaa ei voi poistaa suunnitelmasta: ensin poistetaan syöty-merkintä.
export function canToggleAccepted(entry: PlanEntry): boolean {
  return !(entry.status === "ACCEPTED" && entry.eaten);
}
