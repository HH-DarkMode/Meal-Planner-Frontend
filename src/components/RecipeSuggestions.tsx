import "./RecipeSuggestions.css"
import { useEffect, useState } from "react"

type Recipe = {
  recipeId: number
  name: string
  url: string
  caloriesPerServing: number
  proteinPerServing: number
  fatPerServing: number
  carbsPerServing: number
  unmatchedIngredients: string[]
  dietWarning: boolean
}

type DayPlan = {
  breakfast: Recipe[]
  lunch: Recipe[]
  dinner: Recipe[]
}

type SavedProfile = {
  calories: number
  protein: number
  fat: number
  carbs: number
  diets: string[]
}

const meals: { key: keyof DayPlan; label: string }[] = [
  { key: "breakfast", label: "Aamiainen" },
  { key: "lunch", label: "Lounas" },
  { key: "dinner", label: "Päivällinen" },
]

// Hakee tallennetun profiilin ja sen tavoitteiden perusteella päivän ateriaehdotukset.
async function loadPlan(): Promise<{ profile: SavedProfile; plan: DayPlan }> {
  const profileResponse = await fetch("/api/profile")
  if (!profileResponse.ok) throw new Error("Profiilin lataus epäonnistui")
  const profile: SavedProfile = await profileResponse.json()

  const params = new URLSearchParams({
    calories: String(profile.calories),
    protein: String(profile.protein),
    fat: String(profile.fat),
    carbs: String(profile.carbs),
    optionsPerMeal: "3",
  })
  if (profile.diets.length > 0) params.set("diets", profile.diets.join(","))

  const planResponse = await fetch(`/api/recipes/plan?${params}`)
  if (!planResponse.ok) throw new Error("Reseptiehdotusten lataus epäonnistui")
  return { profile, plan: await planResponse.json() }
}

function RecipeSuggestions() {
  const [profile, setProfile] = useState<SavedProfile | null>(null)
  const [plan, setPlan] = useState<DayPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Näyttää haun tuloksen. setState kutsutaan vasta vastauksen saavuttua.
  const showResult = (request: Promise<{ profile: SavedProfile; plan: DayPlan }>) => {
    request
      .then((result) => {
        setProfile(result.profile)
        setPlan(result.plan)
      })
      .catch(() => setError("Ehdotusten lataus epäonnistui. Onko backend käynnissä?"))
      .finally(() => setIsLoading(false))
  }

  // Ensimmäinen haku sivun avautuessa (isLoading on alussa jo true).
  useEffect(() => {
    showResult(loadPlan())
  }, [])

  const reload = () => {
    setIsLoading(true)
    setError("")
    showResult(loadPlan())
  }

  return (
    <div className="recipes-page">
      <div className="recipes-header">
        <div>
          <h1>Reseptiehdotukset</h1>
          {profile && (
            <p className="recipes-summary">
              Tavoite {profile.calories} kcal/pv · proteiini {profile.protein} g · rasva {profile.fat} g ·
              hiilihydraatit {profile.carbs} g
              {profile.diets.length > 0 && ` · ${profile.diets.join(", ")}`}
            </p>
          )}
        </div>
        <button onClick={reload} disabled={isLoading}>
          {isLoading ? "Haetaan..." : "Uudet ehdotukset"}
        </button>
      </div>

      {error && <p className="recipes-error" role="alert">{error}</p>}

      {plan && meals.map((meal) => (
        <section key={meal.key} className="recipes-meal">
          <h2>{meal.label}</h2>
          {plan[meal.key].length === 0 && (
            <p className="recipes-empty">Ei sopivia ehdotuksia näillä valinnoilla.</p>
          )}
          <ul>
            {plan[meal.key].map((recipe) => (
              <li key={recipe.recipeId}>
                <a href={recipe.url} target="_blank" rel="noreferrer">{recipe.name}</a>
                <div className="recipes-stats">
                  {Math.round(recipe.caloriesPerServing)} kcal · P {Math.round(recipe.proteinPerServing)} g ·
                  R {Math.round(recipe.fatPerServing)} g · H {Math.round(recipe.carbsPerServing)} g / annos
                </div>
                {recipe.dietWarning && (
                  <div className="recipes-warning">
                    Ruokavaliosopivuutta ei voi taata. Tuntemattomat ainesosat: {recipe.unmatchedIngredients.join(", ")}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export default RecipeSuggestions
