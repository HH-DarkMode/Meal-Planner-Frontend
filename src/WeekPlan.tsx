import type { SuggestedMeal } from "./data/recipeApi";
import { mealTypeIcons, mealTypeLabel, type MealType, type PlanEntry } from "./data/mealPlanApi";
import {
  canMarkEaten, canReroll, canToggleAccepted, dayMealTypes, dayTitle, dietWarningText, entryKey, weekDays,
} from "./data/weekLogic";

// Toiminnot, jotka Meal plan -sivu antaa viikkonäkymälle ja Today's meals -korteille.
export type PlanActions = {
  onToggleAccepted: (entry: PlanEntry) => void;
  onToggleEaten: (entry: PlanEntry) => void;
  onReroll: (entry: PlanEntry) => void;
  onAcceptDay: (date: string) => void;
  onOpen: (meal: SuggestedMeal) => void;
  busyKey: string | null; // käynnissä oleva Vaihda ("päivä|ateria"), sen nappi on pois käytöstä
};

// Koko viikko: 7 päiväkorttia maanantaista sunnuntaihin.
export function WeekView({ start, today, mealTypes, entries, actions }: {
  start: string;
  today: string;
  mealTypes: MealType[];
  entries: PlanEntry[];
  actions: PlanActions;
}) {
  return <div className="week-grid">
    {weekDays(start).map((date) => (
      <DayCard key={date} date={date} today={today} mealTypes={mealTypes}
        entries={entries.filter((entry) => entry.date === date)} actions={actions} />
    ))}
  </div>;
}

// Yksi päivä: otsikko, montako ateriaa on hyväksytty, ateriarivit ja Accept all.
function DayCard({ date, today, mealTypes, entries, actions }: {
  date: string;
  today: string;
  mealTypes: MealType[];
  entries: PlanEntry[];
  actions: PlanActions;
}) {
  const { weekday, short } = dayTitle(date);
  const acceptedCount = entries.filter((entry) => entry.status === "ACCEPTED").length;
  const hasSuggestions = entries.some((entry) => entry.status === "SUGGESTED");
  // Tämä päivä korostetaan, menneet päivät himmennetään.
  const className = ["week-day-card", date === today && "is-today", date < today && "is-past"]
    .filter(Boolean).join(" ");

  return <article className={className}>
    <div className="week-day-header">
      <div>
        <span>{weekday}</span>
        <small>{short}</small>
        {date === today && <em className="today-badge">Today</em>}
      </div>
      <span className="week-day-count">{acceptedCount}/{mealTypes.length} planned</span>
    </div>
    <div className="week-meals">
      {dayMealTypes(mealTypes, entries).map((type) => {
        const entry = entries.find((e) => e.mealType === type);
        const label = mealTypeLabel(type, mealTypes);
        return entry
          ? <PlanMealRow key={type} entry={entry} label={label} today={today} actions={actions} />
          // Tyhjä paikka: menneelle päivälle ei luoda ehdotuksia, tulevalle ei löytynyt sopivaa reseptiä.
          : <div className="week-meal is-empty" key={type}>
              <span className="week-meal-icon">{mealTypeIcons[type]}</span>
              <div><span>{label}</span><small>{date < today ? "Not planned" : "No suitable recipe found"}</small></div>
            </div>;
      })}
    </div>
    {hasSuggestions &&
      <button className="recipe-approve-button week-accept-all" onClick={() => actions.onAcceptDay(date)}>Accept all</button>}
  </article>;
}

// Yksi ateria päiväkortissa (tiivis rivi). Diet-varoitus on pieni ⚠-merkki, ja koko teksti näkyy,
// kun hiiri viedään merkin päälle.
function PlanMealRow({ entry, label, today, actions }: {
  entry: PlanEntry;
  label: string;
  today: string;
  actions: PlanActions;
}) {
  const { meal } = entry;
  return <div className={`week-meal ${entry.status === "ACCEPTED" ? "is-accepted" : "is-suggested"}`}>
    <span className="week-meal-icon">{meal.icon}</span>
    <div className="week-meal-info">
      <span>{label}{meal.dietWarning && <abbr className="diet-warning-badge" title={dietWarningText(meal)}> ⚠</abbr>}</span>
      <strong title={meal.name}>{meal.name}</strong>
      <small>{meal.calories} kcal</small>
    </div>
    <MealActions entry={entry} today={today} actions={actions} />
  </div>;
}

// Aterian napit (sama sekä viikkonäkymässä että Today's meals -korteissa). Säännöt: weekLogic.ts.
export function MealActions({ entry, today, actions }: { entry: PlanEntry; today: string; actions: PlanActions }) {
  const accepted = entry.status === "ACCEPTED";
  const toggleAllowed = canToggleAccepted(entry);
  return <div className="week-meal-actions">
    <button
      className={`recipe-approve-button${accepted ? " is-added" : ""}`}
      onClick={() => actions.onToggleAccepted(entry)}
      disabled={!toggleAllowed}
      title={toggleAllowed ? undefined : "Uncheck Eaten first"}
      aria-pressed={accepted}
    >
      {accepted ? "Added ✓" : "Add"}
    </button>
    {canReroll(entry, today) &&
      <button className="icon-button" onClick={() => actions.onReroll(entry)}
        disabled={actions.busyKey === entryKey(entry.date, entry.mealType)}
        title="New suggestion" aria-label={`New suggestion for ${entry.mealType}`}>↻</button>}
    {canMarkEaten(entry, today) &&
      <label className="eaten-check">
        <input type="checkbox" checked={entry.eaten} onChange={() => actions.onToggleEaten(entry)}
          aria-label={`Mark ${entry.meal.name} as eaten`} />
        <span>Eaten</span>
      </label>}
    <button className="icon-button" onClick={() => actions.onOpen(entry.meal)}
      aria-label={`Open recipe: ${entry.meal.name}`}>→</button>
  </div>;
}
