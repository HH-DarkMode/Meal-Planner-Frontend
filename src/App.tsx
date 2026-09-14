import { useState } from "react";
import "./App.css";
import Recipes from "./Recipes";

type Theme = "light" | "dark";

function App() {

  const [theme, setTheme] = useState<Theme>("light");
  const isDarkTheme = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDarkTheme ? "light" : "dark");
  };

  return (
    <div className={`app ${theme}`}>
      <Header isDarkTheme={isDarkTheme} onToggleTheme={toggleTheme} />
      <Recipes />
    </div>
  );

  function Header({ isDarkTheme, onToggleTheme }: { isDarkTheme: boolean; onToggleTheme: () => void }) {
    return (
      <header className="header">
        <a className="logo" href="#home" aria-label="Siirry etusivulle">
          <span className="logo-icon">🥗</span>
          <span>AI Meal Planner</span>
        </a>

        <nav className="nav" aria-label="Päänavigaatio">
          <a className="nav-link" href="#home">Etusivu</a>
          <a className="nav-link" href="#paivan-ateriat">Ateriasuunnitelma</a>
          <a className="nav-link  active" href="#reseptit">Reseptit</a>
          <a className="nav-link" href="#ostoslista">Ostoslista</a>
        </nav>

        <div className="header-actions">
          <button className="theme-button" onClick={onToggleTheme} aria-label="Vaihda teema">
            {isDarkTheme ? "☀" : "☾"}
            <span>{isDarkTheme ? "Dark Mode" : "Secret button"}</span>
          </button>
          <span className="profile-button" aria-label="Profiili: Tanja">
            <span className="avatar">T</span>
            <span className="profile-name">Tanja</span>
          </span>
        </div>
      </header>
    );
  }

}

export default App;