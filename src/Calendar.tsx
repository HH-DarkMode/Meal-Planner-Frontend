import { useState } from "react";
import CalendarComponent from "react-calendar";
import type { Value } from "react-calendar/dist/shared/types.js";
import "./Calendar.css";

type Meal = {
  id: number;
  type: string;
  name: string;
  calories: number;
  icon: string;
  eaten: boolean;
};

type DayMeals = {
  [date: string]: Meal[];
};

const initialMeals: DayMeals = {
  "2026-10-04": [
    {
      id: 1,
      type: "Aamiainen",
      name: "Proteiinikaurapuuro",
      calories: 520,
      icon: "🥣",
      eaten: true,
    },
    {
      id: 2,
      type: "Lounas",
      name: "Naudanliha-riisikulho",
      calories: 680,
      icon: "🥩",
      eaten: false,
    },
    {
      id: 3,
      type: "Välipala",
      name: "Kreikkalainen jogurtti",
      calories: 320,
      icon: "🥛",
      eaten: false,
    },
    {
      id: 4,
      type: "Päivällinen",
      name: "Kana-pasta",
      calories: 620,
      icon: "🍝",
      eaten: false,
    },
  ],

  "2026-10-05": [
    {
      id: 5,
      type: "Aamiainen",
      name: "Munakas ja täysjyväleipä",
      calories: 450,
      icon: "🍳",
      eaten: false,
    },
    {
      id: 6,
      type: "Lounas",
      name: "Kana-caesarsalaatti",
      calories: 590,
      icon: "🥗",
      eaten: false,
    },
    {
      id: 7,
      type: "Välipala",
      name: "Banaani ja rahka",
      calories: 280,
      icon: "🍌",
      eaten: false,
    },
    {
      id: 8,
      type: "Päivällinen",
      name: "Lohi ja perunat",
      calories: 650,
      icon: "🐟",
      eaten: false,
    },
  ],

  "2026-10-06": [
    {
      id: 9,
      type: "Aamiainen",
      name: "Smoothie",
      calories: 380,
      icon: "🥤",
      eaten: false,
    },
    {
      id: 10,
      type: "Lounas",
      name: "Kana-riisi",
      calories: 650,
      icon: "🍗",
      eaten: false,
    },
    {
      id: 11,
      type: "Välipala",
      name: "Omena ja pähkinät",
      calories: 300,
      icon: "🍎",
      eaten: false,
    },
    {
      id: 12,
      type: "Päivällinen",
      name: "Kasvispasta",
      calories: 560,
      icon: "🍝",
      eaten: false,
    },
  ],

  "2026-10-07": [
    {
      id: 13,
      type: "Aamiainen",
      name: "Jogurtti ja marjat",
      calories: 350,
      icon: "🫐",
      eaten: false,
    },
    {
      id: 14,
      type: "Lounas",
      name: "Jauheliha-perunavuoka",
      calories: 680,
      icon: "🥘",
      eaten: false,
    },
    {
      id: 15,
      type: "Välipala",
      name: "Smoothie",
      calories: 300,
      icon: "🥤",
      eaten: false,
    },
    {
      id: 16,
      type: "Päivällinen",
      name: "Tortillat",
      calories: 620,
      icon: "🌯",
      eaten: false,
    },
  ],
};

function Calendar() {
  const today = new Date();

  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const [meals, setMeals] =
    useState<DayMeals>(initialMeals);

  function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year} -${month} -${day} `;
  }

  function handleDateChange(value: Value) {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  }

  function toggleMeal(mealId: number) {
    setMeals((currentMeals) => {
      const updatedMeals = { ...currentMeals };

      Object.keys(updatedMeals).forEach((date) => {
        updatedMeals[date] = updatedMeals[date].map(
          (meal) => {
            if (meal.id === mealId) {
              return {
                ...meal,
                eaten: !meal.eaten,
              };
            }

            return meal;
          }
        );
      });

      return updatedMeals;
    });
  }

  const selectedDateString = formatDate(selectedDate);

  const selectedMeals =
    meals[selectedDateString] || [];

  const totalCalories = selectedMeals.reduce(
    (total, meal) => total + meal.calories,
    0
  );

  const eatenCalories = selectedMeals
    .filter((meal) => meal.eaten)
    .reduce(
      (total, meal) => total + meal.calories,
      0
    );

  function getSelectedDateText() {
    return selectedDate.toLocaleDateString("fi-FI", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <div className="calendar-page">

      <div className="calendar-page-header">
        <span className="calendar-badge">
          MEAL PLANNER
        </span>

        <p className="calendar-eyebrow">
          ATERIASUUNNITTELU
        </p>

        <h1>
          Oma <span>kalenteri.</span>
        </h1>

        <p className="calendar-description">
          Suunnittele viikon ateriat ja seuraa
          päivän ruokailuja helposti yhdestä paikasta.
        </p>
      </div>

      <section className="calendar-section">

        <div className="calendar-section-heading">
          <div>
            <div className="calendar-section-label">
              KALENTERI
            </div>

            <h2>
              Ateriasuunnitelma
            </h2>

            <p className="calendar-section-subtitle">
              Valitse päivä nähdäksesi sen ateriat.
            </p>
          </div>
        </div>

        <div className="calendar-card">

          <CalendarComponent
            onChange={handleDateChange}
            value={selectedDate}
            locale="fi-FI"
            calendarType="iso8601"
          />

        </div>
      </section>

      <section className="selected-day-section">

        <div className="selected-day-heading">
          <div>
            <div className="calendar-section-label">
              VALITTU PÄIVÄ
            </div>

            <h2>
              {selectedDateString ===
                formatDate(today)
                ? "Tänään"
                : "Päivän ateriat"}
            </h2>

            <p className="calendar-section-subtitle">
              {getSelectedDateText()}
            </p>
          </div>

          <div className="calorie-summary">
            <span>SYÖTY</span>
            <strong>
              {eatenCalories} kcal
            </strong>
          </div>
        </div>

        {selectedMeals.length === 0 ? (
          <div className="no-meals">
            <div className="no-meals-icon">
              🍽️
            </div>

            <h3>
              Ei aterioita
            </h3>

            <p>
              Tälle päivälle ei ole vielä
              suunniteltuja aterioita.
            </p>
          </div>
        ) : (
          <>
            <div className="calendar-meal-list">

              {selectedMeals.map((meal) => (
                <div
                  key={meal.id}
                  className={`calendar - meal - card ${meal.eaten ? "eaten" : ""
                    } `}
                >

                  <div className="calendar-meal-icon">
                    {meal.icon}
                  </div>

                  <div className="calendar-meal-info">

                    <span className="calendar-meal-type">
                      {meal.type}
                    </span>

                    <h3>
                      {meal.name}
                    </h3>

                    <div className="calendar-meal-meta">
                      <span>
                        {meal.calories} kcal
                      </span>
                    </div>

                  </div>

                  <button
                    className={`calendar - meal - check ${meal.eaten ? "checked" : ""} `}
                    onClick={() =>
                      toggleMeal(meal.id)
                    }
                  >
                    {meal.eaten ? "✓" : ""}
                  </button>

                </div>
              ))}

            </div>

            <div className="calendar-daily-total">
              <span>
                Päivän suunnitellut kalorit
              </span>

              <strong>
                {totalCalories} kcal
              </strong>
            </div>
          </>
        )}

      </section>

    </div>
  );
}

export default Calendar;