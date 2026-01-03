'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface EonmedsLogoProps {
  compact?: boolean;
  showLottie?: boolean;
}

// Small sphere animation data (simplified)
const sphereAnimationData = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 90,
  w: 100,
  h: 100,
  assets: [],
  layers: [{
    ddd: 0,
    ind: 1,
    ty: 4,
    nm: "Sphere",
    sr: 1,
    ks: {
      o: { a: 0, k: 80 },
      r: { a: 1, k: [{ t: 0, s: [0], e: [360] }, { t: 90, s: [360] }] },
      p: { a: 0, k: [50, 50, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 1, k: [{ t: 0, s: [100, 100, 100], e: [110, 110, 100] }, { t: 45, s: [110, 110, 100], e: [100, 100, 100] }, { t: 90, s: [100, 100, 100] }] }
    },
    shapes: [{
      ty: "gr",
      it: [{
        ty: "el",
        s: { a: 0, k: [40, 40] },
        p: { a: 0, k: [0, 0] }
      }, {
        ty: "gf",
        o: { a: 0, k: 100 },
        r: 1,
        g: { p: 3, k: { a: 0, k: [0, 0.4, 0.6, 1, 0.5, 0.2, 0.4, 0.8, 1, 0.1, 0.2, 0.6] } },
        s: { a: 0, k: [-15, -15] },
        e: { a: 0, k: [15, 15] },
        t: 2
      }, {
        ty: "tr",
        p: { a: 0, k: [0, 0] },
        a: { a: 0, k: [0, 0] },
        s: { a: 0, k: [100, 100] },
        r: { a: 0, k: 0 },
        o: { a: 0, k: 100 }
      }]
    }]
  }]
};

export default function EonmedsLogo({ compact = false, showLottie = true }: EonmedsLogoProps) {
  return (
    <div className={`px-6 lg:px-8 mb-4 max-w-md ${compact ? 'lg:max-w-lg' : 'lg:max-w-2xl'} mx-auto w-full`}>
      <div className="flex items-center justify-between">
        <img 
          src="https://static.wixstatic.com/shapes/c49a9b_807d1532baa84b3893fca492cd2189fc.svg"
          alt="EONMeds"
          className="h-6 w-auto"
        />
        {showLottie && (
          <div className="w-8 h-8">
            <Lottie 
              animationData={sphereAnimationData}
              loop={true}
              autoplay={true}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
