'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EonmedsLogo from '@/components/EonmedsLogo';
import IntakePageLayout from '@/components/IntakePageLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';

export default function ContactInfoPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('US');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [consent, setConsent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const countries = [
    { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
    { code: 'PR', name: 'Puerto Rico', flag: '🇵🇷', dialCode: '+1' }
  ];

  const selectedCountry = countries.find(c => c.code === country) || countries[0];

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation for US and Puerto Rico
  const validatePhone = (phone: string) => {
    // Remove all non-digits
    const digitsOnly = phone.replace(/\D/g, '');
    
    if (country === 'US' || country === 'PR') {
      // US and Puerto Rico phone: 10 digits
      return digitsOnly.length === 10;
    }
    return false;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    // Clear error when user starts typing
    if (emailError) {
      setEmailError('');
    }
  };

  const formatPhoneNumber = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    let formatted = digitsOnly;
    
    if (digitsOnly.length > 0) {
      if (digitsOnly.length <= 3) {
        formatted = digitsOnly;
      } else if (digitsOnly.length <= 6) {
        formatted = `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3)}`;
      } else {
        formatted = `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6, 10)}`;
      }
    }
    
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const digitsOnly = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    if (digitsOnly.length <= 10) {
      const formatted = formatPhoneNumber(digitsOnly);
      setPhone(formatted);
      // Clear error when user starts typing
      if (phoneError) {
        setPhoneError('');
      }
    }
  };

  const handleContinue = async () => {
    // Prevent double submission
    if (isSubmitting) {
      console.log('Already submitting...');
      return;
    }

    console.log('Starting submission...');
    console.log('Email:', email, 'Valid:', validateEmail(email));
    console.log('Phone:', phone, 'Valid:', validatePhone(phone));
    console.log('Consent:', consent);

    // Validate inputs
    const isEmailValid = validateEmail(email);
    const isPhoneValid = validatePhone(phone);
    
    // Set error messages if invalid
    if (!isEmailValid) {
      setEmailError(language === 'es' ? 'Por favor ingrese un email válido' : 'Please enter a valid email');
      return;
    }
    
    if (!isPhoneValid) {
      setPhoneError(language === 'es' ? 'Por favor ingrese un número de teléfono válido de 10 dígitos' : 'Please enter a valid 10-digit phone number');
      return;
    }
    
    if (!consent) {
      console.log('Consent not checked');
      return;
    }

    // All validations passed, proceed with submission
    setIsSubmitting(true);
    
    try {
      // Save data to session storage
      const phoneDigitsOnly = phone.replace(/\D/g, '');
      const formattedPhone = '+1' + phoneDigitsOnly;
      
      sessionStorage.setItem('intake_contact', JSON.stringify({ 
        email, 
        phone: formattedPhone 
      }));
      
      console.log('Data saved to sessionStorage');
      
      // Save checkpoint data locally (no API call for now)
      const nameData = sessionStorage.getItem('intake_name');
      const stateData = sessionStorage.getItem('intake_state');
      const dobData = sessionStorage.getItem('intake_dob');
      
      const checkpointData = {
        checkpointName: 'personal-info',
        timestamp: new Date().toISOString(),
        data: {
          personalInfo: {
            ...(nameData ? JSON.parse(nameData) : {}),
            email,
            phone: formattedPhone,
            dob: dobData ? JSON.parse(dobData) : null,
            state: stateData ? JSON.parse(stateData) : null
          }
        },
        sessionId: sessionStorage.getItem('intake_session_id') || `session-${Date.now()}`,
        status: 'partial'
      };
      
      // Save checkpoint locally
      const existingCheckpoints = JSON.parse(
        sessionStorage.getItem('intake_checkpoints') || '[]'
      );
      existingCheckpoints.push(checkpointData);
      sessionStorage.setItem('intake_checkpoints', JSON.stringify(existingCheckpoints));
      
      // Mark checkpoint as completed
      const completedCheckpoints = JSON.parse(
        sessionStorage.getItem('completed_checkpoints') || '[]'
      );
      if (!completedCheckpoints.includes('personal-info')) {
        completedCheckpoints.push('personal-info');
        sessionStorage.setItem('completed_checkpoints', JSON.stringify(completedCheckpoints));
      }
      
      console.log('Checkpoint saved locally');
      console.log('Navigating to /intake/support-info...');
      
      // Navigate to next page
      router.push('/intake/support-info');
    } catch (error) {
      console.error('Error during submission:', error);
      // Even if there's an error, try to navigate
      router.push('/intake/support-info');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressBar = (
    <div className="w-full h-1 bg-gray-100">
      <div className="h-full w-[16%] bg-[#f0feab] transition-all duration-300"></div>
    </div>
  );

  const backButton = (
    <Link href="/intake/dob" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
      </svg>
    </Link>
  );

  const continueButton = (
    <button 
      onClick={handleContinue}
      disabled={!email || !phone || !consent || isSubmitting}
      className={`w-full py-4 px-8 rounded-full text-lg font-medium flex items-center justify-center space-x-3 transition-all ${
        email && phone && consent && !isSubmitting
          ? 'bg-black text-white hover:bg-gray-900' 
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
    >
      <span>{isSubmitting ? (language === 'es' ? 'Procesando...' : 'Processing...') : (language === 'es' ? 'Continuar' : 'Continue')}</span>
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
      </svg>
    </button>
  );

  const copyrightText = (
    <p className="text-[9px] lg:text-[11px] text-gray-400 text-center leading-tight">
      {language === 'es' 
        ? '© 2025 EONPro, LLC. Todos los derechos reservados.\nProceso exclusivo y protegido. Copiar o reproducir\nsin autorización está prohibido.'
        : '© 2025 EONPro, LLC. All rights reserved.\nExclusive and protected process. Copying or reproduction\nwithout authorization is prohibited.'}
    </p>
  );

  return (
    <IntakePageLayout
      progressBar={progressBar}
      backButton={backButton}
      button={continueButton}
      copyright={copyrightText}
    >
      <div className="max-w-md lg:max-w-2xl mx-auto w-full">
        {/* Logo */}
        <EonmedsLogo />
      
        <div className="space-y-6 mt-6">
          <div>
            <h1 className="text-3xl font-medium mb-4">
              {language === 'es' ? '¿Cómo podemos contactarte?' : 'How can we contact you?'}
            </h1>
            <p className="text-gray-500">
              {language === 'es' 
                ? 'Usamos esta información para mantenerte informado sobre tu tratamiento, enviarte actualizaciones importantes y ayudarte a mantenerte conectado con tu proveedor.'
                : 'We use this information to keep you informed about your treatment, send you important updates, and help you stay connected with your provider.'}
            </p>
          </div>

          <div className="space-y-4">
            {/* Email Input */}
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                className={`w-full p-4 text-[16px] md:text-lg font-medium border rounded-2xl focus:outline-none ${
                  emailError ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-gray-400'
                }`}
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>

            {/* Phone Input with Country Code */}
            <div>
              <div className="flex space-x-2 w-full overflow-hidden">
                <div className="relative flex-shrink-0">
                  <button 
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="flex items-center space-x-2 p-4 border border-gray-200 rounded-2xl"
                  >
                    <span className="text-2xl">{selectedCountry.flag}</span>
                    <span className="text-[16px] md:text-base font-medium">+1</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showCountryDropdown && (
                    <div className="absolute z-10 mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-lg">
                      {countries.map(c => (
                        <button
                          key={c.code}
                          onClick={() => {
                            setCountry(c.code);
                            setShowCountryDropdown(false);
                            setPhone(''); // Reset phone when country changes
                            setPhoneError('');
                          }}
                          className={`w-full flex items-center space-x-3 p-3 hover:bg-gray-50 first:rounded-t-2xl last:rounded-b-2xl ${
                            country === c.code ? 'bg-gray-100' : ''
                          }`}
                        >
                          <span className="text-2xl">{c.flag}</span>
                          <span className="text-sm">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <input
                  type="tel"
                  placeholder="000 000 0000"
                  value={phone}
                  onChange={handlePhoneChange}
                  inputMode="numeric"
                  className={`flex-1 min-w-0 p-4 text-[16px] md:text-lg border rounded-2xl focus:outline-none ${
                    phoneError ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-gray-400'
                  }`}
                />
              </div>
              {phoneError && (
                <p className="text-red-500 text-sm mt-1">{phoneError}</p>
              )}
            </div>

            {/* Consent Checkbox */}
            <div className="flex items-start">
              <button
                type="button"
                onClick={() => setConsent(!consent)}
                className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  consent ? 'bg-gray-200 border-gray-400' : 'bg-white border-gray-300'
                }`}
              >
                {consent && (
                  <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <div className="ml-3 text-sm text-gray-600 leading-relaxed">
                {language === 'es'
                  ? <>Acepto la <a href="#" className="text-[#4fa87f] underline">Política de Privacidad</a> y autorizo recibir comunicaciones importantes por correo electrónico y mensajes de texto (SMS) de EONMeds/EONPro y afiliados con respecto a mi tratamiento.</>
                  : <>I accept the <a href="#" className="text-[#4fa87f] underline">Privacy Policy</a> and I authorize receiving important communications via email and text messages (SMS) from EONMeds/EONPro and affiliates regarding my treatment.</>
                }
              </div>
            </div>
          </div>

          {/* SMS Disclosure */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs text-gray-600 leading-relaxed">
              {language === 'es'
                ? 'Para ayudar a garantizar la seguridad del paciente, necesitamos verificar tu número de teléfono. Al proporcionarlo y continuar, consientes recibir mensajes de texto de EONPro para verificación y otros usos legalmente permitidos relacionados con tu cuenta y nuestros servicios. Esto puede incluir confirmaciones de pedidos, actualizaciones de envío y mensajes de tu proveedor. Pueden aplicarse tarifas de mensajes y datos. La frecuencia de los mensajes puede variar. Responde AYUDA para asistencia o STOP para cancelar la suscripción. Pueden aplicarse tarifas estándar de mensajes y datos. Estos mensajes pueden incluir recordatorios médicos, actualizaciones de tratamiento, promociones y otra información relacionada con tu atención.'
                : 'To help ensure patient safety, we need to verify your phone number. By providing it and continuing, you consent to receive text messages from EONPro for verification and other legally permitted uses related to your account and our services. This may include order confirmations, shipping updates, and messages from your provider. Message and data rates may apply. Message frequency may vary. Reply HELP for assistance or STOP to unsubscribe. Standard message and data rates may apply. These messages may include medical reminders, treatment updates, promotions, and other information related to your care.'}
            </p>
          </div>
        </div>
      </div>
    </IntakePageLayout>
  );
}
