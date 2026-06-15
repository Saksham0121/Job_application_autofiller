import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Click on Sign In link
    await page.click('text=Sign In');
    
    // Verify we are on login page
    await expect(page).toHaveURL('http://localhost:3000/login');
    await expect(page.locator('h1')).toContainText('Welcome back');
  });

  test('should show error on invalid login', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    await page.fill('#login-email', 'invalid@example.com');
    await page.fill('#login-password', 'wrongpassword');
    await page.click('#login-submit');
    
    // Should show error message (API is not mocked here, so it should fail)
    const errorMsg = page.locator('text=⚠️');
    await expect(errorMsg).toBeVisible({ timeout: 5000 });
  });
});
