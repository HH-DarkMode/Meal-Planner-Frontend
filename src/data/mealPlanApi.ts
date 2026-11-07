import { toMeal, type BackendRecipe, type SuggestedMeal } from "./recipeApi";
import { apiFetch } from "./apiClient";

const mealPlanApi = `${import.meta.env.VITE_BACKEND_URL}/api/meal-plan`;

// Kaikki ateriat päivän kulun mukaisessa järjestyksessä.
// Sama lista kuin backendin MealSlots.ALL_MEAL_TYPES. Nimet tallennetaan tietokantaan sellaisenaan.
export const ALL_MEAL_TYPES = [
  "Breakfast", "Morning snack", "Lunch", "Snack", "Dinner", "Evening snack", "Supper", "Late snack",
] as const;
export type MealType = (typeof ALL_MEAL_TYPES)[number];

// VANHA: Recipes-sivun 4 ateriaa (ja kalenteri vaiheeseen 7 asti).
// Poistetaan vaiheessa 8, kun Recipes-sivusta tulee "coming soon".
// satisfies: TypeScript tarkistaa, että nämä ovat sallittuja ateriannimiä.
export const MEAL_TYPES = ["Breakfast", "Lunch", "Snack", "Dinner"] as const satisfies readonly MealType[];

export const mealTypeIcons: Record<MealType, string> = {
  Breakfast: "🥣",
  "Morning snack": "🍌",
  Lunch: "🥗",
  Snack: "🍎",
  Dinner: "🍝",
  "Evening snack": "🥜",
  Supper: "🥛",
  "Late snack": "🍵",
};

// Onko backendiltä tullut teksti tunnettu ateriannimi? Tuntemattomat rivit ohitetaan.
export function isMealType(value: string): value is MealType {
  return (ALL_MEAL_TYPES as readonly string[]).includes(value);
}

const SNACK_TYPES: readonly MealType[] = ["Morning snack", "Snack", "Evening snack", "Late snack"];

// Aterian näyttönimi. "Snack" näytetään nimellä "Afternoon snack", jos päivässä on useita välipaloja
// (6–8 ateriaa). Jos välipala on päivän ainoa (5 ateriaa), nimi on pelkkä "Snack", jolloin se ei
// lupaa tiettyä kellonaikaa. Tietokannassa nimi on aina "Snack".
export function mealTypeLabel(type: MealType, dayMealTypes: readonly MealType[]): string {
  if (type !== "Snack") return type;
  const snackCount = dayMealTypes.filter((t) => SNACK_TYPES.includes(t)).length;
  return snackCount > 1 ? "Afternoon snack" : "Snack";
}

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

// Rivin tila: ehdotus (ei vielä suunnitelmassa) tai hyväksytty (näkyy kalenterissa).
export type PlanStatus = "SUGGESTED" | "ACCEPTED";

// Yksi ateriasuunnitelman rivi: päivä (YYYY-MM-DD), ateriatyyppi, syöty-tila, tila ja resepti.
export type PlanEntry = {
  date: string;
  mealType: MealType;
  eaten: boolean;
  status: PlanStatus;
  meal: SuggestedMeal;
};

// Backendin palauttama rivi (MealPlanEntryDto).
type BackendPlanEntry = {
  date: string;
  mealType: string;
  eaten: boolean;
  status: PlanStatus;
  recipe: BackendRecipe;
};

// Backendin rivi -> frontendin rivi. Diet-varoitus tulee reseptin mukana (dietWarning, unmatchedIngredients).
function toPlanEntry(entry: BackendPlanEntry & { mealType: MealType }): PlanEntry {
  return {
    date: entry.date,
    mealType: entry.mealType,
    eaten: entry.eaten,
    status: entry.status,
    meal: toMeal(entry.recipe, entry.mealType, mealTypeIcons[entry.mealType]),
  };
}

// Pitää vain rivit, joiden ateriannimi on tunnettu (TypeScript tietää sen jälkeen tyypin MealType).
function knownEntries(data: BackendPlanEntry[]): PlanEntry[] {
  return data
    .filter((entry): entry is BackendPlanEntry & { mealType: MealType } => isMealType(entry.mealType))
    .map(toPlanEntry);
}

