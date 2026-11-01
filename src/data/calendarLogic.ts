import { toDateString, type PlanEntry } from "./mealPlanApi";

// Aterian tila palloa varten:
// none = ei valittu, planned = valittu eikä päivä ole ohi, eaten = syöty, missed = päivä ohi eikä syöty.
export type MealState = "none" | "planned" | "eaten" | "missed";

// Päivän tila taustavärille: complete = kaikki syöty, partial = osa syöty, none = ei väriä.
export type DayStatus = "complete" | "partial" | "none";

export type Macros = { calories: number; protein: number; carbs: number; fat: number };

// Päivämäärät ovat muodossa YYYY-MM-DD, joten ne voi vertailla suoraan merkkijonoina.

// Aterian pallotila. entry on undefined, jos päivän ateriatyypille ei ole valittu reseptiä.
export function mealState(entry: Pick<PlanEntry, "eaten"> | undefined, date: string, today: string): MealState {
  if (!entry) return "none";
  if (entry.eaten) return "eaten";
  return date < today ? "missed" : "planned";
}

// Päivän taustaväri kuukausinäkymässä. Väri tulee vasta, kun päivä on ohi,
// koska käyttäjällä on koko päivä aikaa syödä ja merkitä ateriat.
// Jos mitään ei ole syöty, ei väriä (punainen pallo näkyy päivän listassa).
export function dayStatus(entries: Pick<PlanEntry, "eaten">[], date: string, today: string): DayStatus {
  if (date >= today) return "none";
  const eatenCount = entries.filter((entry) => entry.eaten).length;
  if (eatenCount === 0) return "none";
  return eatenCount === entries.length ? "complete" : "partial";
}

function emptyMacros(): Macros {
  return { calories: 0, protein: 0, carbs: 0, fat: 0 };
}

function addMacros(total: Macros, meal: Macros) {
  total.calories += meal.calories;
  total.protein += meal.protein;
  total.carbs += meal.carbs;
  total.fat += meal.fat;
}

// Laskee makrot päivävälille from-to (molemmat mukana).
// eaten = vain syödyt ateriat, planned = kaikki suunnitellut ateriat.
export function summarize(entries: PlanEntry[], from: string, to: string): { eaten: Macros; planned: Macros } {
  const result = { eaten: emptyMacros(), planned: emptyMacros() };
  for (const entry of entries) {
    if (entry.date < from || entry.date > to) continue;
    addMacros(result.planned, entry.meal);
    if (entry.eaten) addMacros(result.eaten, entry.meal);
  }
  return result;
}

// Kuukausinäkymän koko ruudukko: ensimmäisen päivän viikon maanantaista viimeisen päivän
// viikon sunnuntaihin. Ruudukossa näkyy myös viereisten kuukausien päiviä, joten ne haetaan mukaan.
// Viikko alkaa maanantaista (getDay: 0 = sunnuntai, siksi (päivä + 6) % 7).
export function calendarGridRange(monthStart: Date): { from: string; to: string } {
  const first = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
  const last = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
  const start = new Date(first);
  start.setDate(first.getDate() - ((first.getDay() + 6) % 7));
  const end = new Date(last);
  end.setDate(last.getDate() + (6 - ((last.getDay() + 6) % 7)));
  return { from: toDateString(start), to: toDateString(end) };
}

// Jokaisen päivän tila taustavärille. Avaimena päivä (YYYY-MM-DD).
// Päiviä, joilla ei ole yhtään valittua ateriaa, ei ole mukana.
export function dayStatuses(entries: PlanEntry[], today: string): Map<string, DayStatus> {
  const byDate = new Map<string, PlanEntry[]>();
  for (const entry of entries) {
    byDate.set(entry.date, [...(byDate.get(entry.date) ?? []), entry]);
  }
  const result = new Map<string, DayStatus>();
  for (const [date, list] of byDate) {
    result.set(date, dayStatus(list, date, today));
  }
  return result;
}

// Viikon alku ja loppu (maanantai–sunnuntai) annetun päivän ympäriltä, muodossa YYYY-MM-DD.
export function weekRange(date: Date): { from: string; to: string } {
  const daysFromMonday = (date.getDay() + 6) % 7;
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate() - daysFromMonday);
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  return { from: toDateString(start), to: toDateString(end) };
}

// Kuukauden ensimmäinen ja viimeinen päivä annetun päivän kuukaudesta, muodossa YYYY-MM-DD.
export function monthRange(date: Date): { from: string; to: string } {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { from: toDateString(first), to: toDateString(last) };
}
