import { afterEach, describe, expect, it, vi } from "vitest";
import { addFavorite, asFavourite, getFavorites, removeFavorite } from "./favoritesApi";

afterEach(() => {
  vi.unstubAllGlobals();
});

// Backendin resepti testeihin (RecipeSummaryDto).
const recipe = {
  recipeId: 7,
  name: "Veggie curry",
  url: "/recipes/7",
  prepTimeMin: 10,
  cookTimeMin: 20,
  caloriesPerServing: 520.6,
  proteinPerServing: 18,
  fatPerServing: 14,
  carbsPerServing: 70,
  unmatchedIngredients: ["chicken stock"],
  dietWarning: true,
};

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
}

describe("getFavorites", () => {
  it("returns favourites as meals with a heart and keeps the diet warning", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([recipe]));
    vi.stubGlobal("fetch", fetchMock);

    const result = await getFavorites();

    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/api\/favorites$/), expect.anything());
    expect(result).toEqual([expect.objectContaining({
      recipeId: 7, name: "Veggie curry", type: "Favourite", icon: "♥",
      calories: 521, time: 30, dietWarning: true,
    })]);
  });

  it("throws when loading fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 500 })));
    await expect(getFavorites()).rejects.toThrow("Favourites loading failed");
  });
});

describe("addFavorite", () => {
  it("sends a PUT to the recipe's address", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await addFavorite(7);

    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/api\/favorites\/7$/),
      expect.objectContaining({ method: "PUT" }));
  });

  it("throws when saving fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 404 })));
    await expect(addFavorite(999)).rejects.toThrow("Could not add to favourites");
  });
});

describe("removeFavorite", () => {
  it("sends a DELETE to the recipe's address", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await removeFavorite(7);

    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/api\/favorites\/7$/),
      expect.objectContaining({ method: "DELETE" }));
  });
});

describe("asFavourite", () => {
  it("keeps the recipe but shows it as a favourite with a heart", () => {
    const lunch = { icon: "🥗", type: "Lunch", name: "Salad", calories: 480, protein: 42, carbs: 35, fat: 16,
      time: 15, recipeId: 5, url: "/recipes/5", dietWarning: false, unmatchedIngredients: [] };

    expect(asFavourite(lunch)).toEqual({ ...lunch, type: "Favourite", icon: "♥" });
  });
});