// Muuttaa päivän muotoon YYYY-MM-DD selaimen paikallisen ajan mukaan.
// toISOString() ei kelpaa, koska se käyttää UTC-aikaa ja päivä voisi vaihtua väärin.
export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Hakee valitut (hyväksytyt) ateriat aikaväliltä from-to (molemmat päivät mukana, muoto YYYY-MM-DD).
// Rivit, joiden ateriatyyppi on tuntematon, ohitetaan.
export async function getSelections(from: string, to: string): Promise<PlanEntry[]> {
  const params = new URLSearchParams({ from, to });
  const response = await apiFetch(`${mealPlanApi}/selections?${params}`, { credentials: "include" });
  if (!response.ok) {
    throw new Error("Meal plan loading failed");
  }

  const data = (await response.json()) as BackendPlanEntry[];
  return knownEntries(data);
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

// Viikkonäkymän data: viikon alkupäivä, käyttäjän ateriat järjestyksessä ja viikon rivit.
export type WeekPlan = {
  start: string;
  mealTypes: MealType[];
  entries: PlanEntry[];
};

// Lähettää JSON-pyynnön meal plan -rajapintaan (PATCH/POST). Kirjautumistunnus tulee apiFetchistä.
function sendJson(path: string, method: "PATCH" | "POST", body: unknown): Promise<Response> {
  return apiFetch(`${mealPlanApi}${path}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// Hakee viikon (start = maanantai, YYYY-MM-DD). Backend luo puuttuville aterioille ehdotukset
// tälle päivälle ja tuleville päiville. today tulee selaimesta, jotta aikavyöhyke on oikea.
export async function getWeek(start: string, today: string): Promise<WeekPlan> {
  const params = new URLSearchParams({ start, today });
  const response = await apiFetch(`${mealPlanApi}/week?${params}`, { credentials: "include" });
  if (!response.ok) {
    throw new Error("Week plan loading failed");
  }
  const data = (await response.json()) as { start: string; mealTypes: string[]; entries: BackendPlanEntry[] };
  return {
    start: data.start,
    mealTypes: data.mealTypes.filter(isMealType),
    entries: knownEntries(data.entries),
  };
}

// Hyväksy (accepted = true) tai peru hyväksyntä (accepted = false).
// Backend estää syödyn aterian perumisen (409). Käyttöliittymä estää sen jo etukäteen.
export async function setAccepted(date: string, mealType: MealType, accepted: boolean): Promise<void> {
  const response = await sendJson("/selections/status", "PATCH", { date, mealType, accepted });
  if (!response.ok) {
    throw new Error("Could not save the change");
  }
}

// Vaihda: uusi ehdotus yhteen ateriaan. Palauttaa päivitetyn rivin.
// 404 = sopivaa uutta reseptiä ei löytynyt (vanha ehdotus säilyy).
export async function rerollMeal(date: string, mealType: MealType, today: string): Promise<PlanEntry> {
  const response = await sendJson("/selections/reroll", "POST", { date, mealType, today });
  if (!response.ok) {
    throw new Error(response.status === 404 ? "No other suitable recipe found" : "Could not get a new suggestion");
  }
  const [entry] = knownEntries([(await response.json()) as BackendPlanEntry]);
  return entry;
}

// Accept all: päivän kaikki ehdotukset hyväksytyiksi.
export async function acceptDay(date: string): Promise<void> {
  const response = await sendJson("/day/accept", "POST", { date });
  if (!response.ok) {
    throw new Error("Could not accept the day");
  }
}

// Käyttäjän päivän ateriat järjestyksessä (kalenteri, vaihe 7).
export async function getMealTypes(): Promise<MealType[]> {
  const response = await apiFetch(`${mealPlanApi}/meal-types`, { credentials: "include" });
  if (!response.ok) {
    throw new Error("Meal types loading failed");
  }
  return ((await response.json()) as string[]).filter(isMealType);
}
