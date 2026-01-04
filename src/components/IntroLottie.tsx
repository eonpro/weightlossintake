'use client';

import React, { useEffect, useRef } from 'react';

function IntroLottie() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Directly inject the iframe HTML with responsive sizing
    containerRef.current.innerHTML = `
      <iframe 
        src="https://lottie.host/embed/c68f2fe5-b37e-4e92-8e8d-1e6df2d36618/1vhhi2DFps.lottie"
        style="width: 100%; height: 100%; border: none; background: transparent;"
        frameborder="0"
        allowfullscreen
        allow="autoplay"
        loading="eager"
      ></iframe>
    `;

  }, []);

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div ref={containerRef} className="w-[560px] h-[560px] lg:w-[840px] lg:h-[840px] flex items-center justify-center">
        <div className="text-gray-400">Loading animation...</div>
      </div>
    </div>
  );
}

export default IntroLottie;