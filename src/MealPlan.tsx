import "./Recipes.css";
import { todayMeals, weekPlan, type Meal } from "./data/mealPlan";

function MealPlan() {
  return <main className="recipes-page meal-plan-page">
    <header className="recipes-page-header"><span className="recipes-badge">✦ AI MEAL PLANNER</span><p className="recipes-eyebrow">MEAL PLAN</p><h1>Plan the week.<br /><span>Eat with ease.</span></h1><p className="recipes-description">See today&apos;s meals and your full weekly plan in one place.</p></header>
    <section className="recipes-section"><div className="recipes-section-heading"><div><p className="recipes-section-label">TODAY</p><h2>Today&apos;s meals</h2><p className="recipes-section-subtitle">Meals designed to support your goals today.</p></div></div><div className="today-recipe-grid">{todayMeals.map((meal) => <MealCard key={meal.name} meal={meal} />)}</div></section>
    <section className="recipes-section week-section"><div className="recipes-section-heading"><div><p className="recipes-section-label">WEEK</p><h2>Weekly plan</h2><p className="recipes-section-subtitle">Keep the full picture visible and make daily life easier.</p></div></div><div className="week-grid">{weekPlan.map((day) => <article className="week-day-card" key={day.day}><div className="week-day-header"><div><span>{day.day}</span><small>{day.date}</small></div><span className="week-day-count">{day.meals.length} meals</span></div><div className="week-meals">{day.meals.map((meal) => <div className="week-meal" key={meal.name}><span className="week-meal-icon">{meal.icon}</span><div><span>{meal.type}</span><strong>{meal.name}</strong><small>{meal.calories} kcal</small></div></div>)}</div></article>)}</div></section>
  </main>;
}

function MealCard({ meal }: { meal: Meal }) {
  return <article className="recipe-meal-card"><div className="recipe-meal-icon">{meal.icon}</div><div className="recipe-meal-info"><span className="recipe-meal-type">{meal.type}</span><h3>{meal.name}</h3><div className="recipe-meal-meta"><span>{meal.calories} kcal</span><span>{meal.protein} g protein</span><span>{meal.carbs} g carbs</span></div><p className="recipe-time">⏱ {meal.time} min</p></div></article>;
}

export default MealPlan;
