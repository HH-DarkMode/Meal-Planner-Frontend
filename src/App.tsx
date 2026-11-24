import { useEffect, useState } from "react";
import "./App.css";
import brandLogo from "/meal-planner-logo.jpeg";
import MealPlan from "./MealPlan";
import MyRecipes from "./MyRecipes";
import Calendar from "./Calendar";
import About from "./About";
import Profile from "./Profile";
import { isProfileComplete, type ProfileData } from "./data/profile";
import { getProfile } from "./data/profileApi";
import { getCurrentUser, logout, type AuthUser } from "./data/authApi";
import { authSessionExpiredEvent } from "./data/apiClient";
import Auth from "./Auth";

type Theme = "system" | "light" | "dark";
type ResolvedTheme = Exclude<Theme, "system">;
type View = "home" | "meal-plan" | "my-recipes" | "calendar" | "about" | "profile" | "sign-in";

// Näkymät, jotka hakevat käyttäjän tietoja backendistä. Kirjautumaton käyttäjä
// näkee niiden tilalla kirjautumislomakkeen ja pääsee kirjautumisen jälkeen
// suoraan sille sivulle, jota yritti avata. Home ja About ovat julkisia.
const protectedViews: View[] = ["meal-plan", "my-recipes", "calendar", "profile"];

type Navigation = {
  navigate: (view: View) => void;
};

const themeStorageKey = "meal-planner-theme";

function getStoredTheme(): Theme {
  const storedTheme = window.localStorage.getItem(themeStorageKey);
  return storedTheme === "light" || storedTheme === "dark" || storedTheme === "system" ? storedTheme : "system";
}

function App() {
  const [themePreference, setThemePreference] = useState<Theme>(getStoredTheme);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>("light");
  const [view, setView] = useState<View>("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const theme: ResolvedTheme = themePreference === "system" ? systemTheme : themePreference;
  const isDarkTheme = theme === "dark";
  const navigate = (nextView: View) => {
    setView(nextView);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = () => setSystemTheme(mediaQuery.matches ? "dark" : "light");
    updateSystemTheme();
    mediaQuery.addEventListener("change", updateSystemTheme);
    return () => mediaQuery.removeEventListener("change", updateSystemTheme);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(themeStorageKey, themePreference);
  }, [themePreference]);

  useEffect(() => {
    getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
        if (currentUser) return getProfile().then(setProfile).catch(() => setProfile(null));
        setProfile(null);
        return undefined;
      })
      .catch(() => {
        setUser(null);
        setProfile(null);
      })
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      setProfile(null);
      setAuthNotice("Your session has expired. Please sign in again.");
    };
    window.addEventListener(authSessionExpiredEvent, handleSessionExpired);
    return () => window.removeEventListener(authSessionExpiredEvent, handleSessionExpired);
  }, []);

  if (authLoading) return <main className="auth-page"><p>Loading...</p></main>;

  const showAuth = !user && (view === "sign-in" || protectedViews.includes(view));

  const handleAuthenticated = (authenticatedUser: AuthUser) => {
    setAuthNotice(null);
    setUser(authenticatedUser);
    getProfile().then(setProfile).catch(() => setProfile(null));
    if (view === "sign-in") setView("home");
  };

  const handleLogout = () => {
    logout().finally(() => {
      setUser(null);
      setProfile(null);
      setAuthNotice(null);
      setView("home");
    });
  };

  const cycleTheme = () => {
    setThemePreference((currentTheme) => currentTheme === "system" ? "light" : currentTheme === "light" ? "dark" : "system");
  };

  return <div className={`app ${theme}`}>
    <Header view={view} navigate={navigate} themePreference={themePreference} isDarkTheme={isDarkTheme} isMenuOpen={isMenuOpen} onToggleMenu={() => setIsMenuOpen((open) => !open)} onToggleTheme={cycleTheme} onLogout={handleLogout} username={user?.username ?? null} showSignIn={!showAuth} />
    {showAuth && <Auth notice={authNotice} onAuthenticated={handleAuthenticated} />}
    {view === "home" && <Home navigate={navigate} profile={profile} isSignedIn={user !== null} />}
    {view === "about" && <About />}
    {user && view === "meal-plan" && <MealPlan profile={profile} />}
    {user && view === "my-recipes" && <MyRecipes onOpenMealPlan={() => navigate("meal-plan")} />}
    {user && view === "calendar" && <Calendar />}
    {user && view === "profile" && <Profile profile={profile} onProfileSaved={setProfile} />}
  </div>;
}

