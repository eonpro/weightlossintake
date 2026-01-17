'use client';

import { useEffect } from 'react';

// =============================================================================
// INTAKE ERROR BOUNDARY
// =============================================================================
// Catches runtime errors in the intake flow and provides graceful recovery.
// Prevents the entire app from crashing due to unexpected errors.
//
// PHI Safety: This component does NOT log or display any PHI.
// Only generic error messages are shown to users.
// =============================================================================

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function IntakeError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console (no PHI - only error details)
    console.error('[Intake Error]', {
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-red-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        
        {/* Error Message */}
        <h1 className="text-2xl font-bold text-slate-800 mb-3">
          Something went wrong
        </h1>
        <p className="text-slate-600 mb-6">
          We encountered an unexpected error. Your progress has been saved. 
          Please try again or contact support if the problem persists.
        </p>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-xl
                       hover:bg-blue-700 transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.href = '/intake/start'}
            className="w-full py-3 px-6 bg-slate-100 text-slate-700 font-semibold rounded-xl
                       hover:bg-slate-200 transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Start Over
          </button>
        </div>
        
        {/* Support Link */}
        <p className="mt-6 text-sm text-slate-500">
          Need help?{' '}
          <a 
            href="mailto:support@eonmeds.com" 
            className="text-blue-600 hover:underline"
          >
            Contact Support
          </a>
        </p>
        
        {/* Error Digest (for debugging - no PHI) */}
        {error.digest && (
          <p className="mt-4 text-xs text-slate-400 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
