import "./Recipes.css";
import { useState } from "react";

type Meal = {
  icon: string;
  type: string;
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  time: string;
};

type DayPlan = {
  day: string;
  date: string;
  meals: Meal[];
};

const todayMeals: Meal[] = [
  {
    icon: "🥣",
    type: "Aamupala",
    name: "Proteiinikaurapuuro",
    calories: "520 kcal",
    protein: "35 g",
    carbs: "58 g",
    fat: "16 g",
    time: "10 min",
  },
  {
    icon: "🥗",
    type: "Lounas",
    name: "Värikäs kanasalaatti",
    calories: "480 kcal",
    protein: "42 g",
    carbs: "35 g",
    fat: "16 g",
    time: "25 min",
  },
  {
    icon: "🍎",
    type: "Välipala",
    name: "Kreikkalainen jogurtti ja marjat",
    calories: "320 kcal",
    protein: "25 g",
    carbs: "28 g",
    fat: "10 g",
    time: "5 min",
  },
  {
    icon: "🍝",
    type: "Päivällinen",
    name: "Kana-pasta",
    calories: "620 kcal",
    protein: "52 g",
    carbs: "64 g",
    fat: "15 g",
    time: "30 min",
  },
];

const weekPlan: DayPlan[] = [
  {
    day: "Maanantai",
    date: "14.9.",
    meals: [
      {
        icon: "🥣",
        type: "Aamupala",
        name: "Banaani-proteiinipuuro",
        calories: "490 kcal",
        protein: "32 g",
        carbs: "60 g",
        fat: "12 g",
        time: "10 min",
      },
      {
        icon: "🍗",
        type: "Lounas",
        name: "Kana-riisikulho",
        calories: "610 kcal",
        protein: "48 g",
        carbs: "70 g",
        fat: "14 g",
        time: "25 min",
      },
      {
        icon: "🍓",
        type: "Välipala",
        name: "Jogurtti ja marjat",
        calories: "280 kcal",
        protein: "22 g",
        carbs: "30 g",
        fat: "8 g",
        time: "5 min",
      },
    ],
  },
  {
    day: "Tiistai",
    date: "15.9.",
    meals: [
      {
        icon: "🥑",
        type: "Aamupala",
        name: "Avokado-kananmunaleipä",
        calories: "450 kcal",
        protein: "24 g",
        carbs: "38 g",
        fat: "22 g",
        time: "10 min",
      },
      {
        icon: "🌯",
        type: "Lounas",
        name: "Avokado-kanawrap",
        calories: "510 kcal",
        protein: "39 g",
        carbs: "48 g",
        fat: "17 g",
        time: "20 min",
      },
      {
        icon: "🍌",
        type: "Välipala",
        name: "Banaani ja rahka",
        calories: "300 kcal",
        protein: "25 g",
        carbs: "35 g",
        fat: "5 g",
        time: "5 min",
      },
    ],
  },
  {
    day: "Keskiviikko",
    date: "16.9.",
    meals: [
      {
        icon: "🥞",
        type: "Aamupala",
        name: "Proteiinipannukakut",
        calories: "510 kcal",
        protein: "34 g",
        carbs: "52 g",
        fat: "17 g",
        time: "15 min",
      },
      {
        icon: "🍲",
        type: "Lounas",
        name: "Kasviskeitto ja täysjyväleipä",
        calories: "420 kcal",
        protein: "20 g",
        carbs: "55 g",
        fat: "12 g",
        time: "35 min",
      },
      {
        icon: "🥜",
        type: "Välipala",
        name: "Omena ja pähkinät",
        calories: "290 kcal",
        protein: "7 g",
        carbs: "25 g",
        fat: "18 g",
        time: "2 min",
      },
    ],
  },
  {
    day: "Torstai",
    date: "17.9.",
    meals: [
      {
        icon: "🥣",
        type: "Aamupala",
        name: "Marjainen tuorepuuro",
        calories: "430 kcal",
        protein: "27 g",
        carbs: "55 g",
        fat: "12 g",
        time: "5 min",
      },
      {
        icon: "🐟",
        type: "Lounas",
        name: "Lohibowl kasviksilla",
        calories: "590 kcal",
        protein: "42 g",
        carbs: "45 g",
        fat: "24 g",
        time: "25 min",
      },
      {
        icon: "🍓",
        type: "Välipala",
        name: "Rahka ja mansikat",
        calories: "250 kcal",
        protein: "26 g",
        carbs: "20 g",
        fat: "5 g",
        time: "5 min",
      },
    ],
  },
  {
    day: "Perjantai",
    date: "18.9.",
    meals: [
      {
        icon: "🍳",
        type: "Aamupala",
        name: "Kasvismunakas",
        calories: "410 kcal",
        protein: "29 g",
        carbs: "18 g",
        fat: "25 g",
        time: "15 min",
      },
      {
        icon: "🍝",
        type: "Lounas",
        name: "Kana-pasta",
        calories: "620 kcal",
        protein: "52 g",
        carbs: "64 g",
        fat: "15 g",
        time: "30 min",
      },
      {
        icon: "🍫",
        type: "Välipala",
        name: "Suklaa-proteiinirahka",
        calories: "300 kcal",
        protein: "28 g",
        carbs: "25 g",
        fat: "9 g",
        time: "5 min",
      },
    ],
  },
  {
    day: "Lauantai",
    date: "19.9.",
    meals: [
      {
        icon: "🥞",
        type: "Aamupala",
        name: "Banaanipannukakut",
        calories: "530 kcal",
        protein: "30 g",
        carbs: "65 g",
        fat: "16 g",
        time: "20 min",
      },
      {
        icon: "🍔",
        type: "Lounas",
        name: "Terveellinen kanaburgeri",
        calories: "650 kcal",
        protein: "45 g",
        carbs: "60 g",
        fat: "22 g",
        time: "30 min",
      },
      {
        icon: "🍇",
        type: "Välipala",
        name: "Hedelmiä ja jogurttia",
        calories: "260 kcal",
        protein: "18 g",
        carbs: "35 g",
        fat: "5 g",
        time: "5 min",
      },
    ],
  },
  {
    day: "Sunnuntai",
    date: "20.9.",
    meals: [
      {
        icon: "🥑",
        type: "Aamupala",
        name: "Avokado-munaleipä",
        calories: "460 kcal",
        protein: "25 g",
        carbs: "35 g",
        fat: "23 g",
        time: "10 min",
      },
      {
        icon: "🍛",
        type: "Lounas",
        name: "Kana-kookoscurry",
        calories: "640 kcal",
        protein: "44 g",
        carbs: "58 g",
        fat: "22 g",
        time: "35 min",
      },
      {
        icon: "🍓",
        type: "Välipala",
        name: "Marjasmoothie",
        calories: "280 kcal",
        protein: "20 g",
        carbs: "38 g",
        fat: "6 g",
        time: "5 min",
      },
    ],
  },
];

