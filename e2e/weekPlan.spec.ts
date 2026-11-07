import { expect, test, type Page } from "@playwright/test";

// Viikkonäkymän E2E-testi. Backendin vastaukset annetaan testissä itse (page.route),
// joten oikeaa backendia tai tietokantaa ei tarvita (sama tapa kuin authentication.spec.ts).
// Selaimen kello lukitaan keskiviikkoon 11.11.2026, jotta "tämä päivä" on aina sama.

const MONDAY = "2026-11-09";
const TODAY = "2026-11-11"; // keskiviikko
const TOMORROW = "2026-11-12";

// Backendin resepti (RecipeSummaryDto).
function recipe(id: number, name: string, dietWarning = false) {
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
    unmatchedIngredients: dietWarning ? ["chicken stock"] : [],
    dietWarning,
  };
}

// Viikon vastaus (WeekPlanDto): 4 ateriaa (Breakfast, Lunch, Dinner, Supper).
// Tänään: aamupala ehdotus, lounas hyväksytty ja syöty, päivällinen ehdotus diet-varoituksella,
// iltapalalle ei löytynyt reseptiä. Huomenna: aamupala ehdotus.
const week = {
  start: MONDAY,
  mealTypes: ["Breakfast", "Lunch", "Dinner", "Supper"],
  entries: [
    { date: TODAY, mealType: "Breakfast", eaten: false, status: "SUGGESTED", recipe: recipe(1, "Overnight oats") },
    { date: TODAY, mealType: "Lunch", eaten: true, status: "ACCEPTED", recipe: recipe(2, "Lentil soup") },
    { date: TODAY, mealType: "Dinner", eaten: false, status: "SUGGESTED", recipe: recipe(3, "Veggie curry", true) },
    { date: TOMORROW, mealType: "Breakfast", eaten: false, status: "ACCEPTED", recipe: recipe(4, "Berry porridge") },
  ],
};

/** Kirjautuu sisään valmiilla profiililla ja avaa Meal plan -sivun. Palauttaa hyväksyntäpyyntöjen rungot. */
async function openMealPlan(page: Page): Promise<unknown[]> {
  const statusRequests: unknown[] = [];
  await page.clock.setFixedTime(new Date(`${TODAY}T10:00:00`));

  await page.route("**/api/auth/me", (route) =>
    route.request().headers().authorization === "Bearer e2e-token"
      ? route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ username: "e2e-user" }) })
      : route.fulfill({ status: 403, body: "" }));
  await page.route("**/api/auth/login", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ username: "e2e-user", token: "e2e-token" }) }));
  // Valmis profiili (Meal plan näytetään vain, kun profiili on täytetty).
  await page.route("**/api/profile**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        username: "e2e-user", weight: 70, height: 170, mealsPerDay: 4, gender: "female", goal: "maintain",
        calories: 2000, protein: 120, fat: 70, carbs: 220, diets: ["vegan"],
      }),
    }));
  await page.route("**/api/meal-plan/week**", (route) => {
    // Frontend lähettää viikon maanantain ja selaimen päivän.
    const url = new URL(route.request().url());
    expect(url.searchParams.get("start")).toBe(MONDAY);
    expect(url.searchParams.get("today")).toBe(TODAY);
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(week) });
  });
  await page.route("**/api/meal-plan/selections/status", (route) => {
    statusRequests.push(route.request().postDataJSON());
    return route.fulfill({ status: 200, body: "" });
  });

  await page.goto("/");
  await page.getByLabel("Username").fill("e2e-user");
  await page.getByLabel("Password").fill("password-123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("navigation").getByRole("button", { name: "Meal plan" }).click();
  await expect(page.getByRole("heading", { name: "Weekly plan" })).toBeVisible();
  return statusRequests;
}

test("weekly plan shows the whole week and highlights today", async ({ page }) => {
  await openMealPlan(page);

  // 7 päiväkorttia maanantaista sunnuntaihin
  await expect(page.locator(".week-day-card")).toHaveCount(7);

  // Tämä päivä (keskiviikko) on korostettu ja siinä on Today-merkki
  const today = page.locator(".week-day-card.is-today");
  await expect(today).toHaveCount(1);
  await expect(today).toContainText("Wednesday");
  await expect(today).toContainText("Today");

  // Maanantai ja tiistai ovat menneitä päiviä
  await expect(page.locator(".week-day-card.is-past")).toHaveCount(2);

  // Jokaisella päivällä on profiilin 4 ateriaa: tyhjä paikka näytetään selityksen kanssa
  await expect(today.locator(".week-meal")).toHaveCount(4);
  await expect(today.locator(".week-meal.is-empty")).toContainText("No suitable recipe found");

  // Diet-varoitus näkyy ⚠-merkkinä, ja koko teksti on hiiren alla (title)
  await expect(today.locator(".diet-warning-badge")).toHaveAttribute("title", /Unknown ingredients: chicken stock/);
});

test("user can add a suggestion to the plan", async ({ page }) => {
  const statusRequests = await openMealPlan(page);
  const breakfast = page.locator(".week-day-card.is-today .week-meal").filter({ hasText: "Overnight oats" });

  await breakfast.getByRole("button", { name: "Add", exact: true }).click();

  // Nappi muuttuu heti hyväksytyksi, ja backendille lähtee oikea pyyntö
  await expect(breakfast.getByRole("button", { name: "Added ✓" })).toBeVisible();
  expect(statusRequests).toEqual([{ date: TODAY, mealType: "Breakfast", accepted: true }]);
});

test("button rules: eaten meal cannot be removed, eaten only for today, new suggestion only for suggestions", async ({ page }) => {
  await openMealPlan(page);
  const todayCard = page.locator(".week-day-card.is-today");

  // Syötyä lounasta ei voi poistaa suunnitelmasta (Added-nappi pois käytöstä)
  const lunch = todayCard.locator(".week-meal").filter({ hasText: "Lentil soup" });
  await expect(lunch.getByRole("button", { name: "Added ✓" })).toBeDisabled();
  await expect(lunch.getByRole("checkbox")).toBeChecked();
  // Hyväksyttyä ateriaa ei voi vaihtaa (ei ↻-nappia)
  await expect(lunch.getByRole("button", { name: /New suggestion/ })).toHaveCount(0);

  // Ehdotuksella on ↻-nappi, mutta ei Eaten-täppää
  const dinner = todayCard.locator(".week-meal").filter({ hasText: "Veggie curry" });
  await expect(dinner.getByRole("button", { name: /New suggestion/ })).toBeVisible();
  await expect(dinner.getByRole("checkbox")).toHaveCount(0);

  // Huomisen hyväksytylle aterialle ei voi vielä merkitä syödyksi
  const tomorrow = page.locator(".week-day-card").filter({ hasText: "Thursday" });
  const tomorrowBreakfast = tomorrow.locator(".week-meal").filter({ hasText: "Berry porridge" });
  await expect(tomorrowBreakfast.getByRole("button", { name: "Added ✓" })).toBeEnabled();
  await expect(tomorrowBreakfast.getByRole("checkbox")).toHaveCount(0);
});
