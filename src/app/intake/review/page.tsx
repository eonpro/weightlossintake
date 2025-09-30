'use client';

import { useRouter } from 'next/navigation';

export default function ReviewPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/intake/conditions');
  };

  const handleContinue = () => {
    // Navigate to checkout or next steps
    alert('Proceeding to checkout...');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div className="h-full w-[90%] bg-[#f0feab] transition-all duration-300"></div>
      </div>

      {/* Back button */}
      <div className="px-6 pt-6">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
        <div className="space-y-8">
          {/* Success Message */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-[#4fa87f] rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-medium">
              Great news!
            </h1>
            
            <p className="text-xl text-gray-600">
              Based on your responses, you may qualify for treatment.
            </p>
          </div>

          {/* Qualification Details */}
          <div className="bg-green-50 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-medium">Your Qualification Status</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">BMI Assessment</span>
                <span className="text-[#4fa87f] font-medium">Qualified ✓</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Medical History</span>
                <span className="text-[#4fa87f] font-medium">Reviewed ✓</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Age Verification</span>
                <span className="text-[#4fa87f] font-medium">Verified ✓</span>
              </div>
            </div>
          </div>

          {/* Recommended Treatment */}
          <div className="border rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-medium">Recommended Treatment</h2>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Semaglutide (GLP-1)</p>
                <p className="text-sm text-gray-500">Weight Management Program</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold">$229</p>
                <p className="text-sm text-gray-500">per month</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-sm text-gray-600">
                ✓ FDA-approved medication
                <br />
                ✓ Personalized dosing
                <br />
                ✓ Ongoing medical support
                <br />
                ✓ Free shipping included
              </p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-3 text-sm text-gray-600">
            <p className="font-medium text-black">Next Steps:</p>
            <p>1. Complete checkout to secure your treatment</p>
            <p>2. A licensed provider will review your information</p>
            <p>3. Your medication will be shipped within 2-3 business days</p>
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="px-6 pb-8">
        <button
          onClick={handleContinue}
          className="w-full bg-black text-white py-4 px-8 rounded-full text-lg font-medium flex items-center justify-between hover:bg-gray-800 transition-colors"
        >
          <span>Continue to Checkout</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 text-center">
        <p className="text-xs text-gray-400">
          © 2025 EONPro, LLC. All rights reserved.
        </p>
      </div>
    </div>
  );
}
