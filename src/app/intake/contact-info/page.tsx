'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ContactInfoPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('US');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [consent, setConsent] = useState(false);

  const countries = [
    { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
    { code: 'PR', name: 'Puerto Rico', flag: '🇵🇷', dialCode: '+1 787' }
  ];

  const selectedCountry = countries.find(c => c.code === country) || countries[0];

  const handleContinue = () => {
    if (email && phone && consent) {
      sessionStorage.setItem('intake_contact', JSON.stringify({ email, phone: selectedCountry.dialCode + phone }));
      // Navigate to next page (could be more medical questions)
      router.push('/intake/success');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-full bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      <div className="px-6 pt-6">
        <Link href="/intake/testimonials" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      <div className="flex-1 px-6 py-8 max-w-md mx-auto w-full">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-medium mb-4">How can we contact you?</h1>
            <p className="text-gray-500">
              We use this information to keep you informed about your treatment, send you important updates, 
              and help you stay connected with your provider.
            </p>
          </div>

          <div className="space-y-4">
            {/* Email Input */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 text-base md:text-lg font-medium border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-400"
            />

            {/* Phone Input with Country Code */}
            <div className="flex space-x-2">
              <div className="relative">
                <button 
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="flex items-center space-x-2 p-4 border border-gray-200 rounded-2xl"
                >
                  <span className="text-2xl">{selectedCountry.flag}</span>
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
                placeholder={selectedCountry.dialCode + " 000 000 0000"}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 p-4 text-base md:text-lg border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-400"
              />
            </div>

            {/* Consent Checkbox */}
            <label className="flex items-start space-x-3 cursor-pointer" onClick={() => setConsent(!consent)}>
              <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer ${
                consent ? 'bg-[#4fa87f] border-[#4fa87f]' : 'border-gray-400'
              }`}>
                {consent && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="text-sm font-light">
                I accept the <a href="#" className="text-[#4fa87f] underline" onClick={(e) => e.stopPropagation()}>Privacy Policy</a> and I authorize 
                receiving important communications via email and text messages (SMS) from EONMeds/EONPro 
                and affiliates regarding my treatment.
              </div>
            </label>
          </div>

          {/* SMS Disclosure */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs text-gray-600 leading-relaxed">
              To help ensure patient safety, we need to verify your phone number. By providing it and continuing, 
              you consent to receive text messages from EONPro for verification and other legally permitted uses 
              related to your account and our services. This may include order confirmations, shipping updates, 
              and messages from your provider. Message and data rates may apply. Message frequency may vary. 
              Reply HELP for assistance or STOP to unsubscribe. Standard message and data rates may apply. 
              These messages may include medical reminders, treatment updates, promotions, and other information 
              related to your care.
            </p>
          </div>
        </div>
      </div>
      
      <div className="px-6 pb-8 max-w-md mx-auto w-full">
        <button 
          onClick={handleContinue}
          disabled={!email || !phone || !consent}
          className={`w-full py-4 px-8 rounded-full text-lg font-medium flex items-center justify-center space-x-3 transition-all ${
            email && phone && consent 
              ? 'bg-black text-white hover:bg-gray-900' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>Continue</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
