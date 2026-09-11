import { useState } from "react";
import "./App.css";

type Theme = "light" | "dark";

type MealData = {
  icon: string;
  type: string;
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
};

const meals: MealData[] = [
  {
    icon: "🥣",
    type: "Aamiainen",
    name: "Proteiinikaurapuuro",
    calories: "520 kcal",
    protein: "35 g proteiinia",
    carbs: "58 g hiilareita",
    fat: "16 g rasvaa",
  },
  {
    icon: "🥩",
    type: "Lounas",
    name: "Naudanliha-riisikulho",
    calories: "680 kcal",
    protein: "58 g proteiinia",
    carbs: "72 g hiilareita",
    fat: "18 g rasvaa",
  },
  {
    icon: "🥛",
    type: "Välipala",
    name: "Kreikkalainen jogurtti",
    calories: "320 kcal",
    protein: "25 g proteiinia",
    carbs: "28 g hiilareita",
    fat: "10 g rasvaa",
  },
  {
    icon: "🍝",
    type: "Päivällinen",
    name: "Kana-pasta",
    calories: "620 kcal",
    protein: "52 g proteiinia",
    carbs: "64 g hiilareita",
    fat: "15 g rasvaa",
  },
];

function App() {
  const [theme, setTheme] = useState<Theme>("light");
  const isDarkTheme = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDarkTheme ? "light" : "dark");
  };

  return (
    <div className={`app ${theme}`}>
      <Header isDarkTheme={isDarkTheme} onToggleTheme={toggleTheme} />
      <Home />
    </div>
  );
}

function Header({ isDarkTheme, onToggleTheme }: { isDarkTheme: boolean; onToggleTheme: () => void }) {
  return (
    <header className="header">
      <a className="logo" href="#home" aria-label="Siirry etusivulle">
        <span className="logo-icon">🥗</span>
        <span>AI Meal Planner</span>
      </a>

      <nav className="nav" aria-label="Päänavigaatio">
        <a className="nav-link active" href="#home">Etusivu</a>
        <a className="nav-link" href="#paivan-ateriat">Ateriasuunnitelma</a>
        <a className="nav-link" href="#reseptit">Reseptit</a>
        <a className="nav-link" href="#ostoslista">Ostoslista</a>
      </nav>

      <div className="header-actions">
        <button className="theme-button" onClick={onToggleTheme} aria-label="Vaihda teema">
          {isDarkTheme ? "☀" : "☾"}
          <span>{isDarkTheme ? "Dark Mode" : "Secret button"}</span>
        </button>
        <span className="profile-button" aria-label="Profiili: Maxim Kotsalainen">
          <span className="avatar">MK</span>
          <span className="profile-name">Maxim</span>
        </span>
      </div>
    </header>
  );
}

function Home() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="page-shell">
      <section className="hero" id="home">
        <div className="hero-content">
          <span className="badge">✦ AI Meal Planner</span>
          <p className="eyebrow">Hyvää huomenta, Maxim</p>
          <h1>Syö hyvin.<br /><span>Voit paremmin.</span></h1>
          <p className="hero-description">Suunnittele arkeesi sopivat ateriat, seuraa ravintojasi ja tee terveellisistä valinnoista helppoja.</p>
          <div className="hero-buttons">
            <button className="primary-button" onClick={() => scrollTo("paivan-ateriat")}>✦ Luo ateriasuunnitelma</button>
            <button className="secondary-button" onClick={() => scrollTo("ravintotavoite")}>Näytä tavoitteeni</button>
          </div>
          <div className="hero-note"><span className="status-dot" /> Suunnitelmasi on päivitetty tänään</div>
        </div>
        <NutritionCard />
      </section>

      <TodayMeals />
      <Recipes />
      <ShoppingList />
      <Insight />
    </main>
  );
}

