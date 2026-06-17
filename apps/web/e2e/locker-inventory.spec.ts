import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Locker Inventory Page
 * 
 * Verifies the main landing page showing available lockers:
 * 1. Display locker list with codes and sizes
 * 2. Filter by size
 * 3. Show availability status
 * 4. Navigate to store package via header nav
 */

test.describe('Locker Inventory Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display page title and header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Locker Inventory' })).toBeVisible();
  });

  test('should display locker list', async ({ page }) => {
    // Should show lockers grid
    await expect(page.locator('.grid')).toBeVisible();
    
    // Should show availability stats after loading
    await expect(page.getByText(/available/i).first()).toBeVisible();
  });

  test('should show locker details (code, size, status)', async ({ page }) => {
    // Wait for grid to load
    await expect(page.locator('.grid')).toBeVisible({ timeout: 10000 });
    
    // Look for locker code pattern
    await expect(page.getByText(/L-S-\d{3}/).first()).toBeVisible();
    
    // Look for availability indicators
    await expect(page.getByText(/Free|In Use/).first()).toBeVisible();
  });

  test('should have working filter by size', async ({ page }) => {
    // Use the size filter select
    const sizeFilter = page.locator('#size-filter');
    await sizeFilter.selectOption('SMALL');
    
    // Wait for filter to take effect
    await page.waitForTimeout(500);
    
    // Should only show small lockers
    const lockerCodes = await page.locator('text=/L-S-\\d{3}/').count();
    expect(lockerCodes).toBeGreaterThan(0);
    
    // Should not show other sizes
    const otherCodes = await page.locator('text=/L-[ML]-\\d{3}/').count();
    expect(otherCodes).toBe(0);
  });

  test('should navigate to store package page via nav', async ({ page }) => {
    await page.getByRole('link', { name: /Store/ }).click();
    await expect(page.getByRole('heading', { name: 'Store a Package' })).toBeVisible();
  });

  test('should navigate to retrieve package page via nav', async ({ page }) => {
    await page.getByRole('link', { name: /Retrieve/ }).click();
    await expect(page.getByRole('heading', { name: 'Retrieve Package' })).toBeVisible();
  });

  test('should show locker statistics', async ({ page }) => {
    // Should show available/occupied counts
    await expect(page.getByText(/\d+ available/)).toBeVisible();
    await expect(page.getByText(/\d+ occupied/)).toBeVisible();
  });
});
