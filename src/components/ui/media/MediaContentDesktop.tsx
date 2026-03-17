'use client';

import { useState, useEffect } from 'react';
import {
  BookOpenIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../primitives/Button';
import Image from 'next/image';
import Link from 'next/link';
import { generateBookSlug } from '@/utils/slugify';
import { API_CONFIG } from '@/config/api';
import { freeSummariesApi, type FreeSummary } from '@/services/api/freeSummariesApi';
import { trendingBooksApi, type TrendingBook } from '@/services/api/trendingBooksApi';
import { premiumSummariesApi, type PremiumSummary } from '@/services/api/premiumSummariesApi';

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

// Type definitions
interface Book {
  id: number;
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
}

export default function MediaContentDesktop() {
  const [books, setBooks] = useState<Book[]>([]);
  const [freeSummaries, setFreeSummaries] = useState<FreeSummary[]>([]);
  const [trendingBooks, setTrendingBooks] = useState<TrendingBook[]>([]);
  const [premiumSummaries, setPremiumSummaries] = useState<PremiumSummary[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [isLoadingFreeSummaries, setIsLoadingFreeSummaries] = useState(true);
  const [isLoadingTrendingBooks, setIsLoadingTrendingBooks] = useState(true);
  const [isLoadingPremiumSummaries, setIsLoadingPremiumSummaries] = useState(true);

  const topicChips = [
    'Self Improvement',
    'Business',
    'Motivation & Inspiration',
    'Biographies',
    'Productivity',
    'Students',
    'Science',
    'Communication Skills',
    'Trending',
    'For You',
    'Newly Added',
    'Premium Book Summaries',
    'Business Secrets',
    'Indian Personalities',
    '21 Days Challenge',
    'Free Summaries',
    'Most Famous Books',
    'Positive Mindset',
    'Investment',
    '75 Days Challenge',
  ];

  const itemsPerPage = 4;

  // Fetch all data from APIs
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch books
        setIsLoadingBooks(true);
        const booksResponse = await fetch(`${API_URL}/books`);
        if (booksResponse.ok) {
          const booksData = await booksResponse.json();
          if (booksData.success && booksData.data) {
            setBooks(booksData.data.slice(0, 6));
          }
        }
      } catch (err) {
        console.error('Error fetching books:', err);
      } finally {
        setIsLoadingBooks(false);
      }

      try {
        // Fetch free summaries
        setIsLoadingFreeSummaries(true);
        const freeSummariesData = await freeSummariesApi.getFeaturedFreeSummaries(6);
        setFreeSummaries(freeSummariesData);
      } catch (err) {
        console.error('Error fetching free summaries:', err);
      } finally {
        setIsLoadingFreeSummaries(false);
      }

      try {
        // Fetch trending books
        setIsLoadingTrendingBooks(true);
        const trendingBooksData = await trendingBooksApi.getFeaturedTrendingBooks(6);
        setTrendingBooks(trendingBooksData);
      } catch (err) {
        console.error('Error fetching trending books:', err);
      } finally {
        setIsLoadingTrendingBooks(false);
      }

      try {
        // Fetch premium summaries
        setIsLoadingPremiumSummaries(true);
        const premiumSummariesData = await premiumSummariesApi.getLatestPremiumSummaries(6);
        setPremiumSummaries(premiumSummariesData);
      } catch (err) {
        console.error('Error fetching premium summaries:', err);
      } finally {
        setIsLoadingPremiumSummaries(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    // Inject blob animation styles only once
    if (!document.getElementById('blob-animations-desktop')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'blob-animations-desktop';
      styleElement.textContent = blobStyles;
      document.head.appendChild(styleElement);
    }
  }, []);

  const getBooksPageItems = () => {
    return books.slice(0, itemsPerPage);
  };

  return (
    <>
    <section className='pt-8 bg-gradient-to-br from-white via-slate-50 to-indigo-50/30 relative overflow-hidden'>
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
        <div className='absolute top-20 right-10 w-32 h-32 bg-indigo-200/20 rounded-full blur-3xl animate-pulse' />
        <div className='absolute bottom-20 left-10 w-40 h-40 bg-purple-200/15 rounded-full blur-3xl animate-pulse delay-1000' />
      </div>

      <div className='max-w-7xl mx-auto px-8 relative'>
        {/* Books Section */}
        <div className='mb-12'>
          <div className='flex items-center justify-between mb-8'>
            <div className='flex-1'>
              <h3 className='text-3xl font-bold text-slate-900 mb-2 flex items-center'>
                <BookOpenIcon className='w-7 h-7 mr-3 text-black' />
                <span className='text-black'>Books</span>
              </h3>
              <div className='h-1 w-36 bg-black rounded-full'></div>
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

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8'>
            {isLoadingBooks ? (
              // Loading skeleton
              Array.from({ length: 4 }, (_, index) => (
                <div
                  key={`book-skeleton-${index}`}
                  className='relative w-full bg-slate-200 animate-pulse rounded-2xl'
                  style={{ height: '440px' }}
                />
              ))
            ) : books.length === 0 ? (
              // No books message
              <div className='col-span-full text-center py-12'>
                <p className='text-slate-600'>No books available at the moment.</p>
              </div>
            ) : (
              getBooksPageItems().map((book, index) => (
              <div
                key={book.id}
                className='group relative w-full'
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  position: 'relative',
                  height: '340px',
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
                  {/* Book Cover Image */}
                  <div className='relative w-full h-full overflow-hidden flex items-center justify-center p-0'>
                    {book.image ? (
                      <Image
                        src={book.image}
                        alt={book.title}
                        fill
                        className='object-cover object-center transition-transform duration-300 group-hover:scale-105'
                        sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
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

                  {/* Hover Overlay */}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 z-[3] rounded-[10px] flex flex-col justify-end'>
                    <div className='p-4 text-white transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500'>
                      <h3 className='text-lg font-bold mb-2 leading-tight'>
                        {book.title}
                      </h3>
                      <p className='text-sm text-white/90 mb-3 leading-relaxed line-clamp-2'>
                        {book.description}
                      </p>
                      <div className='text-xs text-white/80 mb-4'>
                        <div className='font-medium'>{book.author}</div>
                        <div>{book.pages ? `${book.pages} pages` : book.duration || book.type}</div>
                      </div>
                      <Link href={`/books/${generateBookSlug(book.title)}`}>
                        <Button variant="secondary" size="sm" fullWidth>
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>

          {/* Pagination for Books */}
          {/* {getBooksTotalPages() > 1 && (
            <div className='flex items-center justify-center space-x-4 mt-8'>
              <Button
                onClick={handleBooksPrevPage}
                disabled={currentBookPage === 0}
                variant="secondary"
                size="sm"
                leftIcon={<ChevronLeftIcon className='w-5 h-5' />}
              >
                Previous
              </Button>

              <div className='flex space-x-2'>
                {Array.from({ length: getBooksTotalPages() }, (_, i) => (
                  <Button
                    key={i}
                    onClick={() => setCurrentBookPage(i)}
                    variant={currentBookPage === i ? "primary" : "secondary"}
                    size="icon"
                    className="w-10 h-10"
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>

              <Button
                onClick={handleBooksNextPage}
                disabled={currentBookPage === getBooksTotalPages() - 1}
                variant="secondary"
                size="sm"
                rightIcon={<ChevronRightIcon className='w-5 h-5' />}
              >
                Next
              </Button>
            </div>
          )} */}
        </div>
      </div>
    </section>
    <section className='pt-8 bg-gradient-to-br from-white via-slate-50 to-indigo-50/30 relative overflow-hidden'>
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
        <div className='absolute top-20 right-10 w-32 h-32 bg-indigo-200/20 rounded-full blur-3xl animate-pulse' />
        <div className='absolute bottom-20 left-10 w-40 h-40 bg-purple-200/15 rounded-full blur-3xl animate-pulse delay-1000' />
      </div>

      <div className='max-w-7xl mx-auto px-8 relative'>
        {/* Books Section */}
        <div className='mb-12'>
          <div className='flex items-center justify-between mb-8'>
            <div className='flex-1'>
              <h3 className='text-3xl font-bold text-slate-900 mb-2 flex items-center'>
                <BookOpenIcon className='w-7 h-7 mr-3 text-black' />
                <span className='text-black'>Free Summaries</span>
              </h3>
              <div className='h-1 w-36 bg-black rounded-full'></div>
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

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8'>
            {isLoadingFreeSummaries ? (
              // Loading skeleton
              Array.from({ length: 4 }, (_, index) => (
                <div
                  key={`free-summary-skeleton-${index}`}
                  className='relative w-full bg-slate-200 animate-pulse rounded-2xl'
                  style={{ height: '340px' }}
                />
              ))
            ) : freeSummaries.length === 0 ? (
              // No free summaries message
              <div className='col-span-full text-center py-12'>
                <p className='text-slate-600'>No free summaries available at the moment.</p>
              </div>
            ) : (
              freeSummaries.slice(0, itemsPerPage).map((summary, index) => (
              <div
                key={summary._id}
                className='group relative w-full'
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  position: 'relative',
                  height: '340px',
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
                  {/* Book Cover Image */}
                  <div className='relative w-full h-full overflow-hidden flex items-center justify-center p-0'>
                    {summary.image ? (
                      <Image
                        src={summary.image}
                        alt={summary.title}
                        fill
                        className='object-cover object-center transition-transform duration-300 group-hover:scale-105'
                        sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
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
                        {summary.category}
                      </span>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 z-[3] rounded-[10px] flex flex-col justify-end'>
                    <div className='p-4 text-white transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500'>
                      <h3 className='text-lg font-bold mb-2 leading-tight'>
                        {summary.title}
                      </h3>
                      <p className='text-sm text-white/90 mb-3 leading-relaxed line-clamp-2'>
                        {summary.description}
                      </p>
                      <div className='text-xs text-white/80 mb-4'>
                        <div className='font-medium'>{summary.author}</div>
                        <div>{summary.pages ? `${summary.pages} pages` : summary.readingTime || 'Free Summary'}</div>
                      </div>
                      <Link href={`/free-summaries/${summary.slug}`}>
                        <Button variant="secondary" size="sm" fullWidth>
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      </div>
    </section>
    <section className='pt-8 bg-gradient-to-br from-white via-slate-50 to-indigo-50/30 relative overflow-hidden'>
     
      {/* Background Elements */}
      <div className='absolute inset-0 opacity-20'>
        <div className='absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-transparent to-purple-600/5' />
        <div className='absolute top-20 right-10 w-32 h-32 bg-indigo-200/20 rounded-full blur-3xl animate-pulse' />
        <div className='absolute bottom-20 left-10 w-40 h-40 bg-purple-200/15 rounded-full blur-3xl animate-pulse delay-1000' />
      </div>

      <div className='max-w-7xl mx-auto px-8 relative'>
        {/* Books Section */}
        <div className='mb-12'>
          <div className='flex items-center justify-between mb-8'>
            <div className='flex-1'>
              <h3 className='text-3xl font-bold text-slate-900 mb-2 flex items-center'>
                <BookOpenIcon className='w-7 h-7 mr-3 text-black' />
                <span className='text-black'>Trending Books</span>
              </h3>
              <div className='h-1 w-36 bg-black rounded-full'></div>
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

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8'>
            {isLoadingTrendingBooks ? (
              // Loading skeleton
              Array.from({ length: 4 }, (_, index) => (
                <div
                  key={`trending-book-skeleton-${index}`}
                  className='relative w-full bg-slate-200 animate-pulse rounded-2xl'
                  style={{ height: '340px' }}
                />
              ))
            ) : trendingBooks.length === 0 ? (
              // No trending books message
              <div className='col-span-full text-center py-12'>
                <p className='text-slate-600'>No trending books available at the moment.</p>
              </div>
            ) : (
              trendingBooks.slice(0, itemsPerPage).map((book, index) => (
              <div
                key={book._id}
                className='group relative w-full'
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  position: 'relative',
                  height: '340px',
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
                  {/* Book Cover Image */}
                  <div className='relative w-full h-full overflow-hidden flex items-center justify-center p-0'>
                    {book.image ? (
                      <Image
                        src={book.image}
                        alt={book.title}
                        fill
                        className='object-cover object-center transition-transform duration-300 group-hover:scale-105'
                        sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
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

                  {/* Hover Overlay */}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 z-[3] rounded-[10px] flex flex-col justify-end'>
                    <div className='p-4 text-white transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500'>
                      <h3 className='text-lg font-bold mb-2 leading-tight'>
                        {book.title}
                      </h3>
                      <p className='text-sm text-white/90 mb-3 leading-relaxed line-clamp-2'>
                        {book.description}
                      </p>
                      <div className='text-xs text-white/80 mb-4'>
                        <div className='font-medium'>{book.author}</div>
                        <div>{book.pages ? `${book.pages} pages` : 'Trending'}</div>
                      </div>
                      <Link href={`/trending-books/${book.slug}`}>
                        <Button variant="secondary" size="sm" fullWidth>
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      </div>
    </section>
    <section className='pt-8 bg-gradient-to-br from-white via-slate-50 to-indigo-50/30 relative overflow-hidden'>
    

      {/* Background Elements */}
      <div className='absolute inset-0 opacity-20'>
        <div className='absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-transparent to-purple-600/5' />
        <div className='absolute top-20 right-10 w-32 h-32 bg-indigo-200/20 rounded-full blur-3xl animate-pulse' />
        <div className='absolute bottom-20 left-10 w-40 h-40 bg-purple-200/15 rounded-full blur-3xl animate-pulse delay-1000' />
      </div>

      <div className='max-w-7xl mx-auto px-8 relative'>
        {/* Books Section */}
        <div className='mb-12'>
          <div className='flex items-center justify-between mb-8'>
            <div className='flex-1'>
              <h3 className='text-3xl font-bold text-slate-900 mb-2 flex items-center'>
                <BookOpenIcon className='w-7 h-7 mr-3 text-black' />
                <span className='text-black'>New Premium Summaries</span>
              </h3>
              <div className='h-1 w-36 bg-black rounded-full'></div>
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

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8'>
            {isLoadingPremiumSummaries ? (
              // Loading skeleton
              Array.from({ length: 4 }, (_, index) => (
                <div
                  key={`premium-summary-skeleton-${index}`}
                  className='relative w-full bg-slate-200 animate-pulse rounded-2xl'
                  style={{ height: '340px' }}
                />
              ))
            ) : premiumSummaries.length === 0 ? (
              // No premium summaries message
              <div className='col-span-full text-center py-12'>
                <p className='text-slate-600'>No premium summaries available at the moment.</p>
              </div>
            ) : (
              premiumSummaries.slice(0, itemsPerPage).map((summary, index) => (
              <div
                key={summary._id}
                className='group relative w-full'
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  position: 'relative',
                  height: '340px',
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
                  {/* Book Cover Image */}
                  <div className='relative w-full h-full overflow-hidden flex items-center justify-center p-0'>
                    {summary.image ? (
                      <Image
                        src={summary.image}
                        alt={summary.title}
                        fill
                        className='object-cover object-center transition-transform duration-300 group-hover:scale-105'
                        sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
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
                        {summary.category}
                      </span>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 z-[3] rounded-[10px] flex flex-col justify-end'>
                    <div className='p-4 text-white transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500'>
                      <h3 className='text-lg font-bold mb-2 leading-tight'>
                        {summary.title}
                      </h3>
                      <p className='text-sm text-white/90 mb-3 leading-relaxed line-clamp-2'>
                        {summary.description}
                      </p>
                      <div className='text-xs text-white/80 mb-4'>
                        <div className='font-medium'>{summary.author}</div>
                        <div>{summary.pages ? `${summary.pages} pages` : 'Premium Summary'}</div>
                      </div>
                      <Link href={`/premium-summaries/${summary.slug}`}>
                        <Button variant="secondary" size="sm" fullWidth>
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
          <div className='lg:col-span-3'>
            <div className='bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-lg overflow-hidden'>
              <div className='p-6 flex flex-col items-center text-center'>
                <div className='bg-amber-200/70 text-amber-900 text-xs font-semibold px-3 py-1 rounded-md mb-5'>
                  book of the day
                </div>
                <div className='text-slate-900 font-extrabold leading-none'>
                  <div className='text-5xl'>21</div>
                  <div className='text-xl tracking-wide mt-1'>DAYS</div>
                </div>
                <div className='text-slate-600 font-semibold text-sm mt-2'>CHALLENGES</div>
                <Button
                  onClick={() => (window.location.href = '/books?type=Audiobook')}
                  size='sm'
                  className='mt-6'
                >
                  Start now
                </Button>
              </div>
            </div>
          </div>

          <div className='lg:col-span-9'>
            <div className='flex flex-wrap gap-3'>
              {topicChips.map((label) => (
                <button
                  key={label}
                  type='button'
                  onClick={() =>
                    (window.location.href = `/books?search=${encodeURIComponent(label)}`)
                  }
                  className='inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm text-slate-700 text-sm hover:bg-white transition-colors'
                >
                  <BookOpenIcon className='w-4 h-4 text-slate-400' />
                  <span className='truncate max-w-[220px]'>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}