function Header({ view, navigate, themePreference, isDarkTheme, isMenuOpen, onToggleMenu, onToggleTheme, onLogout, username, showSignIn }: Navigation & { view: View; themePreference: Theme; isDarkTheme: boolean; isMenuOpen: boolean; onToggleMenu: () => void; onToggleTheme: () => void; onLogout: () => void; username: string | null; showSignIn: boolean }) {
  const links: { view: View; label: string }[] = [
    { view: "home", label: "Home" },
    { view: "meal-plan", label: "Meal plan" },
    { view: "my-recipes", label: "My recipes" },
    { view: "calendar", label: "Calendar" },
    { view: "about", label: "About us" },
  ];
  return <header className="header">
    <button type="button" className="logo" onClick={() => navigate("home")} aria-label="Go to home">
      <img className="brand-mark" src={brandLogo} alt="Meal Planner logo" />
    </button>
    <button className="menu-toggle" onClick={onToggleMenu} aria-expanded={isMenuOpen} aria-controls="main-navigation" aria-label={isMenuOpen ? "Close menu" : "Open menu"}><span /><span /><span /></button>
    <nav className={`nav ${isMenuOpen ? "is-open" : ""}`} id="main-navigation" aria-label="Main navigation">{links.map((link) => <button className={`nav-link ${view === link.view ? "active" : ""}`} key={link.view} onClick={() => navigate(link.view)}>{link.label}</button>)}</nav>
    <div className={`header-actions ${isMenuOpen ? "is-open" : ""}`}><button className="theme-button" onClick={onToggleTheme} aria-label={`Theme: ${themePreference}. Click to change`}>{themePreference === "system" ? "◐" : isDarkTheme ? "☀" : "☾"}<span>{themePreference === "system" ? "System mode" : isDarkTheme ? "Dark mode" : "Light mode"}</span></button>{username
      ? <><button className={`profile-button ${view === "profile" ? "active" : ""}`} onClick={() => navigate("profile")} aria-label="Open profile"><span className="avatar">{username.slice(0, 1).toUpperCase()}</span><span className="profile-name">{username}</span></button><button className="theme-button" onClick={onLogout}>Sign out</button></>
      : showSignIn && <button className="theme-button" onClick={() => navigate("sign-in")}>Sign in</button>}</div>
  </header>;
}

function Home({ navigate, profile, isSignedIn }: Navigation & { profile: ProfileData | null; isSignedIn: boolean }) {
  const hasProfile = isProfileComplete(profile);
  const note = !isSignedIn ? "Sign in or create an account to get started" : hasProfile ? "Your goals are active" : "Start by completing your profile";
  return <main className="page-shell">
    <section className="hero"><div className="hero-content"><span className="badge">✦ AI MEAL PLANNER</span><p className="eyebrow">Welcome to smarter planning</p><h1>Eat well.<br /><span>Feel better.</span></h1><p className="hero-description">Plan meals that fit your routine, track your nutrition, and make healthy choices easier every day.</p><div className="hero-buttons"><button className="primary-button" onClick={() => navigate("meal-plan")}>✦ Open meal plan</button>{isSignedIn
      ? <button className="secondary-button" onClick={() => navigate("profile")}>{hasProfile ? "Edit profile" : "Complete profile"}</button>
      : <button className="secondary-button" onClick={() => navigate("sign-in")}>Sign in / Register</button>}</div><div className="hero-note"><span className="status-dot" /> {note}</div></div><NutritionCard profile={profile} /></section>
    <section className="content-section"><div className="section-heading"><div><p className="section-label">QUICK LINKS</p><h2>Everything important in one place</h2><p className="section-subtitle">Open today&apos;s meals, plan your week, or update your goals.</p></div></div><div className="hero-buttons"><button className="secondary-button" onClick={() => navigate("meal-plan")}>Meal plan</button><button className="secondary-button" onClick={() => navigate("my-recipes")}>My recipes</button><button className="secondary-button" onClick={() => navigate("profile")}>Profile</button></div></section>
  </main>;
}

