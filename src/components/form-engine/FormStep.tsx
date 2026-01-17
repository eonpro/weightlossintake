'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { FormStep as FormStepType, FieldOption } from '@/types/form';
import { useIntakeStore } from '@/store/intakeStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { OptionButton, TextField, SelectField, CheckboxField } from './fields';
import EonmedsLogo from '@/components/EonmedsLogo';
import { getNextStep, getPreviousStep } from '@/config/forms/weightloss-intake';
import { logger } from '@/lib/logger';

// Import custom step components
import {
  InfoImageStep,
  TypewriterStep,
  BMICalculatingStep,
  FindingProviderStep,
  QualifiedStep,
  ConsentStep,
  StateSelectStep,
  DateOfBirthStep,
  ContactInfoStep,
  AddressStep,
  WeightInputStep,
  WeightHeightStep,
  BMIResultStep,
  TestimonialsStep,
  ProgramsIncludeStep,
  SideEffectsStep,
  SafetyQualityStep,
  ReviewStep,
  SupportInfoStep,
  MedicalHistoryOverviewStep,
  ChronicConditionsDetailStep,
  GLP1DataStep,
  MedicalTeamStep,
  PersonalizedTreatmentStep,
  TreatmentBenefitsStep,
} from './steps';

interface FormStepProps {
  config: FormStepType;
  basePath?: string;
}

