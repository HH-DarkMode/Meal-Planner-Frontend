import { afterEach, describe, expect, it, vi } from "vitest";
import { getSelections, setEaten, toDateString } from "./mealPlanApi";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("toDateString", () => {
  it("formats a date as YYYY-MM-DD using local time", () => {
    // kuukausi 10 = marraskuu (JavaScriptissä kuukaudet alkavat nollasta)
    expect(toDateString(new Date(2026, 10, 3))).toBe("2026-11-03");
  });
});

describe("getSelections", () => {
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

  it("requests the given range and maps rows to meals with the eaten state", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([{ date: "2026-11-23", mealType: "Lunch", eaten: true, recipe }]), {
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
      new Response(JSON.stringify([{ date: "2026-11-23", mealType: "Brunch", eaten: false, recipe }]), {
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
