# EventBase — Playwright Automation Suite

**Author:** Arbaaz ,syed Hussain | **Project:** EventBase

---

## 📁 Project Structure

```
eventbase-tests/
├── playwright.config.js          ← Main config (Allure + HTML reporter)
├── package.json
├── tests/
│   ├── fixtures/
│   │   └── hooks.js              ← Custom fixtures (page objects auto-inject)
│   ├── pages/
│   │   ├── BasePage.js           ← Base class (screenshot + Allure helpers)
│   │   ├── LoginPage.js
│   │   ├── SignupPage.js
│   │   ├── NavbarPage.js
│   │   ├── EventsPage.js
│   │   ├── CreateEventPage.js
│   │   ├── ManagerPage.js
│   │   └── UserDashboardPage.js
│   ├── login/
│   │   └── login.test.js         ← TC-01 to TC-10
│   ├── signup/
│   │   └── signup.test.js        ← TC-11 to TC-17
│   ├── events/
│   │   └── events.test.js        ← TC-18 to TC-26
│   ├── booking/
│   │   └── booking.test.js       ← TC-27 to TC-34
│   ├── manager/
│   │   └── manager.test.js       ← TC-35 to TC-41
│   ├── navigation/
│   │   └── navigation.test.js    ← TC-42 to TC-45
│   ├── data/
│   │   ├── loginData.json
│   │   ├── signupData.json
│   │   └── eventData.json
│   └── utils/
│       ├── logger.js
│       ├── dataParser.js
│       ├── screenshotHelper.js
│       └── waitHelper.js
```

---

## 🚀 Setup

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers
npx playwright install chromium

# 3. Install Allure CLI (one-time global install)
npm install -g allure-commandline
```

---

## ▶️ Running Tests

```bash
# Run all tests
npm test

# Run a specific suite
npm run test:login
npm run test:signup
npm run test:events
npm run test:booking
npm run test:manager
npm run test:navigation
```

---

## 📊 Viewing Reports

### Allure Report (recommended)
```bash
npm run report:allure
# Opens interactive Allure report in browser
```

### HTML Report (Playwright built-in)
```bash
npm run report:html
```

### Log File
```
tests/reports/test-run.log
```

---

## 🧩 Allure Features Used

| Feature            | Where Used                        |
|--------------------|-----------------------------------|
| `allure.suite()`   | Every test describe block         |
| `allure.feature()` | Every test describe block         |
| `allure.story()`   | Every individual test             |
| `allure.severity()`| Every individual test             |
| `allure.description()` | Every individual test         |
| `allure.step()`    | Every assertion wrapped           |
| `allure.parameter()` | Data-driven tests (TC-26, TC-40) |
| `allure.attachment()` | Screenshots via BasePage       |

---

## 📸 Screenshot Strategy

- **Every page load** — BasePage `navigate()` auto-takes screenshot via `allureStep()`
- **After every major step** — `allureStep()` takes screenshot and attaches to Allure
- **On failure** — `screenshotOnFailure()` in `afterEach` saves `FAIL_<testname>.png`
- All screenshots → `tests/screenshots/`
- All screenshots → attached in Allure report under that step

---

## 📦 Test Counts

| Suite       | TCs         | Count |
|-------------|-------------|-------|
| Login       | TC-01 → 10  | 10    |
| Signup      | TC-11 → 17  | 7     |
| Events      | TC-18 → 26  | 9     |
| Booking     | TC-27 → 34  | 8     |
| Manager     | TC-35 → 41  | 7     |
| Navigation  | TC-42 → 45  | 4     |
| **Total**   |             | **45**|
