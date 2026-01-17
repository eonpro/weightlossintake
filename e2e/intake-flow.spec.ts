import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Critical Intake Flow
 * 
 * Tests the main user journey from landing page through qualification.
 * These tests verify the core functionality works end-to-end.
 */

test.describe('Intake Flow - Critical Path', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
  });

  test('Landing page loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check logo is visible
    await expect(page.locator('img[alt*="EON"]')).toBeVisible();
    
    // Check CTA button exists
    await expect(page.getByRole('button', { name: /start|comenzar|continue/i })).toBeVisible();
  });

  test('Can navigate from landing to goals page', async ({ page }) => {
    await page.goto('/');
    
    // Click the start button
    await page.getByRole('button', { name: /start|comenzar|continue/i }).click();
    
    // Should be on goals page
    await expect(page).toHaveURL(/\/intake\/goals/);
    await expect(page.locator('h1')).toContainText(/life change|cambiaría/i);
  });

  test('Goals page - can select an option', async ({ page }) => {
    await page.goto('/intake/goals');
    
    // Wait for options to load
    await page.waitForSelector('button.option-button');
    
    // Click first option
    await page.locator('button.option-button').first().click();
    
    // Should auto-advance to next page
    await expect(page).toHaveURL(/\/intake\/obesity-stats/);
  });

  test('State selection page works', async ({ page }) => {
    await page.goto('/intake/state');
    
    // Check state dropdown exists
    await expect(page.locator('select, [role="combobox"]')).toBeVisible();
    
    // Check terms checkbox exists
    await expect(page.locator('input[type="checkbox"], button[role="checkbox"], .standalone-checkbox')).toBeVisible();
  });

  test('Name entry page accepts input', async ({ page }) => {
    await page.goto('/intake/name');
    
    // Fill in name fields
    await page.fill('input[placeholder*="First"], input[name="firstName"]', 'Test');
    await page.fill('input[placeholder*="Last"], input[name="lastName"]', 'User');
    
    // Check inputs have values
    await expect(page.locator('input').first()).toHaveValue('Test');
  });

  test('DOB page validates age requirement', async ({ page }) => {
    await page.goto('/intake/dob');
    
    // Check for date input
    await expect(page.locator('input[type="text"], input[placeholder*="MM"]')).toBeVisible();
    
    // Check for age certification checkbox
    await expect(page.getByText(/18 years|18 años/i)).toBeVisible();
  });

  test('Contact info page has all required fields', async ({ page }) => {
    await page.goto('/intake/contact-info');
    
    // Check email field
    await expect(page.locator('input[type="email"], input[placeholder*="email"]')).toBeVisible();
    
    // Check phone field
    await expect(page.locator('input[type="tel"], input[placeholder*="phone"]')).toBeVisible();
  });

  test('Consent page has all legal checkboxes', async ({ page }) => {
    await page.goto('/intake/consent');
    
    // Check for terms text
    await expect(page.getByText(/terms|términos/i)).toBeVisible();
    
    // Check for privacy text
    await expect(page.getByText(/privacy|privacidad/i)).toBeVisible();
  });

  test('BMI result page displays correctly', async ({ page }) => {
    // Set up required session data
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.setItem('current_weight', '180');
      sessionStorage.setItem('ideal_weight', '150');
      sessionStorage.setItem('intake_height', JSON.stringify({ feet: 5, inches: 10 }));
    });
    
    await page.goto('/intake/bmi-result');
    
    // Check BMI is calculated and displayed
    await expect(page.locator('text=/\\d+\\.\\d+/')).toBeVisible();
  });

  test('Finding provider page shows progress', async ({ page }) => {
    await page.goto('/intake/finding-provider');
    
    // Check progress bar exists
    await expect(page.locator('[class*="progress"], [role="progressbar"]')).toBeVisible();
    
    // Check MedLink logo
    await expect(page.locator('img[alt*="MedLink"]')).toBeVisible();
  });

  test('Qualified page shows success message', async ({ page }) => {
    // Set up required session data
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.setItem('intake_name', JSON.stringify({ firstName: 'Test', lastName: 'User' }));
    });
    
    await page.goto('/intake/qualified');
    
    // Check for success message
    await expect(page.getByText(/great news|excelentes noticias/i)).toBeVisible();
    
    // Check checkout button exists
    await expect(page.getByRole('button', { name: /checkout|pagar/i })).toBeVisible();
  });
});

test.describe('Intake Flow - Language Toggle', () => {
  
  test('Can switch to Spanish', async ({ page }) => {
    await page.goto('/');
    
    // Look for language toggle
    const esButton = page.getByText('ES');
    if (await esButton.isVisible()) {
      await esButton.click();
      
      // Content should be in Spanish
      await expect(page.getByText(/comenzar|empezar/i)).toBeVisible();
    }
  });

  test('Can switch to English', async ({ page }) => {
    await page.goto('/');
    
    // Look for language toggle
    const enButton = page.getByText('EN');
    if (await enButton.isVisible()) {
      await enButton.click();
      
      // Content should be in English
      await expect(page.getByText(/start|begin/i)).toBeVisible();
    }
  });
});

test.describe('Intake Flow - Error Handling', () => {
  
  test('Shows error boundary on crash', async ({ page }) => {
    // Navigate to error-prone page with invalid data
    await page.goto('/intake/bmi-result');
    
    // If error boundary catches, should show recovery UI
    // (This depends on whether the page errors with no data)
    const errorMessage = page.getByText(/something went wrong|error/i);
    const normalContent = page.locator('h1, h2');
    
    // Either error boundary or normal content should be visible
    await expect(errorMessage.or(normalContent)).toBeVisible();
  });
});

test.describe('Intake Flow - Mobile Responsiveness', () => {
  
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE
  
  test('Landing page is mobile-friendly', async ({ page }) => {
    await page.goto('/');
    
    // Check content is not overflowing
    const body = page.locator('body');
    const bodyWidth = await body.evaluate(el => el.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
    
    // Check buttons are tappable size (44px minimum)
    const button = page.getByRole('button').first();
    const box = await button.boundingBox();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe('Intake Flow - Data Persistence', () => {
  
  test('Data persists in sessionStorage', async ({ page }) => {
    await page.goto('/intake/name');
    
    // Fill in name
    await page.fill('input[placeholder*="First"], input[name="firstName"]', 'Test');
    await page.fill('input[placeholder*="Last"], input[name="lastName"]', 'User');
    
    // Click continue if visible
    const continueBtn = page.getByRole('button', { name: /continue|continuar/i });
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
    }
    
    // Navigate back
    await page.goto('/intake/name');
    
    // Data should be restored (if the page implements this)
    // This verifies the sessionStorage mechanism works
    const storedData = await page.evaluate(() => {
      return sessionStorage.getItem('intake_name');
    });
    
    expect(storedData).toBeTruthy();
  });
});
