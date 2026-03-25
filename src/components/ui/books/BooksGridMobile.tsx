'use client';

import { useState, useRef, useEffect } from 'react';
import {
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/primitives/Button';
import { generateBookSlug } from '@/utils/slugify';

// Add the blob animation styles
const blobStyles = `
  @keyframes blob-bounce {
    0% {
      transform: translate(-50%, -50%) translate3d(0, 0, 0);
    }
    25% {
      transform: translate(-50%, -50%) translate3d(100%, 0, 0);
    }
    50% {
      transform: translate(-50%, -50%) translate3d(100%, 100%, 0);
    }
    75% {
      transform: translate(-50%, -50%) translate3d(0, 100%, 0);
    }
    100% {
      transform: translate(-50%, -50%) translate3d(0, 0, 0);
    }
  }
`;

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

interface BooksGridMobileProps {
  items: Book[];
  className?: string;
  onAudiobookSelect?: (item: Book) => void;
}

export default function BooksGridMobile({ items, className = '', onAudiobookSelect }: BooksGridMobileProps) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Inject blob animation styles only once
    if (!document.getElementById('blob-animations-books-mobile')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'blob-animations-books-mobile';
      styleElement.textContent = blobStyles;
      document.head.appendChild(styleElement);
    }
  }, []);

  // Audio playback functionality
  const handlePlay = (item: Book) => {
    if (item.type !== 'Audiobook') return;
    
    if (!audioRef.current) return;

    const audioUrl = item.files?.audiobook?.url || '/audio/audiobook-sample.mp3';

    if (currentlyPlaying === item.id && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (currentlyPlaying !== item.id) {
        audioRef.current.src = audioUrl;
        setCurrentlyPlaying(item.id);
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentlyPlaying(null);
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [currentlyPlaying]);

  if (items.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className='text-gray-600 text-sm font-medium'>No books found matching your criteria</p>
      </div>
    );
  }

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, Book[]>);

  const sortedCategories = Object.keys(groupedItems).sort();

  return (
    <div className={`${className}`}>
      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload='metadata' />
      
      {sortedCategories.map((category) => (
        <div key={category} className='mb-10 last:mb-0'>
          {/* Category Section Header */}
          <div className='flex items-center gap-3 mb-5 overflow-hidden'>
            <h2 className='text-base font-bold text-red-600 whitespace-nowrap'>
              {category}
            </h2>
            <div className='h-[1px] w-full bg-red-100'></div>
          </div>

          {/* Mobile Grid for this Category */}
          <div className='grid grid-cols-2 gap-4 mb-2'>
            {groupedItems[category].map((item, index) => (
              item.type === 'Books' ? (
            <Link
              key={item.id}
              href={`/books/${generateBookSlug(item.title)}`}
              className='group relative w-full block'
              style={{ 
                animationDelay: `${index * 100}ms`,
                position: 'relative',
                height: '280px',
                borderRadius: '12px',
                zIndex: 10,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '12px 12px 40px rgba(0,0,0,0.1), -12px -12px 40px rgba(255,255,255,0.9)',
              }}
            >
            {/* Animated Blob Background */}
            <div 
              className="hidden absolute z-[1] top-1/2 left-1/2 w-[100px] h-[100px] rounded-full opacity-100 blur-[8px]"
              style={{
                backgroundColor: index % 3 === 0 ? '#4f46e5' : index % 3 === 1 ? '#7c3aed' : '#ec4899',
                animation: 'blob-bounce 5s infinite ease',
                transform: 'translate(-50%, -50%)',
              }}
            />

            {/* Glass Background */}
            <div 
              className="absolute z-[2] bg-white/95 backdrop-blur-[16px] rounded-[8px] overflow-hidden"
              style={{
                top: '4px',
                left: '4px',
                width: 'calc(100% - 8px)',
                height: 'calc(100% - 8px)',
                outline: '1px solid white',
              }}
            >
              {/* Cover Image */}
              <div className='relative w-full h-full overflow-hidden flex items-center justify-center p-0'>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className='object-cover object-center transition-transform duration-300 group-hover:scale-105'
                  sizes='(max-width: 768px) 50vw, 33vw'
                  loading={index < 4 ? "eager" : "lazy"}
                  priority={index < 4}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+E="
                />
                
                {/* Category Badge */}
                <div className='absolute top-2 left-2'>
                  <span className='bg-white/90 backdrop-blur-sm text-indigo-700 px-2 py-1 rounded-full text-xs font-semibold shadow-sm'>
                    {item.category}
                  </span>
                </div>

                {/* Type Badge */}
                <div className='absolute top-2 right-2'>
                  <span className='bg-white/90 backdrop-blur-sm text-indigo-700 px-2 py-1 rounded-full text-xs font-semibold shadow-sm'>
                    {item.type}
                  </span>
                </div>
              </div>

              {/* Mobile Bottom Info - Always visible on mobile */}
              <div className='absolute bottom-0 left-0 right-0 z-[4] bg-gradient-to-t from-black/95 via-black/80 to-transparent rounded-b-[8px] p-2'>
                <h3 className='text-xs font-bold text-white mb-1 leading-tight line-clamp-1'>
                  {item.title}
                </h3>
                <p className='text-xs text-white/80 mb-2'>
                  By {item.author} • {item.pages ?? ''} pages
                </p>
                <Button variant="secondary" size="xs" fullWidth>
                  Buy Now
                </Button>
              </div>
            </div>
            </Link>
          ) : (
            <div
              key={item.id}
              role='button'
              tabIndex={0}
              onClick={() => onAudiobookSelect?.(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onAudiobookSelect?.(item);
                }
              }}
              className='group relative w-full block cursor-pointer'
              style={{ 
                animationDelay: `${index * 100}ms`,
                position: 'relative',
                height: '280px',
                borderRadius: '12px',
                zIndex: 10,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '12px 12px 40px rgba(0,0,0,0.1), -12px -12px 40px rgba(255,255,255,0.9)',
              }}
            >
              {/* Animated Blob Background */}
              <div 
                className="hidden absolute z-[1] top-1/2 left-1/2 w-[100px] h-[100px] rounded-full opacity-100 blur-[8px]"
                style={{
                  backgroundColor: index % 3 === 0 ? '#4f46e5' : index % 3 === 1 ? '#7c3aed' : '#ec4899',
                  animation: 'blob-bounce 5s infinite ease',
                  transform: 'translate(-50%, -50%)',
                }}
              />

              {/* Glass Background */}
              <div 
                className="absolute z-[2] bg-white/95 backdrop-blur-[16px] rounded-[8px] overflow-hidden"
                style={{
                  top: '4px',
                  left: '4px',
                  width: 'calc(100% - 8px)',
                  height: 'calc(100% - 8px)',
                  outline: '1px solid white',
                }}
              >
                {/* Cover Image */}
                <div className='relative w-full h-full overflow-hidden flex items-center justify-center p-0'>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className='object-cover object-center transition-transform duration-300 group-hover:scale-105'
                    sizes='(max-width: 768px) 50vw, 33vw'
                    loading={index < 4 ? "eager" : "lazy"}
                    priority={index < 4}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+E="
                  />

                  {/* Category Badge */}
                  <div className='absolute top-2 left-2'>
                    <span className='bg-white/90 backdrop-blur-sm text-indigo-700 px-2 py-1 rounded-full text-xs font-semibold shadow-sm'>
                      {item.category}
                    </span>
                  </div>

                  {/* Type Badge */}
                  <div className='absolute top-2 right-2'>
                    <span className='bg-white/90 backdrop-blur-sm text-indigo-700 px-2 py-1 rounded-full text-xs font-semibold shadow-sm'>
                      {item.type}
                    </span>
                  </div>

                  {/* Audio Play Button - for audiobooks */}
                  {item.type === 'Audiobook' && (
                    <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[4]'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlay(item);
                        }}
                        className='
                          bg-white/90 backdrop-blur-sm hover:bg-white 
                          w-10 h-10 rounded-full flex items-center justify-center
                          shadow-lg transition-all duration-300 hover:scale-110
                        '
                      >
                        {currentlyPlaying === item.id && isPlaying ? (
                          <PauseIcon className='w-4 h-4 text-indigo-600' />
                        ) : (
                          <PlayIcon className='w-4 h-4 text-indigo-600 ml-0.5' />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Bottom Info - Always visible on mobile */}
                <div className='absolute bottom-0 left-0 right-0 z-[4] bg-gradient-to-t from-black/95 via-black/80 to-transparent rounded-b-[8px] p-2'>
                  <h3 className='text-xs font-bold text-white mb-1 leading-tight line-clamp-1'>
                    {item.title}
                  </h3>
                  <p className='text-xs text-white/80 mb-2'>
                    By {item.author} • {item.duration}
                  </p>
                  <Button variant="secondary" size="xs" fullWidth>
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>
              )
            ))}
          </div>
        </div>
      ))}

      {/* Audio Player Bar (appears when playing audiobooks) */}
      {currentlyPlaying && isPlaying && (
        <div className='
          fixed bottom-0 left-0 right-0 
          bg-indigo-600 backdrop-blur-sm 
          border-t border-indigo-500 
          p-3 z-50 shadow-2xl
          safe-area-inset-bottom
        '>
          <div className='max-w-7xl mx-auto'>
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2 flex-1 min-w-0'>
                <div className='relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0'>
                  <Image
                    src={items.find((item) => item.id === currentlyPlaying)?.image || ''}
                    alt='Track cover'
                    fill
                    className='object-cover'
                    sizes='40px'
                  />
                </div>
                <div className='flex-1 min-w-0'>
                  <h4 className='font-semibold text-xs line-clamp-1 text-white'>
                    {items.find((item) => item.id === currentlyPlaying)?.title}
                  </h4>
                  <p className='text-xs text-indigo-200 line-clamp-1'>
                    {(() => {
                      const playingItem = items.find((item) => item.id === currentlyPlaying);
                      if (playingItem?.type === 'Audiobook') {
                        return `by ${playingItem.author}`;
                      }
                      return 'UniqueIIT Research Center';
                    })()}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2 flex-shrink-0'>
                <button
                  onClick={() => handlePlay(items.find((item) => item.id === currentlyPlaying)!)}
                  className='
                    text-white hover:text-indigo-200 
                    transition-colors p-1
                    touch-manipulation
                  '
                >
                  {isPlaying ? (
                    <PauseIcon className='w-5 h-5' />
                  ) : (
                    <PlayIcon className='w-5 h-5' />
                  )}
                </button>
                <div className='text-xs text-indigo-200 whitespace-nowrap hidden xs:block'>
                  Now Playing
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
