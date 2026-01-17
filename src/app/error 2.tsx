'use client';

import { useEffect } from 'react';

// =============================================================================
// GLOBAL ERROR BOUNDARY
// =============================================================================
// Catches runtime errors at the app root level.
// PHI Safety: This component does NOT log or display any PHI.
// =============================================================================

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console (no PHI - only error details)
    console.error('[Global Error]', {
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <html lang="en">
      <body>
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
              We encountered an unexpected error. Please try again or contact support if the problem persists.
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
                onClick={() => window.location.href = '/'}
                className="w-full py-3 px-6 bg-slate-100 text-slate-700 font-semibold rounded-xl
                           hover:bg-slate-200 transition-colors duration-200
                           focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                Go Home
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
      </body>
    </html>
  );
}
