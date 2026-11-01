import { useEffect, useState } from "react";
import CalendarComponent from "react-calendar";
import type { OnArgs, Value } from "react-calendar/dist/shared/types.js";
import { calendarGridRange, dayStatuses, mealState, summarize, type MealState } from "./data/calendarLogic";
import { getSelections, MEAL_TYPES, toDateString, type PlanEntry } from "./data/mealPlanApi";
import "./Calendar.css";

// Pallon selite ruudunlukijalle ja merkki pallon sisällä. Merkki auttaa erottamaan tilat
// myös silloin, kun värejä ei erota (punainen ja vihreä).
const ballLabels: Record<MealState, string> = {
  none: "Not planned",
  planned: "Planned",
  eaten: "Eaten",
  missed: "Not eaten",
};
const ballSymbols: Record<MealState, string> = { none: "", planned: "", eaten: "✓", missed: "!" };

// Aterian tilaa kuvaava pallo: harmaa = ei valittu, ääriviiva = suunniteltu,
// vihreä = syöty, punainen = päivä ohi eikä syöty.
function MealBall({ state }: { state: MealState }) {
  return (
    <span className={`meal-ball meal-ball-${state}`} role="img" aria-label={ballLabels[state]}>
      {ballSymbols[state]}
    </span>
  );
}

function Calendar() {
  const today = new Date();

  const [selectedDate, setSelectedDate] = useState<Date>(today);
  // Kalenterin näyttämä kuukausi (kuukauden ensimmäinen päivä).
  const [activeStartDate, setActiveStartDate] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  // Näkyvän kuukauden ateriat, myös viereisten kuukausien päivät, jotka näkyvät ruudukossa.
  const [entries, setEntries] = useState<PlanEntry[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);

  // Hakee näkyvän kuukauden ateriat aina, kun käyttäjä vaihtaa kuukautta.
  useEffect(() => {
    const { from, to } = calendarGridRange(activeStartDate);
    let ignore = false; // ohittaa vanhentuneen vastauksen, jos kuukausi ehti vaihtua
    getSelections(from, to)
      .then((list) => {
        if (ignore) return;
        setEntries(list);
        setLoadFailed(false);
      })
      .catch(() => {
        if (!ignore) setLoadFailed(true);
      });
    return () => {
      ignore = true;
    };
  }, [activeStartDate]);

  function handleDateChange(value: Value) {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  }

  function handleActiveStartDateChange({ activeStartDate: start }: OnArgs) {
    if (start) {
      setActiveStartDate(start);
    }
  }

  const todayString = toDateString(today);
  const selectedDateString = toDateString(selectedDate);

  // Valitun päivän ateriat. Järjestys tulee MEAL_TYPES-listasta, kun paikat piirretään.
  const selectedEntries = entries.filter((entry) => entry.date === selectedDateString);

  // Päivien taustavärit kuukausinäkymää varten.
  const statusByDate = dayStatuses(entries, todayString);

  const totals = summarize(entries, selectedDateString, selectedDateString).planned;

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
            activeStartDate={activeStartDate}
            onActiveStartDateChange={handleActiveStartDateChange}
            minDetail="month"
            // Antaa päivälle taustavärin luokan (day-complete / day-partial), kun päivä on ohi.
            tileClassName={({ date, view }) => {
              if (view !== "month") return null;
              const status = statusByDate.get(toDateString(date));
              return status && status !== "none" ? `day-${status}` : null;
            }}
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
              {selectedDateString === todayString
                ? "Today"
                : "Daily meals"}
            </h2>

            <p className="calendar-section-subtitle">
              {getSelectedDateText()}
            </p>

            {loadFailed && (
              <p className="calendar-section-subtitle">
                Could not load meals. Is the backend running?
              </p>
            )}
          </div>

          {/* Daily nutrition */}
          <div className="calorie-summary">
            <span>DAILY NUTRITION</span>

            <strong>
              {totals.calories} kcal · {totals.protein} g protein ·{" "}
              {totals.carbs} g carbs · {totals.fat} g fat
            </strong>
          </div>
        </div>

        {/* No meals */}
        {selectedEntries.length === 0 ? (
          <div className="no-meals">
            <div className="no-meals-icon">🍽️</div>

            <h3>No meals planned</h3>

            <p>
              There are no meals planned for this day yet.
            </p>
          </div>
        ) : (
          <>
            {/* Meal cards: jokainen ateriapaikka näkyy, myös valitsematon (harmaa pallo) */}
            <div className="calendar-meal-list">
              {MEAL_TYPES.map((type) => {
                const entry = selectedEntries.find((e) => e.mealType === type);
                const state = mealState(entry, selectedDateString, todayString);

                if (!entry) {
                  return (
                    <div key={type} className="calendar-meal-card is-empty">
                      <div className="calendar-meal-info">
                        <span className="calendar-meal-type">
                          <MealBall state={state} />
                          {type}
                        </span>

                        <p className="calendar-meal-empty">
                          No {type.toLowerCase()} chosen.
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={type}
                    className={`calendar-meal-card ${entry.eaten ? "eaten" : ""}`}
                  >
                    <div className="calendar-meal-icon">
                      {entry.meal.icon}
                    </div>

                    <div className="calendar-meal-info">
                      <span className="calendar-meal-type">
                        <MealBall state={state} />
                        {entry.meal.type}
                      </span>

                      <h3>{entry.meal.name}</h3>

                      <div className="calendar-meal-meta">
                        <span>{entry.meal.calories} kcal</span>
                        <span>{entry.meal.protein} g protein</span>
                        <span>{entry.meal.carbs} g carbs</span>
                        <span>{entry.meal.fat} g fat</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Daily total */}
            <div className="calendar-daily-total">
              <span>Planned daily nutrition</span>

              <strong>
                {totals.calories} kcal · {totals.protein} g protein ·{" "}
                {totals.carbs} g carbs · {totals.fat} g fat
              </strong>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default Calendar;
