import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PORT ?? 3100);
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${port}`, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
    // Cross-browser: Safari engine (all iOS browsers use WebKit) and Firefox. Run with --project=iphone / firefox.
    { name: "iphone", use: { ...devices["iPhone 15"] } },
    { name: "ipad", use: { ...devices["iPad (gen 7)"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"], viewport: { width: 1440, height: 900 } } },
    { name: "safari", use: { ...devices["Desktop Safari"], viewport: { width: 1280, height: 800 } } },
  ],
  webServer: { command: `npx next start -p ${port}`, port, reuseExistingServer: true, timeout: 120_000, env: { RATE_LIMIT_OFF: "1" } },
});
