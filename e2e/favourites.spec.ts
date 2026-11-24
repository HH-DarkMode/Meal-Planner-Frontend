import { expect, test, type Page } from "@playwright/test";

// Suosikkien E2E-testi: sydän (♡/♥), suosikin valinta suunnitelmaan (♥▾) ja My recipes -sivu.
// Backendin vastaukset annetaan testissä itse (page.route), joten oikeaa backendia ei tarvita.
// Selaimen kello lukitaan keskiviikkoon 11.11.2026, jotta "tämä päivä" on aina sama.

const MONDAY = "2026-11-09";
const TODAY = "2026-11-11"; // keskiviikko

// Backendin resepti (RecipeSummaryDto).
function recipe(id: number, name: string) {
  return {
    recipeId: id,
    name,
    url: `https://example.com/recipes/${id}`,
    prepTimeMin: 10,
    cookTimeMin: 5,
    caloriesPerServing: 500,
    proteinPerServing: 30,
    fatPerServing: 15,
    carbsPerServing: 50,
    unmatchedIngredients: [],
    dietWarning: false,
  };
}

// Viikko: tänään aamupala ja päivällinen ovat ehdotuksia.
const week = {
  start: MONDAY,
  mealTypes: ["Breakfast", "Lunch", "Dinner", "Supper"],
  entries: [
    { date: TODAY, mealType: "Breakfast", eaten: false, status: "SUGGESTED", recipe: recipe(1, "Overnight oats") },
    { date: TODAY, mealType: "Dinner", eaten: false, status: "SUGGESTED", recipe: recipe(3, "Veggie curry") },
  ],
};

// Backendille lähteneet pyynnöt, joita testit tarkistavat.
type SentRequest = { method: string; path: string; body: unknown };

/**
 * Kirjautuu sisään valmiilla profiililla. favourites = suosikit, jotka backend palauttaa.
 * Palauttaa listan suosikki- ja valintapyynnöistä (PUT/DELETE), jotta testi voi tarkistaa ne.
 */
async function signIn(page: Page, favourites: ReturnType<typeof recipe>[]): Promise<SentRequest[]> {
  const sent: SentRequest[] = [];
  await page.clock.setFixedTime(new Date(`${TODAY}T10:00:00`));

  await page.route("**/api/auth/me", (route) =>
    route.request().headers().authorization === "Bearer e2e-token"
      ? route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ username: "e2e-user" }) })
      : route.fulfill({ status: 403, body: "" }));
  await page.route("**/api/auth/login", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ username: "e2e-user", token: "e2e-token" }) }));
  await page.route("**/api/profile**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        username: "e2e-user", weight: 70, height: 170, mealsPerDay: 4, gender: "female", goal: "maintain",
        calories: 2000, protein: 120, fat: 70, carbs: 220, diets: [],
      }),
    }));
  await page.route("**/api/meal-plan/week**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(week) }));

  // Suosikit: GET palauttaa listan, PUT (lisäys) ja DELETE (poisto) kirjataan talteen.
  await page.route("**/api/favorites**", (route) => {
    const request = route.request();
    if (request.method() === "GET") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(favourites) });
    }
    sent.push({ method: request.method(), path: new URL(request.url()).pathname, body: null });
    return route.fulfill({ status: 200, body: "" });
  });

  // Suosikki aterian paikalle (PUT /selections).
  await page.route("**/api/meal-plan/selections", (route) => {
    const request = route.request();
    sent.push({ method: request.method(), path: new URL(request.url()).pathname, body: request.postDataJSON() });
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(recipe(9, "Pesto pasta")) });
  });

  await page.goto("/");
  // Kirjautumaton käyttäjä näkee ensin etusivun, joten lomake avataan headerista.
  await page.getByRole("banner").getByRole("button", { name: "Sign in" }).click();
  await page.getByLabel("Username").fill("e2e-user");
  await page.getByLabel("Password").fill("password-123");
  await page.getByRole("button", { name: "Sign in" }).click();
  return sent;
}

/** Avaa sivun ylävalikosta (esim. "Meal plan" tai "My recipes"). */
async function openPage(page: Page, name: string) {
  await page.getByRole("navigation").getByRole("button", { name }).click();
}

test("heart saves a recipe as a favourite", async ({ page }) => {
  const sent = await signIn(page, []);
  await openPage(page, "Meal plan");
  const todayCard = page.locator(".week-day-card.is-today");

  await todayCard.getByRole("button", { name: "Add Overnight oats to favourites" }).click();

  // Sydän muuttuu heti täytetyksi, ja backendille lähtee lisäyspyyntö reseptin osoitteeseen
  await expect(todayCard.getByRole("button", { name: "Remove Overnight oats from favourites" }))
    .toHaveAttribute("aria-pressed", "true");
  expect(sent).toContainEqual(expect.objectContaining({ method: "PUT", path: "/api/favorites/1" }));
});

test("favourite picker puts a favourite into the plan", async ({ page }) => {
  const sent = await signIn(page, [recipe(9, "Pesto pasta")]);
  await openPage(page, "Meal plan");
  const todayCard = page.locator(".week-day-card.is-today");

  // ♥▾ päivällisen kohdalla avaa listan, jossa suosikki näkyy kaloreineen
  await todayCard.getByRole("button", { name: "Choose a favourite for Dinner" }).click();
  await todayCard.getByRole("menuitem", { name: /Pesto pasta.*500 kcal/ }).click();

  // Päivällinen vaihtuu suosikkiin ja on heti hyväksytty
  const dinner = todayCard.locator(".week-meal").filter({ hasText: "Pesto pasta" });
  await expect(dinner.getByRole("button", { name: "Added ✓" })).toBeVisible();
  await expect(todayCard).not.toContainText("Veggie curry");
  expect(sent).toContainEqual({
    method: "PUT", path: "/api/meal-plan/selections", body: { date: TODAY, mealType: "Dinner", recipeId: 9 },
  });
});

test("My recipes lists favourites and removing the last one shows the empty state", async ({ page }) => {
  const sent = await signIn(page, [recipe(9, "Pesto pasta")]);
  await openPage(page, "My recipes");

  // Suosikki näkyy korttina
  await expect(page.getByRole("heading", { name: "Saved recipes" })).toBeVisible();
  await expect(page.locator(".recipe-meal-card")).toContainText("Pesto pasta");

  // ♥ poistaa suosikin: kortti katoaa, tyhjä tila näkyy ja backendille lähtee poistopyyntö
  await page.getByRole("button", { name: "Remove Pesto pasta from favourites" }).click();
  await expect(page.locator(".recipe-meal-card")).toHaveCount(0);
  await expect(page.getByText("No favourites yet")).toBeVisible();
  await expect(page.getByRole("button", { name: "Open meal plan" })).toBeVisible();
  expect(sent).toContainEqual(expect.objectContaining({ method: "DELETE", path: "/api/favorites/9" }));
});
