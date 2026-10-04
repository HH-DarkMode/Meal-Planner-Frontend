import { useState } from "react";
import CalendarComponent from "react-calendar";
import type { Value } from "react-calendar/dist/shared/types.js";
import "./Calendar.css";

type Meal = {
  id: number;
  type: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
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
      type: "Breakfast",
      name: "Protein oatmeal",
      calories: 520,
      protein: 30,
      carbs: 55,
      fat: 15,
      icon: "🥣",
      eaten: true,
    },
    {
      id: 2,
      type: "Lunch",
      name: "Beef and rice bowl",
      calories: 680,
      protein: 42,
      carbs: 70,
      fat: 22,
      icon: "🥩",
      eaten: false,
    },
    {
      id: 3,
      type: "Snack",
      name: "Greek yogurt",
      calories: 320,
      protein: 20,
      carbs: 25,
      fat: 12,
      icon: "🥛",
      eaten: false,
    },
    {
      id: 4,
      type: "Dinner",
      name: "Chicken pasta",
      calories: 620,
      protein: 40,
      carbs: 65,
      fat: 18,
      icon: "🍝",
      eaten: false,
    },
  ],

  "2026-10-05": [
    {
      id: 5,
      type: "Breakfast",
      name: "Omelette and whole grain bread",
      calories: 450,
      protein: 28,
      carbs: 35,
      fat: 20,
      icon: "🍳",
      eaten: false,
    },
    {
      id: 6,
      type: "Lunch",
      name: "Chicken Caesar salad",
      calories: 590,
      protein: 38,
      carbs: 25,
      fat: 32,
      icon: "🥗",
      eaten: false,
    },
    {
      id: 7,
      type: "Snack",
      name: "Banana and quark",
      calories: 280,
      protein: 18,
      carbs: 35,
      fat: 5,
      icon: "🍌",
      eaten: false,
    },
    {
      id: 8,
      type: "Dinner",
      name: "Salmon and potatoes",
      calories: 650,
      protein: 42,
      carbs: 45,
      fat: 28,
      icon: "🐟",
      eaten: false,
    },
  ],

  "2026-10-06": [
    {
      id: 9,
      type: "Breakfast",
      name: "Berry smoothie",
      calories: 380,
      protein: 22,
      carbs: 50,
      fat: 10,
      icon: "🥤",
      eaten: false,
    },
    {
      id: 10,
      type: "Lunch",
      name: "Chicken and rice",
      calories: 650,
      protein: 45,
      carbs: 70,
      fat: 16,
      icon: "🍗",
      eaten: false,
    },
    {
      id: 11,
      type: "Snack",
      name: "Apple and nuts",
      calories: 300,
      protein: 7,
      carbs: 30,
      fat: 18,
      icon: "🍎",
      eaten: false,
    },
    {
      id: 12,
      type: "Dinner",
      name: "Vegetable pasta",
      calories: 560,
      protein: 20,
      carbs: 75,
      fat: 18,
      icon: "🍝",
      eaten: false,
    },
  ],

  "2026-10-07": [
    {
      id: 13,
      type: "Breakfast",
      name: "Yogurt and berries",
      calories: 350,
      protein: 20,
      carbs: 35,
      fat: 12,
      icon: "🫐",
      eaten: false,
    },
    {
      id: 14,
      type: "Lunch",
      name: "Ground beef and potato casserole",
      calories: 680,
      protein: 40,
      carbs: 55,
      fat: 30,
      icon: "🥘",
      eaten: false,
    },
    {
      id: 15,
      type: "Snack",
      name: "Smoothie",
      calories: 300,
      protein: 18,
      carbs: 40,
      fat: 8,
      icon: "🥤",
      eaten: false,
    },
    {
      id: 16,
      type: "Dinner",
      name: "Chicken tortillas",
      calories: 620,
      protein: 38,
      carbs: 60,
      fat: 22,
      icon: "🌯",
      eaten: false,
    },
  ],
};

