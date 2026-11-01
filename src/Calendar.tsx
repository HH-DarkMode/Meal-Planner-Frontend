import { useEffect, useState } from "react";
import CalendarComponent from "react-calendar";
import type { OnArgs, Value } from "react-calendar/dist/shared/types.js";
import { calendarGridRange, dayStatuses, mealState, monthRange, summarize, weekRange, type Macros, type MealState } from "./data/calendarLogic";
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

const legendStates = ["none", "planned", "eaten", "missed"] as const;

// Selite kalenterin alla: mitä pallot ja värit tarkoittavat.
function CalendarLegend() {
  return (
    <div className="calendar-legend">
      <div className="legend-group">
        <span className="legend-title">Meals</span>
        <ul>
          {legendStates.map((state) => (
            <li key={state}>
              <MealBall state={state} />
              {ballLabels[state]}
            </li>
          ))}
        </ul>
      </div>

      <div className="legend-group">
        <span className="legend-title">Calendar days</span>
        <ul>
          <li><span className="legend-ring" />Today</li>
          <li><span className="legend-filled" />Selected</li>
          <li><span className="legend-swatch legend-swatch-complete" />All planned meals eaten</li>
          <li><span className="legend-swatch legend-swatch-partial" />Some meals eaten</li>
        </ul>
        <small>Day colours appear once the day is over.</small>
      </div>
    </div>
  );
}

// Yhteenvedon jaksot: päivä, viikko tai kuukausi.
const modes = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
] as const;
type SummaryMode = (typeof modes)[number]["value"];

const macroItems = [
  { label: "Calories", key: "calories", unit: "kcal" },
  { label: "Protein", key: "protein", unit: "g" },
  { label: "Carbs", key: "carbs", unit: "g" },
  { label: "Fat", key: "fat", unit: "g" },
] as const;

// Muuttaa päivän (YYYY-MM-DD) luettavaksi, esim. "Nov 9".
function formatShortDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Kuukauden nimi ja vuosi, esim. "November 2026".
function formatMonth(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// Yhteenvedon makrot: isona syödyt (vain eaten = true) ja pienempänä suunniteltu.
function MacroSummary({ title, subtitle, summary }: {
  title: string;
  subtitle?: string;
  summary: { eaten: Macros; planned: Macros };
}) {
  return (
    <div className="macro-summary">
      <div className="macro-summary-head">
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="macro-grid">
        {macroItems.map((item) => (
          <div className="macro-item" key={item.key}>
            <span className="macro-label">{item.label}</span>
            <strong>{summary.eaten[item.key]} {item.unit}</strong>
            <small>of {summary.planned[item.key]} {item.unit} planned</small>
          </div>
        ))}
      </div>
    </div>
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
  // Mikä yhteenveto näytetään kalenterin alla.
  const [mode, setMode] = useState<SummaryMode>("day");

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

  function handleActiveStartDateChange({ activeStartDate: start, action }: OnArgs) {
    if (!start) return;
    setActiveStartDate(start);
    // Kun kuukautta vaihdetaan nuolilla, valinta siirretään uuteen kuukauteen (tämä päivä
    // tai kuukauden 1. päivä). Silloin päivän ja viikon yhteenvedot käyttävät aina haettua dataa.
    if (action === "prev" || action === "prev2" || action === "next" || action === "next2") {
      const isCurrentMonth = start.getFullYear() === today.getFullYear() && start.getMonth() === today.getMonth();
      setSelectedDate(isCurrentMonth ? today : start);
    }
  }

  const todayString = toDateString(today);
  const selectedDateString = toDateString(selectedDate);

  // Valitun päivän ateriat. Järjestys tulee MEAL_TYPES-listasta, kun paikat piirretään.
  const selectedEntries = entries.filter((entry) => entry.date === selectedDateString);

  // Päivien taustavärit kuukausinäkymää varten.
  const statusByDate = dayStatuses(entries, todayString);

  // Yhteenvedot: valittu päivä, valitun päivän viikko (ma–su) ja näkyvä kuukausi.
  const week = weekRange(selectedDate);
  const monthOfView = monthRange(activeStartDate);
  const daySummary = summarize(entries, selectedDateString, selectedDateString);
  const weekSummary = summarize(entries, week.from, week.to);
  const monthOfViewSummary = summarize(entries, monthOfView.from, monthOfView.to);

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

        <CalendarLegend />

        {/* Yhteenvedot: päivä / viikko / kuukausi valinnan mukaan */}
        <div className="summary-section">
          <div className="view-switch" role="group" aria-label="Summary period">
            {modes.map((m) => (
              <button
                key={m.value}
                type="button"
                className={`view-switch-button${mode === m.value ? " active" : ""}`}
                aria-pressed={mode === m.value}
                onClick={() => setMode(m.value)}
              >
                {m.label}
              </button>
            ))}
          </div>

          <p className="calendar-section-subtitle">
            Totals count only meals marked as eaten.
          </p>

          {mode === "day" && (
            <MacroSummary title={getSelectedDateText()} summary={daySummary} />
          )}

          {mode === "week" && (
            <MacroSummary
              title="Week"
              subtitle={`${formatShortDate(week.from)} – ${formatShortDate(week.to)}`}
              summary={weekSummary}
            />
          )}

          {mode === "month" && (
            <MacroSummary title={formatMonth(activeStartDate)} summary={monthOfViewSummary} />
          )}
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
          </>
        )}
      </section>
    </div>
  );
}

export default Calendar;
