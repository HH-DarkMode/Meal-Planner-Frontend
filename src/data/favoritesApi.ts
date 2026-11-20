import { apiFetch } from "./apiClient";
import { toMeal, type BackendRecipe, type SuggestedMeal } from "./recipeApi";

const favoritesApi = `${import.meta.env.VITE_BACKEND_URL}/api/favorites`;

// Suosikkien kortissa ja reseptinäkymässä näytettävä "ateriatyyppi" ja kuvake.
// Suosikki ei kuulu mihinkään ateriaan, joten tilalla on teksti "Favourite" ja sydän.
const FAVOURITE_TYPE = "Favourite";
const FAVOURITE_ICON = "♥";

// Hakee käyttäjän suosikit, uusin ensin. Palauttaa saman muodon (SuggestedMeal) kuin
// viikkonäkymän ateriat, joten kortit ja reseptinäkymä (RecipeDetails) toimivat sellaisenaan.
// Diet-varoitus tulee backendiltä profiilin ruokavalion mukaan.
export async function getFavorites(): Promise<SuggestedMeal[]> {
  const response = await apiFetch(favoritesApi, { credentials: "include" });
  if (!response.ok) {
    throw new Error("Favourites loading failed");
  }
  const data = (await response.json()) as BackendRecipe[];
  return data.map((recipe) => toMeal(recipe, FAVOURITE_TYPE, FAVOURITE_ICON));
}

// Lisää reseptin suosikkeihin (♡ → ♥). Toisto ei tee tuplaa, joten nappia voi painaa turvallisesti.
export async function addFavorite(recipeId: number): Promise<void> {
  const response = await apiFetch(`${favoritesApi}/${recipeId}`, { method: "PUT", credentials: "include" });
  if (!response.ok) {
    throw new Error("Could not add to favourites");
  }
}

// Poistaa reseptin suosikeista (♥ → ♡).
export async function removeFavorite(recipeId: number): Promise<void> {
  const response = await apiFetch(`${favoritesApi}/${recipeId}`, { method: "DELETE", credentials: "include" });
  if (!response.ok) {
    throw new Error("Could not remove from favourites");
  }
}
