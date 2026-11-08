import "./Recipes.css";
import { useEffect, useState } from "react";
import RecipeDetails from "./RecipeDetails";
import { isProfileComplete, type ProfileData } from "./data/profile";
import type { SuggestedMeal } from "./data/recipeApi";
import {
  acceptDay, getWeek, mealTypeIcons, mealTypeLabel, rerollMeal, setAccepted, setEaten, toDateString,
  type PlanEntry, type WeekPlan,
} from "./data/mealPlanApi";
import { addDays, dayMealTypes, dayTitle, dietWarningText, entryKey, mondayOf } from "./data/weekLogic";
import { MealActions, WeekView, type PlanActions } from "./WeekPlan";

function MealPlan({ profile }: { profile: ProfileData | null }) {
  const today = toDateString(new Date());
  const thisMonday = mondayOf(new Date());
  // Näytettävä viikko. Nuolilla voi siirtyä edelliseen ja seuraavaan viikkoon.
  const [shownStart, setShownStart] = useState(thisMonday);
  // Ladatut viikot alkupäivän mukaan. Tämä viikko ladataan aina, koska Today's meals käyttää sitä.
  // "error" = lataus epäonnistui.
  const [weeks, setWeeks] = useState<Record<string, WeekPlan | "error">>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<SuggestedMeal | null>(null);

  const canShow = profile !== null && isProfileComplete(profile);

  // Hakee tämän viikon ja näytettävän viikon. Backend luo puuttuvat ehdotukset hakiessaan.
  useEffect(() => {
    if (!canShow) return;
    for (const start of new Set([thisMonday, shownStart])) {
      getWeek(start, today)
        .then((plan) => setWeeks((current) => ({ ...current, [start]: plan })))
        .catch(() => setWeeks((current) => ({ ...current, [start]: "error" })));
    }
  }, [canShow, thisMonday, shownStart, today]);

  // Muuttaa rivejä kaikissa ladatuissa viikoissa. Sama rivi voi olla kahdessa, jos näytetään tätä viikkoa.
  function updateEntries(change: (entry: PlanEntry) => PlanEntry) {
    setWeeks((current) => Object.fromEntries(Object.entries(current).map(([start, plan]) =>
      [start, plan === "error" ? plan : { ...plan, entries: plan.entries.map(change) }])));
  }

  function updateOne(target: PlanEntry, change: Partial<PlanEntry>) {
    updateEntries((entry) =>
      entry.date === target.date && entry.mealType === target.mealType ? { ...entry, ...change } : entry);
  }

  // Näkymä päivittyy heti, ja jos tallennus epäonnistuu, muutos perutaan (sama malli kuin ennen syöty-täpässä).
  function saveOptimistically(entry: PlanEntry, change: Partial<PlanEntry>, save: () => Promise<void>) {
    setActionError(null);
    updateOne(entry, change);
    save().catch(() => {
      updateOne(entry, { status: entry.status, eaten: entry.eaten });
      setActionError("Could not save the change. Try again.");
    });
  }

  const actions: PlanActions = {
    onToggleAccepted: (entry) => {
      const accepted = entry.status !== "ACCEPTED";
      saveOptimistically(entry, { status: accepted ? "ACCEPTED" : "SUGGESTED" },
        () => setAccepted(entry.date, entry.mealType, accepted));
    },
    onToggleEaten: (entry) =>
      saveOptimistically(entry, { eaten: !entry.eaten }, () => setEaten(entry.date, entry.mealType, !entry.eaten)),
    // Vaihda odottaa backendin vastausta, koska uusi resepti tulee sieltä.
    onReroll: (entry) => {
      setActionError(null);
      setBusyKey(entryKey(entry.date, entry.mealType));
      rerollMeal(entry.date, entry.mealType, today)
        .then((updated) => updateOne(entry, { meal: updated.meal }))
        .catch((error: Error) => setActionError(error.message))
        .finally(() => setBusyKey(null));
    },
    onAcceptDay: (date) => {
      setActionError(null);
      const isDaySuggestion = (entry: PlanEntry) => entry.date === date && entry.status === "SUGGESTED";
      // Muistetaan, mitkä olivat ehdotuksia, jotta ne voidaan palauttaa virheen sattuessa.
      const keys = new Set(Object.values(weeks).flatMap((plan) => plan === "error" ? [] : plan.entries)
        .filter(isDaySuggestion).map((entry) => entryKey(entry.date, entry.mealType)));
      updateEntries((entry) => isDaySuggestion(entry) ? { ...entry, status: "ACCEPTED" } : entry);
      acceptDay(date).catch(() => {
        updateEntries((entry) => keys.has(entryKey(entry.date, entry.mealType)) ? { ...entry, status: "SUGGESTED" } : entry);
        setActionError("Could not accept the day. Try again.");
      });
    },
    onOpen: setSelectedMeal,
    busyKey,
  };

  const currentWeek = weeks[thisMonday];
  const shownWeek = weeks[shownStart];
  const todayEntries = currentWeek && currentWeek !== "error" ? currentWeek.entries.filter((e) => e.date === today) : [];

  return (
  <main className="recipes-page meal-plan-page">
    <header className="recipes-page-header">
      <span className="recipes-badge">✦ AI MEAL PLANNER</span>
      <p className="recipes-eyebrow">MEAL PLAN</p>
      <h1>Plan the week.<br /><span>Eat with ease.</span></h1>
      <p className="recipes-description">See today&apos;s meals and your full weekly plan in one place.</p>
    </header>

    <section className="recipes-section">
      <div className="recipes-section-heading"><div>
        <p className="recipes-section-label">TODAY</p>
        <h2>Today&apos;s meals</h2>
        <p className="recipes-section-subtitle">Add suggestions to your plan and mark meals as eaten.</p>
      </div></div>
      {!canShow && <p className="recipes-message">Complete and save your profile to see your meal plan.</p>}
      {canShow && currentWeek === "error" && <p className="recipes-message">Could not load today&apos;s meals. Is the backend running?</p>}
      {canShow && !currentWeek && <p className="recipes-message">Loading today&apos;s meals...</p>}
      {canShow && actionError && <p className="recipes-message">{actionError}</p>}
      {canShow && currentWeek && currentWeek !== "error" &&
        <div className="today-recipe-grid">
          {dayMealTypes(currentWeek.mealTypes, todayEntries).map((type) => {
            const entry = todayEntries.find((e) => e.mealType === type);
            const label = mealTypeLabel(type, currentWeek.mealTypes);
            return entry
              ? <TodayMealCard key={type} entry={entry} label={label} today={today} actions={actions} />
              : <article className="recipe-meal-card is-empty" key={type}>
                  <div className="recipe-meal-icon">{mealTypeIcons[type]}</div>
                  <div className="recipe-meal-info">
                    <span className="recipe-meal-type">{label}</span>
                    <p className="recipe-empty-text">No suitable recipe found. Try changing your goals or diets on the Profile page.</p>
                  </div>
                </article>;
          })}
        </div>}
    </section>

    {selectedMeal && <RecipeDetails key={selectedMeal.recipeId} meal={selectedMeal} backLabel="Back to meal plan" onClose={() => setSelectedMeal(null)} />}

    <section className="recipes-section week-section">
      <div className="recipes-section-heading">
        <div>
          <p className="recipes-section-label">WEEK</p>
          <h2>Weekly plan</h2>
          <p className="recipes-section-subtitle">
            {dayTitle(shownStart).short} – {dayTitle(addDays(shownStart, 6)).short}. Add meals one by one, a day at a time or plan ahead.
          </p>
        </div>
        {canShow && <div className="week-nav">
          <button className="secondary-button" onClick={() => setShownStart(addDays(shownStart, -7))}>‹ Previous</button>
          {shownStart !== thisMonday && <button className="secondary-button" onClick={() => setShownStart(thisMonday)}>This week</button>}
          <button className="secondary-button" onClick={() => setShownStart(addDays(shownStart, 7))}>Next ›</button>
        </div>}
      </div>
      {canShow && shownWeek === "error" && <p className="recipes-message">Could not load the week. Is the backend running?</p>}
      {canShow && !shownWeek && <p className="recipes-message">Loading the week...</p>}
      {canShow && actionError && <p className="recipes-message">{actionError}</p>}
      {canShow && shownWeek && shownWeek !== "error" &&
        <WeekView start={shownStart} today={today} mealTypes={shownWeek.mealTypes} entries={shownWeek.entries} actions={actions} />}
    </section>
  </main>
  );
}

// Tämän päivän ateria isona korttina: makrot, valmistusaika, koko diet-varoitus ja napit.
// Ehdotus näkyy katkoviivareunuksella, syöty vihreällä reunuksella.
function TodayMealCard({ entry, label, today, actions }: {
  entry: PlanEntry;
  label: string;
  today: string;
  actions: PlanActions;
}) {
  const { meal } = entry;
  const suggested = entry.status === "SUGGESTED";
  return <article className={`recipe-meal-card${entry.eaten ? " is-eaten" : ""}${suggested ? " is-suggested" : ""}`}>
    <div className="recipe-meal-icon">{meal.icon}</div>
    <div className="recipe-meal-info">
      <span className="recipe-meal-type">{label}{suggested && " · suggestion"}</span>
      <h3>{meal.name}</h3>
      <div className="recipe-meal-meta"><span>{meal.calories} kcal</span><span>{meal.protein} g protein</span><span>{meal.carbs} g carbs</span></div>
      {meal.time > 0 && <p className="recipe-time">⏱ {meal.time} min</p>}
      {meal.dietWarning && <p className="recipe-warning">{dietWarningText(meal)}</p>}
      <MealActions entry={entry} today={today} actions={actions} />
    </div>
  </article>;
}

export default MealPlan;