type RecipeDetails = {
  ingredients: string[];
  instructions: string[];
};

const recipes: Record<string, RecipeDetails> = {
  Proteiinikaurapuuro: {
    ingredients: [
      "1 dl kaurahiutaleita",
      "2 dl maitoa",
      "1 banaani",
      "20 g proteiinijauhetta",
      "Marjoja",
    ],
    instructions: [
      "Keitä kaurahiutaleet maidossa.",
      "Sekoita joukkoon proteiinijauhe.",
      "Lisää päälle banaani ja marjat.",
    ],
  },

  "Värikäs kanasalaatti": {
    ingredients: [
      "150 g kanafileetä",
      "Salaattia",
      "1 tomaatti",
      "½ kurkkua",
      "Jogurttikastiketta",
    ],
    instructions: [
      "Paista kana kypsäksi ja leikkaa paloiksi.",
      "Pilko kasvikset.",
      "Kokoa salaatti lautaselle.",
      "Lisää kana ja jogurttikastike.",
    ],
  },

  "Kreikkalainen jogurtti ja marjat": {
    ingredients: [
      "200 g kreikkalaista jogurttia",
      "100 g marjoja",
      "1 banaani",
      "Pieni määrä pähkinöitä",
    ],
    instructions: [
      "Laita jogurtti kulhoon.",
      "Lisää marjat ja banaani.",
      "Viimeistele pähkinöillä.",
    ],
  },

  "Kana-pasta": {
    ingredients: [
      "150 g kanaa",
      "100 g pastaa",
      "½ paprika",
      "½ sipuli",
      "Kevyt ruokakerma",
    ],
    instructions: [
      "Keitä pasta.",
      "Paista kana ja kasvikset pannulla.",
      "Lisää ruokakerma.",
      "Sekoita pasta kastikkeen joukkoon.",
    ],
  },
};



