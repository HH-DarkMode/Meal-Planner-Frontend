import { useEffect, useState } from "react";
import { addFavorite, asFavourite, getFavorites, removeFavorite } from "./data/favoritesApi";
import type { SuggestedMeal } from "./data/recipeApi";

// Suosikkien tila ja ♡/♥-toiminto. Käytössä Meal plan- ja My recipes -sivuilla.
// enabled: haetaanko suosikit (Meal plan hakee vasta, kun profiili on valmis).
// onError: sivun oma virheilmoitus. null = tyhjennä edellinen virhe.
export function useFavourites(enabled: boolean, onError: (message: string | null) => void) {
  // Suosikit uusin ensin. null = ei vielä ladattu tai lataus epäonnistui.
  const [favourites, setFavourites] = useState<SuggestedMeal[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    getFavorites()
      .then((list) => { setFavourites(list); setLoadFailed(false); })
      .catch(() => { setFavourites(null); setLoadFailed(true); });
  }, [enabled]);

  const favouriteIds = favourites ? new Set(favourites.map((meal) => meal.recipeId)) : null;

  // Sydän päivittyy heti. Jos tallennus epäonnistuu, muutos perutaan ja näytetään virhe.
  // Peruminen tehdään käänteisellä muutoksella eikä palauttamalla vanhaa listaa, jotta samaan
  // aikaan painettu toinen sydän ei katoa.
  function toggleFavourite(meal: SuggestedMeal) {
    if (!favouriteIds) return;
    onError(null);
    const without = (list: SuggestedMeal[]) => list.filter((f) => f.recipeId !== meal.recipeId);
    const removeFromList = (list: SuggestedMeal[] | null) => list && without(list);
    const addToList = (list: SuggestedMeal[] | null) => list && [asFavourite(meal), ...without(list)];
    const wasFavourite = favouriteIds.has(meal.recipeId);
    setFavourites(wasFavourite ? removeFromList : addToList);
    (wasFavourite ? removeFavorite(meal.recipeId) : addFavorite(meal.recipeId)).catch(() => {
      setFavourites(wasFavourite ? addToList : removeFromList);
      onError("Could not save the favourite. Try again.");
    });
  }

  return { favourites, favouriteIds, loadFailed, toggleFavourite };
}