function Calendar() {
  const today = new Date();

  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [meals, setMeals] = useState<DayMeals>(initialMeals);

  function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
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
        updatedMeals[date] = updatedMeals[date].map((meal) => {
          if (meal.id === mealId) {
            return {
              ...meal,
              eaten: !meal.eaten,
            };
          }

          return meal;
        });
      });

      return updatedMeals;
    });
  }

  const selectedDateString = formatDate(selectedDate);

  const selectedMeals = meals[selectedDateString] || [];

  const totalCalories = selectedMeals.reduce(
    (total, meal) => total + meal.calories,
    0
  );

  const totalProtein = selectedMeals.reduce(
    (total, meal) => total + meal.protein,
    0
  );

  const totalCarbs = selectedMeals.reduce(
    (total, meal) => total + meal.carbs,
    0
  );

  const totalFat = selectedMeals.reduce(
    (total, meal) => total + meal.fat,
    0
  );

  function getSelectedDateText() {
    return selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <div className="calendar-page">

      {/* Page header */}
      <div className="calendar-page-header">
        <span className="calendar-badge">✦ AI MEAL PLANNER</span>

        <p className="calendar-eyebrow">CALENDAR</p>

        <h1>
          My <span>calendar.</span>
        </h1>

        <p className="calendar-description">
          Plan your weekly meals and keep track of your daily nutrition in
          one place.
        </p>
      </div>

      {/* Calendar */}
      <section className="calendar-section">
        <div className="calendar-section-heading">
          <div>
            <div className="calendar-section-label">MEAL PLAN</div>

            <h2>Meal plan</h2>

            <p className="calendar-section-subtitle">
              Select a day to see your meals.
            </p>
          </div>
        </div>

        <div className="calendar-card">
          <CalendarComponent
            onChange={handleDateChange}
            value={selectedDate}
            locale="en-US"
            calendarType="iso8601"
          />
        </div>
      </section>

      {/* Selected day */}
      <section className="selected-day-section">
        <div className="selected-day-heading">
          <div>
            <div className="calendar-section-label">
              SELECTED DAY
            </div>

            <h2>
              {selectedDateString === formatDate(today)
                ? "Today"
                : "Daily meals"}
            </h2>

            <p className="calendar-section-subtitle">
              {getSelectedDateText()}
            </p>
          </div>

          {/* Daily nutrition */}
          <div className="calorie-summary">
            <span>DAILY NUTRITION</span>

            <strong>
              {totalCalories} kcal · {totalProtein} g protein ·{" "}
              {totalCarbs} g carbs · {totalFat} g fat
            </strong>
          </div>
        </div>

        {/* No meals */}
        {selectedMeals.length === 0 ? (
          <div className="no-meals">
            <div className="no-meals-icon">🍽️</div>

            <h3>No meals planned</h3>

            <p>
              There are no meals planned for this day yet.
            </p>
          </div>
        ) : (
          <>
            {/* Meal cards */}
            <div className="calendar-meal-list">
              {selectedMeals.map((meal) => (
                <div
                  key={meal.id}
                  className={`calendar-meal-card ${meal.eaten ? "eaten" : ""
                    }`}
                >
                  <div className="calendar-meal-icon">
                    {meal.icon}
                  </div>

                  <div className="calendar-meal-info">
                    <span className="calendar-meal-type">
                      {meal.type}
                    </span>

                    <h3>{meal.name}</h3>

                    <div className="calendar-meal-meta">
                      <span>{meal.calories} kcal</span>
                      <span>{meal.protein} g protein</span>
                      <span>{meal.carbs} g carbs</span>
                      <span>{meal.fat} g fat</span>
                    </div>
                  </div>

                  <button
                    className={`calendar-meal-check ${meal.eaten ? "checked" : ""
                      }`}
                    onClick={() => toggleMeal(meal.id)}
                  >
                    {meal.eaten ? "✓" : ""}
                  </button>
                </div>
              ))}
            </div>

            {/* Daily total */}
            <div className="calendar-daily-total">
              <span>Planned daily nutrition</span>

              <strong>
                {totalCalories} kcal · {totalProtein} g protein ·{" "}
                {totalCarbs} g carbs · {totalFat} g fat
              </strong>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default Calendar;