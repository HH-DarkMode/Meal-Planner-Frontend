import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import type { SuggestedMeal } from "./data/recipeApi";
import { mealTypeIcons, mealTypeLabel, type MealType, type PlanEntry } from "./data/mealPlanApi";
import {
  canChooseFavourite, canMarkEaten, canReroll, canToggleAccepted, dayMealTypes, dayTitle, dietWarningText, entryKey, veganSwapText, weekDays,
} from "./data/weekLogic";

// Toiminnot, jotka Meal plan -sivu antaa viikkonäkymälle ja Today's meals -korteille.
export type PlanActions = {
  onToggleAccepted: (entry: PlanEntry) => void;
  onToggleEaten: (entry: PlanEntry) => void;
  onReroll: (entry: PlanEntry) => void;
  onAcceptDay: (date: string) => void;
  onOpen: (meal: SuggestedMeal) => void;
  onToggleFavourite: (meal: SuggestedMeal) => void;
  // Suosikkien reseptitunnukset. null = suosikkeja ei ole vielä ladattu (tai lataus epäonnistui),
  // jolloin sydäntä ei näytetä, ettei se näytä väärää tilaa.
  favouriteIds: Set<number> | null;
  // Suosikit listana (♥▾-valikko). null = ei ladattu, jolloin ♥▾-nappia ei näytetä.
  favourites: SuggestedMeal[] | null;
  // Valitsee suosikin päivän ateriaksi (hyväksytty). Odottaa backendin vastausta.
  onChooseFavourite: (date: string, mealType: MealType, meal: SuggestedMeal) => void;
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
              <div className="week-meal-info"><span>{label}</span><small>{date < today ? "Not planned" : "No suitable recipe found"}</small></div>
              {canChooseFavourite(date, today) &&
                <FavouritePicker date={date} mealType={type} actions={actions} />}
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
      <span>{label}
        {meal.dietWarning && <abbr className="diet-warning-badge" title={dietWarningText(meal)}> ⚠</abbr>}
        {veganSwapText(meal) && <abbr className="vegan-swap-badge" title={veganSwapText(meal)}> 🌱</abbr>}
      </span>
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
    {canChooseFavourite(entry.date, today, entry) &&
      <FavouritePicker date={entry.date} mealType={entry.mealType} actions={actions} />}
    {canMarkEaten(entry, today) &&
      <label className="eaten-check">
        <input type="checkbox" checked={entry.eaten} onChange={() => actions.onToggleEaten(entry)}
          aria-label={`Mark ${entry.meal.name} as eaten`} />
        <span>Eaten</span>
      </label>}
    {actions.favouriteIds &&
      <FavouriteButton meal={entry.meal} isFavourite={actions.favouriteIds.has(entry.meal.recipeId)}
        onToggle={actions.onToggleFavourite} />}
    <button className="icon-button" onClick={() => actions.onOpen(entry.meal)}
      aria-label={`Open recipe: ${entry.meal.name}`}>→</button>
  </div>;
}

// Sydännappi: ♡ = ei suosikki (painallus lisää), ♥ = suosikki (painallus poistaa).
// aria-pressed kertoo ruudunlukijalle, onko nappi "päällä", ja aria-label sanoo, mitä painallus tekee.
export function FavouriteButton({ meal, isFavourite, onToggle }: {
  meal: SuggestedMeal;
  isFavourite: boolean;
  onToggle: (meal: SuggestedMeal) => void;
}) {
  const label = isFavourite ? `Remove ${meal.name} from favourites` : `Add ${meal.name} to favourites`;
  return <button className={`icon-button favourite-button${isFavourite ? " is-favourite" : ""}`}
    onClick={() => onToggle(meal)} aria-pressed={isFavourite} aria-label={label} title={label}>
    {isFavourite ? "♥" : "♡"}
  </button>;
}

const MENU_WIDTH = 240; // sama kuin CSS:n .favourite-picker-menu width

// ♥▾: avaa listan suosikeista, ja valittu suosikki tulee aterian paikalle hyväksyttynä.
// Lista suljetaan, kun suosikki valitaan, kun nappia painetaan uudelleen, kun klikataan listan
// ulkopuolelle tai kun painetaan Esc.
export function FavouritePicker({ date, mealType, actions }: {
  date: string;
  mealType: MealType;
  actions: PlanActions;
}) {
  const [open, setOpen] = useState(false);
  // true = lista aukeaa napista vasemmalle (oikealla ei ole tilaa), false = oikealle.
  const [alignRight, setAlignRight] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Avattaessa katsotaan, mahtuuko lista napin oikealle puolelle ruudussa.
  function toggle(event: ReactMouseEvent<HTMLButtonElement>) {
    const button = event.currentTarget.getBoundingClientRect();
    setAlignRight(button.left + MENU_WIDTH > window.innerWidth - 16);
    setOpen(!open);
  }

  // Kun lista on auki, kuunnellaan klikkauksia ja Esc-näppäintä koko sivulla.
  // Kuuntelijat poistetaan, kun lista suljetaan (return-funktio).
  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  if (!actions.favourites) return null;
  const favourites = actions.favourites;

  return <div className="favourite-picker" ref={pickerRef}>
    <button className="icon-button favourite-picker-button" onClick={toggle}
      disabled={actions.busyKey === entryKey(date, mealType)}
      aria-expanded={open} aria-label={`Choose a favourite for ${mealType}`} title="Choose a favourite">♥▾</button>
    {open && <div className={`favourite-picker-menu${alignRight ? " align-right" : ""}`} role="menu">
      {favourites.length === 0
        ? <p className="favourite-picker-empty">No favourites yet – tap ♡ on a recipe to save it.</p>
        : favourites.map((meal) => (
          <button key={meal.recipeId} className="favourite-picker-item" role="menuitem"
            onClick={() => { setOpen(false); actions.onChooseFavourite(date, mealType, meal); }}>
            <span className="favourite-picker-name">{meal.name}</span>
            <span className="favourite-picker-kcal">{meal.calories} kcal</span>
          </button>
        ))}
    </div>}
  </div>;
}