function NutritionCard({ profile }: { profile: ProfileData | null }) {
  if (!profile || !isProfileComplete(profile)) {
    return <div className="hero-card nutrition-card is-empty"><div className="card-header"><div><p>Nutrition goals</p><h3>Not set yet</h3></div><span className="check">＋</span></div><p className="card-empty-state">Complete and save your profile to see your calorie and macro goals here.</p></div>;
  }

  const calories = profile.calories ?? 0;
  const protein = profile.protein ?? 0;
  const carbs = profile.carbs ?? 0;
  const fat = profile.fat ?? 0;
  const proteinCalories = protein * 4;
  const carbsCalories = carbs * 4;
  const fatCalories = fat * 9;
  const macroCalories = proteinCalories + carbsCalories + fatCalories;
  const proteinShare = macroCalories ? Math.round(proteinCalories / macroCalories * 100) : 0;
  const carbsShare = macroCalories ? Math.round(carbsCalories / macroCalories * 100) : 0;
  const fatShare = macroCalories ? 100 - proteinShare - carbsShare : 0;

  return <div className="hero-card nutrition-card">
    <div className="nutrition-card-glow" />
    <div className="card-header nutrition-card-header">
      <div>
        <p>DAILY TARGET</p>
        <h3>Your nutrition goals</h3>
      </div>
      <span className="nutrition-status"><i /> Active</span>
    </div>

    <div className="calorie-ring" role="img" aria-label={`${calories} kilocalories per day`}>
      <div
        className="calorie-ring-chart"
        style={{
          background: `conic-gradient(
            #f0a64a 0 ${proteinShare}%,
            #54b97a ${proteinShare}% ${proteinShare + carbsShare}%,
            #7c91d8 ${proteinShare + carbsShare}% 100%
          )`,
        }}
      />
      <span className="ring-orbit ring-orbit-one" />
      <span className="ring-orbit ring-orbit-two" />
      <div className="calorie-ring-content">
        <span className="calorie-spark">✦</span>
        <strong>{calories.toLocaleString()}</strong>
        <small>kcal / day</small>
      </div>
    </div>

    <div className="nutrition-macros" aria-label="Daily macro targets">
      <NutritionValue
        label="Protein"
        value={`${protein} g`}
        share={proteinShare}
        tone="protein"
      />
      <NutritionValue
        label="Carbs"
        value={`${carbs} g`}
        share={carbsShare}
        tone="carbs"
      />
      <NutritionValue
        label="Fat"
        value={`${fat} g`}
        share={fatShare}
        tone="fat"
      />
    </div>
  </div>;
}
function NutritionValue({ label, value, share, tone }: { label: string; value: string; share: number; tone: "protein" | "carbs" | "fat" }) {
  return <div className={`nutrition-macro nutrition-macro-${tone}`}>
    <div className="nutrition-macro-top">
      <span><i />{label}</span>
      <strong>{value}</strong>
    </div>
    <div className="nutrition-macro-track" aria-label={`${label}: ${share}% of macro calories`}>
      <span style={{ width: `${share}%` }} />
    </div>
  </div>;
}

export default App;
