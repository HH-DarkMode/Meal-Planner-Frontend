import "./Recipes.css";
import { todayMeals, weekPlan, type Meal } from "./data/mealPlan";

function MealPlan() {
  return <main className="recipes-page meal-plan-page">
    <header className="recipes-page-header"><span className="recipes-badge">✦ AI MEAL PLANNER</span><p className="recipes-eyebrow">ATERIASUUNNITELMA</p><h1>Viikko valmiiksi.<br /><span>Syö rennommin.</span></h1><p className="recipes-description">Näe päivän ateriat ja koko viikon suunnitelma yhdellä sivulla.</p></header>
    <section className="recipes-section"><div className="recipes-section-heading"><div><p className="recipes-section-label">TÄNÄÄN</p><h2>Päivän ateriat</h2><p className="recipes-section-subtitle">Ateriat, jotka tukevat tämän päivän tavoitettasi.</p></div></div><div className="today-recipe-grid">{todayMeals.map((meal) => <MealCard key={meal.name} meal={meal} />)}</div></section>
    <section className="recipes-section week-section"><div className="recipes-section-heading"><div><p className="recipes-section-label">VIIKKO</p><h2>Viikon suunnitelma</h2><p className="recipes-section-subtitle">Pidä kokonaisuus näkyvissä ja arki helppona.</p></div></div><div className="week-grid">{weekPlan.map((day) => <article className="week-day-card" key={day.day}><div className="week-day-header"><div><span>{day.day}</span><small>{day.date}</small></div><span className="week-day-count">{day.meals.length} ateriaa</span></div><div className="week-meals">{day.meals.map((meal) => <div className="week-meal" key={meal.name}><span className="week-meal-icon">{meal.icon}</span><div><span>{meal.type}</span><strong>{meal.name}</strong><small>{meal.calories} kcal</small></div></div>)}</div></article>)}</div></section>
  </main>;
}

function MealCard({ meal }: { meal: Meal }) {
  return <article className="recipe-meal-card"><div className="recipe-meal-icon">{meal.icon}</div><div className="recipe-meal-info"><span className="recipe-meal-type">{meal.type}</span><h3>{meal.name}</h3><div className="recipe-meal-meta"><span>{meal.calories} kcal</span><span>{meal.protein} g proteiinia</span><span>{meal.carbs} g hiilihydraatteja</span></div><p className="recipe-time">⏱ {meal.time} min</p></div></article>;
}

export default MealPlan;
