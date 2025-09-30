'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ProgramsIncludePage() {
  const router = useRouter();
  const { language } = useLanguage();

  const programs = language === 'es' ? [
    {
      title: 'Chequeos Semanales',
      description: 'Un representate asignado estará contigo durante todo tu tratamiento*',
      bgColor: '#4ea77e',
      image: 'https://static.wixstatic.com/media/c49a9b_2c49b136f5ec49c787b37346cca7f47b~mv2.webp'
    },
    {
      title: 'Consultas Médicas',
      description: 'Tu proveedor en las palmas de tus manos. Consultas por telemedicina incluidas',
      bgColor: '#e4fb74',
      image: 'https://static.wixstatic.com/media/c49a9b_5683be4d8e5a425a8cae0f35d26eb98b~mv2.webp'
    },
    {
      title: 'Ajuste de Dosis',
      description: 'Ajustamos tu dosis con el tiempo para un tratamiento 100% personalizado.',
      bgColor: '#edffa8',
      image: 'https://static.wixstatic.com/media/c49a9b_9b3696821bfc4d84beb17a4266110488~mv2.webp'
    }
  ] : [
    {
      title: 'Weekly Check-ins',
      description: 'An assigned representative will be with you throughout your treatment*',
      bgColor: '#4ea77e',
      image: 'https://static.wixstatic.com/media/c49a9b_2c49b136f5ec49c787b37346cca7f47b~mv2.webp'
    },
    {
      title: 'Medical Consultations',
      description: 'Your provider in the palm of your hands. Telemedicine consultations included',
      bgColor: '#e4fb74',
      image: 'https://static.wixstatic.com/media/c49a9b_5683be4d8e5a425a8cae0f35d26eb98b~mv2.webp'
    },
    {
      title: 'Dose Adjustment',
      description: 'We adjust your dose over time for 100% personalized treatment.',
      bgColor: '#edffa8',
      image: 'https://static.wixstatic.com/media/c49a9b_9b3696821bfc4d84beb17a4266110488~mv2.webp'
    }
  ];

  const handleContinue = () => {
    router.push('/intake/chronic-conditions');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Back button */}
      <div className="px-6 pt-6">
        <Link 
          href="/intake/mental-health" 
          className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium leading-tight">
            {language === 'es' ? (
              <>
                Todos nuestros <span className="text-[#4fa87f]">programas</span> incluyen
              </>
            ) : (
              <>
                All our <span className="text-[#4fa87f]">programs</span> include
              </>
            )}
          </h1>
        </div>

        {/* Program cards */}
        <div className="space-y-6 flex-1">
          {programs.map((program, index) => (
            <div
              key={index}
              className="rounded-3xl p-4 flex items-center space-x-4"
              style={{ backgroundColor: program.bgColor }}
            >
              <img
                src={program.image}
                alt={program.title}
                className="w-24 h-24 rounded-2xl object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-black mb-1">
                  {program.title}
                </h3>
                <p className="text-sm text-gray-800">
                  {program.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Continue button */}
      <div className="px-6 pb-8 max-w-md mx-auto w-full">
        <button 
          onClick={handleContinue}
          className="w-full bg-black text-white py-4 px-8 rounded-full text-lg font-medium flex items-center justify-center space-x-3 hover:bg-gray-800 transition-colors"
        >
          <span>{language === 'es' ? 'Continuar' : 'Continue'}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}