import { useState } from "react";
import "./Recipes.css";
import { recipes, todayMeals, type Meal } from "./data/mealPlan";

function Recipes() {
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  return <main className="recipes-page">
    <header className="recipes-page-header">
      <span className="recipes-badge">✦ AI MEAL PLANNER</span>
      <p className="recipes-eyebrow">RECIPES</p>
      <h1>Good recipes.<br /><span>For every day.</span></h1>
      <p className="recipes-description">Find today&apos;s meals and open recipe instructions in one place.</p>
    </header>
    <section className="recipes-section">
      <div className="recipes-section-heading"><div><p className="recipes-section-label">TODAY</p><h2>Today&apos;s recipes</h2><p className="recipes-section-subtitle">Your meals for today, planned and ready.</p></div></div>
      <div className="today-recipe-grid">{todayMeals.map((meal) => <RecipeCard key={meal.name} meal={meal} onOpen={() => setSelectedMeal(meal)} />)}</div>
    </section>
    {selectedMeal && <RecipeDetails meal={selectedMeal} onClose={() => setSelectedMeal(null)} />}
  </main>;
}

function RecipeCard({ meal, onOpen }: { meal: Meal; onOpen: () => void }) {
  return <article className="recipe-meal-card"><div className="recipe-meal-icon">{meal.icon}</div><div className="recipe-meal-info"><span className="recipe-meal-type">{meal.type}</span><h3>{meal.name}</h3><div className="recipe-meal-meta"><span>{meal.calories} kcal</span><span>{meal.protein} g protein</span><span>{meal.time} min</span></div></div><button className="recipe-arrow" aria-label={`Open recipe: ${meal.name}`} onClick={onOpen}>→</button></article>;
}

function RecipeDetails({ meal, onClose }: { meal: Meal; onClose: () => void }) {
  const details = recipes[meal.name];
  if (!details) return null;
  return <section className="recipe-details"><button className="recipe-back-button" onClick={onClose}>← Back to recipes</button><div className="recipe-details-card"><div className="recipe-details-icon">{meal.icon}</div><div><span className="recipe-meal-type">{meal.type}</span><h2>{meal.name}</h2><p>⏱ {meal.time} min · {meal.calories} kcal</p><h3>Ingredients</h3><ul>{details.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}</ul><h3>Instructions</h3><ol>{details.instructions.map((step) => <li key={step}>{step}</li>)}</ol></div></div></section>;
}

export default Recipes;
