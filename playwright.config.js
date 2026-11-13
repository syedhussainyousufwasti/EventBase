// ============================================================
//  Features: Allure Reporting, HTML Report, Screenshots,
//            Video on Failure, Retry, Multi-project ready
// ============================================================

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // ── Test discovery ────────────────────────────────────────
  testDir: './tests',

  // ── Global timeouts ───────────────────────────────────────
  timeout:           30_000,   // per-test timeout
  expect:            { timeout: 10_000 },

  // ── Execution ─────────────────────────────────────────────
  retries:           1,
  workers:           1,        // serial for state consistency
  fullyParallel:     false,

  // ── Reporters ─────────────────────────────────────────────
  reporter: [
    ['list'],
    ['allure-playwright', {
      detail:       true,
      outputFolder: 'allure-results',
      suiteTitle:   true,
    }],
    ['html', {
      outputFolder: 'reports/html-report',
      open:         'never',
    }],
  ],

  // ── Shared browser settings ───────────────────────────────
  use: {
    baseURL:      'http://localhost:5173',
    headless:     true,
    viewport:     { width: 1280, height: 720 },

    // Screenshots
    screenshot:   'on',          // ← always capture (Allure attach karein)

    // Video
    video:        'retain-on-failure',

    // Traces (Allure timeline ke liye)
    trace:        'retain-on-failure',

    // Slow down for visibility in headed mode
    // actionTimeout: 8000,
  },

  // ── Output folders ────────────────────────────────────────
  outputDir: 'screenshots/',

  // ── Projects (browsers) ───────────────────────────────────
  projects: [
    {
      name: 'chromium',
      use:  { ...devices['Desktop Chrome'] },
    },
    // Uncomment to run on Firefox / WebKit:
    // {
    //   name: 'firefox',
    //   use:  { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use:  { ...devices['Desktop Safari'] },
    // },
  ],
});
