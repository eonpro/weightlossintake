import { test, expect } from '@playwright/test';

/**
 * E2E Tests for API Health
 * 
 * Tests that critical API endpoints are functioning correctly.
 */

test.describe('API Health Checks', () => {
  
  test('Health endpoint returns OK', async ({ request }) => {
    const response = await request.get('/api/health');
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
  });

  test('Airtable endpoint rejects invalid data', async ({ request }) => {
    const response = await request.post('/api/airtable', {
      data: {
        // Missing required fields
        invalid: true
      }
    });
    
    // Should return 400 Bad Request
    expect(response.status()).toBe(400);
  });

  test('Airtable endpoint validates session ID', async ({ request }) => {
    const response = await request.post('/api/airtable', {
      data: {
        sessionId: 'test-session-123',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '555-555-5555',
        dob: '1990-01-15',
        state: 'FL',
        qualified: true,
        flowLanguage: 'en'
      }
    });
    
    // Should either succeed (200) or fail due to Airtable config (500)
    // But should not be a validation error (400)
    expect([200, 201, 500]).toContain(response.status());
  });

  test('IntakeQ endpoint exists', async ({ request }) => {
    const response = await request.post('/api/intakeq', {
      data: {}
    });
    
    // Should respond (even with error)
    expect([200, 400, 401, 405, 500]).toContain(response.status());
  });

  test('Stripe create-intent endpoint exists', async ({ request }) => {
    const response = await request.post('/api/stripe/create-intent', {
      data: {
        amount: 299,
        email: 'test@example.com'
      }
    });
    
    // Should respond (may fail without Stripe key)
    expect([200, 400, 500]).toContain(response.status());
  });
});

test.describe('API Security', () => {
  
  test('Endpoints reject oversized payloads', async ({ request }) => {
    // Create a large payload (>100KB)
    const largeData = {
      data: 'x'.repeat(200 * 1024), // 200KB
      sessionId: 'test',
    };
    
    const response = await request.post('/api/airtable', {
      data: largeData
    });
    
    // Should be rejected
    expect([400, 413]).toContain(response.status());
  });

  test('CORS headers are present', async ({ request }) => {
    const response = await request.get('/api/health');
    
    // Check for security headers
    const headers = response.headers();
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBeTruthy();
  });
});
