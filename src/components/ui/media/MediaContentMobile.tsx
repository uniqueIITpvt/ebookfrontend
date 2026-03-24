'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  BookOpenIcon,
  ChevronRightIcon,
  HandRaisedIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../primitives/Button';
import Image from 'next/image';
import Link from 'next/link';
import { generateBookSlug } from '@/utils/slugify';
import { API_CONFIG } from '@/config/api';
import { booksApi, type Book } from '@/services/api/booksApi';

const API_URL = API_CONFIG.API_BASE_URL;

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

// Local Book interface removed - using type from @/services/api/booksApi

export default function MediaContentMobile() {
  const [currentBookPage, setCurrentBookPage] = useState(0);
  const [currentFreeSummaryPage, setCurrentFreeSummaryPage] = useState(0);
  const [currentTrendingBookPage, setCurrentTrendingBookPage] = useState(0);
  const [currentPremiumSummaryPage, setCurrentPremiumSummaryPage] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [freeSummaries, setFreeSummaries] = useState<Book[]>([]);
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
  const [premiumSummaries, setPremiumSummaries] = useState<Book[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [isLoadingFreeSummaries, setIsLoadingFreeSummaries] = useState(true);
  const [isLoadingTrendingBooks, setIsLoadingTrendingBooks] = useState(true);
  const [isLoadingPremiumSummaries, setIsLoadingPremiumSummaries] = useState(true);

  const itemsPerPage = 2; // 2 cards per page for mobile 
  
  // Refs for swipe containers
  const booksContainerRef = useRef<HTMLDivElement>(null);
  const freeSummariesContainerRef = useRef<HTMLDivElement>(null);
  const trendingBooksContainerRef = useRef<HTMLDivElement>(null);
  const premiumSummariesContainerRef = useRef<HTMLDivElement>(null);
  
  // Touch handling state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const activePagerRef = useRef<{
    currentPage: number;
    setCurrentPage: (v: number | ((prev: number) => number)) => void;
    totalPages: number;
  } | null>(null);

  // Fetch books from API
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoadingBooks(true);
        const response = await fetch(`${API_URL}/books`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          // Get first 6 books for home page
          setBooks(data.data.slice(0, 6));
        }
      } catch (err) {
        console.error('Error fetching books:', err);
        setBooks([]);
      } finally {
        setIsLoadingBooks(false);
      }

      try {
        // Fetch free summaries using unified Books API
        setIsLoadingFreeSummaries(true);
        const response = await booksApi.getBooksByComponentType('free-summaries', 6);
        setFreeSummaries(response.data);
      } catch (err) {
        console.error('Error fetching free summaries:', err);
        setFreeSummaries([]);
      } finally {
        setIsLoadingFreeSummaries(false);
      }

      try {
        // Fetch trending books using unified Books API
        setIsLoadingTrendingBooks(true);
        const response = await booksApi.getBooksByComponentType('trending-books', 6);
        setTrendingBooks(response.data);
      } catch (err) {
        console.error('Error fetching trending books:', err);
        setTrendingBooks([]);
      } finally {
        setIsLoadingTrendingBooks(false);
      }

      try {
        // Fetch premium summaries using unified Books API
        setIsLoadingPremiumSummaries(true);
        const response = await booksApi.getBooksByComponentType('premium-summaries', 6);
        setPremiumSummaries(response.data);
      } catch (err) {
        console.error('Error fetching premium summaries:', err);
        setPremiumSummaries([]);
      } finally {
        setIsLoadingPremiumSummaries(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    // Inject blob animation styles only once
    if (!document.getElementById('blob-animations')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'blob-animations';
      styleElement.textContent = blobStyles;
      document.head.appendChild(styleElement);
    }
  }, []);

  const getBooksPageItems = () => {
    const startBook = currentBookPage * itemsPerPage;
    return books.slice(startBook, startBook + itemsPerPage);
  };

  const getBooksTotalPages = () => Math.ceil(books.length / itemsPerPage);

  const getFreeSummariesPageItems = () => {
    const start = currentFreeSummaryPage * itemsPerPage;
    return freeSummaries.slice(start, start + itemsPerPage);
  };

  const getFreeSummariesTotalPages = () => Math.ceil(freeSummaries.length / itemsPerPage);

  const getTrendingBooksPageItems = () => {
    const start = currentTrendingBookPage * itemsPerPage;
    return trendingBooks.slice(start, start + itemsPerPage);
  };

  const getTrendingBooksTotalPages = () => Math.ceil(trendingBooks.length / itemsPerPage);

  const getPremiumSummariesPageItems = () => {
    const start = currentPremiumSummaryPage * itemsPerPage;
    return premiumSummaries.slice(start, start + itemsPerPage);
  };

  const getPremiumSummariesTotalPages = () => Math.ceil(premiumSummaries.length / itemsPerPage);

  // Swipe handling functions
  const minSwipeDistance = 50;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    const isSwipe = Math.abs(distanceX) > minSwipeDistance;
    
    if (isHorizontalSwipe && isSwipe) {
      setHasInteracted(true);
      setShowSwipeHint(false);

      const pager = activePagerRef.current;
      if (!pager) return;

      if (distanceX > 0 && pager.currentPage < pager.totalPages - 1) {
        pager.setCurrentPage((prev) => prev + 1);
      } else if (distanceX < 0 && pager.currentPage > 0) {
        pager.setCurrentPage((prev) => prev - 1);
      }
    }
  }, [touchStart, touchEnd]);

  const setActivePager = useCallback(
    (pager: {
      currentPage: number;
      setCurrentPage: (v: number | ((prev: number) => number)) => void;
      totalPages: number;
    }) => {
      activePagerRef.current = pager;
    },
    []
  );

  // Swipe Hint Component
  const SwipeHint = ({ show }: { show: boolean }) => (
    <div 
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className='bg-black/80 backdrop-blur-sm text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 animate-pulse'>
        <HandRaisedIcon className='w-5 h-5 text-blue-400' />
        <span className='text-sm font-medium'>Swipe left or right for more</span>
        <div className='flex space-x-1'>
          <ArrowRightIcon className='w-4 h-4 text-blue-400 animate-bounce' style={{ animationDelay: '0s' }} />
          <ArrowRightIcon className='w-4 h-4 text-blue-400 animate-bounce' style={{ animationDelay: '0.2s' }} />
          <ArrowRightIcon className='w-4 h-4 text-blue-400 animate-bounce' style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );

  return (
    <section className='pt-4 pb-6 bg-gradient-to-br from-white via-slate-50 to-indigo-50/30 relative overflow-hidden'>
      {/* Main Loading Overlay */}
        {/* {isLoading && (
          <div className="absolute inset-0 z-40 bg-white/80 backdrop-blur-sm">
            <LoadingAnimation className="text-blue-600 scale-150 mb-8" />
            <p className="text-slate-600 text-lg font-medium">Loading media content...</p>
          </div>
        )} */}

      {/* Background Elements */}
      <div className='absolute inset-0 opacity-20'>
        <div className='absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-transparent to-purple-600/5' />
        <div className='absolute top-10 right-5 w-20 h-20 bg-indigo-200/20 rounded-full blur-2xl animate-pulse' />
        <div className='absolute bottom-10 left-5 w-24 h-24 bg-purple-200/15 rounded-full blur-2xl animate-pulse delay-1000' />
      </div>

      <div className='max-w-2xl mx-auto px-4 relative'>
        {/* Books Section */}
        <div className='mb-8'>
          {/* Header */}
          <div className='flex items-center justify-between mb-6'>
            <div className='flex-1'>
              <h3 className='text-lg font-bold text-slate-900 mb-2 flex items-center'>
                <BookOpenIcon className='w-4 h-4 mr-2 text-black' />
                <span className='text-black'>Books Collection</span>
              </h3>
              <div className='h-1 w-20 bg-black rounded-full'></div>
            </div>
            <Button
              onClick={() => window.location.href = '/books'}
              variant="outline"
              size="sm"
              rightIcon={<ChevronRightIcon className='w-4 h-4' />}
            >
              See More
            </Button>
          </div>

          {/* Books Grid - 2 columns with swipe */}
          <div 
            ref={booksContainerRef}
            className='grid grid-cols-2 gap-4 mb-6 touch-pan-y'
            onTouchStart={(e) => {
              setActivePager({
                currentPage: currentBookPage,
                setCurrentPage: setCurrentBookPage,
                totalPages: getBooksTotalPages(),
              });
              onTouchStart(e);
            }}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {getBooksPageItems().map((book, index) => (
              <div
                key={book.id}
                className='group relative w-full'
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
                  {/* Book Cover Image */}
                  <div className='relative w-full h-full overflow-hidden flex items-center justify-center p-0'>
                    {book.image ? (
                      <Image
                        src={book.image}
                        alt={book.title}
                        fill
                        className='object-cover object-center transition-transform duration-300 group-hover:scale-105'
                        sizes='(max-width: 768px) 50vw, 33vw'
                        loading={index === 0 ? "eager" : "lazy"}
                        priority={index === 0}
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+E="
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400 text-sm">No Image</span>
                      </div>
                    )}
                    
                    {/* Category Badge */}
                    <div className='absolute top-2 left-2'>
                      <span className='bg-white/90 backdrop-blur-sm text-indigo-700 px-2 py-1 rounded-full text-xs font-semibold shadow-sm'>
                        {book.category}
                      </span>
                    </div>
                  </div>

                  {/* Mobile Bottom Info */}
                  <div className='absolute bottom-0 left-0 right-0 z-[4] bg-gradient-to-t from-black/95 via-black/80 to-transparent rounded-b-[8px] p-2'>
                    <h3 className='text-xs font-bold text-white mb-1 leading-tight line-clamp-1'>
                      {book.title}
                    </h3>
                    <p className='text-xs text-white/80 mb-2'>
                      By {book.author} • {book.pages ? `${book.pages} pages` : book.duration || book.type}
                    </p>
                    <Link href={`/books/${generateBookSlug(book.title)}`}>
                      <Button variant="secondary" size="xs" fullWidth>
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Dots */}
          {getBooksTotalPages() > 1 && (
            <div className='flex justify-center space-x-2 mb-4'>
              {Array.from({ length: getBooksTotalPages() }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentBookPage(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentBookPage === i
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 w-6'
                      : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Free Summaries Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex-1'>
              <h3 className='text-lg font-bold text-slate-900 mb-2 flex items-center'>
                <BookOpenIcon className='w-4 h-4 mr-2 text-black' />
                <span className='text-black'>Free Summaries</span>
              </h3>
              <div className='h-1 w-20 bg-black rounded-full'></div>
            </div>
            <Button
              onClick={() => window.location.href = '/free-summaries'}
              variant="outline"
              size="sm"
              rightIcon={<ChevronRightIcon className='w-4 h-4' />}
            >
              See More
            </Button>
          </div>

          <div
            ref={freeSummariesContainerRef}
            className='grid grid-cols-2 gap-4 mb-6 touch-pan-y'
            onTouchStart={(e) => {
              setActivePager({
                currentPage: currentFreeSummaryPage,
                setCurrentPage: setCurrentFreeSummaryPage,
                totalPages: getFreeSummariesTotalPages(),
              });
              onTouchStart(e);
            }}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {(isLoadingFreeSummaries ? [] : getFreeSummariesPageItems()).map((summary, index) => (
              <div
                key={(summary as any)._id || (summary as any).id}
                className='group relative w-full'
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
                <div
                  className="hidden absolute z-[1] top-1/2 left-1/2 w-[100px] h-[100px] rounded-full opacity-100 blur-[8px]"
                  style={{
                    backgroundColor: index % 3 === 0 ? '#4f46e5' : index % 3 === 1 ? '#7c3aed' : '#ec4899',
                    animation: 'blob-bounce 5s infinite ease',
                    transform: 'translate(-50%, -50%)',
                  }}
                />

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
                  <div className='relative w-full h-full overflow-hidden flex items-center justify-center p-0'>
                    {summary.image ? (
                      <Image
                        src={summary.image}
                        alt={summary.title}
                        fill
                        className='object-cover object-center transition-transform duration-300 group-hover:scale-105'
                        sizes='(max-width: 768px) 50vw, 33vw'
                        loading={index === 0 ? 'eager' : 'lazy'}
                        priority={index === 0}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400 text-sm">No Image</span>
                      </div>
                    )}

                    <div className='absolute top-2 left-2'>
                      <span className='bg-white/90 backdrop-blur-sm text-indigo-700 px-2 py-1 rounded-full text-xs font-semibold shadow-sm'>
                        {summary.category}
                      </span>
                    </div>
                  </div>

                  <div className='absolute bottom-0 left-0 right-0 z-[4] bg-gradient-to-t from-black/95 via-black/80 to-transparent rounded-b-[8px] p-2'>
                    <h3 className='text-xs font-bold text-white mb-1 leading-tight line-clamp-1'>
                      {summary.title}
                    </h3>
                    <p className='text-xs text-white/80 mb-2'>
                      By {summary.author} • {summary.pages ? `${summary.pages} pages` : 'Free Summary'}
                    </p>
                    <Link href={`/free-summaries/${(summary as any).slug || (summary as any).id || (summary as any)._id}`}>
                      <Button variant="secondary" size="xs" fullWidth>
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {getFreeSummariesTotalPages() > 1 && (
            <div className='flex justify-center space-x-2 mb-4'>
              {Array.from({ length: getFreeSummariesTotalPages() }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentFreeSummaryPage(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentFreeSummaryPage === i
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 w-6'
                      : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Trending Books Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex-1'>
              <h3 className='text-lg font-bold text-slate-900 mb-2 flex items-center'>
                <BookOpenIcon className='w-4 h-4 mr-2 text-black' />
                <span className='text-black'>Trending Books</span>
              </h3>
              <div className='h-1 w-20 bg-black rounded-full'></div>
            </div>
            <Button
              onClick={() => window.location.href = '/trending-books'}
              variant="outline"
              size="sm"
              rightIcon={<ChevronRightIcon className='w-4 h-4' />}
            >
              See More
            </Button>
          </div>

          <div
            ref={trendingBooksContainerRef}
            className='grid grid-cols-2 gap-4 mb-6 touch-pan-y'
            onTouchStart={(e) => {
              setActivePager({
                currentPage: currentTrendingBookPage,
                setCurrentPage: setCurrentTrendingBookPage,
                totalPages: getTrendingBooksTotalPages(),
              });
              onTouchStart(e);
            }}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {(isLoadingTrendingBooks ? [] : getTrendingBooksPageItems()).map((book, index) => (
              <div
                key={(book as any)._id || (book as any).id}
                className='group relative w-full'
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
                <div
                  className="hidden absolute z-[1] top-1/2 left-1/2 w-[100px] h-[100px] rounded-full opacity-100 blur-[8px]"
                  style={{
                    backgroundColor: index % 3 === 0 ? '#4f46e5' : index % 3 === 1 ? '#7c3aed' : '#ec4899',
                    animation: 'blob-bounce 5s infinite ease',
                    transform: 'translate(-50%, -50%)',
                  }}
                />

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
                  <div className='relative w-full h-full overflow-hidden flex items-center justify-center p-0'>
                    {book.image ? (
                      <Image
                        src={book.image}
                        alt={book.title}
                        fill
                        className='object-cover object-center transition-transform duration-300 group-hover:scale-105'
                        sizes='(max-width: 768px) 50vw, 33vw'
                        loading={index === 0 ? 'eager' : 'lazy'}
                        priority={index === 0}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400 text-sm">No Image</span>
                      </div>
                    )}

                    <div className='absolute top-2 left-2'>
                      <span className='bg-white/90 backdrop-blur-sm text-indigo-700 px-2 py-1 rounded-full text-xs font-semibold shadow-sm'>
                        {book.category}
                      </span>
                    </div>
                  </div>

                  <div className='absolute bottom-0 left-0 right-0 z-[4] bg-gradient-to-t from-black/95 via-black/80 to-transparent rounded-b-[8px] p-2'>
                    <h3 className='text-xs font-bold text-white mb-1 leading-tight line-clamp-1'>
                      {book.title}
                    </h3>
                    <p className='text-xs text-white/80 mb-2'>
                      By {book.author} • {book.pages ? `${book.pages} pages` : 'Trending'}
                    </p>
                    <Link href={`/trending-books/${(book as any).slug || (book as any).id || (book as any)._id}`}>
                      <Button variant="secondary" size="xs" fullWidth>
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {getTrendingBooksTotalPages() > 1 && (
            <div className='flex justify-center space-x-2 mb-4'>
              {Array.from({ length: getTrendingBooksTotalPages() }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTrendingBookPage(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentTrendingBookPage === i
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 w-6'
                      : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Premium Summaries Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex-1'>
              <h3 className='text-lg font-bold text-slate-900 mb-2 flex items-center'>
                <BookOpenIcon className='w-4 h-4 mr-2 text-black' />
                <span className='text-black'>Premium Summaries</span>
              </h3>
              <div className='h-1 w-20 bg-black rounded-full'></div>
            </div>
            <Button
              onClick={() => window.location.href = '/premium-summaries'}
              variant="outline"
              size="sm"
              rightIcon={<ChevronRightIcon className='w-4 h-4' />}
            >
              See More
            </Button>
          </div>

          <div
            ref={premiumSummariesContainerRef}
            className='grid grid-cols-2 gap-4 mb-6 touch-pan-y'
            onTouchStart={(e) => {
              setActivePager({
                currentPage: currentPremiumSummaryPage,
                setCurrentPage: setCurrentPremiumSummaryPage,
                totalPages: getPremiumSummariesTotalPages(),
              });
              onTouchStart(e);
            }}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {(isLoadingPremiumSummaries ? [] : getPremiumSummariesPageItems()).map((summary, index) => (
              <div
                key={(summary as any)._id || (summary as any).id}
                className='group relative w-full'
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
                <div
                  className="absolute z-[1] top-1/2 left-1/2 w-[100px] h-[100px] rounded-full opacity-100 blur-[8px]"
                  style={{
                    backgroundColor: index % 3 === 0 ? '#4f46e5' : index % 3 === 1 ? '#7c3aed' : '#ec4899',
                    animation: 'blob-bounce 5s infinite ease',
                    transform: 'translate(-50%, -50%)',
                  }}
                />

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
                  <div className='relative w-full h-full overflow-hidden flex items-center justify-center p-0'>
                    {summary.image ? (
                      <Image
                        src={summary.image}
                        alt={summary.title}
                        fill
                        className='object-cover object-center transition-transform duration-300 group-hover:scale-105'
                        sizes='(max-width: 768px) 50vw, 33vw'
                        loading={index === 0 ? 'eager' : 'lazy'}
                        priority={index === 0}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400 text-sm">No Image</span>
                      </div>
                    )}

                    <div className='absolute top-2 left-2'>
                      <span className='bg-white/90 backdrop-blur-sm text-indigo-700 px-2 py-1 rounded-full text-xs font-semibold shadow-sm'>
                        {summary.category}
                      </span>
                    </div>
                  </div>

                  <div className='absolute bottom-0 left-0 right-0 z-[4] bg-gradient-to-t from-black/95 via-black/80 to-transparent rounded-b-[8px] p-2'>
                    <h3 className='text-xs font-bold text-white mb-1 leading-tight line-clamp-1'>
                      {summary.title}
                    </h3>
                    <p className='text-xs text-white/80 mb-2'>
                      By {summary.author} • {summary.pages ? `${summary.pages} pages` : 'Premium Summary'}
                    </p>
                    <Link href={`/premium-summaries/${(summary as any).slug || (summary as any).id || (summary as any)._id}`}>
                      <Button variant="secondary" size="xs" fullWidth>
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {getPremiumSummariesTotalPages() > 1 && (
            <div className='flex justify-center space-x-2 mb-4'>
              {Array.from({ length: getPremiumSummariesTotalPages() }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPremiumSummaryPage(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentPremiumSummaryPage === i
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 w-6'
                      : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Swipe Hint */}
      <SwipeHint show={showSwipeHint} />
    </section>
  );
}