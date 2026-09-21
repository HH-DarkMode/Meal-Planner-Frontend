import { useEffect, useState } from "react";
import "./App.css";
import MealPlan from "./MealPlan";
import Recipes from "./Recipes";
import About from "./About";
import Profile from "./components/Profile";
import { emptyProfile, isProfileComplete, type ProfileData } from "./data/profile";

type Theme = "light" | "dark";
type View = "home" | "meal-plan" | "recipes" | "about" | "profile";

type Navigation = {
  navigate: (view: View) => void;
};

function App() {
  const [theme, setTheme] = useState<Theme>("light");
  const [view, setView] = useState<View>("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const isDarkTheme = theme === "dark";
  const navigate = (nextView: View) => {
    setView(nextView);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    fetch("http://localhost:8080/api/profile")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Profile loading failed")))
      .then((data: Partial<ProfileData>) => setProfile({ ...emptyProfile, ...data, diets: data.diets ?? [] }))
      .catch(() => setProfile(null));
  }, []);

  return <div className={`app ${theme}`}>
    <Header view={view} navigate={navigate} isDarkTheme={isDarkTheme} isMenuOpen={isMenuOpen} onToggleMenu={() => setIsMenuOpen((open) => !open)} onToggleTheme={() => setTheme(isDarkTheme ? "light" : "dark")} />
    {view === "home" && <Home navigate={navigate} profile={profile} />}
    {view === "meal-plan" && <MealPlan />}
    {view === "recipes" && <Recipes />}
    {view === "about" && <About />}
    {view === "profile" && <Profile profile={profile} onProfileSaved={setProfile} />}
  </div>;
}

function Header({ view, navigate, isDarkTheme, isMenuOpen, onToggleMenu, onToggleTheme }: Navigation & { view: View; isDarkTheme: boolean; isMenuOpen: boolean; onToggleMenu: () => void; onToggleTheme: () => void }) {
  const links: { view: View; label: string }[] = [
    { view: "home", label: "Etusivu" },
    { view: "meal-plan", label: "Ateriasuunnitelma" },
    { view: "recipes", label: "Reseptit" },
    { view: "about", label: "Tietoa meistä" },
  ];
  return <header className="header">
    <button className="logo" onClick={() => navigate("home")} aria-label="Siirry etusivulle"><span className="logo-icon">🥗</span><span>AI Meal Planner</span></button>
    <button className="menu-toggle" onClick={onToggleMenu} aria-expanded={isMenuOpen} aria-controls="main-navigation" aria-label={isMenuOpen ? "Sulje valikko" : "Avaa valikko"}><span /><span /><span /></button>
    <nav className={`nav ${isMenuOpen ? "is-open" : ""}`} id="main-navigation" aria-label="Päänavigaatio">{links.map((link) => <button className={`nav-link ${view === link.view ? "active" : ""}`} key={link.view} onClick={() => navigate(link.view)}>{link.label}</button>)}</nav>
    <div className={`header-actions ${isMenuOpen ? "is-open" : ""}`}><button className="theme-button" onClick={onToggleTheme} aria-label="Vaihda teema">{isDarkTheme ? "☀" : "☾"}<span>{isDarkTheme ? "Light mode" : "Dark mode"}</span></button><button className={`profile-button ${view === "profile" ? "active" : ""}`} onClick={() => navigate("profile")} aria-label="Avaa profiili"><span className="avatar">??</span><span className="profile-name">Profiili</span></button></div>
  </header>;
}

function Home({ navigate, profile }: Navigation & { profile: ProfileData | null }) {
  const hasProfile = isProfileComplete(profile);
  return <main className="page-shell">
    <section className="hero"><div className="hero-content"><span className="badge">✦ AI Meal Planner</span><p className="eyebrow">Tervetuloa suunnittelemaan</p><h1>Syö hyvin.<br /><span>Voit paremmin.</span></h1><p className="hero-description">Suunnittele arkeesi sopivat ateriat, seuraa ravintojasi ja tee terveellisistä valinnoista helppoja.</p><div className="hero-buttons"><button className="primary-button" onClick={() => navigate("meal-plan")}>✦ Avaa ateriasuunnitelma</button><button className="secondary-button" onClick={() => navigate("profile")}>{hasProfile ? "Muokkaa profiilia" : "Täytä profiili"}</button></div><div className="hero-note"><span className="status-dot" /> {hasProfile ? "Tavoitteesi ovat käytössä" : "Aloita täyttämällä oma profiilisi"}</div></div><NutritionCard profile={profile} /></section>
    <section className="content-section"><div className="section-heading"><div><p className="section-label">NOPEAT SIIRTYMISET</p><h2>Kaikki tärkeä yhdessä paikassa</h2><p className="section-subtitle">Avaa päivän ateriat, löydä uusi resepti tai päivitä omat tavoitteesi.</p></div></div><div className="hero-buttons"><button className="secondary-button" onClick={() => navigate("meal-plan")}>Ateriasuunnitelma</button><button className="secondary-button" onClick={() => navigate("recipes")}>Reseptit</button><button className="secondary-button" onClick={() => navigate("profile")}>Profiili</button></div></section>
  </main>;
}

function NutritionCard({ profile }: { profile: ProfileData | null }) {
  if (!profile || !isProfileComplete(profile)) {
    return <div className="hero-card"><div className="card-header"><div><p>Ravintotavoitteet</p><h3>Ei vielä asetettu</h3></div><span className="check">＋</span></div><p className="card-empty-state">Täytä ja tallenna profiilisi, niin omat kalori- ja makrotavoitteesi näkyvät tässä.</p></div>;
  }

  const calories = profile.calories ?? 0;
  const protein = profile.protein ?? 0;
  const carbs = profile.carbs ?? 0;
  const fat = profile.fat ?? 0;
  return <div className="hero-card"><div className="card-header"><div><p>Omat ravintotavoitteesi</p><h3>{calories} <small>kcal / päivä</small></h3></div><span className="check">✓</span></div><div className="nutrition-grid"><NutritionValue label="Proteiini" value={`${protein} g`} /><NutritionValue label="Hiilihydraatit" value={`${carbs} g`} /><NutritionValue label="Rasva" value={`${fat} g`} /></div></div>;
}
function NutritionValue({ label, value }: { label: string; value: string }) { return <div><span>{label}</span><strong>{value}</strong></div>; }

export default App;
