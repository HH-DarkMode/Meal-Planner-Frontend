import "./Recipes.css";
import { useEffect, useState } from "react";
import RecipeDetails from "./RecipeDetails";
import { weekPlan } from "./data/mealPlan";
import { isProfileComplete, type ProfileData } from "./data/profile";
import type { SuggestedMeal } from "./data/recipeApi";
import { getTodaysSelections, MEAL_TYPES, type MealType } from "./data/mealPlanApi";

function MealPlan({ profile }: { profile: ProfileData | null }) {
  const [selections, setSelections] = useState<Partial<Record<MealType, SuggestedMeal>> | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<SuggestedMeal | null>(null);

  const canShow = profile !== null && isProfileComplete(profile);

  useEffect(() => {
    if (!canShow) return;
    getTodaysSelections()
      .then(setSelections)
      .catch(() => setLoadFailed(true));
  }, [canShow]);

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
      {!canShow && <p className="recipes-message">Complete and save your profile to see today&apos;s meals.</p>}
      {canShow && loadFailed && <p className="recipes-message">Could not load today&apos;s meals. Is the backend running?</p>}
      {canShow && !loadFailed && !selections && <p className="recipes-message">Loading today&apos;s meals...</p>}
      {canShow && selections &&
      <div className="today-recipe-grid">
      {
        MEAL_TYPES.map((type) => {
          const meal = selections[type];
          return meal
            ? <MealCard key={type} meal={meal} onOpen={() => setSelectedMeal(meal)} />
            : <article className="recipe-meal-card" key={type}>
                <div className="recipe-meal-info">
                  <span className="recipe-meal-type">{type}</span>
                  <p className="recipes-message">No {type.toLowerCase()} chosen yet. Pick one on the Recipes page.</p>
                </div>
              </article>;
        })
      }
      </div>
      }
    </section>
    {selectedMeal && <RecipeDetails key={selectedMeal.recipeId} meal={selectedMeal} backLabel="Back to meal plan" onClose={() => setSelectedMeal(null)} />}
    <section className="recipes-section week-section">
      <div className="recipes-section-heading"><div>
        <p className="recipes-section-label">WEEK</p>
          <h2>Weekly plan <span className="not-implemented-badge">Not yet implemented</span></h2>
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

function MealCard({ meal, onOpen }: { meal: SuggestedMeal; onOpen: () => void }) {
  return <article className="recipe-meal-card">
    <div className="recipe-meal-icon">{meal.icon}</div>
    <div className="recipe-meal-info">
      <span className="recipe-meal-type">{meal.type}</span>
      <h3>{meal.name}</h3>
      <div className="recipe-meal-meta"><span>{meal.calories} kcal</span><span>{meal.protein} g protein</span><span>{meal.carbs} g carbs</span></div>
      {meal.time > 0 && <p className="recipe-time">⏱ {meal.time} min</p>}
    </div>
    <button className="recipe-arrow" aria-label={`Open recipe: ${meal.name}`} onClick={onOpen}>→</button>
  </article>;
}

export default MealPlan;
