const { test, expect } = require('@playwright/test');

test.describe('Calculator E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#display');
  });

  test('displays initial state correctly', async ({ page }) => {
    await expect(page.locator('#display')).toHaveText('0');
    await expect(page.locator('#expression')).toHaveText('');
  });

  test('performs addition', async ({ page }) => {
    await page.click('[data-digit="5"]');
    await page.click('[data-action="operator"][data-op="add"]');
    await page.click('[data-digit="3"]');
    await page.click('[data-action="equals"]');

    await expect(page.locator('#display')).toHaveText('8', { timeout: 10000 });
  });

  test('performs subtraction', async ({ page }) => {
    await page.click('[data-digit="9"]');
    await page.click('[data-action="operator"][data-op="subtract"]');
    await page.click('[data-digit="4"]');
    await page.click('[data-action="equals"]');

    await expect(page.locator('#display')).toHaveText('5', { timeout: 10000 });
  });

  test('performs multiplication', async ({ page }) => {
    await page.click('[data-digit="6"]');
    await page.click('[data-action="operator"][data-op="multiply"]');
    await page.click('[data-digit="7"]');
    await page.click('[data-action="equals"]');

    await expect(page.locator('#display')).toHaveText('42', { timeout: 10000 });
  });

  test('performs division', async ({ page }) => {
    await page.click('[data-digit="8"]');
    await page.click('[data-action="operator"][data-op="divide"]');
    await page.click('[data-digit="2"]');
    await page.click('[data-action="equals"]');

    await expect(page.locator('#display')).toHaveText('4', { timeout: 10000 });
  });

  test('handles division by zero', async ({ page }) => {
    await page.click('[data-digit="5"]');
    await page.click('[data-action="operator"][data-op="divide"]');
    await page.click('[data-digit="0"]');
    await page.click('[data-action="equals"]');

    await expect(page.locator('#display')).toHaveText(/Division by zero/i, { timeout: 10000 });
  });

  test('clears display with C button', async ({ page }) => {
    await page.click('[data-digit="7"]');
    await page.click('[data-action="clear"]');

    await expect(page.locator('#display')).toHaveText('0');
  });

  test('clears entry with CE button', async ({ page }) => {
    await page.click('[data-digit="5"]');
    await page.click('[data-action="clear-entry"]');

    await expect(page.locator('#display')).toHaveText('0');
  });

  test('inputs decimal number', async ({ page }) => {
    await page.click('[data-digit="3"]');
    await page.click('[data-action="decimal"]');
    await page.click('[data-digit="1"]');
    await page.click('[data-digit="4"]');

    await expect(page.locator('#display')).toHaveText('3.14');
  });

  test('toggles sign', async ({ page }) => {
    await page.click('[data-digit="5"]');
    await page.click('[data-action="sign"]');

    await expect(page.locator('#display')).toHaveText('-5');
  });

  test('applies percentage', async ({ page }) => {
    await page.click('[data-digit="5"]');
    await page.click('[data-digit="0"]');
    await page.click('[data-action="percent"]');

    await expect(page.locator('#display')).toHaveText('0.5');
  });

  test('chained operations work correctly', async ({ page }) => {
    await page.click('[data-digit="2"]');
    await page.click('[data-action="operator"][data-op="add"]');
    await page.click('[data-digit="3"]');
    await page.click('[data-action="operator"][data-op="multiply"]');
    await page.waitForSelector('#display:not(.is-busy)', { timeout: 10000 });
    await page.click('[data-digit="4"]');
    await page.click('[data-action="equals"]');

    await expect(page.locator('#display')).toHaveText('20', { timeout: 10000 });
  });

  test('keyboard input works', async ({ page }) => {
    await page.keyboard.press('5');
    await page.keyboard.press('+');
    await page.keyboard.press('3');
    await page.keyboard.press('Enter');

    await expect(page.locator('#display')).toHaveText('8', { timeout: 10000 });
  });

  test('backspace via keyboard removes last digit', async ({ page }) => {
    await page.keyboard.press('1');
    await page.keyboard.press('2');
    await page.keyboard.press('3');
    await page.keyboard.press('Backspace');

    await expect(page.locator('#display')).toHaveText('12');
  });
});
