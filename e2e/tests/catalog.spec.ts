import { expect, test } from "@playwright/test";

test("catalog loads cleanly and supports the main interaction", async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const requestFailures: string[] = [];
  const errorResponses: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => {
    requestFailures.push(`${request.method()} ${request.url()}`);
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      errorResponses.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.goto("/");
  await expect(page).toHaveTitle(/MythBase/);
  await expect(page.getByRole("heading", { name: "Существа" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /^Открыть карточку:/ }),
  ).toHaveCount(12);

  const favicon = await page.request.get("/favicon.svg");
  expect(favicon.ok()).toBe(true);

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);

  const images = page.locator("img");
  for (let index = 0; index < (await images.count()); index += 1) {
    await images.nth(index).scrollIntoViewIfNeeded();
  }

  await expect
    .poll(() =>
      images.evaluateAll((elements) =>
        elements.filter((image) => !image.complete || image.naturalWidth === 0)
          .length,
      ),
    )
    .toBe(0);

  await page.getByLabel("Поиск").fill("Glimmerwyrm");
  await expect(
    page.getByRole("button", { name: "Открыть карточку: Glimmerwyrm" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /^Открыть карточку:/ }),
  ).toHaveCount(1);

  await page
    .getByRole("button", { name: "Открыть карточку: Glimmerwyrm" })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Glimmerwyrm" })).toBeVisible();
  await expect(dialog.getByText("A slow, luminous serpent")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
  expect(requestFailures).toEqual([]);
  expect(errorResponses).toEqual([]);
});
