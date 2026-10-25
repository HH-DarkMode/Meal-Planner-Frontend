import { expect, test } from "@playwright/test";

test("user can sign in and open the profile", async ({ page }) => {
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({ status: 403, body: "" });
  });
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ username: "e2e-user" }),
    });
  });
  await page.route("**/api/profile", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ username: "e2e-user", diets: [] }),
      });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });

  await page.goto("/");
  await page.getByLabel("Username").fill("e2e-user");
  await page.getByLabel("Password").fill("password-123");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByRole("button", { name: "Open profile" })).toBeVisible();
  await page.getByRole("button", { name: "Open profile" }).click();
  await expect(page.getByRole("heading", { name: "Hello, e2e-user!" })).toBeVisible();
});
