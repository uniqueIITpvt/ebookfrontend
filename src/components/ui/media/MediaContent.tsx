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

    // Remove artificial delay - load instantly
    setIsLoading(false);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Skip loading state for instant rendering
  if (isLoading) {
    return (
      <section className='pt-8 pb-12 bg-gradient-to-br from-white via-slate-50 to-indigo-50/30 relative overflow-hidden'>
        {/* Simple skeleton instead of spinner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-200 animate-pulse rounded-xl h-64"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Render mobile or desktop component based on screen size
  return isMobile ? <MediaContentMobile /> : <MediaContentDesktop />;
}