export default function FormStep({ config, basePath = '/v2/intake' }: FormStepProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  
  // SSR-safe hydration - don't use store values until mounted
  const [mounted, setMounted] = useState(false);
  
  // Access store directly for stable references
  const store = useIntakeStore;
  
  // Local state for form values - initialize with empty defaults to avoid hydration mismatch
  const [localValues, setLocalValues] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    config.fields.forEach(field => {
      initial[field.id] = field.defaultValue ?? '';
    });
    return initial;
  });
  
  // Store raw error message objects to support dynamic language switching
  const [errors, setErrors] = useState<Record<string, { en: string; es: string }>>({});
  
  // Sync with store after client-side mount to avoid hydration mismatch
  useEffect(() => {
    const currentResponses = store.getState().responses;
    const synced: Record<string, unknown> = {};
    config.fields.forEach(field => {
      synced[field.id] = currentResponses[field.storageKey] ?? field.defaultValue ?? '';
    });
    setLocalValues(synced);
    setMounted(true);
  }, [config.fields, store]);

  // Get localized text
  const getText = useCallback((localizedString: { en: string; es: string } | undefined) => {
    if (!localizedString) return '';
    return isSpanish ? localizedString.es : localizedString.en;
  }, [isSpanish]);

  // Get error message in current language
  const getErrorText = useCallback((fieldId: string) => {
    const error = errors[fieldId];
    if (!error) return '';
    return isSpanish ? error.es : error.en;
  }, [errors, isSpanish]);

  // Handle single-select option click - use refs and getState for stable callback
  const handleSingleSelect = useCallback((fieldId: string, storageKey: string, value: string) => {
    setLocalValues(prev => ({ ...prev, [fieldId]: value }));
    store.getState().setResponse(storageKey, value);
    
    if (config.autoAdvance) {
      store.getState().markStepCompleted(config.id);
      const currentResponses = store.getState().responses;
      const nextStepId = getNextStep(config.id, { ...currentResponses, [storageKey]: value });
      if (nextStepId) {
        store.getState().setCurrentStep(nextStepId);
        router.push(`${basePath}/${nextStepId}`);
      }
    }
  }, [config.autoAdvance, config.id, router, basePath, store]);

  // Handle multi-select option toggle
  const handleMultiSelect = useCallback((fieldId: string, value: string) => {
    setLocalValues(prev => {
      const currentValues = Array.isArray(prev[fieldId]) ? prev[fieldId] as string[] : [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v: string) => v !== value)
        : [...currentValues, value];
      return { ...prev, [fieldId]: newValues };
    });
  }, []);

  // Handle text input change - clear error when user types
  const handleTextChange = useCallback((fieldId: string, value: string) => {
    setLocalValues(prev => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  }, [errors]);

  // Handle checkbox change
  const handleCheckboxChange = useCallback((fieldId: string, checked: boolean) => {
    setLocalValues(prev => ({ ...prev, [fieldId]: checked }));
  }, []);

  // Validate form - stores raw message objects for dynamic language support
  const validate = useCallback(() => {
    const newErrors: Record<string, { en: string; es: string }> = {};
    
    config.fields.forEach(field => {
      const value = localValues[field.id];
      
      field.validation?.forEach(rule => {
        if (!rule.message) return;
        
        switch (rule.type) {
          case 'required':
            if (!value || (Array.isArray(value) && value.length === 0)) {
              newErrors[field.id] = rule.message;
            }
            break;
          case 'minLength':
            if (typeof value === 'string' && value.length < (rule.value as number)) {
              newErrors[field.id] = rule.message;
            }
            break;
          case 'email':
            if (value && typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              newErrors[field.id] = rule.message;
            }
            break;
          case 'phone':
            if (value && typeof value === 'string' && !/^(\+1)?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/.test(value)) {
              newErrors[field.id] = rule.message;
            }
            break;
        }
      });
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [config.fields, localValues]);

  // Handle continue button click
  const handleContinue = useCallback(() => {
    if (!validate()) return;
    
    const storageUpdates: Record<string, unknown> = {};
    config.fields.forEach(field => {
      storageUpdates[field.storageKey] = localValues[field.id];
    });
    store.getState().setResponses(storageUpdates);
    
    store.getState().markStepCompleted(config.id);
    const currentResponses = store.getState().responses;
    const nextStepId = getNextStep(config.id, { ...currentResponses, ...storageUpdates });
    if (nextStepId) {
      store.getState().setCurrentStep(nextStepId);
      router.push(`${basePath}/${nextStepId}`);
    }
  }, [config.fields, config.id, localValues, validate, router, basePath, store]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    const prevStepId = getPreviousStep(config.id);
    if (prevStepId) {
      store.getState().setCurrentStep(prevStepId);
      router.push(`${basePath}/${prevStepId}`);
    }
  }, [config.id, router, basePath, store]);

  // Show loading placeholder during SSR/hydration for non-custom steps
  if (!mounted && config.type !== 'custom') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="w-full h-1 bg-gray-100">
          <div 
            className="h-full bg-[#f0feab] transition-all duration-300"
            style={{ width: `${config.progressPercent}%` }}
          />
        </div>
        <EonmedsLogo />
        <div className="flex-1 flex flex-col px-6 lg:px-8 py-8 max-w-md lg:max-w-2xl mx-auto w-full">
          <div className="space-y-8">
            <div>
              <h1 className="page-title">{getText(config.title)}</h1>
              {config.subtitle && (
                <p className="page-subtitle mt-3">{getText(config.subtitle)}</p>
              )}
            </div>
            <div className="space-y-4 animate-pulse">
              {config.fields.map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render custom components based on component name
  if (config.type === 'custom' && config.component) {
    const props = config.props || {};
    
    switch (config.component) {
      case 'InfoImageStep':
        return (
          <InfoImageStep
            basePath={basePath}
            nextStep={typeof config.nextStep === 'string' ? config.nextStep : ''}
            prevStep={config.prevStep}
            progressPercent={config.progressPercent}
            imageEn={props.imageEn as string}
            imageEs={props.imageEs as string}
            sourceEn={props.sourceEn as string}
            sourceEs={props.sourceEs as string}
            sourceLinkEn={props.sourceLinkEn as string}
            sourceLinkEs={props.sourceLinkEs as string}
            autoAdvanceDelay={props.autoAdvanceDelay as number}
          />
        );
      
      case 'TypewriterStep':
        return (
          <TypewriterStep
            basePath={basePath}
            nextStep={typeof config.nextStep === 'string' ? config.nextStep : ''}
            prevStep={config.prevStep}
            progressPercent={config.progressPercent}
            title={config.title}
            subtitle={config.subtitle}
            typewriterDelay={props.typewriterDelay as number}
            autoAdvanceDelay={props.autoAdvanceDelay as number}
          />
        );
      
      case 'BMICalculatingStep':
        return (
          <BMICalculatingStep
            basePath={basePath}
            nextStep={typeof config.nextStep === 'string' ? config.nextStep : ''}
            autoAdvanceDelay={props.autoAdvanceDelay as number}
          />
        );
      
      case 'FindingProviderStep':
        return (
          <FindingProviderStep
            basePath={basePath}
            nextStep={typeof config.nextStep === 'string' ? config.nextStep : ''}
            autoAdvanceDelay={props.autoAdvanceDelay as number}
          />
        );
      
      case 'QualifiedStep':
        return (
          <QualifiedStep
            basePath={basePath}
            prevStep={config.prevStep}
          />
        );
      
      case 'ConsentStep':
        return (
          <ConsentStep
            basePath={basePath}
            nextStep={typeof config.nextStep === 'string' ? config.nextStep : ''}
            prevStep={config.prevStep}
            progressPercent={config.progressPercent}
          />
        );
      
      case 'StateSelectStep':
        return (
          <StateSelectStep
            basePath={basePath}
            nextStep={typeof config.nextStep === 'string' ? config.nextStep : ''}
            prevStep={config.prevStep}
            progressPercent={config.progressPercent}
          />
        );
      
      case 'DateOfBirthStep':
        return (
          <DateOfBirthStep
            basePath={basePath}
            nextStep={typeof config.nextStep === 'string' ? config.nextStep : ''}
            prevStep={config.prevStep}
            progressPercent={config.progressPercent}
          />
        );
      
      case 'ContactInfoStep':
        return (
          <ContactInfoStep
            basePath={basePath}
            nextStep={typeof config.nextStep === 'string' ? config.nextStep : ''}
            prevStep={config.prevStep}
            progressPercent={config.progressPercent}
          />
        );
      
      case 'AddressStep':
        return (
          <AddressStep
            basePath={basePath}
            nextStep={typeof config.nextStep === 'string' ? config.nextStep : ''}
            prevStep={config.prevStep}
            progressPercent={config.progressPercent}
          />
        );
      
      case 'WeightInputStep':
        return (
          <WeightInputStep
            basePath={basePath}
            nextStep={typeof config.nextStep === 'string' ? config.nextStep : ''}
            prevStep={config.prevStep}
            progressPercent={config.progressPercent}
            title={config.title}
            subtitle={config.subtitle}
          />
        );
      
      case 'WeightHeightStep':
        return (
          <WeightHeightStep
            basePath={basePath}
            nextStep={typeof config.nextStep === 'string' ? config.nextStep : ''}
            prevStep={config.prevStep}
            progressPercent={config.progressPercent}
          />
        );
      
      case 'BMIResultStep':
        return (
          <BMIResultStep
            basePath={basePath}
            nextStep={typeof config.nextStep === 'string' ? config.nextStep : ''}
            prevStep={config.prevStep}
            progressPercent={config.progressPercent}
          />
        );
      
      case 'TestimonialsStep':
        return (
          <TestimonialsStep
            basePath={basePath}
            nextStep={typeof config.nextStep === 'string' ? config.nextStep : ''}
            prevStep={config.prevStep}
            progressPercent={config.progressPercent}
          />
        );
      
      case 'ProgramsIncludeStep':
        return (
          <ProgramsIncludeStep
            basePath={basePath}
            nextStep={typeof config.nextStep === 'string' ? config.nextStep : ''}
            prevStep={config.prevStep}
            progressPercent={config.progressPercent}
          />
        );
      
      case 'SideEffectsStep':
        return (
          <SideEffectsStep
            basePath={basePath}
            nextStep={typeof config.nextStep === 'string' ? config.nextStep : ''}
            prevStep={config.prevStep}
            progressPercent={config.progressPercent}
          />
        );
      
      case 'SafetyQualityStep':
        return (
          <SafetyQualityStep
            basePath={basePath}
            nextStep={typeof config.nextStep === 'string' ? config.nextStep : ''}
            prevStep={config.prevStep}
            progressPercent={config.progressPercent}
          />
        );
      
      case 'ReviewStep':
        return (
          <ReviewStep
            basePath={basePath}
            nextStep={typeof config.nextStep === 'string' ? config.nextStep : ''}
            prevStep={config.prevStep}
            progressPercent={config.progressPercent}
          />
        );
      
      case 'SupportInfoStep':
        return (
          <SupportInfoStep
            basePath={basePath}
            nextStep={typeof config.nextStep === 'string' ? config.nextStep : ''}
            prevStep={config.prevStep}
            progressPercent={config.progressPercent}
          />
        );
      
      case 'MedicalHistoryOverviewStep':
        return <MedicalHistoryOverviewStep config={config} />;
      
      case 'ChronicConditionsDetailStep':
        return <ChronicConditionsDetailStep config={config} />;
      
      case 'GLP1DataStep':
        return <GLP1DataStep config={config} />;
      
      case 'MedicalTeamStep':
        return (
          <MedicalTeamStep
            basePath={basePath}
            nextStep={typeof config.nextStep === 'string' ? config.nextStep : ''}
            prevStep={config.prevStep}
            progressPercent={config.progressPercent}
          />
        );
      
      case 'PersonalizedTreatmentStep':
        return (
          <PersonalizedTreatmentStep
            basePath={basePath}
            nextStep={typeof config.nextStep === 'string' ? config.nextStep : ''}
            prevStep={config.prevStep}
            progressPercent={config.progressPercent}
          />
        );
      
      case 'TreatmentBenefitsStep':
        return (
          <TreatmentBenefitsStep
            basePath={basePath}
            nextStep={typeof config.nextStep === 'string' ? config.nextStep : ''}
            prevStep={config.prevStep}
            progressPercent={config.progressPercent}
          />
        );
      
      default:
        // Fall through to default rendering for unknown custom components
        logger.warn(`Unknown custom component: ${config.component}`);
        break;
    }
  }

  // Render field based on type
  const renderField = (field: typeof config.fields[0]) => {
    const value = localValues[field.id];
    const error = getErrorText(field.id); // Get translated error message

    switch (field.type) {
      case 'radio':
        return (
          <div className="space-y-3" key={field.id}>
            {field.options?.map((option: FieldOption) => (
              <OptionButton
                key={option.id}
                label={getText(option.label)}
                description={getText(option.description)}
                selected={value === option.value}
                onClick={() => handleSingleSelect(field.id, field.storageKey, option.value)}
              />
            ))}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'checkbox':
        if (field.options) {
          return (
            <div className="space-y-3" key={field.id}>
              {field.options.map((option: FieldOption) => (
                <OptionButton
                  key={option.id}
                  label={getText(option.label)}
                  description={getText(option.description)}
                  selected={Array.isArray(value) && value.includes(option.value)}
                  onClick={() => handleMultiSelect(field.id, option.value)}
                  showCheckbox
                />
              ))}
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          );
        }
        return (
          <CheckboxField
            key={field.id}
            id={field.id}
            label={getText(field.label)}
            checked={!!value}
            onChange={(checked) => handleCheckboxChange(field.id, checked)}
            error={error}
          />
        );

      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <TextField
            key={field.id}
            id={field.id}
            label={getText(field.label)}
            placeholder={getText(field.placeholder)}
            value={(value as string) || ''}
            onChange={(val) => handleTextChange(field.id, val)}
            type={field.type === 'phone' ? 'tel' : field.type}
            error={error}
          />
        );

      case 'select':
        return (
          <SelectField
            key={field.id}
            id={field.id}
            label={getText(field.label)}
            placeholder={getText(field.placeholder)}
            value={(value as string) || ''}
            onChange={(val) => handleTextChange(field.id, val)}
            options={field.options?.map(opt => ({
              value: opt.value,
              label: getText(opt.label),
            })) || []}
            error={error}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div 
          className="h-full bg-[#f0feab] transition-all duration-300"
          style={{ width: `${config.progressPercent}%` }}
        />
      </div>
      
      {/* Back button */}
      {config.prevStep && (
        <div className="px-6 lg:px-8 pt-6 max-w-md lg:max-w-2xl mx-auto w-full">
          <button 
            onClick={handleBack}
            className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6 text-[#413d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Logo */}
      <EonmedsLogo />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col px-6 lg:px-8 py-8 max-w-md lg:max-w-2xl mx-auto w-full">
        <div className="space-y-8">
          {/* Title */}
          <div>
            <h1 className="page-title">
              {getText(config.title)}
            </h1>
            {config.subtitle && (
              <p className="page-subtitle mt-3">
                {getText(config.subtitle)}
              </p>
            )}
          </div>
          
          {/* Fields */}
          <div className="space-y-4">
            {config.fields.map(renderField)}
          </div>
        </div>
      </div>
      
      {/* Continue button */}
      {config.showContinueButton && (
        <div className="px-6 lg:px-8 pb-6 max-w-md lg:max-w-2xl mx-auto w-full">
          <button 
            onClick={handleContinue}
            className="continue-button"
          >
            <span>{isSpanish ? 'Continuar' : 'Continue'}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Copyright */}
          <div className="mt-6 text-center">
            <p className="copyright-text">
              {isSpanish ? (
                <>
                  © 2026 EONPro, LLC. Todos los derechos reservados.<br/>
                  Proceso exclusivo y protegido.
                </>
              ) : (
                <>
                  © 2026 EONPro, LLC. All rights reserved.<br/>
                  Exclusive and protected process.
                </>
              )}
            </p>
          </div>
        </div>
      )}
      
      {/* Copyright for auto-advance pages */}
      {!config.showContinueButton && (
        <div className="px-6 lg:px-8 pb-6 max-w-md lg:max-w-2xl mx-auto w-full">
          <p className="copyright-text text-center">
            {isSpanish ? (
              <>
                © 2026 EONPro, LLC. Todos los derechos reservados.<br/>
                Proceso exclusivo y protegido.
              </>
            ) : (
              <>
                © 2026 EONPro, LLC. All rights reserved.<br/>
                Exclusive and protected process.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
