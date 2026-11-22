import "./Recipes.css";
import { useState } from "react";
import RecipeDetails from "./RecipeDetails";
import type { SuggestedMeal } from "./data/recipeApi";
import { dietWarningText } from "./data/weekLogic";
import { useFavourites } from "./useFavourites";
import { FavouriteButton } from "./WeekPlan";

// My recipes: käyttäjän suosikkireseptit, jotka hän on tallentanut sydämellä (♡).
// Reseptiehdotukset ja niiden valinta ovat Meal plan -sivulla (viikkonäkymä).
function MyRecipes({ onOpenMealPlan }: { onOpenMealPlan: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<SuggestedMeal | null>(null);
  const { favourites, favouriteIds, loadFailed, toggleFavourite } = useFavourites(true, setError);

  return <main className="recipes-page">
    <header className="recipes-page-header">
      <span className="recipes-badge">✦ AI MEAL PLANNER</span>
      <p className="recipes-eyebrow">MY RECIPES</p>
      <h1>Your favourite recipes.<br /><span>In one place.</span></h1>
      <p className="recipes-description">Save the recipes you love with a ♡ and find them here.</p>
    </header>

    <section className="recipes-section">
      <div className="recipes-section-heading"><div>
        <p className="recipes-section-label">MY RECIPES</p>
        <h2>Saved recipes</h2>
        <p className="recipes-section-subtitle">Add a favourite to your plan with ♥▾ on the Meal plan page.</p>
      </div></div>

      {loadFailed && <p className="recipes-message">Could not load your favourites. Is the backend running?</p>}
      {!loadFailed && !favourites && <p className="recipes-message">Loading your favourites...</p>}
      {error && <p className="recipes-message">{error}</p>}

      {favourites?.length === 0 && <>
        <p className="recipes-message">No favourites yet. Tap ♡ on a recipe on the Meal plan page to save it here.</p>
        <button className="primary-button" onClick={onOpenMealPlan}>Open meal plan</button>
      </>}

      {favourites && favourites.length > 0 &&
        <div className="today-recipe-grid">
          {favourites.map((meal) =>
            <FavouriteCard key={meal.recipeId} meal={meal} onToggleFavourite={toggleFavourite} onOpen={setSelectedMeal} />)}
        </div>}
    </section>

    {/* Reseptinäkymä korttien alla. Sydän toimii samoin kuin kortissa. Jos suosikin poistaa
        tästä, näkymä jää auki, ja sydämen voi painaa uudelleen, jos poisto oli vahinko. */}
    {selectedMeal && <RecipeDetails key={selectedMeal.recipeId} meal={selectedMeal} backLabel="Back to my recipes"
      onClose={() => setSelectedMeal(null)}
      isFavourite={favouriteIds?.has(selectedMeal.recipeId)}
      onToggleFavourite={favouriteIds ? toggleFavourite : undefined} />}
  </main>;
}

// Yksi suosikki korttina: makrot, valmistusaika, diet-varoitus, sydän (poisto) ja avaus.
// Kortissa oleva resepti on aina suosikki, joten sydän on täytetty (♥).
function FavouriteCard({ meal, onToggleFavourite, onOpen }: {
  meal: SuggestedMeal;
  onToggleFavourite: (meal: SuggestedMeal) => void;
  onOpen: (meal: SuggestedMeal) => void;
}) {
  return <article className="recipe-meal-card">
    <div className="recipe-meal-icon">{meal.icon}</div>
    <div className="recipe-meal-info">
      <h3>{meal.name}</h3>
      <div className="recipe-meal-meta">
        <span>{meal.calories} kcal</span><span>{meal.protein} g protein</span>
        <span>{meal.carbs} g carbs</span><span>{meal.fat} g fat</span>
      </div>
      {meal.time > 0 && <p className="recipe-time">⏱ {meal.time} min</p>}
      {meal.dietWarning && <p className="recipe-warning">{dietWarningText(meal)}</p>}
      <div className="week-meal-actions">
        <FavouriteButton meal={meal} isFavourite onToggle={onToggleFavourite} />
        <button className="icon-button" onClick={() => onOpen(meal)} aria-label={`Open recipe: ${meal.name}`}>→</button>
      </div>
    </div>
  </article>;
}

export default MyRecipes;
