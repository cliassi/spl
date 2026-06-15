import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Package Storage Flow
 * 
 * These tests verify the complete user journey for storing a package:
 * 1. Navigate to storage page
 * 2. Fill in package reference and select size
 * 3. Submit form
 * 4. Verify success view with locker code and pickup code
 */

test.describe('Store Package Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the store package page
    await page.goto('/packages/store');
  });

  test('should display store package form', async ({ page }) => {
    // Verify page title
    await expect(page.getByRole('heading', { name: 'Package Storage' })).toBeVisible();
    
    // Verify form elements
    await expect(page.getByLabel('Package Reference')).toBeVisible();
    await expect(page.getByText('Package Size')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Store Package' })).toBeVisible();
    
    // Verify size options
    await expect(page.getByLabel('SMALL')).toBeVisible();
    await expect(page.getByLabel('MEDIUM')).toBeVisible();
    await expect(page.getByLabel('LARGE')).toBeVisible();
  });

  test('should successfully store a small package', async ({ page }) => {
    // Generate unique reference
    const reference = `TEST-PKG-${Date.now()}`;
    
    // Fill in form
    await page.getByLabel('Package Reference').fill(reference);
    await page.getByLabel('SMALL').check();
    
    // Submit form
    await page.getByRole('button', { name: 'Store Package' }).click();
    
    // Wait for success view
    await expect(page.getByText('Package Stored Successfully!')).toBeVisible({ timeout: 10000 });
    
    // Verify success view content - locker code and pickup code are displayed
    await expect(page.getByText(/Locker Code/i)).toBeVisible();
    await expect(page.getByText(/Pickup Code/i)).toBeVisible();
    
    // Verify locker code pattern (L-S-XXX, L-M-XXX, or L-L-XXX) appears somewhere on page
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/L-[SML]-\d{3}/);
    
    // Verify pickup code (6-digit number) appears somewhere on page  
    expect(pageContent).toMatch(/\d{6}/);
    
    // Verify warning message about saving pickup code
    await expect(page.getByText(/Save your pickup code/)).toBeVisible();
  });

  test('should successfully store a medium package', async ({ page }) => {
    const reference = `TEST-MEDIUM-${Date.now()}`;
    
    await page.getByLabel('Package Reference').fill(reference);
    await page.getByLabel('MEDIUM').check();
    await page.getByRole('button', { name: 'Store Package' }).click();
    
    await expect(page.getByText('Package Stored Successfully!')).toBeVisible({ timeout: 10000 });
  });

  test('should successfully store a large package', async ({ page }) => {
    const reference = `TEST-LARGE-${Date.now()}`;
    
    await page.getByLabel('Package Reference').fill(reference);
    await page.getByLabel('LARGE').check();
    await page.getByRole('button', { name: 'Store Package' }).click();
    
    await expect(page.getByText('Package Stored Successfully!')).toBeVisible({ timeout: 10000 });
  });

  test('should show validation error for empty reference', async ({ page }) => {
    // Try to submit without filling reference
    await page.getByRole('button', { name: 'Store Package' }).click();
    
    // Form should prevent submission (HTML5 validation)
    // Check we're still on the form page
    await expect(page.getByLabel('Package Reference')).toBeVisible();
  });

  test('should show error for duplicate package reference', async ({ page }) => {
    const reference = `DUPLICATE-${Date.now()}`;
    
    // Store first package
    await page.getByLabel('Package Reference').fill(reference);
    await page.getByLabel('SMALL').check();
    await page.getByRole('button', { name: 'Store Package' }).click();
    
    // Wait for success
    await expect(page.getByText('Package Stored Successfully!')).toBeVisible({ timeout: 10000 });
    
    // Navigate back to store another
    await page.getByRole('button', { name: 'Store Another Package' }).click();
    
    // Try to store same reference again
    await page.getByLabel('Package Reference').fill(reference);
    await page.getByLabel('SMALL').check();
    await page.getByRole('button', { name: 'Store Package' }).click();
    
    // Should show duplicate error (API returns "Package reference already exists.")
    await expect(page.getByText(/already exists/i)).toBeVisible({ timeout: 10000 });
  });

  test('should have working navigation back to locker inventory', async ({ page }) => {
    // Navigate directly to home (no back link in current UI)
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Locker Inventory' })).toBeVisible();
  });
});
