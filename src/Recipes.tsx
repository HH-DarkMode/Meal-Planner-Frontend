import "./Recipes.css";

// My recipes: tuleva sivu (sprint 4), jolle käyttäjä tallentaa suosikkireseptinsä sydämellä (♡).
// Reseptiehdotukset ja niiden valinta on siirretty Meal plan -sivulle (viikkonäkymä).
function Recipes({ onOpenMealPlan }: { onOpenMealPlan: () => void }) {
  return <main className="recipes-page">
    <header className="recipes-page-header">
      <span className="recipes-badge">✦ AI MEAL PLANNER</span>
      <p className="recipes-eyebrow">MY RECIPES</p>
      <h1>Your favourite recipes.<br /><span>In one place.</span></h1>
      <p className="recipes-description">Soon you can save the recipes you love with a ♡ and find them here.</p>
    </header>
    <section className="recipes-section">
      <div className="recipes-section-heading"><div>
        <p className="recipes-section-label">MY RECIPES</p>
        <h2>Saved recipes <span className="not-implemented-badge">Coming soon</span></h2>
        <p className="recipes-section-subtitle">Recipe suggestions are now part of your weekly plan.</p>
      </div></div>
      <button className="primary-button" onClick={onOpenMealPlan}>Open meal plan</button>
    </section>
  </main>;
}

export default Recipes;