function RecipeCard({
  meal,
  onOpen,
}: {
  meal: Meal;
  onOpen: (meal: Meal) => void;
}) {
  return (
    <article className="recipe-meal-card">
      <div className="recipe-meal-icon">{meal.icon}</div>

      <div className="recipe-meal-info">
        <span className="recipe-meal-type">{meal.type}</span>

        <h3>{meal.name}</h3>

        <div className="recipe-meal-meta">
          <span>{meal.calories}</span>
          <span>{meal.protein}</span>
          <span>{meal.carbs}</span>
          <span>{meal.fat}</span>
        </div>

        <p className="recipe-time">⏱ {meal.time}</p>
      </div>

      <button
        className="recipe-arrow"
        aria-label={`Avaa resepti: ${meal.name}`}
        onClick={() => onOpen(meal)}
      >
        →
      </button>
    </article>
  );
}

function DayRecipeSection({
  onOpenRecipe,
}: {
  onOpenRecipe: (meal: Meal) => void;
}) {
  return (
    <section className="recipes-section">
      <div className="recipes-section-heading">
        <div>
          <p className="recipes-section-label">TÄNÄÄN</p>

          <h2>Tiistain reseptit</h2>

          <p className="recipes-section-subtitle">
            Päivän ateriat valmiiksi suunniteltuna.
          </p>
        </div>
      </div>

      <div className="today-recipe-grid">
        {todayMeals.map((meal) => (
          <RecipeCard
            key={meal.type}
            meal={meal}
            onOpen={onOpenRecipe}
          />
        ))}
      </div>
    </section>
  );
}

function WeekRecipeSection() {
  return (
    <section className="recipes-section week-section">
      <div className="recipes-section-heading">
        <div>
          <p className="recipes-section-label">TULEVA VIIKKO</p>

          <h2>Viikon resepti-ideat</h2>

          <p className="recipes-section-subtitle">
            Katso koko viikon ateriasuunnitelma yhdellä silmäyksellä.
          </p>
        </div>
      </div>

      <div className="week-grid">
        {weekPlan.map((day) => (
          <article className="week-day-card" key={day.day}>
            <div className="week-day-header">
              <div>
                <span>{day.day}</span>
                <small>{day.date}</small>
              </div>

              <span className="week-day-count">
                {day.meals.length} ateriaa
              </span>
            </div>

            <div className="week-meals">
              {day.meals.map((meal) => (
                <div className="week-meal" key={meal.type}>
                  <span className="week-meal-icon">{meal.icon}</span>

                  <div>
                    <span>{meal.type}</span>
                    <strong>{meal.name}</strong>
                    <small>{meal.calories}</small>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Recipes() {
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  return (
    <main className="recipes-page">
      <div className="recipes-page-header">
        <span className="recipes-badge">✦ AI MEAL PLANNER</span>

        <p className="recipes-eyebrow">RESEPTIT</p>

        <h1>
          Hyviä reseptejä.
          <br />
          <span>Jokaiseen päivään.</span>
        </h1>

        <p className="recipes-description">
          Löydä päivän ateriat ja suunnittele koko viikon ruoat helposti
          yhdestä paikasta.
        </p>
      </div>

      <DayRecipeSection
        onOpenRecipe={(meal) => setSelectedMeal(meal)}
      />

      {selectedMeal && recipes[selectedMeal.name] && (
        <section className="recipe-details">
          <button
            className="recipe-back-button"
            onClick={() => setSelectedMeal(null)}
          >
            ← Takaisin resepteihin
          </button>

          <div className="recipe-details-card">
            <div className="recipe-details-icon">
              {selectedMeal.icon}
            </div>

            <div>
              <span className="recipe-meal-type">
                {selectedMeal.type}
              </span>

              <h2>{selectedMeal.name}</h2>

              <p>
                ⏱ {selectedMeal.time} · {selectedMeal.calories}
              </p>

              <h3>Ainekset</h3>

              <ul>
                {recipes[selectedMeal.name].ingredients.map((ingredient) => (
                  <li key={ingredient}>{ingredient}</li>
                ))}
              </ul>

              <h3>Valmistus</h3>

              <ol>
                {recipes[selectedMeal.name].instructions.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}

      <WeekRecipeSection />
    </main>
  );
}

export default Recipes;