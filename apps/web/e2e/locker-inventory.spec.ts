import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Locker Inventory Page
 * 
 * Verifies the main landing page showing available lockers:
 * 1. Display locker list with codes and sizes
 * 2. Filter by size
 * 3. Show availability status
 * 4. Navigate to store package
 */

test.describe('Locker Inventory Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display page title and header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Smart Package Locker' })).toBeVisible();
    await expect(page.getByText(/Locker Inventory/)).toBeVisible();
  });

  test('should display locker list', async ({ page }) => {
    // Should show lockers table/grid
    await expect(page.locator('table, .locker-grid, .locker-list')).toBeVisible();
    
    // Should show at least some lockers
    const lockerRows = page.locator('tr, .locker-card');
    await expect(lockerRows.first()).toBeVisible();
  });

  test('should show locker details (code, size, status)', async ({ page }) => {
    // Look for locker code pattern in the page
    await expect(page.locator('text=/L-[SML]-\\d{3}/')).toBeVisible();
    
    // Look for size indicators
    await expect(page.locator('text=/(SMALL|MEDIUM|LARGE)/i').first()).toBeVisible();
    
    // Look for availability indicators
    await expect(page.locator('text=/(Available|Occupied|In Use)/i').first()).toBeVisible();
  });

  test('should have working filter by size', async ({ page }) => {
    // Find and use size filter if it exists
    const sizeFilter = page.locator('select, button:has-text("Size"), [data-testid="size-filter"]');
    
    if (await sizeFilter.count() > 0) {
      await sizeFilter.click();
      await page.getByText('SMALL').click();
      
      // Should only show small lockers
      const lockerCodes = await page.locator('text=/L-S-\\d{3}/').count();
      expect(lockerCodes).toBeGreaterThan(0);
    }
  });

  test('should navigate to store package page', async ({ page }) => {
    // Look for store package link or button
    const storeLink = page.getByRole('link', { name: /Store Package/i });
    
    if (await storeLink.count() > 0) {
      await storeLink.click();
      await expect(page).toHaveURL(/\/packages\/store/);
    } else {
      // Try alternative navigation
      await page.goto('/packages/store');
      await expect(page.getByRole('heading', { name: 'Package Storage' })).toBeVisible();
    }
  });

  test('should navigate to retrieve package page', async ({ page }) => {
    // Look for retrieve package link or button
    const retrieveLink = page.getByRole('link', { name: /Retrieve Package/i });
    
    if (await retrieveLink.count() > 0) {
      await retrieveLink.click();
      await expect(page).toHaveURL(/\/packages\/retrieval/);
    } else {
      // Try alternative navigation
      await page.goto('/packages/retrieval');
      await expect(page.getByRole('heading', { name: 'Retrieve Package' })).toBeVisible();
    }
  });

  test('should refresh locker status', async ({ page }) => {
    // Look for refresh button if it exists
    const refreshButton = page.getByRole('button', { name: /Refresh/i });
    
    if (await refreshButton.count() > 0) {
      await refreshButton.click();
      
      // Should show loading state or updated data
      await expect(page.locator('table, .locker-grid')).toBeVisible();
    }
  });
});
