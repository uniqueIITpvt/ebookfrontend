'use client';

import { useState, useRef, useEffect } from 'react';
import {
  StarIcon,
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

interface BooksGridDesktopProps {
  items: Book[];
  className?: string;
  onAudiobookSelect?: (item: Book) => void;
}

export default function BooksGridDesktop({ items, className = '', onAudiobookSelect }: BooksGridDesktopProps) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Inject blob animation styles only once
    if (!document.getElementById('blob-animations-books-desktop')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'blob-animations-books-desktop';
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (items.length === 0) {
    return (
      <div className={`text-center py-16 ${className}`}>
        <p className='text-gray-600 font-medium'>No books found matching your criteria</p>
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
        <div key={category} className='mb-16 last:mb-0'>
          {/* Category Section Header - matching user request "red area" */}
          <div className='flex items-center gap-4 mb-8 overflow-hidden'>
            <h2 className='text-xl md:text-2xl font-bold text-red-600 whitespace-nowrap'>
              {category}
            </h2>
            <div className='h-[1px] w-full bg-red-100'></div>
          </div>

          {/* Desktop Grid for this Category */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-8 gap-y-12'>
            {groupedItems[category].map((item, index) => (
              item.type === 'Books' ? (
                <Link
                  key={item.id}
                  href={`/books/${generateBookSlug(item.title)}`}
                  className='group relative w-full block'
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    position: 'relative',
                    height: '440px',
                    borderRadius: '14px',
                    zIndex: 10,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '20px 20px 60px #bebebe, -20px -20px 60px #ffffff',
                  }}
                >
            {/* Animated Blob Background */}
            <div 
              className="hidden absolute z-[1] top-1/2 left-1/2 w-[150px] h-[150px] rounded-full opacity-100 blur-[12px]"
              style={{
                backgroundColor: index % 3 === 0 ? '#4f46e5' : index % 3 === 1 ? '#7c3aed' : '#ec4899',
                animation: 'blob-bounce 5s infinite ease',
                transform: 'translate(-50%, -50%)',
              }}
            />

            {/* Glass Background */}
            <div 
              className="absolute z-[2] bg-white/95 backdrop-blur-[24px] rounded-[10px] overflow-hidden"
              style={{
                top: '5px',
                left: '5px',
                width: 'calc(100% - 10px)',
                height: 'calc(100% - 10px)',
                outline: '2px solid white',
              }}
            >
              {/* Cover Image */}
              <div className='relative w-full h-full overflow-hidden flex items-center justify-center p-0'>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className='object-cover object-center transition-transform duration-300 group-hover:scale-105'
                  sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
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

              {/* Hover Overlay - only for Reading Books (e-books and physical books) */}
              {item.type === 'Books' && (
                <div className='
                  absolute inset-0 
                  bg-gradient-to-t from-black/95 via-black/70 to-transparent 
                  opacity-0 group-hover:opacity-100 
                  transition-all duration-500 z-[3] rounded-[10px] 
                  flex flex-col justify-end
                '>
                  <div className='
                    p-4 text-white 
                    transform translate-y-8 group-hover:translate-y-0 
                    transition-transform duration-500
                  '>
                    <h3 className='text-lg font-bold mb-2 leading-tight'>
                      {item.title}
                    </h3>
                    <p className='text-sm text-white/90 mb-3 leading-relaxed line-clamp-2'>
                      {item.description}
                    </p>
                    <div className='text-xs text-white/80 mb-4'>
                      <div className='font-medium'>{item.author}</div>
                      <div>
                        {item.pages ? `${item.pages} pages` : item.duration}
                      </div>
                      <div className='flex items-center mt-1'>
                        {renderStars(item.rating)}
                        <span className='ml-2 text-xs'>({item.reviews})</span>
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <Button variant="secondary" size="sm" fullWidth>
                        Buy Now
                      </Button>
                    </div>
                  </div>
                </div>
              )}
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
                    height: '440px',
                    borderRadius: '14px',
                    zIndex: 10,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '20px 20px 60px #bebebe, -20px -20px 60px #ffffff',
                  }}
                >
                  {/* Animated Blob Background */}
                  <div 
                    className="hidden absolute z-[1] top-1/2 left-1/2 w-[150px] h-[150px] rounded-full opacity-100 blur-[12px]"
                    style={{
                      backgroundColor: index % 3 === 0 ? '#4f46e5' : index % 3 === 1 ? '#7c3aed' : '#ec4899',
                      animation: 'blob-bounce 5s infinite ease',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />

                  {/* Glass Background */}
                  <div 
                    className="absolute z-[2] bg-white/95 backdrop-blur-[24px] rounded-[10px] overflow-hidden"
                    style={{
                      top: '5px',
                      left: '5px',
                      width: 'calc(100% - 10px)',
                      height: 'calc(100% - 10px)',
                      outline: '2px solid white',
                    }}
                  >
                    {/* Cover Image */}
                    <div className='relative w-full h-full overflow-hidden flex items-center justify-center p-0'>
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className='object-cover object-center transition-transform duration-300 group-hover:scale-105'
                        sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
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
                              w-12 h-12 rounded-full flex items-center justify-center
                              shadow-lg transition-all duration-300 hover:scale-110
                            '
                          >
                            {currentlyPlaying === item.id && isPlaying ? (
                              <PauseIcon className='w-6 h-6 text-indigo-600' />
                            ) : (
                              <PlayIcon className='w-6 h-6 text-indigo-600 ml-0.5' />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Audiobook Info Overlay - Always visible for audiobooks */}
                    {item.type === 'Audiobook' && (
                      <div className='absolute bottom-0 left-0 right-0 z-[4] bg-gradient-to-t from-black/95 via-black/80 to-transparent rounded-b-[10px] p-3'>
                        <h3 className='text-sm font-bold text-white mb-1 leading-tight line-clamp-1'>
                          {item.title}
                        </h3>
                        <p className='text-xs text-white/80 mb-2'>
                          By {item.author} • {item.duration}
                        </p>
                        <div className='flex items-center mb-2'>
                          {renderStars(item.rating)}
                          <span className='ml-2 text-xs text-white/70'>({item.reviews})</span>
                        </div>
                        <Button variant="secondary" size="xs" fullWidth>
                          Buy Audiobook
                        </Button>
                      </div>
                    )}
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
          p-4 z-50 shadow-2xl
        '>
          <div className='max-w-7xl mx-auto'>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-3'>
                <div className='relative w-12 h-12 rounded-lg overflow-hidden'>
                  <Image
                    src={items.find((item) => item.id === currentlyPlaying)?.image || ''}
                    alt='Track cover'
                    fill
                    className='object-cover'
                    sizes='48px'
                  />
                </div>
                <div>
                  <h4 className='font-semibold text-sm line-clamp-1 text-white'>
                    {items.find((item) => item.id === currentlyPlaying)?.title}
                  </h4>
                  <p className='text-xs text-indigo-200'>
                    {(() => {
                      const playingItem = items.find((item) => item.id === currentlyPlaying);
                      if (playingItem?.type === 'Audiobook') {
                        return `by ${playingItem.author ?? ''}`;
                      }
                      return 'UniqueIIT Research Center';
                    })()}
                  </p>
                </div>
              </div>

              <div className='flex-1 flex items-center gap-4'>
                <button
                  onClick={() => handlePlay(items.find((item) => item.id === currentlyPlaying)!)}
                  className='text-white hover:text-indigo-200 transition-colors p-2'
                >
                  {isPlaying ? (
                    <PauseIcon className='w-6 h-6' />
                  ) : (
                    <PlayIcon className='w-6 h-6' />
                  )}
                </button>
                <div className='text-xs text-indigo-200 whitespace-nowrap'>
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
