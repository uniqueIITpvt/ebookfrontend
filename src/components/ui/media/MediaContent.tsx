'use client';

import { useState, useEffect } from 'react';
import MediaContentMobile from './MediaContentMobile';
import MediaContentDesktop from './MediaContentDesktop';
// import { ContentLoader } from '../primitives/Loader';



export default function MediaContent() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Initial load state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timer);
    };
  }, []);

  if (isLoading) {
    return (
      <section className='py-20 bg-white relative flex items-center justify-center min-h-[400px] overflow-hidden'>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] animate-pulse"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-8 text-slate-400 font-syne text-xs uppercase tracking-[0.4em] animate-pulse">Initializing Collection</p>
        </div>
      </section>
    );
  }

  // Render mobile or desktop component based on screen size
  return isMobile ? <MediaContentMobile /> : <MediaContentDesktop />;
}
