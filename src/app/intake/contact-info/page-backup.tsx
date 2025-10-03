'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EonmedsLogo from '@/components/EonmedsLogo';
import IntakePageLayout from '@/components/IntakePageLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { submitCheckpoint, markCheckpointCompleted } from '@/lib/api';

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
    
    if (country === 'US') {
      // US phone: 10 digits
      return digitsOnly.length === 10;
    } else if (country === 'PR') {
      // Puerto Rico: 10 digits (area code + 7 digits)
      return digitsOnly.length === 10;
    }
    return false;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError(language === 'es' ? 'Por favor ingrese un email válido' : 'Please enter a valid email');
    } else {
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
      
      if (digitsOnly.length > 0 && !validatePhone(digitsOnly)) {
        setPhoneError(language === 'es' ? 'Por favor ingrese un número de teléfono válido de 10 dígitos' : 'Please enter a valid 10-digit phone number');
      } else {
        setPhoneError('');
      }
    }
  };

  const handleContinue = () => {
    const isEmailValid = validateEmail(email);
    const isPhoneValid = validatePhone(phone);
    
    if (!isEmailValid) {
      setEmailError(language === 'es' ? 'Por favor ingrese un email válido' : 'Please enter a valid email');
    }
    
    if (!isPhoneValid) {
      setPhoneError(language === 'es' ? 'Por favor ingrese un número de teléfono válido de 10 dígitos' : 'Please enter a valid 10-digit phone number');
    }
    
    if (isEmailValid && isPhoneValid && consent) {
      // Always ensure +1 prefix for US numbers
      const phoneDigitsOnly = phone.replace(/\D/g, '');
      const formattedPhone = '+1' + phoneDigitsOnly;
      sessionStorage.setItem('intake_contact', JSON.stringify({ email, phone: formattedPhone }));
      
      // Submit personal info checkpoint
      const nameData = sessionStorage.getItem('intake_name');
      const stateData = sessionStorage.getItem('intake_state');
      const dobData = sessionStorage.getItem('intake_dob');
      
      const checkpointData = {
        personalInfo: {
          ...(nameData ? JSON.parse(nameData) : {}),
          email,
          phone: formattedPhone,
          dob: dobData ? JSON.parse(dobData) : null,
          state: stateData ? JSON.parse(stateData) : null
        },
        timestamp: new Date().toISOString()
      };
      
      // Submit checkpoint without blocking navigation
      submitCheckpoint('personal-info', checkpointData, 'partial').catch(err => {
        console.error('Checkpoint submission failed:', err);
        // Continue anyway - data is saved locally
      });
      markCheckpointCompleted('personal-info');
      
      router.push('/intake/support-info');
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
      disabled={!email || !phone || !consent}
      className={`w-full py-4 px-8 rounded-full text-lg font-medium flex items-center justify-center space-x-3 transition-all ${
        email && phone && consent 
          ? 'bg-black text-white hover:bg-gray-900' 
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
    >
      <span>{language === 'es' ? 'Continuar' : 'Continue'}</span>
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
                  consent ? 'bg-[#f0feab] border-[#f0feab]' : 'bg-white border-gray-300'
                }`}
              >
                {consent && (
                  <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <div className="text-sm font-light ml-3">
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
