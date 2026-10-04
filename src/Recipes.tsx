import { useEffect, useState } from "react";
import "./Recipes.css";
import type { RecipeDetails as RecipeData } from "./data/mealPlan";
import { isProfileComplete, type ProfileData } from "./data/profile";
import { getDayPlan, getRecipeDetails, type SuggestedMeal } from "./data/recipeApi";

type PlanResult = { key: string; meals: SuggestedMeal[] | null };

function Recipes({ profile }: { profile: ProfileData | null }) {
  const [selectedMeal, setSelectedMeal] = useState<SuggestedMeal | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [result, setResult] = useState<PlanResult | null>(null);

  const canSuggest = profile !== null && isProfileComplete(profile);
  // Avain kuvaa, mitä haettiin: uusi haku alkaa, kun profiili tai "New suggestions" muuttuu.
  const requestKey = canSuggest
    ? [refreshCount, profile.calories, profile.protein, profile.fat, profile.carbs, profile.diets.join(",")].join("|")
    : "";

  useEffect(() => {
    if (!profile || !canSuggest) return;
    getDayPlan(profile)
      .then((meals) => setResult({ key: requestKey, meals }))
      .catch(() => setResult({ key: requestKey, meals: null }));
  }, [profile, canSuggest, requestKey]);

  // Tulos kuuluu nykyiseen hakuun vain, jos avain täsmää (vanhentuneet vastaukset ohitetaan).
  const current = result?.key === requestKey ? result : null;

  return <main className="recipes-page">
    <header className="recipes-page-header">
      <span className="recipes-badge">✦ AI MEAL PLANNER</span>
      <p className="recipes-eyebrow">RECIPES</p>
      <h1>Good recipes.<br /><span>For every day.</span></h1>
      <p className="recipes-description">Recipes picked to match your goals and diet, with instructions in one place.</p>
    </header>
    <section className="recipes-section">
      <div className="recipes-section-heading">
        <div><p className="recipes-section-label">TODAY</p><h2>Today&apos;s recipes</h2><p className="recipes-section-subtitle">Suggestions for your calorie and macro goals.</p></div>
        {canSuggest && <button className="secondary-button" onClick={() => setRefreshCount((count) => count + 1)}>New suggestions</button>}
      </div>
      {!canSuggest && <p className="recipes-message">Complete and save your profile to get recipe suggestions.</p>}
      {canSuggest && !current && <p className="recipes-message">Loading suggestions...</p>}
      {current && current.meals === null && <p className="recipes-message">Could not load recipes. Is the backend running?</p>}
      {current?.meals && current.meals.length === 0 && <p className="recipes-message">No recipes match your goals and diet.</p>}
      {current?.meals && <div className="today-recipe-grid">{current.meals.map((meal) => <RecipeCard key={meal.recipeId} meal={meal} onOpen={() => setSelectedMeal(meal)} />)}</div>}
    </section>
    {selectedMeal && <RecipeDetails key={selectedMeal.recipeId} meal={selectedMeal} onClose={() => setSelectedMeal(null)} />}
  </main>;
}

function RecipeCard({ meal, onOpen }: { meal: SuggestedMeal; onOpen: () => void }) {
  return <article className="recipe-meal-card">
    <div className="recipe-meal-icon">{meal.icon}</div>
    <div className="recipe-meal-info">
      <span className="recipe-meal-type">{meal.type}</span>
      <h3>{meal.name}</h3>
      <div className="recipe-meal-meta"><span>{meal.calories} kcal</span><span>{meal.protein} g protein</span>{meal.time > 0 && <span>{meal.time} min</span>}</div>
      {meal.dietWarning && <p className="recipe-warning">Diet suitability cannot be guaranteed. Unknown ingredients: {meal.unmatchedIngredients.join(", ")}</p>}
    </div>
    <button className="recipe-arrow" aria-label={`Open recipe: ${meal.name}`} onClick={onOpen}>→</button>
  </article>;
}

function RecipeDetails({ meal, onClose }: { meal: SuggestedMeal; onClose: () => void }) {
  const [state, setState] = useState<{ recipeId: number; details: RecipeData | null } | null>(null);

  useEffect(() => {
    getRecipeDetails(meal.recipeId)
      .then((details) => setState({ recipeId: meal.recipeId, details }))
      .catch(() => setState({ recipeId: meal.recipeId, details: null }));
  }, [meal.recipeId]);

  const loaded = state?.recipeId === meal.recipeId ? state : null;

  return <section className="recipe-details">
    <button className="recipe-back-button" onClick={onClose}>← Back to recipes</button>
    <div className="recipe-details-card">
      <div className="recipe-details-icon">{meal.icon}</div>
      <div>
        <span className="recipe-meal-type">{meal.type}</span>
        <h2>{meal.name}</h2>
        <p>{meal.time > 0 && `⏱ ${meal.time} min · `}{meal.calories} kcal per serving · <a href={meal.url} target="_blank" rel="noreferrer">Original recipe</a></p>
        {meal.dietWarning && <p className="recipe-warning">Diet suitability cannot be guaranteed. Unknown ingredients: {meal.unmatchedIngredients.join(", ")}</p>}
        {!loaded && <p>Loading recipe...</p>}
        {loaded && !loaded.details && <p>Could not load the recipe.</p>}
        {loaded?.details && <>
          <h3>Ingredients</h3>
          <ul>{loaded.details.ingredients.map((ingredient, index) => <li key={index}>{ingredient}</li>)}</ul>
          <h3>Instructions</h3>
          <ol>{loaded.details.instructions.map((step, index) => <li key={index}>{step}</li>)}</ol>
        </>}
      </div>
    </div>
  </section>;
}

export default Recipes;
