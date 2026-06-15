import { test, expect, APIRequestContext } from '@playwright/test';

/**
 * E2E Tests for Package Retrieval Flow
 * 
 * These tests verify the complete user journey for retrieving a package:
 * 1. Set up: Store a package via API (prerequisite)
 * 2. Navigate to retrieval page
 * 3. Enter locker code and pickup code
 * 4. Submit form
 * 5. Verify success view with package details and charges
 */

// Helper to store a package via API
async function storePackageViaAPI(
  apiContext: APIRequestContext,
  reference: string,
  size: 'SMALL' | 'MEDIUM' | 'LARGE'
): Promise<{ lockerCode: string; pickupCode: string }> {
  const response = await apiContext.post('/api/v1/packages', {
    data: { reference, size },
  });
  
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  
  return {
    lockerCode: data.lockerCode,
    pickupCode: data.pickupCode,
  };
}

test.describe('Retrieve Package Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the retrieve package page
    await page.goto('/packages/retrieval');
  });

  test('should display retrieve package form', async ({ page }) => {
    // Verify page title
    await expect(page.getByRole('heading', { name: 'Retrieve Package' })).toBeVisible();
    
    // Verify form elements
    await expect(page.getByLabel('Locker Code')).toBeVisible();
    await expect(page.getByLabel('Pickup Code')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retrieve Package' })).toBeVisible();
    
    // Verify helper text
    await expect(page.getByText(/Enter your locker code and pickup code/)).toBeVisible();
  });

  test('should successfully retrieve a package', async ({ page, request }) => {
    // Setup: Store a package via API
    const reference = `RETRIEVE-${Date.now()}`;
    const { lockerCode, pickupCode } = await storePackageViaAPI(request, reference, 'SMALL');
    
    // Navigate to retrieval page
    await page.goto('/packages/retrieval');
    
    // Fill in form
    await page.getByLabel('Locker Code').fill(lockerCode);
    await page.getByLabel('Pickup Code').fill(pickupCode);
    
    // Submit form
    await page.getByRole('button', { name: 'Retrieve Package' }).click();
    
    // Wait for success view
    await expect(page.getByText('Package Retrieved!')).toBeVisible({ timeout: 10000 });
    
    // Verify success view content
    await expect(page.getByText(/Package Reference:/)).toBeVisible();
    await expect(page.getByText(reference)).toBeVisible();
    await expect(page.getByText(/Locker:/)).toBeVisible();
    await expect(page.getByText(/Storage Duration:/)).toBeVisible();
    await expect(page.getByText(/Storage Charge:/)).toBeVisible();
    
    // Verify retrieved timestamp is shown
    await expect(page.getByText(/Retrieved at:/)).toBeVisible();
  });

  test('should show FREE for packages within grace period', async ({ page, request }) => {
    // Setup: Store and immediately retrieve a package
    const reference = `FREE-TEST-${Date.now()}`;
    const { lockerCode, pickupCode } = await storePackageViaAPI(request, reference, 'SMALL');
    
    await page.goto('/packages/retrieval');
    await page.getByLabel('Locker Code').fill(lockerCode);
    await page.getByLabel('Pickup Code').fill(pickupCode);
    await page.getByRole('button', { name: 'Retrieve Package' }).click();
    
    // Should show FREE for immediate retrieval (within 24h grace period)
    await expect(page.getByText('Package Retrieved!')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/FREE|\\$0\.00/)).toBeVisible();
  });

  test('should show generic error for invalid pickup code', async ({ page }) => {
    // Try to retrieve with invalid codes
    await page.getByLabel('Locker Code').fill('L-M-001');
    await page.getByLabel('Pickup Code').fill('999999');
    await page.getByRole('button', { name: 'Retrieve Package' }).click();
    
    // Should show generic error (security: don't reveal if code was ever valid)
    await expect(page.getByText(/Invalid pickup code or locker code\./)).toBeVisible({ timeout: 10000 });
    
    // Should NOT show specific error like "Package already retrieved"
    await expect(page.getByText(/already retrieved/i)).not.toBeVisible();
    await expect(page.getByText(/locker not found/i)).not.toBeVisible();
  });

  test('should show generic error for already retrieved package', async ({ page, request }) => {
    // Setup: Store and retrieve a package
    const reference = `ALREADY-RETRIEVED-${Date.now()}`;
    const { lockerCode, pickupCode } = await storePackageViaAPI(request, reference, 'SMALL');
    
    // First retrieval
    await page.goto('/packages/retrieval');
    await page.getByLabel('Locker Code').fill(lockerCode);
    await page.getByLabel('Pickup Code').fill(pickupCode);
    await page.getByRole('button', { name: 'Retrieve Package' }).click();
    await expect(page.getByText('Package Retrieved!')).toBeVisible({ timeout: 10000 });
    
    // Try to retrieve again
    await page.getByRole('button', { name: 'Retrieve Another' }).click();
    await page.getByLabel('Locker Code').fill(lockerCode);
    await page.getByLabel('Pickup Code').fill(pickupCode);
    await page.getByRole('button', { name: 'Retrieve Package' }).click();
    
    // Should still show generic error (security)
    await expect(page.getByText(/Invalid pickup code or locker code\./)).toBeVisible({ timeout: 10000 });
  });

  test('should show generic error for non-existent locker', async ({ page }) => {
    await page.getByLabel('Locker Code').fill('L-X-999');
    await page.getByLabel('Pickup Code').fill('123456');
    await page.getByRole('button', { name: 'Retrieve Package' }).click();
    
    // Should show generic error (security: don't reveal locker doesn't exist)
    await expect(page.getByText(/Invalid pickup code or locker code\./)).toBeVisible({ timeout: 10000 });
  });

  test('should have working "Retrieve Another" button', async ({ page, request }) => {
    // Setup: Store a package
    const reference = `ANOTHER-${Date.now()}`;
    const { lockerCode, pickupCode } = await storePackageViaAPI(request, reference, 'SMALL');
    
    // Retrieve it
    await page.goto('/packages/retrieval');
    await page.getByLabel('Locker Code').fill(lockerCode);
    await page.getByLabel('Pickup Code').fill(pickupCode);
    await page.getByRole('button', { name: 'Retrieve Package' }).click();
    await expect(page.getByText('Package Retrieved!')).toBeVisible({ timeout: 10000 });
    
    // Click "Retrieve Another"
    await page.getByRole('button', { name: 'Retrieve Another' }).click();
    
    // Should be back on form
    await expect(page.getByLabel('Locker Code')).toHaveValue('');
    await expect(page.getByLabel('Pickup Code')).toHaveValue('');
    await expect(page.getByRole('button', { name: 'Retrieve Package' })).toBeVisible();
  });

  test('should have working navigation to Done button', async ({ page, request }) => {
    // Setup: Store and retrieve a package
    const reference = `DONE-TEST-${Date.now()}`;
    const { lockerCode, pickupCode } = await storePackageViaAPI(request, reference, 'SMALL');
    
    await page.goto('/packages/retrieval');
    await page.getByLabel('Locker Code').fill(lockerCode);
    await page.getByLabel('Pickup Code').fill(pickupCode);
    await page.getByRole('button', { name: 'Retrieve Package' }).click();
    await expect(page.getByText('Package Retrieved!')).toBeVisible({ timeout: 10000 });
    
    // Click "Done" button
    await page.getByRole('button', { name: 'Done' }).click();
    
    // Should navigate to home
    await expect(page).toHaveURL('/');
  });
});
