'use client';

import { useState, useEffect } from 'react';
import { BookOpenIcon, FunnelIcon } from '@heroicons/react/24/outline';
import BooksGridMobile from './BooksGridMobile';
import BooksGridDesktop from './BooksGridDesktop';



interface Book {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  description: string;
  category: string;
  type: 'Books' | 'Audiobook';
  price: string;
  originalPrice: string;
  rating: number;
  reviews: number;
  pages?: number;
  duration?: string;
  narrator?: string;
  publishDate: string;
  isbn: string;
  format: string[];
  image: string;
  featured: boolean;
  bestseller: boolean;
  tags: string[];
  files?: {
    audiobook?: {
      url?: string;
    };
  };
}

interface BooksGridProps {
  items: Book[];
  className?: string;
  onFilterClick?: () => void;
  hasActiveFilters?: boolean;
  onAudiobookSelect?: (item: Book) => void;
}

export default function BooksGrid({ items, className = '', onFilterClick, hasActiveFilters = false, onAudiobookSelect }: BooksGridProps) {
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

  if (items.length === 0) {
    return (
      <div className={`text-center py-12 sm:py-16 md:py-20 ${className}`}>
        <div className='relative w-24 h-24 xs:w-28 xs:h-28 sm:w-32 sm:h-32 mx-auto mb-6'>
          <div className='absolute inset-2 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center'>
            <BookOpenIcon className='w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 text-indigo-600' />
          </div>
        </div>
        <h3 className='text-lg xs:text-xl sm:text-2xl font-semibold text-gray-900 mb-2'>
          No content found
        </h3>
        <p className='text-sm xs:text-base sm:text-lg text-gray-600 max-w-md mx-auto'>
          Try adjusting your search or filter criteria to discover more books
        </p>
      </div>
    );
  }

  return (
    <section className={`
      py-6 xs:py-8 sm:py-10 md:py-12 lg:py-16 
      relative overflow-hidden
      ${className}
    `}>
      {/* Background decorative elements */}
      <div className='absolute inset-0 pointer-events-none overflow-hidden'>
        <div className='absolute top-20 left-10 w-2 h-2 bg-blue-400/20 rounded-full animate-ping' />
        <div className='absolute top-40 right-20 w-1 h-1 bg-indigo-400/30 rounded-full animate-ping delay-1000' />
        <div className='absolute bottom-40 left-20 w-1.5 h-1.5 bg-purple-400/20 rounded-full animate-ping delay-2000' />
        <div className='absolute top-60 left-1/3 w-1 h-1 bg-blue-400/25 rounded-full animate-ping delay-500' />
        <div className='absolute bottom-60 right-1/3 w-2 h-2 bg-indigo-400/20 rounded-full animate-ping delay-1500' />
      </div>

      <div className='max-w-none mx-auto px-3 xs:px-4 sm:px-6 lg:px-0 relative z-10'>
        {/* Section Header - Only show on mobile */}
        <div className='mb-8 xs:mb-10 sm:mb-12 lg:hidden'>
          <div className='flex items-center justify-between mb-6 xs:mb-8'>
            <div className='flex-1'>
              <h2 className='
                text-2xl xs:text-3xl sm:text-4xl 
                font-bold text-slate-900 mb-2 xs:mb-3 sm:mb-4
                flex items-center
              '>
                <BookOpenIcon className='
                  w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8
                  mr-2 xs:mr-3 sm:mr-4 text-black
                ' />
                <span className='text-black'>Books</span>
              </h2>
              <div className='h-1 w-24 xs:w-28 sm:w-36 bg-black rounded-full'></div>
            </div>
            
            {/* Filter Button - Right side of header */}
            {onFilterClick && (
              <button
                onClick={onFilterClick}
                className='flex items-center gap-2 px-3 xs:px-4 py-2 xs:py-2.5 bg-white shadow-lg border border-gray-200 rounded-lg text-sm xs:text-base font-medium hover:bg-gray-50 transition-all duration-200 ml-4'
              >
                <FunnelIcon className='w-4 h-4 xs:w-5 xs:h-5' />
                <span className='inline'>Filters</span>
                {hasActiveFilters && (
                  <span className='w-2 h-2 bg-blue-500 rounded-full animate-pulse'></span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Render mobile or desktop component based on screen size */}
        {isMobile ? (
          <BooksGridMobile items={items} onAudiobookSelect={onAudiobookSelect} />
        ) : (
          <BooksGridDesktop items={items} onAudiobookSelect={onAudiobookSelect} />
        )}
      </div>
    </section>
  );
}
