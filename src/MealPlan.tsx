import "./Recipes.css";
import { useEffect, useState } from "react";
import { weekPlan, type Meal } from "./data/mealPlan";
import { isProfileComplete, type ProfileData } from "./data/profile";
import { getDayPlan, type SuggestedMeal } from "./data/recipeApi";

type PlanResult = { key: string; meals: SuggestedMeal[] | null };

function MealPlan({ profile }: { profile: ProfileData | null }) {
  const [result, setResult] = useState<PlanResult | null>(null);

  const canSuggest = profile !== null && isProfileComplete(profile);
  // Avain kuvaa, mitä haettiin: uusi haku alkaa, kun profiili muuttuu.
  const requestKey = canSuggest
    ? [profile.calories, profile.protein, profile.fat, profile.carbs, profile.diets.join(",")].join("|")
    : "";

  useEffect(() => {
    if (!profile || !canSuggest) return;
    getDayPlan(profile)
      .then((meals) => setResult({ key: requestKey, meals }))
      .catch(() => setResult({ key: requestKey, meals: null }));
  }, [profile, canSuggest, requestKey]);

  // Tulos kuuluu nykyiseen hakuun vain, jos avain täsmää (vanhentuneet vastaukset ohitetaan).
  const current = result?.key === requestKey ? result : null;

  return (
  <main className="recipes-page meal-plan-page">
    <header className="recipes-page-header">
      <span className="recipes-badge">✦ AI MEAL PLANNER</span>
      <p className="recipes-eyebrow">MEAL PLAN</p>
        <h1>Plan the week.<br />
          <span>Eat with ease.</span>
        </h1>
        <p className="recipes-description">See today&apos;s meals and your full weekly plan in one place.</p>
    </header>
    <section className="recipes-section">
      <div className="recipes-section-heading"><div>
      <p className="recipes-section-label">
        TODAY</p>
      <h2>Today&apos;s meals</h2>
      <p className="recipes-section-subtitle">Meals designed to support your goals today.</p>
      </div>
      </div>
      {!canSuggest && <p className="recipes-message">Complete and save your profile to see today&apos;s meals.</p>}
      {canSuggest && !current && <p className="recipes-message">Loading today&apos;s meals...</p>}
      {current && current.meals === null && <p className="recipes-message">Could not load today&apos;s meals. Is the backend running?</p>}
      {current?.meals && current.meals.length === 0 && <p className="recipes-message">No meals match your goals and diet.</p>}
      {current?.meals && current.meals.length > 0 &&
      <div className="today-recipe-grid">
      {
        current.meals.map((meal) => <MealCard key={meal.recipeId} meal={meal} />)
      }
      </div>
      }
    </section>
    <section className="recipes-section week-section">
      <div className="recipes-section-heading"><div>
        <p className="recipes-section-label">WEEK</p>
          <h2>Weekly plan</h2>
        <p className="recipes-section-subtitle">
          Keep the full picture visible and make daily life easier.
        </p>
        </div>
      </div>
      <div className="week-grid">
        {
          weekPlan.map((day) => <article className="week-day-card" key={day.day}>
            <div className="week-day-header">
              <div>
                <span>{day.day}</span>
                <small>{day.date}</small>
              </div>
              <span className="week-day-count">
                {day.meals.length} meals
              </span>
              </div>
            <div className="week-meals">
              {day.meals.map((meal) => <div className="week-meal" key={meal.name}><span className="week-meal-icon">{meal.icon}</span><div><span>{meal.type}</span><strong>{meal.name}</strong><small>{meal.calories} kcal</small></div></div>)}</div></article>)}</div></section>
  </main>
  );
}

function MealCard({ meal }: { meal: Meal }) {
  return <article className="recipe-meal-card"><div className="recipe-meal-icon">{meal.icon}</div><div className="recipe-meal-info"><span className="recipe-meal-type">{meal.type}</span><h3>{meal.name}</h3><div className="recipe-meal-meta"><span>{meal.calories} kcal</span><span>{meal.protein} g protein</span><span>{meal.carbs} g carbs</span></div><p className="recipe-time">⏱ {meal.time} min</p></div></article>;
}

export default MealPlan;
