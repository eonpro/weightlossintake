// ============================================================
// WEIGHT LOSS INTAKE FORM CONFIGURATION - V2 (V1 CONTENT SYNC)
// ============================================================
// This configuration exactly matches the V1 intake pages content
// ============================================================

import type { FormConfig, FormStep } from '@/types/form';

// ============================================================
// COMPLETE STEP DEFINITIONS (Matching V1 exactly)
// ============================================================

const steps: FormStep[] = [
  // ========== SECTION 1: ONBOARDING ==========
  {
    id: 'goals',
    path: 'goals',
    title: {
      en: 'How would your life change by losing weight?',
      es: '¿Cómo cambiaría tu vida al perder peso?',
    },
    subtitle: {
      en: 'Select all that apply.',
      es: 'Selecciona todos los que apliquen.',
    },
    type: 'multi-select',
    fields: [
      {
        id: 'goals',
        type: 'checkbox',
        label: { en: 'Goals', es: 'Objetivos' },
        storageKey: 'goals',
        options: [
          { id: 'clothes', label: { en: 'Enjoy how your clothes fit', es: 'Disfrutar cómo te queda la ropa' }, value: 'clothes' },
          { id: 'confidence', label: { en: 'Having more confidence', es: 'Tener más confianza' }, value: 'confidence' },
          { id: 'energy', label: { en: 'Getting your energy back', es: 'Recuperar tu energía' }, value: 'energy' },
          { id: 'feel_better', label: { en: 'Feel better about yourself', es: 'Sentirte mejor contigo mismo' }, value: 'feel_better' },
          { id: 'health', label: { en: 'Improving your overall health', es: 'Mejorar tu salud general' }, value: 'health' },
        ],
        validation: [
          { type: 'required', message: { en: 'Please select at least one goal', es: 'Por favor selecciona al menos un objetivo' } },
        ],
      },
    ],
    autoAdvance: false,
    showContinueButton: true,
    nextStep: 'obesity-stats',
    prevStep: null,
    progressPercent: 3,
  },

  {
    id: 'obesity-stats',
    path: 'obesity-stats',
    title: {
      en: '',
      es: '',
    },
    type: 'custom',
    component: 'InfoImageStep',
    fields: [],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: 'medication-preference',
    prevStep: 'goals',
    progressPercent: 4,
    props: {
      autoAdvanceDelay: 2500,
      imageEn: 'https://static.wixstatic.com/media/c49a9b_a9abfe04c0984333bd15070af7de2a72~mv2.webp',
      imageEs: 'https://static.wixstatic.com/media/c49a9b_97794b4b6d264743b5eb4ccd8dc1e7a2~mv2.webp',
      sourceEn: "Source: Trust for America's Health",
      sourceEs: 'Fuente: Oficina de Salud de Minorías - HHS',
      sourceLinkEn: 'https://www.tfah.org/story/new-national-adult-obesity-data-show-level-trend/?utm_source=chatgpt.com',
      sourceLinkEs: 'https://minorityhealth.hhs.gov/obesity-and-hispanic-americans?utm_source=chatgpt.com',
    },
  },

  {
    id: 'medication-preference',
    path: 'medication-preference',
    title: {
      en: 'Do you have a specific weight loss medication in mind?',
      es: '¿Tienes en mente algún medicamento específico para perder peso?',
    },
    type: 'single-select',
    fields: [
      {
        id: 'medication_preference',
        type: 'radio',
        label: { en: 'Preference', es: 'Preferencia' },
        storageKey: 'medication_preference',
        options: [
          { id: 'recommendation', label: { en: "Not yet, I'm looking for a recommendation", es: 'Todavía no, busco una recomendación' }, value: 'recommendation' },
          { id: 'have_in_mind', label: { en: 'Yes, I already have something in mind', es: 'Sí, ya tengo algo en mente' }, value: 'have_in_mind' },
        ],
      },
    ],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: 'research-done',
    prevStep: 'obesity-stats',
    progressPercent: 6,
  },

  {
    id: 'research-done',
    path: 'research-done',
    title: {
      en: "You've got it. We'll begin with some questions about you.",
      es: 'Lo tienes. Comenzaremos con algunas preguntas sobre ti.',
    },
    subtitle: {
      en: "After that, we'll dive into your health history to find which treatment option matches your goals and health history.",
      es: 'Después de eso, profundizaremos en tu historial de salud para encontrar qué opción de tratamiento coincide con tus objetivos e historial de salud.',
    },
    type: 'custom',
    component: 'TypewriterStep',
    fields: [],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: 'consent',
    prevStep: 'medication-preference',
    progressPercent: 7,
    props: {
      typewriterDelay: 25,
      autoAdvanceDelay: 1000,
      // Conditional text based on medication_preference
      conditionalTitle: {
        recommendation: {
          en: "You've got it. We'll begin with some questions about you.",
          es: 'Lo tienes. Comenzaremos con algunas preguntas sobre ti.',
        },
        have_in_mind: {
          en: "Nice, it sounds like you've already done your research.",
          es: 'Bien, parece que ya has hecho tu investigación.',
        },
      },
      conditionalSubtitle: {
        recommendation: {
          en: "After that, we'll dive into your health history to find which treatment option matches your goals and health history.",
          es: 'Después de eso, profundizaremos en tu historial de salud para encontrar qué opción de tratamiento coincide con tus objetivos e historial de salud.',
        },
        have_in_mind: {
          en: "Let's keep going to find which treatment option matches your goals and health history.",
          es: 'Sigamos adelante para encontrar qué opción de tratamiento coincide con tus objetivos e historial de salud.',
        },
      },
    },
  },

  // ========== SECTION 2: CONSENT & BASIC INFO ==========
  {
    id: 'consent',
    path: 'consent',
    title: {
      en: 'This questionnaire helps us understand your medical history, lifestyle, and goals.',
      es: 'Este cuestionario nos ayuda a entender tu historial médico, estilo de vida y objetivos.',
    },
    subtitle: {
      en: 'Similar to the form you fill out when you visit the doctor. Remember: your responses are private and will be reviewed by our medical team.',
      es: 'Similar al formulario que llenas cuando visitas al médico. Recuerda: tus respuestas son privadas y serán revisadas por nuestro equipo médico.',
    },
    type: 'custom',
    component: 'ConsentStep',
    fields: [
      {
        id: 'consent_accepted',
        type: 'checkbox',
        label: { en: 'I understand and agree', es: 'Entiendo y acepto' },
        storageKey: 'consent_accepted',
        validation: [
          { type: 'required', message: { en: 'You must accept to continue', es: 'Debes aceptar para continuar' } },
        ],
      },
    ],
    autoAdvance: false,
    showContinueButton: true,
    nextStep: 'state',
    prevStep: 'research-done',
    progressPercent: 8,
  },

  {
    id: 'state',
    path: 'state',
    title: {
      en: 'Select the state you live in:',
      es: 'Selecciona el estado en el que vives:',
    },
    subtitle: {
      en: 'This state is where your medication will be shipped to, if prescribed.',
      es: 'Este estado es donde se enviará tu medicamento, si se receta.',
    },
    type: 'custom',
    component: 'StateSelectStep',
    fields: [
      {
        id: 'state',
        type: 'select',
        label: { en: 'State', es: 'Estado' },
        storageKey: 'state',
        validation: [
          { type: 'required', message: { en: 'Please select a state', es: 'Por favor selecciona un estado' } },
        ],
      },
      {
        id: 'terms_accepted',
        type: 'checkbox',
        label: { en: 'I agree to the Terms and Conditions and Privacy Policy', es: 'Acepto los Términos y Condiciones y la Política de Privacidad' },
        storageKey: 'terms_accepted',
        validation: [
          { type: 'required', message: { en: 'You must accept the terms', es: 'Debes aceptar los términos' } },
        ],
      },
    ],
    autoAdvance: false,
    showContinueButton: true,
    nextStep: 'name',
    prevStep: 'consent',
    progressPercent: 10,
  },

  {
    id: 'name',
    path: 'name',
    title: {
      en: 'What is your name?',
      es: '¿Cuál es tu nombre?',
    },
    subtitle: {
      en: 'This way, we can personalize your experience from the very beginning.',
      es: 'De esta manera, podemos personalizar tu experiencia desde el principio.',
    },
    type: 'input',
    fields: [
      {
        id: 'firstName',
        type: 'text',
        label: { en: 'First Name', es: 'Nombre' },
        placeholder: { en: 'First Name', es: 'Nombre' },
        storageKey: 'firstName',
        validation: [
          { type: 'required', message: { en: 'First name is required', es: 'El nombre es requerido' } },
          { type: 'minLength', value: 2, message: { en: 'Name must be at least 2 characters', es: 'El nombre debe tener al menos 2 caracteres' } },
        ],
      },
      {
        id: 'lastName',
        type: 'text',
        label: { en: 'Last Name', es: 'Apellido' },
        placeholder: { en: 'Last Name', es: 'Apellido' },
        storageKey: 'lastName',
        validation: [
          { type: 'required', message: { en: 'Last name is required', es: 'El apellido es requerido' } },
          { type: 'minLength', value: 2, message: { en: 'Name must be at least 2 characters', es: 'El nombre debe tener al menos 2 caracteres' } },
        ],
      },
    ],
    autoAdvance: false,
    showContinueButton: true,
    nextStep: 'dob',
    prevStep: 'state',
    progressPercent: 12,
  },

  {
    id: 'dob',
    path: 'dob',
    title: {
      en: 'To check if you qualify, tell us your date of birth.',
      es: 'Para verificar si calificas, dinos tu fecha de nacimiento.',
    },
    subtitle: {
      en: 'This helps us confirm that you meet the age requirements for treatment.',
      es: 'Esto nos ayuda a confirmar que cumples con los requisitos de edad para el tratamiento.',
    },
    type: 'custom',
    component: 'DateOfBirthStep',
    fields: [
      {
        id: 'dob',
        type: 'date',
        label: { en: 'Date of Birth', es: 'Fecha de Nacimiento' },
        placeholder: { en: 'MM/DD/YYYY', es: 'MM/DD/AAAA' },
        storageKey: 'dob',
        validation: [
          { type: 'required', message: { en: 'Date of birth is required', es: 'La fecha de nacimiento es requerida' } },
          { type: 'age', value: 18, message: { en: 'You must be at least 18 years old', es: 'Debes tener al menos 18 años' } },
        ],
      },
    ],
    autoAdvance: false,
    showContinueButton: true,
    nextStep: 'sex-assigned',
    prevStep: 'name',
    progressPercent: 14,
  },

  {
    id: 'sex-assigned',
    path: 'sex-assigned',
    title: {
      en: 'Sex assigned at birth',
      es: 'Sexo asignado al nacer',
    },
    subtitle: {
      en: 'This medical information helps us properly assess your eligibility and determine the most appropriate treatment.',
      es: 'Esta información médica nos ayuda a evaluar adecuadamente tu elegibilidad y determinar el tratamiento más apropiado.',
    },
    type: 'single-select',
    fields: [
      {
        id: 'sex',
        type: 'radio',
        label: { en: 'Sex', es: 'Sexo' },
        storageKey: 'sex',
        options: [
          { id: 'male', label: { en: 'Male', es: 'Hombre' }, value: 'male' },
          { id: 'female', label: { en: 'Female', es: 'Mujer' }, value: 'female' },
        ],
      },
    ],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: 'contact-info',
    prevStep: 'dob',
    progressPercent: 16,
  },

  {
    id: 'contact-info',
    path: 'contact-info',
    title: {
      en: 'How can we reach you?',
      es: '¿Cómo podemos contactarte?',
    },
    type: 'custom',
    component: 'ContactInfoStep',
    fields: [
      {
        id: 'email',
        type: 'email',
        label: { en: 'Email', es: 'Correo electrónico' },
        placeholder: { en: 'your@email.com', es: 'tu@email.com' },
        storageKey: 'email',
        validation: [
          { type: 'required', message: { en: 'Email is required', es: 'El correo electrónico es requerido' } },
          { type: 'email', message: { en: 'Please enter a valid email', es: 'Por favor ingresa un correo válido' } },
        ],
      },
      {
        id: 'phone',
        type: 'phone',
        label: { en: 'Phone number', es: 'Número de teléfono' },
        placeholder: { en: '(555) 555-5555', es: '(555) 555-5555' },
        storageKey: 'phone',
        validation: [
          { type: 'required', message: { en: 'Phone number is required', es: 'El número de teléfono es requerido' } },
          { type: 'phone', message: { en: 'Please enter a valid phone number', es: 'Por favor ingresa un número válido' } },
        ],
      },
      {
        id: 'contact_consent',
        type: 'checkbox',
        label: { en: 'I agree to receive communications via email and SMS', es: 'Acepto recibir comunicaciones por correo electrónico y SMS' },
        storageKey: 'contact_consent',
      },
    ],
    autoAdvance: false,
    showContinueButton: true,
    nextStep: 'support-info',
    prevStep: 'sex-assigned',
    progressPercent: 18,
  },

  {
    id: 'support-info',
    path: 'support-info',
    title: {
      en: 'Did you know?',
      es: '¿Sabías que?',
    },
    type: 'custom',
    component: 'SupportInfoStep',
    fields: [],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: 'address',
    prevStep: 'contact-info',
    progressPercent: 18,
    props: {
      autoAdvanceDelay: 2500,
    },
  },

  // ========== SECTION 3: ADDRESS & WEIGHT ==========
  {
    id: 'address',
    path: 'address',
    title: {
      en: "What's your shipping address?",
      es: '¿Cuál es tu dirección de envío?',
    },
    subtitle: {
      en: 'All treatment medications are shipped to your door.',
      es: 'Todos los medicamentos de tratamiento se envían a tu puerta.',
    },
    type: 'custom',
    component: 'AddressStep',
    fields: [
      {
        id: 'street',
        type: 'text',
        label: { en: 'Street Address', es: 'Dirección' },
        storageKey: 'street',
        validation: [
          { type: 'required', message: { en: 'Address is required', es: 'La dirección es requerida' } },
        ],
      },
      {
        id: 'apartment',
        type: 'text',
        label: { en: 'Apartment/Suite (Optional)', es: 'Apartamento/Suite (Opcional)' },
        storageKey: 'apartment',
      },
    ],
    autoAdvance: false,
    showContinueButton: true,
    nextStep: 'ideal-weight',
    prevStep: 'support-info',
    progressPercent: 25,
  },

  {
    id: 'ideal-weight',
    path: 'ideal-weight',
    title: {
      en: "What's your ideal weight?",
      es: '¿Cuál es tu peso ideal?',
    },
    subtitle: {
      en: "This isn't a binding contract—think of it as your long-term target.",
      es: 'Esto no es un contrato vinculante—piénsalo como tu objetivo a largo plazo.',
    },
    type: 'custom',
    component: 'WeightInputStep',
    fields: [
      {
        id: 'ideal_weight',
        type: 'number',
        label: { en: 'Ideal Weight', es: 'Peso Ideal' },
        storageKey: 'ideal_weight',
        validation: [
          { type: 'required', message: { en: 'Please enter your ideal weight', es: 'Por favor ingresa tu peso ideal' } },
        ],
      },
    ],
    autoAdvance: false,
    showContinueButton: true,
    nextStep: 'current-weight',
    prevStep: 'address',
    progressPercent: 30,
  },

  {
    id: 'current-weight',
    path: 'current-weight',
    title: {
      en: "What's your current weight?",
      es: '¿Cuál es tu peso actual?',
    },
    subtitle: {
      en: "Just an estimate is fine. We'll use this to calculate your BMI.",
      es: 'Solo una estimación está bien. Usaremos esto para calcular tu IMC.',
    },
    type: 'custom',
    component: 'WeightHeightStep',
    fields: [
      {
        id: 'current_weight',
        type: 'number',
        label: { en: 'Current Weight', es: 'Peso Actual' },
        storageKey: 'current_weight',
        validation: [
          { type: 'required', message: { en: 'Please enter your weight', es: 'Por favor ingresa tu peso' } },
        ],
      },
      {
        id: 'height_feet',
        type: 'select',
        label: { en: 'Height (feet)', es: 'Altura (pies)' },
        storageKey: 'height_feet',
        validation: [
          { type: 'required', message: { en: 'Please select feet', es: 'Por favor selecciona pies' } },
        ],
      },
      {
        id: 'height_inches',
        type: 'select',
        label: { en: 'Height (inches)', es: 'Altura (pulgadas)' },
        storageKey: 'height_inches',
        validation: [
          { type: 'required', message: { en: 'Please select inches', es: 'Por favor selecciona pulgadas' } },
        ],
      },
    ],
    autoAdvance: false,
    showContinueButton: true,
    nextStep: 'bmi-calculating',
    prevStep: 'ideal-weight',
    progressPercent: 35,
  },

  // ========== SECTION 4: BMI CALCULATION ==========
  {
    id: 'bmi-calculating',
    path: 'bmi-calculating',
    title: {
      en: 'One moment',
      es: 'Un momento',
    },
    type: 'custom',
    component: 'BMICalculatingStep',
    fields: [],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: 'bmi-result',
    prevStep: 'current-weight',
    progressPercent: 40,
    props: {
      autoAdvanceDelay: 4000,
    },
  },

  {
    id: 'bmi-result',
    path: 'bmi-result',
    title: {
      en: 'Based on the information you shared, the use of medication may be appropriate for you.',
      es: 'Según la información que compartiste, el uso de medicamentos puede ser apropiado para ti.',
    },
    type: 'custom',
    component: 'BMIResultStep',
    fields: [],
    autoAdvance: false,
    showContinueButton: true,
    nextStep: 'testimonials',
    prevStep: 'bmi-calculating',
    progressPercent: 65,
  },

  // ========== SECTION 5: TESTIMONIALS ==========
  {
    id: 'testimonials',
    path: 'testimonials',
    title: {
      en: "Join the thousands of transformations we've helped achieve.",
      es: 'Únete a los miles de transformaciones que hemos ayudado a lograr.',
    },
    subtitle: {
      en: 'Each of these cases features real patients who transformed their lives.',
      es: 'Cada uno de estos casos presenta pacientes reales que transformaron sus vidas.',
    },
    type: 'custom',
    component: 'TestimonialsStep',
    fields: [],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: 'medical-history-overview',
    prevStep: 'bmi-result',
    progressPercent: 70,
    props: {
      autoAdvanceDelay: 4000,
    },
  },

  // ========== SECTION 6: MEDICAL HISTORY OVERVIEW ==========
  {
    id: 'medical-history-overview',
    path: 'medical-history-overview',
    title: {
      en: "Now let's review your medical history.",
      es: 'Ahora revisemos tu historial médico.',
    },
    type: 'custom',
    component: 'MedicalHistoryOverviewStep',
    fields: [],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: [
      { conditions: [{ field: 'sex', operator: 'equals', value: 'female' }], target: 'pregnancy' },
      { conditions: [{ field: 'sex', operator: 'equals', value: 'male' }], target: 'activity-level' },
    ],
    prevStep: 'testimonials',
    progressPercent: 71,
    props: {
      autoAdvanceDelay: 2500,
    },
  },

  {
    id: 'pregnancy',
    path: 'pregnancy',
    title: {
      en: 'Are you currently pregnant, breastfeeding, or planning to become pregnant in the next 6 months?',
      es: '¿Estás actualmente embarazada, amamantando o planeas quedar embarazada en los próximos 6 meses?',
    },
    type: 'single-select',
    fields: [
      {
        id: 'pregnancy_status',
        type: 'radio',
        label: { en: 'Pregnancy Status', es: 'Estado de Embarazo' },
        storageKey: 'pregnancy_status',
        options: [
          { id: 'yes', label: { en: 'Yes', es: 'Sí' }, value: 'yes' },
          { id: 'no', label: { en: 'No', es: 'No' }, value: 'no' },
        ],
      },
    ],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: 'activity-level',
    prevStep: 'medical-history-overview',
    progressPercent: 72,
  },

  {
    id: 'activity-level',
    path: 'activity-level',
    title: {
      en: 'What is your usual level of daily physical activity?',
      es: '¿Cuál es tu nivel habitual de actividad física diaria?',
    },
    type: 'single-select',
    fields: [
      {
        id: 'activity_level',
        type: 'radio',
        label: { en: 'Activity Level', es: 'Nivel de Actividad' },
        storageKey: 'activity_level',
        options: [
          { id: '5', label: { en: '5 - Very Active', es: '5 - Muy Activo' }, value: '5', description: { en: 'Exercise 5 to 7 times per week', es: 'Ejercicio 5 a 7 veces por semana' } },
          { id: '4', label: { en: '4', es: '4' }, value: '4' },
          { id: '3', label: { en: '3 - Moderately Active', es: '3 - Moderadamente Activo' }, value: '3', description: { en: 'Exercise 3 to 4 times per week', es: 'Ejercicio 3 a 4 veces por semana' } },
          { id: '2', label: { en: '2', es: '2' }, value: '2' },
          { id: '1', label: { en: '1 - Not very active', es: '1 - No soy muy activo' }, value: '1', description: { en: "Usually don't exercise", es: 'Usualmente no hago ejercicio' } },
        ],
      },
    ],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: 'mental-health',
    prevStep: 'medical-history-overview',
    progressPercent: 73,
  },

  {
    id: 'mental-health',
    path: 'mental-health',
    title: {
      en: 'Have you been diagnosed with any of the following mental health conditions?',
      es: '¿Has sido diagnosticado con alguna de las siguientes condiciones de salud mental?',
    },
    subtitle: {
      en: 'We ask this because some of these conditions may influence the type of treatment that is most appropriate for you.',
      es: 'Preguntamos esto porque algunas de estas condiciones pueden influir en el tipo de tratamiento más adecuado para ti.',
    },
    type: 'single-select',
    fields: [
      {
        id: 'has_mental_health',
        type: 'radio',
        label: { en: 'Mental Health', es: 'Salud Mental' },
        storageKey: 'has_mental_health',
        options: [
          { id: 'yes', label: { en: 'Yes', es: 'Sí' }, value: 'yes' },
          { id: 'no', label: { en: 'No', es: 'No' }, value: 'no' },
        ],
      },
    ],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: [
      { conditions: [{ field: 'has_mental_health', operator: 'equals', value: 'yes' }], target: 'mental-health-conditions' },
      { conditions: [{ field: 'has_mental_health', operator: 'equals', value: 'no' }], target: 'programs-include' },
    ],
    prevStep: 'activity-level',
    progressPercent: 74,
  },

  {
    id: 'mental-health-conditions',
    path: 'mental-health-conditions',
    title: {
      en: 'Have you been diagnosed with any of the following?',
      es: '¿Has sido diagnosticado con alguno de los siguientes?',
    },
    subtitle: {
      en: 'We ask this because some of these conditions may influence the type of treatment that is most appropriate for you.',
      es: 'Preguntamos esto porque algunas de estas condiciones pueden influir en el tipo de tratamiento más adecuado para ti.',
    },
    type: 'single-select',
    fields: [
      {
        id: 'mental_health_conditions',
        type: 'radio',
        label: { en: 'Conditions', es: 'Condiciones' },
        storageKey: 'mental_health_conditions',
        options: [
          { id: 'none', label: { en: 'No, never.', es: 'No, nunca.' }, value: 'none' },
          { id: 'depression', label: { en: 'Depression', es: 'Depresión' }, value: 'depression' },
          { id: 'bipolar', label: { en: 'Bipolar disorder', es: 'Trastorno bipolar' }, value: 'bipolar' },
          { id: 'bpd', label: { en: 'Borderline personality disorder (BPD)', es: 'Trastorno límite de personalidad (TLP)' }, value: 'bpd' },
          { id: 'panic', label: { en: 'Panic attacks', es: 'Ataques de pánico' }, value: 'panic' },
          { id: 'schizophrenia', label: { en: 'Schizophrenia', es: 'Esquizofrenia' }, value: 'schizophrenia' },
          { id: 'psychosis', label: { en: 'Psychosis', es: 'Psicosis' }, value: 'psychosis' },
        ],
      },
    ],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: 'programs-include',
    prevStep: 'mental-health',
    progressPercent: 75,
  },

  {
    id: 'programs-include',
    path: 'programs-include',
    title: {
      en: 'All our programs include',
      es: 'Todos nuestros programas incluyen',
    },
    type: 'custom',
    component: 'ProgramsIncludeStep',
    fields: [],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: 'chronic-conditions',
    prevStep: 'mental-health',
    progressPercent: 76,
    props: {
      autoAdvanceDelay: 2500,
    },
  },

  {
    id: 'chronic-conditions',
    path: 'chronic-conditions',
    title: {
      en: 'Do you have any medical conditions or chronic diseases?',
      es: '¿Tienes alguna condición médica o enfermedad crónica?',
    },
    type: 'single-select',
    fields: [
      {
        id: 'has_chronic_conditions',
        type: 'radio',
        label: { en: 'Chronic Conditions', es: 'Condiciones Crónicas' },
        storageKey: 'has_chronic_conditions',
        options: [
          { id: 'yes', label: { en: 'Yes', es: 'Sí' }, value: 'yes' },
          { id: 'no', label: { en: 'No', es: 'No' }, value: 'no' },
        ],
      },
    ],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: [
      { conditions: [{ field: 'has_chronic_conditions', operator: 'equals', value: 'yes' }], target: 'chronic-conditions-detail' },
      { conditions: [{ field: 'has_chronic_conditions', operator: 'equals', value: 'no' }], target: 'digestive-conditions' },
    ],
    prevStep: 'programs-include',
    progressPercent: 78,
  },

  {
    id: 'chronic-conditions-detail',
    path: 'chronic-conditions-detail',
    title: {
      en: 'What type of chronic condition or disease do you have?',
      es: '¿Qué tipo de condición o enfermedad crónica padeces?',
    },
    type: 'custom',
    component: 'ChronicConditionsDetailStep',
    fields: [],
    autoAdvance: false,
    showContinueButton: true,
    nextStep: 'digestive-conditions',
    prevStep: 'chronic-conditions',
    progressPercent: 80,
  },

  {
    id: 'digestive-conditions',
    path: 'digestive-conditions',
    title: {
      en: 'Do you have any of the following stomach or digestive conditions?',
      es: '¿Tienes alguna de las siguientes condiciones estomacales o digestivas?',
    },
    type: 'multi-select',
    fields: [
      {
        id: 'digestive_conditions',
        type: 'checkbox',
        label: { en: 'Digestive Conditions', es: 'Condiciones Digestivas' },
        storageKey: 'digestive_conditions',
        options: [
          { id: 'ibs', label: { en: 'Irritable bowel syndrome (IBS)', es: 'Síndrome del intestino irritable (SII)' }, value: 'ibs' },
          { id: 'celiac', label: { en: 'Celiac disease', es: 'Enfermedad celíaca' }, value: 'celiac' },
          { id: 'constipation', label: { en: 'Chronic constipation', es: 'Estreñimiento crónico' }, value: 'constipation' },
          { id: 'heartburn', label: { en: 'Heartburn or GERD', es: 'Acidez o ERGE' }, value: 'heartburn' },
          { id: 'gastroparesis', label: { en: 'Gastroparesis', es: 'Gastroparesia' }, value: 'gastroparesis' },
          { id: 'ulcer', label: { en: 'Peptic ulcer or stomach ulcer', es: 'Úlcera péptica o estomacal' }, value: 'ulcer' },
          { id: 'crohns', label: { en: "Crohn's disease", es: 'Enfermedad de Crohn' }, value: 'crohns' },
          { id: 'colitis', label: { en: 'Ulcerative colitis', es: 'Colitis ulcerosa' }, value: 'colitis' },
          { id: 'diverticulitis', label: { en: 'Diverticulitis', es: 'Diverticulitis' }, value: 'diverticulitis' },
          { id: 'none', label: { en: 'None of the above', es: 'Ninguna de las anteriores' }, value: 'none' },
        ],
      },
    ],
    autoAdvance: false,
    showContinueButton: true,
    nextStep: 'kidney-conditions',
    prevStep: 'chronic-conditions',
    progressPercent: 82,
  },

  {
    id: 'kidney-conditions',
    path: 'kidney-conditions',
    title: {
      en: 'Do you have any history of kidney problems?',
      es: '¿Tienes algún historial de problemas renales?',
    },
    type: 'single-select',
    fields: [
      {
        id: 'has_kidney_conditions',
        type: 'radio',
        label: { en: 'Kidney Conditions', es: 'Condiciones Renales' },
        storageKey: 'has_kidney_conditions',
        options: [
          { id: 'yes', label: { en: 'Yes', es: 'Sí' }, value: 'yes' },
          { id: 'no', label: { en: 'No', es: 'No' }, value: 'no' },
        ],
      },
    ],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: 'surgery',
    prevStep: 'digestive-conditions',
    progressPercent: 83,
  },

  {
    id: 'surgery',
    path: 'surgery',
    title: {
      en: 'Have you had any abdominal, intestinal, or weight-loss surgeries?',
      es: '¿Has tenido alguna cirugía abdominal, intestinal o de pérdida de peso?',
    },
    type: 'single-select',
    fields: [
      {
        id: 'had_surgery',
        type: 'radio',
        label: { en: 'Had Surgery', es: 'Tuvo Cirugía' },
        storageKey: 'had_surgery',
        options: [
          { id: 'yes', label: { en: 'Yes', es: 'Sí' }, value: 'yes' },
          { id: 'no', label: { en: 'No', es: 'No' }, value: 'no' },
        ],
      },
    ],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: [
      { conditions: [{ field: 'had_surgery', operator: 'equals', value: 'yes' }], target: 'surgery-details' },
      { conditions: [{ field: 'had_surgery', operator: 'equals', value: 'no' }], target: 'blood-pressure' },
    ],
    prevStep: 'kidney-conditions',
    progressPercent: 84,
  },

  {
    id: 'surgery-details',
    path: 'surgery-details',
    title: {
      en: 'Have you had any surgery or medical procedure?',
      es: '¿Ha tenido alguna cirugía o procedimiento médico?',
    },
    type: 'multi-select',
    fields: [
      {
        id: 'surgery_types',
        type: 'checkbox',
        label: { en: 'Surgery Types', es: 'Tipos de Cirugía' },
        storageKey: 'surgery_types',
        options: [
          { id: 'gastric_bypass', label: { en: 'Gastric bypass (Roux-en-Y)', es: 'Bypass gástrico (Roux-en-Y)' }, value: 'gastric_bypass' },
          { id: 'duodenal_switch', label: { en: 'Duodenal switch', es: 'Cambio duodenal' }, value: 'duodenal_switch' },
          { id: 'lap_band', label: { en: 'Gastric band (Lap Band)', es: 'Banda gástrica (Lap Band)' }, value: 'lap_band' },
          { id: 'gastric_sleeve', label: { en: 'Gastric sleeve', es: 'Manga gástrica' }, value: 'gastric_sleeve' },
          { id: 'intestinal_surgery', label: { en: 'Intestinal surgery', es: 'Cirugía intestinal' }, value: 'intestinal_surgery' },
          { id: 'none', label: { en: 'No, none of these', es: 'No, ninguno de estos' }, value: 'none' },
        ],
      },
    ],
    autoAdvance: false,
    showContinueButton: true,
    nextStep: 'blood-pressure',
    prevStep: 'surgery',
    progressPercent: 85,
  },

  {
    id: 'blood-pressure',
    path: 'blood-pressure',
    title: {
      en: "What's your most recent blood pressure reading?",
      es: '¿Cuál es tu lectura de presión arterial más reciente?',
    },
    subtitle: {
      en: "If you don't know your exact numbers, select your best estimate.",
      es: 'Si no conoces tus números exactos, selecciona tu mejor estimación.',
    },
    type: 'single-select',
    fields: [
      {
        id: 'blood_pressure',
        type: 'radio',
        label: { en: 'Blood Pressure', es: 'Presión Arterial' },
        storageKey: 'blood_pressure',
        options: [
          { id: 'normal', label: { en: 'Normal (below 120/80 mmHg)', es: 'Normal (menos de 120/80 mmHg)' }, value: 'normal' },
          { id: 'elevated', label: { en: 'Elevated (120-129/less than 80 mmHg)', es: 'Elevada (120-129/menos de 80 mmHg)' }, value: 'elevated' },
          { id: 'high_stage1', label: { en: 'High Blood Pressure Stage 1 (130-139/80-89 mmHg)', es: 'Presión Alta Etapa 1 (130-139/80-89 mmHg)' }, value: 'high_stage1' },
          { id: 'high_stage2', label: { en: 'High Blood Pressure Stage 2 (140/90 mmHg or higher)', es: 'Presión Alta Etapa 2 (140/90 mmHg o más)' }, value: 'high_stage2' },
          { id: 'crisis', label: { en: 'Hypertensive Crisis (higher than 180/120 mmHg)', es: 'Crisis Hipertensiva (más de 180/120 mmHg)' }, value: 'crisis' },
          { id: 'low', label: { en: 'Low blood pressure', es: 'Presión baja' }, value: 'low' },
          { id: 'unknown', label: { en: "I don't know", es: 'No lo sé' }, value: 'unknown' },
        ],
      },
    ],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: 'glp1-history',
    prevStep: 'surgery',
    progressPercent: 86,
  },

  // ========== SECTION 7: GLP-1 HISTORY ==========
  {
    id: 'glp1-history',
    path: 'glp1-history',
    title: {
      en: 'Do you currently take or have you ever taken a GLP-1 medication for weight loss?',
      es: '¿Actualmente toma o ha tomado alguna vez un medicamento GLP-1 para perder peso?',
    },
    subtitle: {
      en: 'GLP-1s include compounded semaglutide, compounded tirzepatide, Ozempic, Wegovy, Mounjaro or Zepbound',
      es: 'Los GLP-1 incluyen semaglutida compuesta, tirzepatida compuesta, Ozempic, Wegovy, Mounjaro o Zepbound',
    },
    type: 'single-select',
    fields: [
      {
        id: 'glp1_history',
        type: 'radio',
        label: { en: 'GLP-1 History', es: 'Historial GLP-1' },
        storageKey: 'glp1_history',
        options: [
          { id: 'currently_taking', label: { en: 'Yes, I am currently taking a GLP-1', es: 'Sí, actualmente estoy tomando un GLP-1' }, value: 'currently_taking' },
          { id: 'previously_taken', label: { en: 'Yes, I have taken a GLP-1 before but not currently', es: 'Sí, he tomado un GLP-1 antes pero no actualmente' }, value: 'previously_taken' },
          { id: 'never_taken', label: { en: 'No, I have never taken a GLP-1', es: 'No, nunca he tomado un GLP-1' }, value: 'never_taken' },
          { id: 'considering', label: { en: 'No, but I am considering it', es: 'No, pero lo estoy considerando' }, value: 'considering' },
        ],
      },
    ],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: [
      { conditions: [{ field: 'glp1_history', operator: 'in', value: ['currently_taking', 'previously_taken'] }], target: 'glp1-type' },
      { conditions: [{ field: 'glp1_history', operator: 'in', value: ['never_taken', 'considering'] }], target: 'recreational-drugs' },
    ],
    prevStep: 'blood-pressure',
    progressPercent: 87,
  },

  {
    id: 'glp1-type',
    path: 'glp1-type',
    title: {
      en: 'Which GLP-1 medication did you take or are you currently taking?',
      es: '¿Qué medicamento GLP-1 tomaste o estás tomando actualmente?',
    },
    type: 'single-select',
    fields: [
      {
        id: 'glp1_type',
        type: 'radio',
        label: { en: 'GLP-1 Type', es: 'Tipo de GLP-1' },
        storageKey: 'glp1_type',
        options: [
          { id: 'liraglutide', label: { en: 'Injectable liraglutide', es: 'Liraglutida inyectable' }, value: 'liraglutide', description: { en: 'Victoza, Saxenda', es: 'Victoza, Saxenda' } },
          { id: 'semaglutide', label: { en: 'Injectable semaglutide', es: 'Semaglutida inyectable' }, value: 'semaglutide', description: { en: 'Ozempic, Wegovy or compounded', es: 'Ozempic, Wegovy o compuesta' } },
          { id: 'tirzepatide', label: { en: 'Injectable tirzepatide', es: 'Tirzepatida inyectable' }, value: 'tirzepatide', description: { en: 'Mounjaro, Zepbound or compounded', es: 'Mounjaro, Zepbound o compuesta' } },
          { id: 'oral_glp1', label: { en: 'Oral GLP-1 Medication', es: 'Medicamento GLP-1 Oral' }, value: 'oral_glp1' },
          { id: 'other', label: { en: 'Other medication', es: 'Otro medicamento' }, value: 'other' },
        ],
      },
    ],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: [
      { conditions: [{ field: 'glp1_type', operator: 'equals', value: 'semaglutide' }], target: 'semaglutide-dosage' },
      { conditions: [{ field: 'glp1_type', operator: 'equals', value: 'tirzepatide' }], target: 'tirzepatide-dosage' },
      { conditions: [{ field: 'glp1_type', operator: 'in', value: ['liraglutide', 'oral_glp1', 'other'] }], target: 'dosage-satisfaction' },
    ],
    prevStep: 'glp1-history',
    progressPercent: 88,
  },

  {
    id: 'semaglutide-dosage',
    path: 'semaglutide-dosage',
    title: {
      en: 'What dose of injectable semaglutide (Ozempic®, Wegovy® or compounded) are you taking?',
      es: '¿Qué dosis de semaglutida inyectable (Ozempic®, Wegovy® o compuesta) está tomando?',
    },
    subtitle: {
      en: 'Indicate your current dose in milligrams (mg) per week.',
      es: 'Indique su dosis actual en miligramos (mg) por semana.',
    },
    type: 'single-select',
    fields: [
      {
        id: 'semaglutide_dosage',
        type: 'radio',
        label: { en: 'Semaglutide Dosage', es: 'Dosis de Semaglutida' },
        storageKey: 'semaglutide_dosage',
        options: [
          { id: '0.25mg', label: { en: '0.25mg', es: '0.25mg' }, value: '0.25mg' },
          { id: '0.50mg', label: { en: '0.50mg', es: '0.50mg' }, value: '0.50mg' },
          { id: '0.75mg', label: { en: '0.75mg', es: '0.75mg' }, value: '0.75mg' },
          { id: '1mg', label: { en: '1mg', es: '1mg' }, value: '1mg' },
          { id: '1.25mg', label: { en: '1.25mg', es: '1.25mg' }, value: '1.25mg' },
          { id: '1.7mg', label: { en: '1.7mg', es: '1.7mg' }, value: '1.7mg' },
          { id: '2mg', label: { en: '2mg', es: '2mg' }, value: '2mg' },
          { id: '2.4mg', label: { en: '2.4mg', es: '2.4mg' }, value: '2.4mg' },
          { id: 'oral', label: { en: 'I am taking Oral Semaglutide', es: 'Estoy tomando Semaglutida Oral' }, value: 'oral' },
        ],
      },
    ],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: 'semaglutide-side-effects',
    prevStep: 'glp1-type',
    progressPercent: 89,
  },

  {
    id: 'semaglutide-side-effects',
    path: 'semaglutide-side-effects',
    title: {
      en: 'Have you experienced any side effects while taking semaglutide?',
      es: '¿Has experimentado algún efecto secundario mientras tomas semaglutida?',
    },
    type: 'multi-select',
    fields: [
      {
        id: 'semaglutide_side_effects',
        type: 'checkbox',
        label: { en: 'Side Effects', es: 'Efectos Secundarios' },
        storageKey: 'semaglutide_side_effects',
        options: [
          { id: 'nausea', label: { en: 'Nausea', es: 'Náuseas' }, value: 'nausea' },
          { id: 'vomiting', label: { en: 'Vomiting', es: 'Vómitos' }, value: 'vomiting' },
          { id: 'diarrhea', label: { en: 'Diarrhea', es: 'Diarrea' }, value: 'diarrhea' },
          { id: 'constipation', label: { en: 'Constipation', es: 'Estreñimiento' }, value: 'constipation' },
          { id: 'headache', label: { en: 'Headache', es: 'Dolor de cabeza' }, value: 'headache' },
          { id: 'fatigue', label: { en: 'Fatigue', es: 'Fatiga' }, value: 'fatigue' },
          { id: 'none', label: { en: 'None of the above', es: 'Ninguno de los anteriores' }, value: 'none' },
        ],
      },
    ],
    autoAdvance: false,
    showContinueButton: true,
    nextStep: 'semaglutide-success',
    prevStep: 'semaglutide-dosage',
    progressPercent: 90,
  },

  {
    id: 'semaglutide-success',
    path: 'semaglutide-success',
    title: {
      en: 'How successful has your experience been with semaglutide (Ozempic®, Wegovy®)?',
      es: '¿Qué tan exitosa ha sido su experiencia con semaglutide (Ozempic®, Wegovy®)?',
    },
    type: 'single-select',
    fields: [
      {
        id: 'semaglutide_success',
        type: 'radio',
        label: { en: 'Success', es: 'Éxito' },
        storageKey: 'semaglutide_success',
        options: [
          { id: 'very_successful', label: { en: 'Very successful, I lost weight and kept it off', es: 'Muy exitosa, bajé de peso y lo mantuve' }, value: 'very_successful' },
          { id: 'somewhat_successful', label: { en: 'Somewhat successful, I lost weight but gained some back', es: 'Algo exitosa, bajé de peso pero volví a subir algo' }, value: 'somewhat_successful' },
          { id: 'not_successful', label: { en: "Not successful, I didn't lose much weight", es: 'No fue exitosa, no bajé mucho de peso' }, value: 'not_successful' },
          { id: 'hard_consistency', label: { en: 'I had trouble maintaining consistency', es: 'Me costó mantener la constancia' }, value: 'hard_consistency' },
        ],
      },
    ],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: 'dosage-satisfaction',
    prevStep: 'semaglutide-side-effects',
    progressPercent: 91,
  },

  {
    id: 'tirzepatide-dosage',
    path: 'tirzepatide-dosage',
    title: {
      en: 'What dose of injectable tirzepatide (Mounjaro®, Zepbound® or compounded) are you taking?',
      es: '¿Qué dosis de tirzepatida inyectable (Mounjaro®, Zepbound® o compuesta) está tomando?',
    },
    subtitle: {
      en: 'Indicate your current dose in milligrams (mg) per week.',
      es: 'Indique su dosis actual en miligramos (mg) por semana.',
    },
    type: 'single-select',
    fields: [
      {
        id: 'tirzepatide_dosage',
        type: 'radio',
        label: { en: 'Tirzepatide Dosage', es: 'Dosis de Tirzepatida' },
        storageKey: 'tirzepatide_dosage',
        options: [
          { id: '2.5mg', label: { en: '2.5mg', es: '2.5mg' }, value: '2.5mg' },
          { id: '5.0mg', label: { en: '5.0mg', es: '5.0mg' }, value: '5.0mg' },
          { id: '7.5mg', label: { en: '7.5mg', es: '7.5mg' }, value: '7.5mg' },
          { id: '10mg', label: { en: '10mg', es: '10mg' }, value: '10mg' },
          { id: '12.5mg', label: { en: '12.5mg', es: '12.5mg' }, value: '12.5mg' },
          { id: '15mg', label: { en: '15mg', es: '15mg' }, value: '15mg' },
          { id: 'oral', label: { en: 'I am taking Oral Tirzepatide', es: 'Estoy tomando Tirzepatida Oral' }, value: 'oral' },
        ],
      },
    ],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: 'tirzepatide-side-effects',
    prevStep: 'glp1-type',
    progressPercent: 89,
  },

  {
    id: 'tirzepatide-side-effects',
    path: 'tirzepatide-side-effects',
    title: {
      en: 'Have you experienced any side effects while taking tirzepatide?',
      es: '¿Has experimentado algún efecto secundario mientras tomas tirzepatida?',
    },
    type: 'multi-select',
    fields: [
      {
        id: 'tirzepatide_side_effects',
        type: 'checkbox',
        label: { en: 'Side Effects', es: 'Efectos Secundarios' },
        storageKey: 'tirzepatide_side_effects',
        options: [
          { id: 'nausea', label: { en: 'Nausea', es: 'Náuseas' }, value: 'nausea' },
          { id: 'vomiting', label: { en: 'Vomiting', es: 'Vómitos' }, value: 'vomiting' },
          { id: 'diarrhea', label: { en: 'Diarrhea', es: 'Diarrea' }, value: 'diarrhea' },
          { id: 'constipation', label: { en: 'Constipation', es: 'Estreñimiento' }, value: 'constipation' },
          { id: 'headache', label: { en: 'Headache', es: 'Dolor de cabeza' }, value: 'headache' },
          { id: 'fatigue', label: { en: 'Fatigue', es: 'Fatiga' }, value: 'fatigue' },
          { id: 'none', label: { en: 'None of the above', es: 'Ninguno de los anteriores' }, value: 'none' },
        ],
      },
    ],
    autoAdvance: false,
    showContinueButton: true,
    nextStep: 'tirzepatide-success',
    prevStep: 'tirzepatide-dosage',
    progressPercent: 90,
  },

  {
    id: 'tirzepatide-success',
    path: 'tirzepatide-success',
    title: {
      en: 'How successful has your experience been with tirzepatide (Mounjaro®, Zepbound®)?',
      es: '¿Qué tan exitosa ha sido su experiencia con tirzepatide (Mounjaro®, Zepbound®)?',
    },
    type: 'single-select',
    fields: [
      {
        id: 'tirzepatide_success',
        type: 'radio',
        label: { en: 'Success', es: 'Éxito' },
        storageKey: 'tirzepatide_success',
        options: [
          { id: 'very_successful', label: { en: 'Very successful, I lost weight and kept it off', es: 'Muy exitosa, bajé de peso y lo mantuve' }, value: 'very_successful' },
          { id: 'somewhat_successful', label: { en: 'Somewhat successful, I lost weight but gained some back', es: 'Algo exitosa, bajé de peso pero volví a subir algo' }, value: 'somewhat_successful' },
          { id: 'not_successful', label: { en: "Not successful, I didn't lose much weight", es: 'No fue exitosa, no bajé mucho de peso' }, value: 'not_successful' },
          { id: 'hard_consistency', label: { en: 'I had trouble maintaining consistency', es: 'Me costó mantener la constancia' }, value: 'hard_consistency' },
        ],
      },
    ],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: 'dosage-satisfaction',
    prevStep: 'tirzepatide-side-effects',
    progressPercent: 91,
  },

  {
    id: 'dosage-satisfaction',
    path: 'dosage-satisfaction',
    title: {
      en: 'Are you satisfied with your current GLP-1 dose?',
      es: '¿Está satisfecho con su dosis actual de GLP-1?',
    },
    type: 'single-select',
    fields: [
      {
        id: 'dosage_satisfaction',
        type: 'radio',
        label: { en: 'Satisfaction', es: 'Satisfacción' },
        storageKey: 'dosage_satisfaction',
        options: [
          { id: 'increase', label: { en: 'Yes, but I would like to increase my dose if higher doses are available and appropriate for me', es: 'Sí, pero me gustaría aumentar mi dosis si hay dosis más altas disponibles y son adecuadas para mí' }, value: 'increase' },
          { id: 'maintain', label: { en: 'Yes, I want to maintain my current dose', es: 'Sí, quiero mantener mi dosis actual' }, value: 'maintain' },
          { id: 'reduce', label: { en: 'No, I want to reduce my current dose', es: 'No, quiero reducir mi dosis actual' }, value: 'reduce' },
        ],
      },
    ],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: 'alcohol-consumption',
    prevStep: 'glp1-type',
    progressPercent: 92,
  },

  // ========== SECTION 8: LIFESTYLE ==========
  {
    id: 'recreational-drugs',
    path: 'recreational-drugs',
    title: {
      en: 'Have you taken any of the following recreational drugs in the past 6 months?',
      es: '¿Has tomado alguna de las siguientes drogas recreativas en los últimos 6 meses?',
    },
    subtitle: {
      en: 'We ask this question so your provider can have a complete picture of your current health and determine which treatment might be right for you.',
      es: 'Hacemos esta pregunta para que tu proveedor pueda tener una imagen completa de tu salud actual y determinar qué tratamiento podría ser adecuado para ti.',
    },
    type: 'multi-select',
    fields: [
      {
        id: 'recreational_drugs',
        type: 'checkbox',
        label: { en: 'Recreational Drugs', es: 'Drogas Recreativas' },
        storageKey: 'recreational_drugs',
        options: [
          { id: 'cocaine', label: { en: 'Cocaine', es: 'Cocaína' }, value: 'cocaine' },
          { id: 'kratom', label: { en: 'Kratom', es: 'Kratom' }, value: 'kratom' },
          { id: 'opiates', label: { en: 'Opiates/opioids', es: 'Opiáceos/opioides' }, value: 'opiates' },
          { id: 'meth', label: { en: 'Methamphetamine', es: 'Metanfetamina' }, value: 'meth' },
          { id: 'cannabis', label: { en: 'Cannabis', es: 'Cannabis' }, value: 'cannabis' },
          { id: 'none', label: { en: 'No, none of these', es: 'No, ninguno de estos' }, value: 'none' },
        ],
      },
    ],
    autoAdvance: false,
    showContinueButton: true,
    nextStep: 'weight-loss-history',
    prevStep: 'glp1-history',
    progressPercent: 88,
  },

  {
    id: 'weight-loss-history',
    path: 'weight-loss-history',
    title: {
      en: 'Have you ever tried to lose weight before?',
      es: '¿Has intentado perder peso antes?',
    },
    type: 'multi-select',
    fields: [
      {
        id: 'weight_loss_methods',
        type: 'checkbox',
        label: { en: 'Methods Tried', es: 'Métodos Probados' },
        storageKey: 'weight_loss_methods',
        options: [
          { id: 'diet', label: { en: 'Diet changes', es: 'Cambios de dieta' }, value: 'diet' },
          { id: 'exercise', label: { en: 'Exercise', es: 'Ejercicio' }, value: 'exercise' },
          { id: 'supplements', label: { en: 'Weight loss supplements', es: 'Suplementos para perder peso' }, value: 'supplements' },
          { id: 'programs', label: { en: 'Weight loss programs (WW, Noom, etc.)', es: 'Programas de pérdida de peso (WW, Noom, etc.)' }, value: 'programs' },
          { id: 'surgery', label: { en: 'Bariatric surgery', es: 'Cirugía bariátrica' }, value: 'surgery' },
          { id: 'medication', label: { en: 'Prescription medication', es: 'Medicación con receta' }, value: 'medication' },
          { id: 'none', label: { en: "Haven't tried before", es: 'No he intentado antes' }, value: 'none' },
        ],
      },
    ],
    autoAdvance: false,
    showContinueButton: true,
    nextStep: 'weight-loss-support',
    prevStep: 'recreational-drugs',
    progressPercent: 89,
  },

  {
    id: 'weight-loss-support',
    path: 'weight-loss-support',
    title: {
      en: 'What would make it easier for you to stick with a weight loss program?',
      es: '¿Qué haría más fácil para ti mantenerte en un programa de pérdida de peso?',
    },
    subtitle: {
      en: 'Select all that apply.',
      es: 'Selecciona todo lo que aplique.',
    },
    type: 'multi-select',
    fields: [
      {
        id: 'weight_loss_support',
        type: 'checkbox',
        label: { en: 'Support', es: 'Apoyo' },
        storageKey: 'weight_loss_support',
        options: [
          { id: 'nutrition', label: { en: 'Personalized recommendations for nutrition and movement', es: 'Recomendaciones personalizadas para nutrición y movimiento' }, value: 'nutrition' },
          { id: 'meals', label: { en: 'Convenient meal options (meal replacements, meal plans)', es: 'Opciones de comida convenientes (reemplazos de comidas, planes de comidas)' }, value: 'meals' },
          { id: 'digital', label: { en: 'Digital tools (tracking apps, coaching)', es: 'Herramientas digitales (aplicaciones de seguimiento, coaching)' }, value: 'digital' },
          { id: 'dosage', label: { en: 'Personalized dosage schedule that would help address side effects', es: 'Programa de dosis personalizado que ayudaría a abordar los efectos secundarios' }, value: 'dosage' },
          { id: 'community', label: { en: 'Stronger community support', es: 'Mayor apoyo comunitario' }, value: 'community' },
          { id: 'other', label: { en: 'Other', es: 'Otro' }, value: 'other' },
        ],
      },
    ],
    autoAdvance: false,
    showContinueButton: true,
    nextStep: 'side-effects-info',
    prevStep: 'weight-loss-history',
    progressPercent: 90,
  },

  {
    id: 'side-effects-info',
    path: 'side-effects-info',
    title: {
      en: 'Nausea, vomiting, constipation, and diarrhea are common early side effects of weight loss medication.',
      es: 'Las náuseas, vómitos, estreñimiento y diarrea son efectos secundarios tempranos comunes de los medicamentos para perder peso.',
    },
    type: 'info',
    fields: [],
    autoAdvance: false,
    showContinueButton: true,
    nextStep: 'dosage-interest',
    prevStep: 'weight-loss-support',
    progressPercent: 91,
  },

  {
    id: 'dosage-interest',
    path: 'dosage-interest',
    title: {
      en: 'Would you be interested in your provider considering a personalized dosage plan that can help manage gastrointestinal side effects like nausea, vomiting, constipation, and diarrhea?',
      es: '¿Estarías interesado en que tu proveedor considere un plan de dosis personalizado que pueda ayudar a manejar los efectos secundarios gastrointestinales como náuseas, vómitos, estreñimiento y diarrea?',
    },
    type: 'single-select',
    fields: [
      {
        id: 'dosage_interest',
        type: 'radio',
        label: { en: 'Interest', es: 'Interés' },
        storageKey: 'dosage_interest',
        options: [
          { id: 'yes', label: { en: 'Yes', es: 'Sí' }, value: 'yes' },
          { id: 'no', label: { en: 'No', es: 'No' }, value: 'no' },
          { id: 'not_sure', label: { en: "I'm not sure", es: 'No estoy seguro' }, value: 'not_sure' },
        ],
      },
    ],
    autoAdvance: false,
    showContinueButton: true,
    nextStep: 'glp1-data',
    prevStep: 'side-effects-info',
    progressPercent: 92,
  },

  {
    id: 'glp1-data',
    path: 'glp1-data',
    title: {
      en: 'Clinical data* indicates that personalized GLP-1 dosing can help reduce side effects without compromising results.',
      es: 'Datos clínicos* indican que las dosis personalizadas de GLP-1 pueden ayudar a reducir los efectos secundarios sin comprometer los resultados.',
    },
    type: 'custom',
    component: 'GLP1DataStep',
    fields: [],
    autoAdvance: false,
    showContinueButton: true,
    nextStep: 'review',
    prevStep: 'dosage-interest',
    progressPercent: 93,
  },

  {
    id: 'alcohol-consumption',
    path: 'alcohol-consumption',
    title: {
      en: 'How often do you have 5 or more alcoholic drinks on a single occasion?',
      es: '¿Con qué frecuencia tomas 5 o más bebidas alcohólicas en una sola ocasión?',
    },
    subtitle: {
      en: "Alcohol can sometimes interfere with the effect of certain medications. It's important for your provider to know so they can give you the best guidance possible.",
      es: 'El alcohol a veces puede interferir con el efecto de ciertos medicamentos. Es importante que tu proveedor lo sepa para poder darte la mejor orientación posible.',
    },
    type: 'single-select',
    fields: [
      {
        id: 'alcohol_consumption',
        type: 'radio',
        label: { en: 'Alcohol Consumption', es: 'Consumo de Alcohol' },
        storageKey: 'alcohol_consumption',
        options: [
          { id: 'never', label: { en: 'Never', es: 'Nunca' }, value: 'never' },
          { id: 'few_times_year', label: { en: 'A few times a year', es: 'Algunas veces al año' }, value: 'few_times_year' },
          { id: 'few_times_month', label: { en: 'A few times a month', es: 'Algunas veces al mes' }, value: 'few_times_month' },
          { id: 'few_times_week', label: { en: 'A few times a week', es: 'Algunas veces a la semana' }, value: 'few_times_week' },
          { id: 'daily', label: { en: 'Every day or almost every day', es: 'Todos los días o casi todos los días' }, value: 'daily' },
        ],
      },
    ],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: 'safety-quality',
    prevStep: 'dosage-satisfaction',
    progressPercent: 93,
  },

  {
    id: 'safety-quality',
    path: 'safety-quality',
    title: {
      en: 'Committed to safety and the highest quality at every step.',
      es: 'Comprometidos con la seguridad y la máxima calidad en cada paso.',
    },
    type: 'custom',
    component: 'SafetyQualityStep',
    fields: [],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: 'medical-team',
    prevStep: 'alcohol-consumption',
    progressPercent: 94,
    props: {
      autoAdvanceDelay: 2500,
    },
  },

  {
    id: 'medical-team',
    path: 'medical-team',
    title: {
      en: 'Meet Your Medical Team',
      es: 'Conoce a Tu Equipo Médico',
    },
    type: 'custom',
    component: 'MedicalTeamStep',
    fields: [],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: 'common-side-effects',
    prevStep: 'safety-quality',
    progressPercent: 95,
    props: {
      autoAdvanceDelay: 2500,
    },
  },

  {
    id: 'common-side-effects',
    path: 'common-side-effects',
    title: {
      en: 'Do you usually experience any of these side effects when starting a new medication or supplement?',
      es: '¿Sueles presentar alguno de estos efectos secundarios al comenzar un nuevo medicamento o suplemento?',
    },
    subtitle: {
      en: 'Our doctors can help you manage side effects with a personalized treatment plan. Select all that apply to your case.',
      es: 'Nuestros doctores puede ayudarte a controlar los efectos secundarios con un plan de tratamiento personalizado. Marca todas las opciones que apliquen a tu caso.',
    },
    type: 'single-select',
    fields: [
      {
        id: 'common_side_effects',
        type: 'radio',
        label: { en: 'Common Side Effects', es: 'Efectos Secundarios Comunes' },
        storageKey: 'common_side_effects',
        options: [
          { id: 'gastrointestinal', label: { en: 'Gastrointestinal problems', es: 'Problemas gastrointestinales' }, value: 'gastrointestinal', description: { en: '(such as nausea, vomiting, diarrhea, constipation or bloating)', es: '(como náuseas, vómitos, diarrea, estreñimiento o hinchazón)' } },
          { id: 'abdominal_pain', label: { en: 'Abdominal pain', es: 'Dolor abdominal' }, value: 'abdominal_pain', description: { en: '(such as cramps or discomfort)', es: '(como cólicos o molestias)' } },
          { id: 'appetite_decrease', label: { en: 'Decreased appetite', es: 'Disminución del apetito' }, value: 'appetite_decrease' },
          { id: 'fatigue', label: { en: 'Fatigue', es: 'Fatiga' }, value: 'fatigue' },
          { id: 'dizziness', label: { en: 'Dizziness', es: 'Mareos' }, value: 'dizziness' },
          { id: 'headache', label: { en: 'Headaches', es: 'Dolores de cabeza' }, value: 'headache' },
          { id: 'none', label: { en: "I don't experience any effects", es: 'No experimento efecto alguno' }, value: 'none' },
        ],
      },
    ],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: 'personalized-treatment',
    prevStep: 'medical-team',
    progressPercent: 96,
  },

  {
    id: 'personalized-treatment',
    path: 'personalized-treatment',
    title: {
      en: 'Your personalized treatment awaits.',
      es: 'Tu tratamiento personalizado te espera.',
    },
    type: 'custom',
    component: 'PersonalizedTreatmentStep',
    fields: [],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: 'review',
    prevStep: 'common-side-effects',
    progressPercent: 97,
    props: {
      autoAdvanceDelay: 2000,
    },
  },

  // ========== SECTION 9: REVIEW & SUBMISSION ==========
  {
    id: 'review',
    path: 'review',
    title: {
      en: 'Thank you',
      es: 'Gracias',
    },
    type: 'custom',
    component: 'ReviewStep',
    fields: [],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: 'finding-provider',
    prevStep: 'personalized-treatment',
    progressPercent: 98,
    props: {
      autoAdvanceDelay: 2000,
    },
  },

  {
    id: 'finding-provider',
    path: 'finding-provider',
    title: {
      en: 'Finding a licensed provider',
      es: 'Buscando un proveedor licenciado',
    },
    type: 'custom',
    component: 'FindingProviderStep',
    fields: [],
    autoAdvance: true,
    showContinueButton: false,
    nextStep: 'qualified',
    prevStep: 'review',
    progressPercent: 99,
    props: {
      autoAdvanceDelay: 4000,
    },
  },

  {
    id: 'qualified',
    path: 'qualified',
    title: {
      en: 'Great news',
      es: '¡Excelentes noticias',
    },
    type: 'custom',
    component: 'QualifiedStep',
    fields: [],
    autoAdvance: false,
    showContinueButton: true,
    nextStep: null,
    prevStep: 'finding-provider',
    progressPercent: 100,
  },
];

