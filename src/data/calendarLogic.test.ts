import { describe, expect, it } from "vitest";
import { calendarGridRange, dayStatus, dayStatuses, mealState, monthRange, summarize, weekRange } from "./calendarLogic";
import type { PlanEntry } from "./mealPlanApi";

// Apumetodi: tekee ateriarivin testejä varten.
function entry(date: string, eaten: boolean, calories: number): PlanEntry {
  return {
    date,
    mealType: "Lunch",
    eaten,
    meal: {
      icon: "🥗", type: "Lunch", name: "Salad", calories, protein: 10, carbs: 20, fat: 5, time: 15,
      recipeId: 1, url: "", dietWarning: false, unmatchedIngredients: [],
    },
  };
}

describe("mealState", () => {
  it("is none when no meal is chosen", () => {
    expect(mealState(undefined, "2026-11-10", "2026-11-12")).toBe("none");
  });

  it("is eaten when the meal is marked eaten", () => {
    expect(mealState({ eaten: true }, "2026-11-10", "2026-11-12")).toBe("eaten");
  });

  it("is missed when the day is over and the meal was not eaten", () => {
    expect(mealState({ eaten: false }, "2026-11-10", "2026-11-12")).toBe("missed");
  });

  it("is planned today and in the future when not eaten", () => {
    expect(mealState({ eaten: false }, "2026-11-12", "2026-11-12")).toBe("planned");
    expect(mealState({ eaten: false }, "2026-11-20", "2026-11-12")).toBe("planned");
  });
});

describe("dayStatus", () => {
  it("is complete when all planned meals were eaten and the day is over", () => {
    expect(dayStatus([{ eaten: true }, { eaten: true }], "2026-11-10", "2026-11-12")).toBe("complete");
  });

  it("is partial when only some meals were eaten", () => {
    expect(dayStatus([{ eaten: true }, { eaten: false }], "2026-11-10", "2026-11-12")).toBe("partial");
  });

  it("has no colour when nothing was eaten or nothing was planned", () => {
    expect(dayStatus([{ eaten: false }], "2026-11-10", "2026-11-12")).toBe("none");
    expect(dayStatus([], "2026-11-10", "2026-11-12")).toBe("none");
  });

  it("has no colour today or in the future, even if everything is eaten", () => {
    expect(dayStatus([{ eaten: true }], "2026-11-12", "2026-11-12")).toBe("none");
    expect(dayStatus([{ eaten: true }], "2026-11-20", "2026-11-12")).toBe("none");
  });
});

describe("summarize", () => {
  it("counts only eaten meals as eaten and all meals as planned", () => {
    const result = summarize(
      [entry("2026-11-10", true, 500), entry("2026-11-10", false, 300)],
      "2026-11-10",
      "2026-11-10",
    );
    expect(result.eaten).toEqual({ calories: 500, protein: 10, carbs: 20, fat: 5 });
    expect(result.planned).toEqual({ calories: 800, protein: 20, carbs: 40, fat: 10 });
  });

  it("ignores meals outside the date range", () => {
    const result = summarize(
      [entry("2026-10-31", true, 500), entry("2026-11-01", true, 100), entry("2026-11-30", true, 200), entry("2026-12-01", true, 400)],
      "2026-11-01",
      "2026-11-30",
    );
    expect(result.eaten.calories).toBe(300);
  });

  it("returns zeros when there are no meals", () => {
    expect(summarize([], "2026-11-01", "2026-11-30").planned.calories).toBe(0);
  });
});

describe("calendarGridRange", () => {
  it("extends to whole weeks (Monday to Sunday) around the month", () => {
    // 1.11.2026 on sunnuntai ja 30.11.2026 maanantai
    expect(calendarGridRange(new Date(2026, 10, 1))).toEqual({ from: "2026-10-26", to: "2026-12-06" });
  });

  it("matches the month exactly when it starts on Monday and ends on Sunday", () => {
    // 1.2.2027 on maanantai ja 28.2.2027 sunnuntai
    expect(calendarGridRange(new Date(2027, 1, 1))).toEqual({ from: "2027-02-01", to: "2027-02-28" });
  });
});

describe("dayStatuses", () => {
  it("gives each day with meals its own status", () => {
    const result = dayStatuses(
      [entry("2026-11-10", true, 100), entry("2026-11-10", false, 100), entry("2026-11-11", true, 100)],
      "2026-11-12",
    );
    expect(result.get("2026-11-10")).toBe("partial");
    expect(result.get("2026-11-11")).toBe("complete");
    // päivä, jolla ei ole aterioita, ei ole mukana
    expect(result.get("2026-11-12")).toBeUndefined();
  });
});

describe("weekRange", () => {
  it("runs from Monday to Sunday", () => {
    // 4.11.2026 on keskiviikko
    expect(weekRange(new Date(2026, 10, 4))).toEqual({ from: "2026-11-02", to: "2026-11-08" });
  });

  it("treats Sunday as the last day of the week and can cross a month boundary", () => {
    // 1.11.2026 on sunnuntai, viikko alkaa edellisen kuukauden puolella
    expect(weekRange(new Date(2026, 10, 1))).toEqual({ from: "2026-10-26", to: "2026-11-01" });
  });
});

describe("monthRange", () => {
  it("covers the whole month", () => {
    expect(monthRange(new Date(2026, 10, 15))).toEqual({ from: "2026-11-01", to: "2026-11-30" });
  });

  it("handles a leap year February", () => {
    expect(monthRange(new Date(2028, 1, 10))).toEqual({ from: "2028-02-01", to: "2028-02-29" });
  });
});
