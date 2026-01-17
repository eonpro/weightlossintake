// =============================================================================
// VALIDATION SCHEMAS - Unit Tests
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  phoneSchema,
  emailSchema,
  nameSchema,
  weightSchema,
  heightFeetSchema,
  heightInchesSchema,
  stateSchema,
  validateStep,
  validateField,
} from '@/validation/schemas';

describe('Validation Schemas', () => {
  // ===========================================================================
  // PHONE VALIDATION
  // ===========================================================================
  describe('phoneSchema', () => {
    it('should accept valid US phone numbers', () => {
      const validPhones = [
        '1234567890',
        '123-456-7890',
        '(123) 456-7890',
        '+1 123 456 7890',
        '+1-123-456-7890',
      ];

      validPhones.forEach((phone) => {
        const result = phoneSchema.safeParse(phone);
        expect(result.success, `Failed for: ${phone}`).toBe(true);
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '123',
        '12345',
        'abcdefghij',
        '123-456-789a',
        '',
      ];

      invalidPhones.forEach((phone) => {
        const result = phoneSchema.safeParse(phone);
        expect(result.success, `Should fail for: ${phone}`).toBe(false);
      });
    });
  });

  // ===========================================================================
  // EMAIL VALIDATION
  // ===========================================================================
  describe('emailSchema', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.org',
        'user+tag@company.co.uk',
        'valid_email@sub.domain.com',
      ];

      validEmails.forEach((email) => {
        const result = emailSchema.safeParse(email);
        expect(result.success, `Failed for: ${email}`).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@domain.com',
        'invalid@domain',
        '',
      ];

      invalidEmails.forEach((email) => {
        const result = emailSchema.safeParse(email);
        expect(result.success, `Should fail for: ${email}`).toBe(false);
      });
    });
  });

  // ===========================================================================
  // NAME VALIDATION
  // ===========================================================================
  describe('nameSchema', () => {
    it('should accept valid names', () => {
      const validNames = [
        'John',
        'Mary Jane',
        "O'Brien",
        'García-López',
        'José',
        'François',
      ];

      validNames.forEach((name) => {
        const result = nameSchema.safeParse(name);
        expect(result.success, `Failed for: ${name}`).toBe(true);
      });
    });

    it('should reject invalid names', () => {
      const invalidNames = [
        'A', // Too short
        '12345',
        'Name123',
        'Name@Special',
        '', // Empty
      ];

      invalidNames.forEach((name) => {
        const result = nameSchema.safeParse(name);
        expect(result.success, `Should fail for: ${name}`).toBe(false);
      });
    });

    it('should reject names exceeding 50 characters', () => {
      const longName = 'A'.repeat(51);
      const result = nameSchema.safeParse(longName);
      expect(result.success).toBe(false);
    });
  });

  // ===========================================================================
  // WEIGHT VALIDATION
  // ===========================================================================
  describe('weightSchema', () => {
    it('should accept valid weights', () => {
      const validWeights = [50, 150, 200, 300, 500, 799];

      validWeights.forEach((weight) => {
        const result = weightSchema.safeParse(weight);
        expect(result.success, `Failed for: ${weight}`).toBe(true);
      });
    });

    it('should reject weights outside valid range', () => {
      const invalidWeights = [0, 49, 801, 1000, -100];

      invalidWeights.forEach((weight) => {
        const result = weightSchema.safeParse(weight);
        expect(result.success, `Should fail for: ${weight}`).toBe(false);
      });
    });
  });

  // ===========================================================================
  // HEIGHT VALIDATION
  // ===========================================================================
  describe('heightFeetSchema', () => {
    it('should accept valid heights', () => {
      const validHeights = [3, 4, 5, 6, 7, 8];

      validHeights.forEach((height) => {
        const result = heightFeetSchema.safeParse(height);
        expect(result.success, `Failed for: ${height}`).toBe(true);
      });
    });

    it('should reject invalid heights', () => {
      const invalidHeights = [0, 1, 2, 9, 10];

      invalidHeights.forEach((height) => {
        const result = heightFeetSchema.safeParse(height);
        expect(result.success, `Should fail for: ${height}`).toBe(false);
      });
    });
  });

  describe('heightInchesSchema', () => {
    it('should accept valid inches (0-11)', () => {
      for (let inches = 0; inches <= 11; inches++) {
        const result = heightInchesSchema.safeParse(inches);
        expect(result.success, `Failed for: ${inches}`).toBe(true);
      }
    });

    it('should reject invalid inches', () => {
      const invalidInches = [-1, 12, 15, 100];

      invalidInches.forEach((inches) => {
        const result = heightInchesSchema.safeParse(inches);
        expect(result.success, `Should fail for: ${inches}`).toBe(false);
      });
    });
  });

  // ===========================================================================
  // STATE VALIDATION
  // ===========================================================================
  describe('stateSchema', () => {
    it('should accept valid state codes', () => {
      const validStates = ['CA', 'NY', 'TX', 'FL', 'WA'];

      validStates.forEach((state) => {
        const result = stateSchema.safeParse(state);
        expect(result.success, `Failed for: ${state}`).toBe(true);
      });
    });

    it('should reject invalid state codes', () => {
      const invalidStates = ['California', 'ca', 'C', 'CAL', ''];

      invalidStates.forEach((state) => {
        const result = stateSchema.safeParse(state);
        expect(result.success, `Should fail for: ${state}`).toBe(false);
      });
    });
  });

  // ===========================================================================
  // VALIDATE STEP HELPER
  // ===========================================================================
  describe('validateStep', () => {
    it('should return success for valid name step data', () => {
      const result = validateStep('name', {
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        firstName: 'John',
        lastName: 'Doe',
      });
    });

    it('should return errors for invalid name step data', () => {
      const result = validateStep('name', {
        firstName: 'A', // Too short
        lastName: '', // Empty
      });

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(Object.keys(result.errors || {}).length).toBeGreaterThan(0);
    });

    it('should return success for valid contact info', () => {
      const result = validateStep('contact-info', {
        email: 'test@example.com',
        phone: '123-456-7890',
        consentToContact: true,
      });

      expect(result.success).toBe(true);
    });

    it('should fail when consent is not given', () => {
      const result = validateStep('contact-info', {
        email: 'test@example.com',
        phone: '123-456-7890',
        consentToContact: false,
      });

      expect(result.success).toBe(false);
    });
  });

  // ===========================================================================
  // VALIDATE FIELD HELPER
  // ===========================================================================
  describe('validateField', () => {
    it('should return null for valid field', () => {
      const error = validateField(emailSchema, 'test@example.com');
      expect(error).toBeNull();
    });

    it('should return error message for invalid field', () => {
      const error = validateField(emailSchema, 'invalid-email');
      expect(error).not.toBeNull();
      expect(typeof error).toBe('string');
    });
  });
});
