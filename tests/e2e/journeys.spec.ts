import { expect, test, type Page } from "@playwright/test";

const errors: string[] = [];
// WebKit reports Next.js prefetches (?_rsc=) aborted by a navigation as "access control checks" errors. Harmless; nothing else is ignored.
const ABORTED_PREFETCH = /\?_rsc=\S+ due to access control checks/;
test.beforeEach(async ({ page }) => {
  errors.length = 0;
  page.on("pageerror", (e) => !ABORTED_PREFETCH.test(e.message) && errors.push(e.message));
  page.on("console", (m) => {
    // OSM tile requests can fail offline; everything else is an error.
    if (m.type() === "error" && !/tile\.openstreetmap|Failed to load resource/.test(m.text()) && !ABORTED_PREFETCH.test(m.text())) errors.push(m.text());
  });
});
test.afterEach(() => expect(errors, errors.join("\n")).toEqual([]));

async function onboard(page: Page, budget = "25000") {
  await page.goto("/onboarding");
  await expect(page.getByRole("heading", { name: "Where are you moving?" })).toBeVisible();
  await page.getByRole("button", { name: /Continue/ }).click();
  await expect(page.getByRole("heading", { name: "Where will you work?" })).toBeVisible();
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByRole("button", { name: /Continue/ }).click(); // date default
  await page.getByLabel("Or type an amount (₹)").fill(budget);
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByRole("button", { name: "Save money" }).click();
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByRole("button", { name: "Laundry" }).click();
  await page.getByRole("button", { name: /Generate my plan/ }).click();
  await expect(page.getByText("Building your settling plan")).toBeVisible();
  await page.waitForURL("**/dashboard");
}

test("home renders hero, CTAs and sections without horizontal overflow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Everything sorted.");
  await expect(page.getByRole("link", { name: /Start Settling/ })).toHaveAttribute("href", "/onboarding");
  await expect(page.getByRole("heading", { name: /Three steps/ })).toBeAttached();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("onboarding validates and produces a dashboard plan", async ({ page }) => {
  await page.goto("/onboarding");
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByLabel("Or type an amount (₹)").fill("100");
  await page.getByRole("button", { name: /Continue/ }).click();
  await expect(page.getByText(/budget between ₹5,000/)).toBeVisible();
  await onboard(page);
  await expect(page.getByRole("heading", { name: "Welcome to your new beginning." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "See how Settlr works" })).toBeVisible();
  const video = page.locator("video");
  await expect(video).toHaveAttribute("poster", "/video/settlr-explainer-poster.jpg");
  expect(await video.evaluate((v: HTMLVideoElement) => v.autoplay)).toBe(false);
  await expect(page.getByText("Hinjewadi Phase 1").first()).toBeVisible();
});

