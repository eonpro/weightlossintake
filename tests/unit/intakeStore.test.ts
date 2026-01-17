// =============================================================================
// INTAKE STORE - Unit Tests
// =============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useIntakeStore, useIntakeActions } from '@/store/intakeStore';

// Mock Zustand persist middleware
vi.mock('zustand/middleware', async () => {
  const actual = await vi.importActual('zustand/middleware');
  return {
    ...actual,
    persist: (fn: any) => fn,
    createJSONStorage: () => ({
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    }),
  };
});

describe('Intake Store', () => {
  // Reset store before each test
  beforeEach(() => {
    act(() => {
      useIntakeStore.getState().resetIntake();
    });
  });

  // ===========================================================================
  // INITIAL STATE
  // ===========================================================================
  describe('Initial State', () => {
    it('should have a valid session ID on initialization', () => {
      const { sessionId } = useIntakeStore.getState();
      
      expect(sessionId).toBeDefined();
      expect(sessionId).toMatch(/^EON-\d+-[a-z0-9]+$/);
    });

    it('should have empty completed steps', () => {
      const { completedSteps } = useIntakeStore.getState();
      
      expect(completedSteps).toEqual([]);
    });

    it('should have empty personal info', () => {
      const { personalInfo } = useIntakeStore.getState();
      
      expect(personalInfo).toEqual({});
    });

    it('should have undefined qualification status', () => {
      const { qualified } = useIntakeStore.getState();
      
      expect(qualified).toBeUndefined();
    });

    it('should have timestamps set', () => {
      const { startedAt, lastUpdatedAt } = useIntakeStore.getState();
      
      expect(startedAt).toBeDefined();
      expect(lastUpdatedAt).toBeDefined();
      expect(new Date(startedAt).getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  // ===========================================================================
  // NAVIGATION ACTIONS
  // ===========================================================================
  describe('Navigation Actions', () => {
    it('should set current step', () => {
      const { result } = renderHook(() => useIntakeStore());
      
      act(() => {
        result.current.setCurrentStep('consent');
      });
      
      expect(result.current.currentStep).toBe('consent');
    });

    it('should mark step as completed', () => {
      const { result } = renderHook(() => useIntakeStore());
      
      act(() => {
        result.current.markStepCompleted('consent');
        result.current.markStepCompleted('state');
      });
      
      expect(result.current.completedSteps).toContain('consent');
      expect(result.current.completedSteps).toContain('state');
    });

    it('should not duplicate completed steps', () => {
      const { result } = renderHook(() => useIntakeStore());
      
      act(() => {
        result.current.markStepCompleted('consent');
        result.current.markStepCompleted('consent');
        result.current.markStepCompleted('consent');
      });
      
      expect(result.current.completedSteps.filter((s: string) => s === 'consent').length).toBe(1);
    });

    it('should check if step is completed', () => {
      const { result } = renderHook(() => useIntakeStore());
      
      act(() => {
        result.current.markStepCompleted('consent');
      });
      
      expect(result.current.isStepCompleted('consent')).toBe(true);
      expect(result.current.isStepCompleted('state')).toBe(false);
    });

    it('should go back to previous step', () => {
      const { result } = renderHook(() => useIntakeStore());
      
      act(() => {
        result.current.markStepCompleted('consent');
        result.current.markStepCompleted('state');
        result.current.setCurrentStep('name');
      });
      
      let previousStep: string | null = null;
      act(() => {
        previousStep = result.current.goBack();
      });
      
      expect(previousStep).toBe('state');
      expect(result.current.currentStep).toBe('state');
      expect(result.current.completedSteps).not.toContain('state');
    });
  });

  // ===========================================================================
  // DATA ACTIONS
  // ===========================================================================
  describe('Data Actions', () => {
    it('should set a single response', () => {
      const { result } = renderHook(() => useIntakeStore());
      
      act(() => {
        result.current.setResponse('goals', ['lose_weight', 'more_energy']);
      });
      
      expect(result.current.responses.goals).toEqual(['lose_weight', 'more_energy']);
    });

    it('should set multiple responses at once', () => {
      const { result } = renderHook(() => useIntakeStore());
      
      act(() => {
        result.current.setResponses({
          activityLevel: '3',
          bloodPressure: 'normal',
        });
      });
      
      expect(result.current.responses.activityLevel).toBe('3');
      expect(result.current.responses.bloodPressure).toBe('normal');
    });

    it('should merge responses without overwriting', () => {
      const { result } = renderHook(() => useIntakeStore());
      
      act(() => {
        result.current.setResponse('key1', 'value1');
        result.current.setResponse('key2', 'value2');
      });
      
      expect(result.current.responses.key1).toBe('value1');
      expect(result.current.responses.key2).toBe('value2');
    });

    it('should set personal info', () => {
      const { result } = renderHook(() => useIntakeStore());
      
      act(() => {
        result.current.setPersonalInfo({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        });
      });
      
      expect(result.current.personalInfo.firstName).toBe('John');
      expect(result.current.personalInfo.lastName).toBe('Doe');
      expect(result.current.personalInfo.email).toBe('john@example.com');
    });

    it('should merge personal info updates', () => {
      const { result } = renderHook(() => useIntakeStore());
      
      act(() => {
        result.current.setPersonalInfo({ firstName: 'John' });
        result.current.setPersonalInfo({ lastName: 'Doe' });
      });
      
      expect(result.current.personalInfo.firstName).toBe('John');
      expect(result.current.personalInfo.lastName).toBe('Doe');
    });

    it('should set address info', () => {
      const { result } = renderHook(() => useIntakeStore());
      
      act(() => {
        result.current.setAddress({
          state: 'CA',
          city: 'Los Angeles',
          street: '123 Main St',
        });
      });
      
      expect(result.current.address.state).toBe('CA');
      expect(result.current.address.city).toBe('Los Angeles');
    });

    it('should set medical profile', () => {
      const { result } = renderHook(() => useIntakeStore());
      
      act(() => {
        result.current.setMedicalProfile({
          bmi: 28.5,
        });
      });
      
      expect(result.current.medicalProfile.bmi).toBe(28.5);
    });
  });

  // ===========================================================================
  // QUALIFICATION
  // ===========================================================================
  describe('Qualification', () => {
    it('should set qualified status', () => {
      const { result } = renderHook(() => useIntakeStore());
      
      act(() => {
        result.current.setQualified(true);
      });
      
      expect(result.current.qualified).toBe(true);
    });

    it('should set disqualification with reason', () => {
      const { result } = renderHook(() => useIntakeStore());
      
      act(() => {
        result.current.setQualified(false, 'BMI below threshold');
      });
      
      expect(result.current.qualified).toBe(false);
      expect(result.current.disqualificationReason).toBe('BMI below threshold');
    });
  });

  // ===========================================================================
  // BMI CALCULATION
  // ===========================================================================
  describe('BMI Calculation', () => {
    it('should calculate BMI correctly', () => {
      const { result } = renderHook(() => useIntakeStore());
      
      act(() => {
        result.current.setWeight({
          currentWeight: 200,
          heightFeet: 5,
          heightInches: 10,
        });
      });
      
      const bmi = result.current.getBMI();
      
      // BMI = (weight / (height in inches)^2) * 703
      // = (200 / (70)^2) * 703 = 28.7
      expect(bmi).toBeCloseTo(28.7, 0);
    });

    it('should return null when weight data is missing', () => {
      const { result } = renderHook(() => useIntakeStore());
      
      const bmi = result.current.getBMI();
      
      expect(bmi).toBeNull();
    });

    it('should return null when height is zero', () => {
      const { result } = renderHook(() => useIntakeStore());
      
      act(() => {
        result.current.setWeight({
          currentWeight: 200,
          heightFeet: 0,
          heightInches: 0,
        });
      });
      
      const bmi = result.current.getBMI();
      
      expect(bmi).toBeNull();
    });
  });

  // ===========================================================================
  // PROGRESS TRACKING
  // ===========================================================================
  describe('Progress Tracking', () => {
    it('should calculate progress percentage', () => {
      const { result } = renderHook(() => useIntakeStore());
      
      act(() => {
        result.current.markStepCompleted('step1');
        result.current.markStepCompleted('step2');
        result.current.markStepCompleted('step3');
      });
      
      const progress = result.current.getProgress(10);
      
      expect(progress).toBe(30);
    });

    it('should return 0 for no completed steps', () => {
      const { result } = renderHook(() => useIntakeStore());
      
      const progress = result.current.getProgress(10);
      
      expect(progress).toBe(0);
    });

    it('should handle edge case of zero total steps', () => {
      const { result } = renderHook(() => useIntakeStore());
      
      const progress = result.current.getProgress(0);
      
      expect(progress).toBe(0);
    });
  });

  // ===========================================================================
  // SESSION MANAGEMENT
  // ===========================================================================
  describe('Session Management', () => {
    it('should reset intake to initial state', () => {
      const { result } = renderHook(() => useIntakeStore());
      
      // Add some data
      act(() => {
        result.current.setPersonalInfo({ firstName: 'John' });
        result.current.markStepCompleted('consent');
        result.current.setQualified(true);
      });
      
      // Reset
      act(() => {
        result.current.resetIntake();
      });
      
      expect(result.current.personalInfo).toEqual({});
      expect(result.current.completedSteps).toEqual([]);
      expect(result.current.qualified).toBeUndefined();
    });

    it('should generate new session ID on reset', () => {
      const { result } = renderHook(() => useIntakeStore());
      
      const originalSessionId = result.current.sessionId;
      
      act(() => {
        result.current.resetIntake();
      });
      
      expect(result.current.sessionId).not.toBe(originalSessionId);
    });

    it('should return complete intake data via getIntakeData', () => {
      const { result } = renderHook(() => useIntakeStore());
      
      act(() => {
        result.current.setPersonalInfo({ firstName: 'John' });
        result.current.setAddress({ state: 'CA' });
      });
      
      const data = result.current.getIntakeData();
      
      expect(data.personalInfo.firstName).toBe('John');
      expect(data.address.state).toBe('CA');
      expect(data.sessionId).toBeDefined();
    });
  });

  // ===========================================================================
  // ACTIONS HOOK
  // ===========================================================================
  describe('useIntakeActions Hook', () => {
    it('should provide stable action references', () => {
      const { result, rerender } = renderHook(() => useIntakeActions());
      
      const initialActions = result.current;
      
      rerender();
      
      // Check that key action references are stable
      expect(result.current.setCurrentStep).toBe(initialActions.setCurrentStep);
      expect(result.current.setResponse).toBe(initialActions.setResponse);
    });
  });
});
