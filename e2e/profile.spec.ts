import { expect, test, type Page } from "@playwright/test";

const savedProfile = {
  username: "e2e-user",
  weight: 70,
  height: 180,
  gender: "mies",
  goal: "healthy",
  mealsPerDay: 4,
  diets: [],
  calories: 2400,
  protein: 140,
  fat: 56,
  carbs: 334,
};

async function mockProfileApi(page: Page) {
  const saved: Record<string, unknown>[] = [];
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ username: "e2e-user" }) });
  });
  await page.route("**/api/profile**", async (route) => {
    if (route.request().method() === "PUT") {
      const body = route.request().postDataJSON();
      saved.push(body);
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(savedProfile) });
  });
  await page.addInitScript(() => window.localStorage.setItem("meal-planner-auth-token", "e2e-token"));
  return saved;
}

test("changing weight recalculates nutrition goals and updates the home page", async ({ page }) => {
  const saved = await mockProfileApi(page);

  await page.goto("/");
  await expect(page.getByRole("img", { name: "2400 kilocalories per day" })).toBeVisible();

  await page.getByRole("button", { name: "Open profile" }).click();
  await page.getByPlaceholder("Esim. 80").fill("100");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Changes saved.")).toBeVisible();

  // Tavoitteet lasketaan uudesta painosta, eikä vanhoja arvoja lähetetä uudelleen.
  expect(saved[0].weight).toBe(100);
  expect(saved[0].protein).toBe(200);
  expect(saved[0].fat).toBe(80);
  expect(saved[0].calories).not.toBe(2400);

  await page.getByRole("navigation").getByRole("button", { name: "Home" }).click();
  await expect(page.getByRole("img", { name: `${saved[0].calories} kilocalories per day` })).toBeVisible();
});

test("low carb limits carbs to 20 % of calories and moves the rest to fat", async ({ page }) => {
  const saved = await mockProfileApi(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Open profile" }).click();
  await page.getByLabel("Aggressive bulk").check();
  await page.getByLabel("Low carb").check();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Changes saved.")).toBeVisible();

  // 70 kg, 180 cm, mies, aggressive bulk: 3050 kcal, proteiini 1,8 g/kg
  expect(saved[0]).toMatchObject({ calories: 3050, protein: 126, carbs: 153, fat: 215 });
});

test("high protein raises protein to 2.2 g per kg", async ({ page }) => {
  const saved = await mockProfileApi(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Open profile" }).click();
  await page.getByLabel("High protein").check();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Changes saved.")).toBeVisible();

  expect(saved[0].protein).toBe(154);
});