test("explore: filter, save/unsave, compare and inquire", async ({ page, isMobile }) => {
  await onboard(page);
  await page.goto("/explore/accommodation");
  const count = page.getByTestId("result-count");
  await expect(count).toBeVisible();
  const total = Number((await count.textContent())!.match(/\d+/)![0]);
  if (isMobile) await page.getByRole("button", { name: /^Filters/ }).click();
  const scope = isMobile ? page.getByRole("dialog") : page.getByRole("complementary", { name: "Filters" });
  await scope.getByRole("button", { name: "Wakad" }).click();
  if (isMobile) await page.getByRole("button", { name: /Show \d+ results/ }).click();
  await expect(count).not.toHaveText(new RegExp(`^${total} `));
  const filtered = Number((await count.textContent())!.match(/\d+/)![0]);
  expect(filtered).toBeLessThan(total);
  const cards = page.locator("article");
  await expect(cards.first()).toContainText("Wakad");

  const save = cards.first().getByRole("button", { name: /^Save / });
  await save.click();
  await expect(cards.first().getByRole("button", { name: /Remove .* from saved/ })).toHaveAttribute("aria-pressed", "true");
  await page.goto("/saved");
  await expect(page.locator("article")).toHaveCount(1);
  await page.locator("article").first().getByRole("button", { name: /Remove .* from saved/ }).click();
  await expect(page.getByText("Nothing saved yet")).toBeVisible();

  await page.goto("/explore/accommodation");
  await page.locator("article").nth(0).getByRole("button", { name: "Compare" }).click();
  await page.locator("article").nth(1).getByRole("button", { name: "Compare" }).click();
  await page.getByRole("link", { name: "Compare", exact: true }).click();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByRole("rowheader", { name: "Monthly" })).toBeVisible();

  await page.goto("/explore/food");
  await page.locator("article").first().getByRole("button", { name: "Inquire" }).click();
  const dlg = page.getByRole("dialog");
  await dlg.getByRole("button", { name: "Send inquiry" }).click();
  await expect(dlg.getByText(/Enter a valid email/)).toBeVisible(); // server-side validation
  await dlg.getByLabel("Your name").fill("Asha");
  await dlg.getByLabel("Email").fill("asha@example.com");
  await dlg.getByRole("button", { name: "Send inquiry" }).click();
  await expect(dlg.getByText("Inquiry recorded")).toBeVisible();
  await expect(dlg.getByText(/not sent to anyone/)).toBeVisible();
});

test("plan replacement recalculates budget; checklist add/check/delete persists", async ({ page }) => {
  await onboard(page);
  await page.goto("/budget");
  const total = page.locator("tfoot td").last();
  const before = await total.textContent();
  await page.goto("/my-plan");
  const stay = page.getByLabel("Replace Stay");
  const last = await stay.evaluate((s: HTMLSelectElement) => s.options[s.options.length - 1].value);
  await stay.selectOption(last);
  await expect(page.getByText("Your pick").first()).toBeVisible();
  await page.goto("/budget");
  await expect(total).not.toHaveText(before!);

  await page.goto("/checklist");
  await expect(page.getByText(/of \d+ tasks done/)).toBeVisible();
  await page.getByLabel("Task", { exact: true }).fill("Buy a pressure cooker");
  await page.getByRole("button", { name: "Add task" }).click();
  await expect(page.getByText("Buy a pressure cooker")).toBeVisible();
  await page.getByLabel('Mark "Buy a pressure cooker" done').check();
  await page.reload();
  await expect(page.getByLabel('Mark "Buy a pressure cooker" not done')).toBeChecked();
  await page.getByRole("button", { name: 'Delete "Buy a pressure cooker"' }).click();
  await expect(page.getByText("Buy a pressure cooker")).toHaveCount(0);
});

test("commute estimates are labelled as estimates", async ({ page }) => {
  await page.goto("/explore/transport");
  await expect(page.getByText(/Estimated road distance/)).toBeVisible();
  await expect(page.getByText(/Method:/).first()).toBeVisible();
});

test("admin and auth are honest in demo mode", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByText(/requires a configured backend/i)).toBeVisible();
  await page.goto("/login");
  await expect(page.getByText(/Accounts aren.t enabled/)).toBeVisible();
});

test("provider application validates", async ({ page }) => {
  await page.goto("/provider/apply");
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(page.getByText("Please fix the highlighted fields.")).toBeVisible();
  await page.getByLabel("Business name").fill("Test Tiffins");
  await page.getByLabel("Contact person").fill("Ravi");
  await page.getByLabel("Phone").fill("+91 98765 43210");
  await page.getByLabel("Email").fill("ravi@example.com");
  await page.getByLabel(/Services offered/).fill("Veg lunch and dinner, delivered");
  await page.getByLabel(/Pricing details/).fill("₹3,200/month");
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(page.getByText("Application received")).toBeVisible();
});

test("footer links resolve", async ({ page, request }) => {
  await page.goto("/");
  const hrefs = await page.locator("footer a[href^='/']").evaluateAll((as) => as.map((a) => a.getAttribute("href")!));
  for (const h of new Set(hrefs)) expect((await request.get(h)).status(), h).toBe(200);
});
