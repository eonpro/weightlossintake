'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';
import EonmedsLogo from '@/components/EonmedsLogo';

declare global {
  interface Window {
    google: any;
    initGmaps: () => void;
  }
}

export default function AddressPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [mapError, setMapError] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Load Google Maps script
  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initializeAutocomplete();
      return;
    }

    // Check if script is already in the DOM
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Wait for it to load
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkInterval);
          initializeAutocomplete();
        }
      }, 100);
      return;
    }

    // Load the Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      initializeAutocomplete();
    };
    
    script.onerror = () => {
      console.error('Failed to load Google Maps');
      setMapError(true);
    };
    
    document.head.appendChild(script);
  }, []);

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google?.maps?.places) return;
    
    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'us' },
        fields: ['address_components', 'formatted_address', 'geometry']
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        
        if (place.formatted_address) {
          setAddress(place.formatted_address);
          setShowMap(true);
          
          // Initialize map after a short delay
          setTimeout(() => {
            if (!mapInstanceRef.current && mapRef.current) {
              initializeMap();
            }
            
            // Update map location
            if (place.geometry?.location && mapInstanceRef.current) {
              updateMapLocation(place.geometry.location);
            }
          }, 100);
        }
      });
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
      setMapError(true);
    }
  };
  
  // Initialize map when showMap becomes true
  useEffect(() => {
    if (showMap && !mapInstanceRef.current && mapRef.current && window.google?.maps) {
      initializeMap();
    }
  }, [showMap]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google?.maps) return;

    try {
      // Default to Tampa, FL
      const defaultLocation = { lat: 27.9506, lng: -82.4572 };
      
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        zoom: 17,
        center: defaultLocation,
        mapTypeId: 'satellite',
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: false,
        scaleControl: false,
        rotateControl: false,
        disableDefaultUI: true,
        tilt: 45,
      });

      // Custom marker with our brand color
      markerRef.current = new window.google.maps.Marker({
        map: mapInstanceRef.current,
        position: defaultLocation,
        draggable: false,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#4fa87f',
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        }
      });
    } catch (error) {
      console.error('Error initializing Google Map:', error);
      setMapError(true);
    }
  };

  const updateMapLocation = (location: any) => {
    if (!mapInstanceRef.current || !location) return;

    // Center map on the location
    mapInstanceRef.current.setCenter(location);
    mapInstanceRef.current.setZoom(17);

    // Update marker position
    if (markerRef.current) {
      markerRef.current.setPosition(location);
    }
  };

  const handleContinue = () => {
    if (address) {
      sessionStorage.setItem('intake_address', JSON.stringify({ address, apartment }));
      router.push('/intake/ideal-weight');
    }
  };
  
  // Enable Enter key navigation
  useEnterNavigation(handleContinue);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-1/4 bg-[#f0feab] transition-all duration-300"></div>
      </div>
      
      <div className="px-6 lg:px-8 pt-6">
        <Link href="/intake/support-info" className="inline-block p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </Link>
      </div>

      {/* EONMeds Logo */}
      <EonmedsLogo compact={true} />

      {/* Cold Shipping Banner */}
      <div className="px-6 mt-3 max-w-md lg:max-w-lg mx-auto w-full">
        <div className="bg-[#f0feab] rounded-3xl overflow-hidden flex items-stretch">
          <div className="flex-1 px-5 py-3 flex flex-col justify-center">
            <h3 className="font-semibold text-base text-black">{t('address.shipping.title')}</h3>
            <p className="text-xs text-gray-600 font-normal mt-0.5">{t('address.shipping.subtitle')}</p>
          </div>
          <div className="flex-shrink-0 bg-gray-200 rounded-r-3xl">
            <img 
              src="https://static.wixstatic.com/media/c49a9b_4d682057194f4e1fa67cf62dd50a1d27~mv2.webp"
              alt="Cold Shipping"
              className="h-20 w-20 object-cover rounded-r-3xl"
            />
          </div>
        </div>
      </div>
      
      <div className="flex-1 px-6 lg:px-8 py-4 max-w-md lg:max-w-lg mx-auto w-full">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-medium mb-4">{t('address.title')}</h1>
            <p className="text-gray-500 mb-1">{t('address.subtitle')}</p>
            <p className="text-sm text-gray-400">{t('address.asterisk')}</p>
          </div>

          {/* Google Map - Only show after address is entered */}
          {showMap && (
            <div ref={mapRef} className="w-full h-64 rounded-2xl border border-gray-200 bg-gray-100 relative overflow-hidden">
              {mapError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-2xl">
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">Map unavailable</p>
                    <p className="text-gray-400 text-xs mt-1">Enter address manually</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <input
              ref={inputRef}
              type="text"
              placeholder={t('address.placeholder')}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-4 text-base md:text-lg font-medium border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-400"
            />
            
            <input
              type="text"
              placeholder={t('address.apartment')}
              value={apartment}
              onChange={(e) => setApartment(e.target.value)}
              className="w-full p-4 text-base md:text-lg font-medium border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-400"
            />
            
            <p className="text-xs text-gray-400">{t('address.apartment.note')}</p>
          </div>
        </div>
      </div>
      
      <div className="px-6 lg:px-8 pb-8 max-w-md lg:max-w-lg mx-auto w-full">
        <button 
          onClick={handleContinue}
          disabled={!address}
          className={`w-full py-4 px-8 rounded-full text-lg font-medium flex items-center justify-center space-x-3 transition-all ${
            address 
              ? 'bg-black text-white hover:bg-gray-900' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>{t('address.continue')}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
        
        {/* Copyright footer */}
        <div className="mt-6 text-center">
          <p className="text-[9px] lg:text-[11px] text-gray-400 leading-tight">
            {language === 'es' ? (
              <>
                © 2025 EONPro, LLC. Todos los derechos reservados.<br/>
                Proceso exclusivo y protegido. Copiar o reproducir sin autorización está prohibido.
              </>
            ) : (
              <>
                © 2025 EONPro, LLC. All rights reserved.<br/>
                Exclusive and protected process. Copying or reproduction without authorization is prohibited.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}