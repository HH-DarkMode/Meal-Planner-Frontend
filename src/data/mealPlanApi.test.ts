import { afterEach, describe, expect, it, vi } from "vitest";
import {
  acceptDay,
  getSelections,
  getWeek,
  mealTypeLabel,
  rerollMeal,
  setAccepted,
  setEaten,
  toDateString,
} from "./mealPlanApi";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("toDateString", () => {
  it("formats a date as YYYY-MM-DD using local time", () => {
    // kuukausi 10 = marraskuu (JavaScriptissä kuukaudet alkavat nollasta)
    expect(toDateString(new Date(2026, 10, 3))).toBe("2026-11-03");
  });
});

// Backendin resepti testeihin (siirretty ylätasolle, jotta uudetkin testit voivat käyttää sitä).
const recipe = {
  recipeId: 5,
  name: "Salad",
  url: "/recipes/5",
  prepTimeMin: 10,
  cookTimeMin: 5,
  caloriesPerServing: 480.4,
  proteinPerServing: 42,
  fatPerServing: 16,
  carbsPerServing: 35,
  unmatchedIngredients: [],
  dietWarning: false,
};

// Apufunktio: JSON-vastaus testeihin.
function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
}

describe("mealTypeLabel", () => {
  it("shows Snack as 'Snack' when it is the only snack of the day", () => {
    expect(mealTypeLabel("Snack", ["Breakfast", "Lunch", "Snack", "Dinner", "Supper"])).toBe("Snack");
  });

  it("shows Snack as 'Afternoon snack' when the day has several snacks", () => {
    expect(mealTypeLabel("Snack", ["Breakfast", "Morning snack", "Lunch", "Snack", "Dinner", "Supper"]))
      .toBe("Afternoon snack");
  });

  it("keeps other meal names as they are", () => {
    expect(mealTypeLabel("Supper", ["Breakfast", "Lunch", "Dinner", "Supper"])).toBe("Supper");
  });
});

describe("getSelections", () => {
  it("keeps new meal types such as Supper", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse([
      { date: "2026-11-23", mealType: "Supper", eaten: false, status: "ACCEPTED", recipe },
    ])));

    const result = await getSelections("2026-11-01", "2026-11-30");

    expect(result[0]).toMatchObject({ mealType: "Supper", status: "ACCEPTED" });
  });

  it("requests the given range and maps rows to meals with the eaten state", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([{ date: "2026-11-23", mealType: "Lunch", eaten: true, status: "ACCEPTED", recipe }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await getSelections("2026-11-01", "2026-11-30");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/selections?from=2026-11-01&to=2026-11-30"),
      expect.objectContaining({ credentials: "include" }),
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ date: "2026-11-23", mealType: "Lunch", eaten: true });
    expect(result[0].meal).toMatchObject({ recipeId: 5, name: "Salad", calories: 480, time: 15 });
  });

  it("ignores rows with an unknown meal type", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify([{ date: "2026-11-23", mealType: "Brunch", eaten: false, status: "ACCEPTED", recipe }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ));

    await expect(getSelections("2026-11-01", "2026-11-30")).resolves.toEqual([]);
  });

  it("throws when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 500 })));

    await expect(getSelections("2026-11-01", "2026-11-30")).rejects.toThrow("Meal plan loading failed");
  });
});

describe("setEaten", () => {
  it("sends a PATCH request with the date, meal type and eaten state", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await setEaten("2026-11-23", "Lunch", true);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/selections/eaten"),
      expect.objectContaining({
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify({ date: "2026-11-23", mealType: "Lunch", eaten: true }),
      }),
    );
  });

  it("throws when saving fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 404 })));

    await expect(setEaten("2026-11-23", "Lunch", true)).rejects.toThrow("Could not save eaten state");
  });
});

describe("getWeek", () => {
  it("requests the week with start and today and returns meal types and entries", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      start: "2026-11-09",
      mealTypes: ["Breakfast", "Lunch", "Dinner", "Supper"],
      entries: [{ date: "2026-11-09", mealType: "Lunch", eaten: false, status: "SUGGESTED", recipe }],
    }));
    vi.stubGlobal("fetch", fetchMock);

    const week = await getWeek("2026-11-09", "2026-11-07");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/week?start=2026-11-09&today=2026-11-07"), expect.anything());
    expect(week.mealTypes).toEqual(["Breakfast", "Lunch", "Dinner", "Supper"]);
    expect(week.entries[0]).toMatchObject({ mealType: "Lunch", status: "SUGGESTED" });
  });

  it("throws when loading fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 500 })));
    await expect(getWeek("2026-11-09", "2026-11-07")).rejects.toThrow("Week plan loading failed");
  });
});

describe("setAccepted", () => {
  it("sends a PATCH with date, meal type and accepted", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await setAccepted("2026-11-09", "Lunch", true);

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/selections/status"), expect.objectContaining({
      method: "PATCH",
      body: JSON.stringify({ date: "2026-11-09", mealType: "Lunch", accepted: true }),
    }));
  });
});

describe("rerollMeal", () => {
  it("returns the updated entry", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(
      { date: "2026-11-09", mealType: "Lunch", eaten: false, status: "SUGGESTED", recipe })));

    const entry = await rerollMeal("2026-11-09", "Lunch", "2026-11-07");

    expect(entry.meal.recipeId).toBe(5);
  });

  it("tells when no other recipe was found (404)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 404 })));
    await expect(rerollMeal("2026-11-09", "Lunch", "2026-11-07")).rejects.toThrow("No other suitable recipe found");
  });
});

describe("acceptDay", () => {
  it("sends a POST with the date", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await acceptDay("2026-11-09");

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/day/accept"), expect.objectContaining({
      method: "POST", body: JSON.stringify({ date: "2026-11-09" }),
    }));
  });
});
