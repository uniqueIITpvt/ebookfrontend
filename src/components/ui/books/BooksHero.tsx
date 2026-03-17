'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { API_CONFIG } from '@/config/api';

const API_URL = API_CONFIG.API_BASE_URL;

interface Banner {
  _id: string;
  title: string;
  image: string;
  isActive: boolean;
  position: string;
}

interface BooksHeroProps {
  className?: string;
}

export default function BooksHero({ className = '' }: BooksHeroProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch all banners
  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/banners/position/any`);
      const data = await res.json();
      
      if (data?.success && data?.data && data.data.length > 0) {
        setBanners(data.data);
      }
    } catch (err) {
      console.error('BooksHero fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const currentBanner = banners[currentSlide];

  return (
    <section className={`relative overflow-hidden w-full ${className}`}>
      {/* Responsive height classes with better mobile optimization */}
      <div className="
        h-[140px] 
        xs:h-[160px] 
        sm:h-[200px] 
        md:h-[280px] 
        lg:h-[360px] 
        xl:h-[400px] 
        2xl:h-[440px]
        relative
      ">
        {/* Background Image - Show current banner */}
        {currentBanner ? (
          <Image
            src={currentBanner.image}
            alt={currentBanner.title || 'Books Banner'} 
            fill
            className='object-cover object-center transition-opacity duration-500'
            priority={true}
            quality={95}
            sizes='
              (max-width: 475px) 100vw,
              (max-width: 640px) 100vw,
              (max-width: 768px) 100vw,
              (max-width: 1024px) 100vw,
              100vw
            '
          />
        ) : (
          <div className='absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200' />
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        
        {/* Dots indicator - show only if multiple banners */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'bg-white w-6' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
        
       
      </div>
    </section>
  );
}
