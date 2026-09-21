import { useState } from "react";
import "./Recipes.css";
import { recipes, todayMeals, type Meal } from "./data/mealPlan";

function Recipes() {
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  return <main className="recipes-page">
    <header className="recipes-page-header">
      <span className="recipes-badge">✦ AI MEAL PLANNER</span>
      <p className="recipes-eyebrow">RESEPTIT</p>
      <h1>Hyviä reseptejä.<br /><span>Jokaiseen päivään.</span></h1>
      <p className="recipes-description">Löydä päivän ateriat ja avaa reseptin ohjeet yhdestä paikasta.</p>
    </header>
    <section className="recipes-section">
      <div className="recipes-section-heading"><div><p className="recipes-section-label">TÄNÄÄN</p><h2>Päivän reseptit</h2><p className="recipes-section-subtitle">Päivän ateriat valmiiksi suunniteltuna.</p></div></div>
      <div className="today-recipe-grid">{todayMeals.map((meal) => <RecipeCard key={meal.name} meal={meal} onOpen={() => setSelectedMeal(meal)} />)}</div>
    </section>
    {selectedMeal && <RecipeDetails meal={selectedMeal} onClose={() => setSelectedMeal(null)} />}
  </main>;
}

function RecipeCard({ meal, onOpen }: { meal: Meal; onOpen: () => void }) {
  return <article className="recipe-meal-card"><div className="recipe-meal-icon">{meal.icon}</div><div className="recipe-meal-info"><span className="recipe-meal-type">{meal.type}</span><h3>{meal.name}</h3><div className="recipe-meal-meta"><span>{meal.calories} kcal</span><span>{meal.protein} g proteiinia</span><span>{meal.time} min</span></div></div><button className="recipe-arrow" aria-label={`Avaa resepti: ${meal.name}`} onClick={onOpen}>→</button></article>;
}

function RecipeDetails({ meal, onClose }: { meal: Meal; onClose: () => void }) {
  const details = recipes[meal.name];
  if (!details) return null;
  return <section className="recipe-details"><button className="recipe-back-button" onClick={onClose}>← Takaisin resepteihin</button><div className="recipe-details-card"><div className="recipe-details-icon">{meal.icon}</div><div><span className="recipe-meal-type">{meal.type}</span><h2>{meal.name}</h2><p>⏱ {meal.time} min · {meal.calories} kcal</p><h3>Ainekset</h3><ul>{details.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}</ul><h3>Valmistus</h3><ol>{details.instructions.map((step) => <li key={step}>{step}</li>)}</ol></div></div></section>;
}

export default Recipes;
