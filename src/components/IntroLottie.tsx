'use client';

import React from 'react';

// =============================================================================
// INTRO LOTTIE ANIMATION
// Uses React iframe component instead of innerHTML for XSS safety
// =============================================================================

const LOTTIE_EMBED_URL = 'https://lottie.host/embed/c68f2fe5-b37e-4e92-8e8d-1e6df2d36618/1vhhi2DFps.lottie';

function IntroLottie() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-white">
      <div className="w-[560px] h-[560px] lg:w-[840px] lg:h-[840px] flex items-center justify-center">
        <iframe
          src={LOTTIE_EMBED_URL}
          title="EONMeds intro animation"
          className="w-full h-full border-none bg-white"
          allowFullScreen
          allow="autoplay"
          loading="eager"
        />
      </div>
    </div>
  );
}

export default IntroLottie;