# Playwright E2E Tests

This directory contains end-to-end tests for the Emoji Mayhem TCG application using Playwright.

## Test Structure

```
tests/
├── helpers/
│   └── test-utils.ts          # Common test utilities and helpers
├── example.spec.ts            # Basic smoke tests
├── game-store.spec.ts         # Tests for game state management
├── card-interactions.spec.ts  # Tests for card UI interactions
├── performance-accessibility.spec.ts  # Performance and accessibility tests
└── README.md                  # This file
```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests with UI mode (recommended for development)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see the browser)
```bash
npm run test:e2e:headed
```

### Debug tests
```bash
npm run test:e2e:debug
```

### View test report
```bash
npm run test:e2e:report
```

### Run specific test file
```bash
npx playwright test tests/game-store.spec.ts
```

### Run tests in specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Categories

### 1. Basic Tests (`example.spec.ts`)
- Application loads successfully
- Main game interface is visible

### 2. Game Store Tests (`game-store.spec.ts`)
- Initial game state display
- Card rolling functionality
- Deck management
- State persistence
- Collection viewing

### 3. Card Interaction Tests (`card-interactions.spec.ts`)
- Card information display
- Hover interactions
- Card selection
- Emoji display
- Passive abilities
- Animations and effects

### 4. Performance & Accessibility Tests (`performance-accessibility.spec.ts`)
- Page load performance
- Network resilience
- Keyboard navigation
- ARIA labels and accessibility
- Responsive design
- Memory management

## Writing New Tests

### Using Test Helpers

The `helpers/test-utils.ts` file provides useful utilities:

```typescript
import { 
  waitForAppLoad,
  getGameState,
  resetGameState,
  checkAccessibility
} from './helpers/test-utils';

test('my test', async ({ page }) => {
  await page.goto('/');
  await waitForAppLoad(page);
  
  const state = await getGameState(page);
  expect(state.coins).toBeGreaterThan(0);
});
```

### Adding Data Test IDs

For better test reliability, add data-testid attributes to your React components:

```tsx
<button data-testid="roll-card">Roll Card</button>
<div data-testid="coins-display">{coins}</div>
```

Then use them in tests:

```typescript
const rollButton = page.locator('[data-testid="roll-card"]');
await rollButton.click();
```

## CI/CD Integration

The project includes a GitHub Actions workflow (`.github/workflows/playwright.yml`) that:
- Runs tests on push to main/master
- Runs tests on pull requests
- Uploads test reports as artifacts

## Best Practices

1. **Use data-testid attributes** for reliable element selection
2. **Wait for network idle** when testing dynamic content
3. **Use page objects** for complex test scenarios
4. **Keep tests independent** - each test should be able to run in isolation
5. **Use beforeEach/afterEach** for setup and cleanup
6. **Mock external APIs** when testing UI behavior
7. **Test user journeys**, not implementation details
8. **Keep tests fast** - use parallelization when possible

## Debugging Tips

1. **Use UI mode** for interactive debugging:
   ```bash
   npm run test:e2e:ui
   ```

2. **Use debug mode** to pause at breakpoints:
   ```bash
   npm run test:e2e:debug
   ```

3. **Take screenshots** on failure (configured automatically)

4. **Use trace viewer** for detailed execution analysis:
   ```bash
   npx playwright show-trace trace.zip
   ```

5. **Run single test** for faster feedback:
   ```typescript
   test.only('specific test', async ({ page }) => {
     // This test will run in isolation
   });
   ```

## Configuration

The Playwright configuration is in `playwright.config.ts`:
- Base URL: http://localhost:3000
- Browsers: Chromium, Firefox, WebKit
- Auto-starts dev server before tests
- Takes screenshots and videos on failure
- Generates HTML reports

## Troubleshooting

### Tests fail with "timeout exceeded"
- Increase timeout in playwright.config.ts
- Check if dev server is running correctly
- Ensure elements have proper selectors

### Tests are flaky
- Add proper wait conditions
- Use `waitForLoadState('networkidle')`
- Avoid hardcoded timeouts

### Can't find elements
- Use Playwright inspector: `npx playwright codegen`
- Check if elements are in shadow DOM
- Verify data-testid attributes

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Assertions](https://playwright.dev/docs/test-assertions)
- [Locators](https://playwright.dev/docs/locators)
