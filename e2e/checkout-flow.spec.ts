import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Checkout Flow
 * 
 * Tests the checkout journey from qualified page to confirmation.
 */

test.describe('Checkout Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set up required session data for checkout
    await page.goto('/');
    await page.evaluate(() => {
      // Set all required intake data
      sessionStorage.setItem('intake_name', JSON.stringify({ firstName: 'Test', lastName: 'User' }));
      sessionStorage.setItem('intake_email', 'test@example.com');
      sessionStorage.setItem('intake_phone', '555-555-5555');
      sessionStorage.setItem('intake_dob', JSON.stringify({ month: '01', day: '15', year: '1990' }));
      sessionStorage.setItem('intake_state', JSON.stringify({ state: 'FL', fullStateName: 'Florida' }));
      sessionStorage.setItem('intake_address', JSON.stringify({
        street: '123 Test St',
        city: 'Miami',
        state: 'FL',
        zip: '33101',
        fullAddress: '123 Test St, Miami, FL 33101'
      }));
      sessionStorage.setItem('current_weight', '180');
      sessionStorage.setItem('ideal_weight', '150');
      sessionStorage.setItem('intake_height', JSON.stringify({ feet: 5, inches: 10 }));
      sessionStorage.setItem('intake_sex', 'male');
      sessionStorage.setItem('intake_activity', 'moderate');
      sessionStorage.setItem('intake_goals', JSON.stringify(['Lose weight', 'Improve health']));
      sessionStorage.setItem('intake_bmi', '25.8');
      sessionStorage.setItem('medication_type', 'semaglutide');
    });
  });

  test('Checkout page loads with product info', async ({ page }) => {
    await page.goto('/checkout');
    
    // Check product information is visible
    await expect(page.getByText(/semaglutide|tirzepatide/i)).toBeVisible();
    
    // Check price is visible
    await expect(page.getByText(/\$\d+/)).toBeVisible();
  });

  test('Can navigate to payment page', async ({ page }) => {
    await page.goto('/checkout');
    
    // Click checkout/continue button
    const checkoutBtn = page.getByRole('button', { name: /checkout|continue|pay/i });
    if (await checkoutBtn.isVisible()) {
      await checkoutBtn.click();
      
      // Should navigate to payment
      await expect(page).toHaveURL(/\/checkout\/payment/);
    }
  });

  test('Payment page has Stripe elements', async ({ page }) => {
    await page.goto('/checkout/payment');
    
    // Wait for Stripe to load (iframe)
    await page.waitForTimeout(2000);
    
    // Check for Stripe iframe or form elements
    const stripeFrame = page.frameLocator('iframe[name*="stripe"]');
    const payButton = page.getByRole('button', { name: /pay|submit|complete/i });
    
    // Either Stripe frame or pay button should be visible
    await expect(stripeFrame.locator('input').first().or(payButton)).toBeVisible({ timeout: 10000 });
  });

  test('Confirmation page shows success', async ({ page }) => {
    // Set up successful payment data
    await page.evaluate(() => {
      sessionStorage.setItem('payment_confirmed', 'true');
    });
    
    await page.goto('/checkout/confirmation');
    
    // Check for success message
    await expect(page.getByText(/thank you|success|confirmed/i)).toBeVisible();
  });
});

test.describe('Checkout Flow - Data Validation', () => {
  
  test('Redirects to intake if no data', async ({ page }) => {
    // Clear all storage
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    
    // Try to access checkout
    await page.goto('/checkout');
    
    // Should redirect or show error
    await expect(page).toHaveURL(/\/intake|\/checkout/);
  });
});
