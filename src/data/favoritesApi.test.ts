import { afterEach, describe, expect, it, vi } from "vitest";
import { addFavorite, getFavorites, removeFavorite } from "./favoritesApi";

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