// ============================================================
// FORM CONFIGURATION
// ============================================================

export const weightLossIntakeConfig: FormConfig = {
  id: 'weight-loss-intake-v2',
  name: 'Weight Loss Medical Intake V2',
  version: '2.1.0',
  description: 'Enterprise-grade medical intake questionnaire - V1 content sync',
  
  steps,
  startStep: 'goals',
  
  languages: ['en', 'es'],
  defaultLanguage: 'en',
  
  integrations: [
    {
      type: 'airtable',
      triggers: ['complete'],
      mapping: {
        'firstName': 'First Name',
        'lastName': 'Last Name',
        'email': 'Email',
        'phone': 'Phone',
        'state': 'State',
        'dob': 'Date of Birth',
        'sex': 'Sex',
        'goals': 'Goals',
        'current_weight': 'Current Weight',
        'ideal_weight': 'Ideal Weight',
        'height_feet': 'Height Feet',
        'height_inches': 'Height Inches',
        'glp1_history': 'GLP1 History',
        'glp1_type': 'GLP1 Type',
        'semaglutide_dosage': 'Semaglutide Dosage',
        'tirzepatide_dosage': 'Tirzepatide Dosage',
        'dosage_satisfaction': 'Dosage Satisfaction',
      },
    },
    {
      type: 'webhook',
      endpoint: '/api/webhooks/eonpro-intake',
      triggers: ['complete'],
    },
  ],
  
  createdAt: '2025-01-14',
  updatedAt: '2025-01-14',
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getStepById(stepId: string): FormStep | undefined {
  return steps.find(step => step.id === stepId);
}

export function getStepByPath(path: string): FormStep | undefined {
  return steps.find(step => step.path === path);
}

export function getNextStep(currentStepId: string, responses: Record<string, unknown>): string | null {
  const currentStep = getStepById(currentStepId);
  if (!currentStep) return null;

  const nextStep = currentStep.nextStep;

  // No next step
  if (nextStep === null) return null;

  // Static navigation
  if (typeof nextStep === 'string') {
    return nextStep;
  }

  // Conditional navigation
  if (Array.isArray(nextStep)) {
    for (const nav of nextStep) {
      const allConditionsMet = nav.conditions.every(condition => {
        const fieldValue = responses[condition.field];
        
        switch (condition.operator) {
          case 'equals':
            return fieldValue === condition.value;
          case 'notEquals':
            return fieldValue !== condition.value;
          case 'in':
            return Array.isArray(condition.value) && condition.value.includes(fieldValue as string);
          case 'notIn':
            return Array.isArray(condition.value) && !condition.value.includes(fieldValue as string);
          case 'contains':
            return Array.isArray(fieldValue) && fieldValue.includes(condition.value);
          case 'greaterThan':
            return typeof fieldValue === 'number' && typeof condition.value === 'number' && fieldValue > condition.value;
          case 'lessThan':
            return typeof fieldValue === 'number' && typeof condition.value === 'number' && fieldValue < condition.value;
          default:
            return false;
        }
      });

      if (allConditionsMet) {
        return nav.target;
      }
    }
  }

  return null;
}

export function getPreviousStep(currentStepId: string): string | null {
  const currentStep = getStepById(currentStepId);
  return currentStep?.prevStep || null;
}

export function getTotalSteps(): number {
  return steps.length;
}

export function getStepProgress(stepId: string): number {
  const step = getStepById(stepId);
  return step?.progressPercent || 0;
}

export function getAllSteps(): FormStep[] {
  return steps;
}

export function getStepIndex(stepId: string): number {
  return steps.findIndex(step => step.id === stepId);
}

export function isFirstStep(stepId: string): boolean {
  return getStepIndex(stepId) === 0;
}

export function isLastStep(stepId: string): boolean {
  return getStepIndex(stepId) === steps.length - 1;
}