function NutritionCard() {
  return (
    <div className="hero-card" id="ravintotavoite">
      <div className="card-header"><div><p>Tämän päivän ravinto</p><h3>2 140 <small>/ 2 500 kcal</small></h3></div><span className="check">✓</span></div>
      <div className="progress" role="progressbar" aria-valuenow={86} aria-valuemin={0} aria-valuemax={100}><div className="progress-bar" /></div>
      <div className="progress-caption"><span>86 % päivän tavoitteesta</span><strong>360 kcal jäljellä</strong></div>
      <div className="nutrition-grid">
        <NutritionValue label="Proteiini" value="145 g" percentage="92 %" />
        <NutritionValue label="Hiilihydraatit" value="220 g" percentage="74 %" />
        <NutritionValue label="Rasva" value="62 g" percentage="88 %" />
      </div>
    </div>
  );
}

function NutritionValue({ label, value, percentage }: { label: string; value: string; percentage: string }) {
  return <div><span>{label}</span><strong>{value}</strong><em>{percentage}</em></div>;
}

function TodayMeals() {
  return (
    <section className="today-section" id="paivan-ateriat">
      <SectionHeading label="PIZZA PERJANTAI 29. HELMIKUUTA" title="Tämän päivän ateriat" subtitle="Neljä herkullista hetkeä, jotka tukevat tavoitteitasi." />
      <div className="meal-grid">{meals.map((meal) => <Meal key={meal.type} {...meal} />)}</div>
    </section>
  );
}

function SectionHeading({ label, title, subtitle }: { label: string; title: string; subtitle: string }) {
  return <div className="section-heading"><div><p className="section-label">{label}</p><h2>{title}</h2><p className="section-subtitle">{subtitle}</p></div></div>;
}

function Recipes() {
  return (
    <section className="content-section" id="reseptit">
      <SectionHeading label="IDEOITA KEITTIÖÖN" title="Suositellut reseptit" subtitle="Helppoja ja ravitsevia reseptejä seuraavalle aterialle." />
      <div className="recipe-grid">
        <Recipe icon="🥗" name="Värikäs kanasalaatti" details="25 min · 480 kcal" />
        <Recipe icon="🍲" name="Kasviskeitto" details="35 min · 360 kcal" />
        <Recipe icon="🌯" name="Avokado-kanawrap" details="20 min · 510 kcal" />
      </div>
    </section>
  );
}

function Recipe({ icon, name, details }: { icon: string; name: string; details: string }) {
  return <article className="recipe-card"><span>{icon}</span><div><strong>{name}</strong><p>{details}</p></div></article>;
}

function ShoppingList() {
  const groceries = ["Kaurahiutaleet", "Kreikkalainen jogurtti", "Kanan rintafileet", "Vihreät kasvikset", "Täysjyväpasta"];

  return (
    <section className="content-section" id="ostoslista">
      <SectionHeading label="TÄMÄN VIIKON OSTOKSET" title="Ostoslista" subtitle="Kaikki tarvittava valmiiksi yhdellä silmäyksellä." />
      <div className="shopping-list">{groceries.map((item) => <label key={item}><input type="checkbox" /> {item}</label>)}</div>
    </section>
  );
}

function Insight() {
  return <section className="insight-strip"><div className="insight-icon">✦</div><div><strong>Pieni vinkki päivään</strong><p>Lisää lounaalle kourallinen vihreitä. Saat helposti enemmän kuitua ja väriä lautaselle.</p></div><button aria-label="Sulje vinkki">×</button></section>;
}

function Meal({ icon, type, name, calories, protein, carbs, fat }: MealData) {
  return (
    <article className="meal-card">
      <div className="meal-icon">{icon}</div>
      <div className="meal-info"><span className="meal-type">{type}</span><h3>{name}</h3><div className="meal-meta"><span>{calories}</span><span>{protein}</span><span>{carbs}</span><span>{fat}</span></div></div>
      <button className="arrow-button" aria-label={`Avaa ateria: ${name}`}>→</button>
    </article>
  );
}

export default App;
