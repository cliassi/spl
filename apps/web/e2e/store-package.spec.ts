import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

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

  test.afterEach(() => {
    // Clean up storage assignments to free lockers for next test
    try {
      execSync(
        'docker exec spl-postgres-1 psql -U spl -d smart_package_locker -c "TRUNCATE TABLE storage_assignments, packages RESTART IDENTITY CASCADE;"',
        { stdio: 'pipe', timeout: 5000 }
      );
    } catch {
      // Ignore cleanup errors
    }
  });

  test('should display store package form', async ({ page }) => {
    // Verify page title
    await expect(page.getByRole('heading', { name: 'Store a Package' })).toBeVisible();
    
    // Verify form elements
    await expect(page.getByLabel('Package Reference')).toBeVisible();
    await expect(page.getByText('Package Size')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Store Package' })).toBeVisible();
    
    // Verify size options
    await expect(page.getByText('Small', { exact: true })).toBeVisible();
    await expect(page.getByText('Medium', { exact: true })).toBeVisible();
    await expect(page.getByText('Large', { exact: true })).toBeVisible();
  });

  test('should successfully store a small package', async ({ page }) => {
    // Generate unique reference
    const reference = `TEST-PKG-${Date.now()}`;
    
    // Fill in form
    await page.getByLabel('Package Reference').fill(reference);
    await page.getByText('Small', { exact: true }).click();
    
    // Submit form
    await page.getByRole('button', { name: 'Store Package' }).click();
    
    // Wait for success view
    await expect(page.getByText('Package Stored!')).toBeVisible({ timeout: 10000 });
    
    // Verify success view content - locker code and pickup code are displayed
    await expect(page.getByText('Assigned Locker')).toBeVisible();
    await expect(page.getByText('Pickup Code', { exact: true })).toBeVisible();
    
    // Verify locker code pattern (L-S-XXX, L-M-XXX, or L-L-XXX) appears somewhere on page
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/L-[SML]-\d{3}/);
    
    // Verify pickup code (6-digit number) appears somewhere on page  
    expect(pageContent).toMatch(/\d{6}/);
    
    // Verify warning message about saving pickup code
    await expect(page.getByText(/Save this code now/)).toBeVisible();
  });

  test('should successfully store a medium package', async ({ page }) => {
    const reference = `TEST-MEDIUM-${Date.now()}`;
    
    await page.getByLabel('Package Reference').fill(reference);
    await page.getByText('Medium', { exact: true }).click();
    await page.getByRole('button', { name: 'Store Package' }).click();
    
    await expect(page.getByText('Package Stored!')).toBeVisible({ timeout: 10000 });
  });

  test('should successfully store a large package', async ({ page }) => {
    const reference = `TEST-LARGE-${Date.now()}`;
    
    await page.getByLabel('Package Reference').fill(reference);
    await page.getByText('Large', { exact: true }).click();
    await page.getByRole('button', { name: 'Store Package' }).click();
    
    await expect(page.getByText('Package Stored!')).toBeVisible({ timeout: 10000 });
  });

  test('should disable submit button for empty reference', async ({ page }) => {
    // Verify button is disabled when reference is empty
    const submitButton = page.getByRole('button', { name: 'Store Package' });
    await expect(submitButton).toBeDisabled();
    
    // After filling reference, button should be enabled
    await page.getByLabel('Package Reference').fill('TEST-REF');
    await expect(submitButton).toBeEnabled();
  });

  test('should show error for duplicate package reference', async ({ page }) => {
    const reference = `DUPLICATE-${Date.now()}`;
    
    // Store first package
    await page.getByLabel('Package Reference').fill(reference);
    await page.getByText('Small', { exact: true }).click();
    await page.getByRole('button', { name: 'Store Package' }).click();
    
    // Wait for success
    await expect(page.getByText('Package Stored!')).toBeVisible({ timeout: 10000 });
    
    // Navigate back to store another
    await page.getByRole('button', { name: 'Store Another Package' }).click();
    
    // Try to store same reference again
    await page.getByLabel('Package Reference').fill(reference);
    await page.getByText('Small', { exact: true }).click();
    await page.getByRole('button', { name: 'Store Package' }).click();
    
    // Should show duplicate error
    await expect(page.getByText(/already|duplicate|exists/i)).toBeVisible({ timeout: 10000 });
  });

  test('should have working navigation back to locker inventory', async ({ page }) => {
    // Use nav link to go home
    await page.getByRole('link', { name: /Lockers/ }).click();
    await expect(page.getByRole('heading', { name: 'Locker Inventory' })).toBeVisible();
  });
});
