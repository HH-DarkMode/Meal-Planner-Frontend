import { useState } from "react"
import Profile from "./components/Profile"
import RecipeSuggestions from "./components/RecipeSuggestions"
import "./Navigation.css"

type Page = "profile" | "recipes"

// Yksinkertainen sivunvaihto: tilamuuttuja päättää, mikä sivu näytetään.
// Kun sivuja tulee lisää, tämän voi korvata React Routerilla.
function App() {
  const [page, setPage] = useState<Page>("profile")

  return (
    <>
      <nav className="app-nav">
        <span className="app-nav-logo">AI Meal Planner</span>
        <button
          className={page === "profile" ? "is-active" : ""}
          onClick={() => setPage("profile")}
        >
          Profiili
        </button>
        <button
          className={page === "recipes" ? "is-active" : ""}
          onClick={() => setPage("recipes")}
        >
          Reseptit
        </button>
      </nav>

      {page === "profile" ? <Profile /> : <RecipeSuggestions />}
    </>
  )
}

export default App
