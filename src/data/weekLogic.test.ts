import { describe, expect, it } from "vitest";
import { addDays, canMarkEaten, canReroll, canToggleAccepted, dayMealTypes, mondayOf, weekDays } from "./weekLogic";
import type { PlanEntry } from "./mealPlanApi";

// Apufunktio: tekee ateriarivin testejä varten.
function entry(date: string, status: PlanEntry["status"], eaten = false, mealType: PlanEntry["mealType"] = "Lunch"): PlanEntry {
  return {
    date, mealType, eaten, status,
    meal: { icon: "🥗", type: mealType, name: "Salad", calories: 500, protein: 30, carbs: 50, fat: 15, time: 15,
      recipeId: 1, url: "", dietWarning: false, unmatchedIngredients: [] },
  };
}

describe("dates", () => {
  it("finds the Monday of the week", () => {
    // lauantai 7.11.2026 -> maanantai 2.11.2026 (kuukausi 10 = marraskuu)
    expect(mondayOf(new Date(2026, 10, 7))).toBe("2026-11-02");
  });

  it("adds days across a month boundary", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDays("2026-11-09", -7)).toBe("2026-11-02");
  });

  it("returns the 7 days of the week", () => {
    expect(weekDays("2026-11-09")).toEqual([
      "2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13", "2026-11-14", "2026-11-15",
    ]);
  });
});

describe("dayMealTypes", () => {
  it("shows the user's meals in day order and keeps old meals such as Snack", () => {
    const old = entry("2026-11-09", "ACCEPTED", false, "Snack");
    expect(dayMealTypes(["Breakfast", "Lunch", "Dinner", "Supper"], [old]))
      .toEqual(["Breakfast", "Lunch", "Snack", "Dinner", "Supper"]);
  });
});

describe("button rules", () => {
  const today = "2026-11-10";

  it("allows a new suggestion only for suggestions today or later", () => {
    expect(canReroll(entry("2026-11-10", "SUGGESTED"), today)).toBe(true);
    expect(canReroll(entry("2026-11-09", "SUGGESTED"), today)).toBe(false); // mennyt päivä
    expect(canReroll(entry("2026-11-11", "ACCEPTED"), today)).toBe(false);  // hyväksytty
  });

  it("allows marking eaten only for accepted meals today or earlier", () => {
    expect(canMarkEaten(entry("2026-11-10", "ACCEPTED"), today)).toBe(true);
    expect(canMarkEaten(entry("2026-11-11", "ACCEPTED"), today)).toBe(false); // tuleva päivä
    expect(canMarkEaten(entry("2026-11-10", "SUGGESTED"), today)).toBe(false); // ehdotus
  });

  it("does not allow removing an eaten meal from the plan", () => {
    expect(canToggleAccepted(entry("2026-11-10", "ACCEPTED", true))).toBe(false);
    expect(canToggleAccepted(entry("2026-11-10", "ACCEPTED", false))).toBe(true);
    expect(canToggleAccepted(entry("2026-11-10", "SUGGESTED"))).toBe(true);
  });
});
