// =============================================================================
// HEALTH API - Unit Tests
// =============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, HEAD } from '@/app/api/health/route';

describe('Health API', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('GET /api/health', () => {
    it('should return healthy status when services are configured', async () => {
      // Mock environment variables
      vi.stubEnv('AIRTABLE_PAT', 'test_pat');
      vi.stubEnv('AIRTABLE_BASE_ID', 'test_base');
      vi.stubEnv('INTAKEQ_API_KEY', 'test_key');
      vi.stubEnv('PDFCO_API_KEY', 'test_pdfco');

      const request = new Request('http://localhost:3000/api/health');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.timestamp).toBeDefined();
      expect(data.version).toBeDefined();
    });

    it('should return degraded status when some services are missing', async () => {
      // Only Airtable configured
      vi.stubEnv('AIRTABLE_PAT', 'test_pat');
      vi.stubEnv('AIRTABLE_BASE_ID', 'test_base');
      vi.stubEnv('INTAKEQ_API_KEY', '');
      vi.stubEnv('PDFCO_API_KEY', '');

      const request = new Request('http://localhost:3000/api/health');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('degraded');
    });

    it('should return unhealthy status when Airtable is not configured', async () => {
      vi.stubEnv('AIRTABLE_PAT', '');
      vi.stubEnv('AIRTABLE_BASE_ID', '');

      const request = new Request('http://localhost:3000/api/health');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.status).toBe('unhealthy');
    });

    it('should include detailed checks in verbose mode', async () => {
      vi.stubEnv('AIRTABLE_PAT', 'test_pat');
      vi.stubEnv('AIRTABLE_BASE_ID', 'test_base');
      vi.stubEnv('INTAKEQ_API_KEY', 'test_key');
      vi.stubEnv('PDFCO_API_KEY', 'test_pdfco');

      const request = new Request('http://localhost:3000/api/health?verbose');
      const response = await GET(request);
      const data = await response.json();

      expect(data.checks).toBeDefined();
      expect(data.checks.airtable).toBe(true);
      expect(data.checks.intakeq).toBe(true);
      expect(data.checks.pdfco).toBe(true);
      expect(data.uptime).toBeDefined();
    });

    it('should have correct cache headers', async () => {
      vi.stubEnv('AIRTABLE_PAT', 'test_pat');
      vi.stubEnv('AIRTABLE_BASE_ID', 'test_base');

      const request = new Request('http://localhost:3000/api/health');
      const response = await GET(request);

      expect(response.headers.get('Cache-Control')).toBe(
        'no-store, no-cache, must-revalidate'
      );
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });
  });

  describe('HEAD /api/health', () => {
    it('should return 200 when Airtable is configured', async () => {
      vi.stubEnv('AIRTABLE_PAT', 'test_pat');
      vi.stubEnv('AIRTABLE_BASE_ID', 'test_base');

      const response = await HEAD();

      expect(response.status).toBe(200);
    });

    it('should return 503 when Airtable is not configured', async () => {
      vi.stubEnv('AIRTABLE_PAT', '');
      vi.stubEnv('AIRTABLE_BASE_ID', '');

      const response = await HEAD();

      expect(response.status).toBe(503);
    });

    it('should have no body', async () => {
      vi.stubEnv('AIRTABLE_PAT', 'test_pat');
      vi.stubEnv('AIRTABLE_BASE_ID', 'test_base');

      const response = await HEAD();

      expect(response.body).toBeNull();
    });
  });
});
