import { useEffect, useRef, useState } from "react";
import "./Recipes.css";
import type { RecipeDetails as RecipeData } from "./data/mealPlan";
import { getRecipeDetails, type SuggestedMeal } from "./data/recipeApi";
import { dietWarningText, veganSwapText } from "./data/weekLogic";
import { FavouriteButton } from "./WeekPlan";

// Yhden reseptin ainekset ja valmistusohjeet. Käytössä Meal plan- ja My recipes -sivuilla,
// backLabel kertoo, minne "takaisin"-nappi palaa.
function RecipeDetails({ meal, backLabel, onClose, isFavourite = false, onToggleFavourite }: {
  meal: SuggestedMeal;
  backLabel: string;
  onClose: () => void;
  // Sydän näytetään vain, jos sivu antaa onToggleFavourite-funktion.
  isFavourite?: boolean;
  onToggleFavourite?: (meal: SuggestedMeal) => void;
}) {
  const [state, setState] = useState<{ recipeId: number; details: RecipeData | null } | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    getRecipeDetails(meal.recipeId)
      .then((details) => setState({ recipeId: meal.recipeId, details }))
      .catch(() => setState({ recipeId: meal.recipeId, details: null }));
  }, [meal.recipeId]);

  // Näkymä avautuu korttien alle, joten vieritetään se esiin.
  useEffect(() => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [meal.recipeId]);

  const loaded = state?.recipeId === meal.recipeId ? state : null;

  return <section className="recipe-details" ref={sectionRef}>
    <button className="recipe-back-button" onClick={onClose}>← {backLabel}</button>
    <div className="recipe-details-card">
      <div className="recipe-details-icon">{meal.icon}</div>
      <div>
        <span className="recipe-meal-type">{meal.type}</span>
        <div className="recipe-details-title">
          <h2>{meal.name}</h2>
          {onToggleFavourite && <FavouriteButton meal={meal} isFavourite={isFavourite} onToggle={onToggleFavourite} />}
        </div>
        <p>{meal.time > 0 && `⏱ ${meal.time} min · `}{meal.calories} kcal per serving · <a href={meal.url} target="_blank" rel="noreferrer">Original recipe</a></p>
        {meal.dietWarning && <p className="recipe-warning">{dietWarningText(meal)}</p>}
        {veganSwapText(meal) && <p className="recipe-vegan-swap">🌱 {veganSwapText(meal)}</p>}
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

export default RecipeDetails;
