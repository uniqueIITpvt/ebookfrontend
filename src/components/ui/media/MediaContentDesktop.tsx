'use client';

import { useState, useEffect } from 'react';
import {
  BookOpenIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Button } from '../primitives/Button';
import Image from 'next/image';
import Link from 'next/link';
import { generateBookSlug } from '@/utils/slugify';
import { API_CONFIG } from '@/config/api';
import { booksApi } from '@/services/api/booksApi';
import type { Book } from '@/services/api/booksApi';

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

const swiperBreakpoints = {
  640: { slidesPerView: 2 },
  1024: { slidesPerView: 4 },
  1280: { slidesPerView: 4 },
};

const BLUR_DATA_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+E=';

interface BookCardProps {
  book: Book;
  index: number;
  href: string;
  subLabel?: string;
}

function BookCard({ book, index, href, subLabel }: BookCardProps) {
  return (
    <div
      className='group relative w-full'
      style={{
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
      {/* Glass Background */}
      <div
        className='absolute z-[2] bg-white/95 backdrop-blur-[24px] rounded-[10px] overflow-hidden'
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
              sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 20vw'
              loading={index === 0 ? 'eager' : 'lazy'}
              priority={index === 0}
              placeholder='blur'
              blurDataURL={BLUR_DATA_URL}
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center bg-gray-100'>
              <span className='text-gray-400 text-sm'>No Image</span>
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
            <h3 className='text-lg font-bold mb-2 leading-tight'>{book.title}</h3>
            <p className='text-sm text-white/90 mb-3 leading-relaxed line-clamp-2'>{book.description}</p>
            <div className='text-xs text-white/80 mb-4'>
              <div className='font-medium'>{book.author}</div>
              <div>{book.pages ? `${book.pages} pages` : subLabel || book.type}</div>
            </div>
            <Link href={href}>
              <Button variant='secondary' size='sm' fullWidth>
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SectionCarouselProps {
  title: string;
  seeMoreHref: string;
  isLoading: boolean;
  items: Book[];
  emptyMsg: string;
  sectionKey: string;
  cardHref: (b: Book) => string;
  subLabel?: string;
}

function SectionCarousel({
  title,
  seeMoreHref,
  isLoading,
  items,
  emptyMsg,
  sectionKey,
  cardHref,
  subLabel,
}: SectionCarouselProps) {
  const prevEl = `.${sectionKey}-prev`;
  const nextEl = `.${sectionKey}-next`;

  return (
    <div className='mb-12'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div className='flex-1'>
          <h3 className='text-3xl font-bold text-slate-900 mb-2 flex items-center'>
            <BookOpenIcon className='w-7 h-7 mr-3 text-black' />
            <span className='text-black'>{title}</span>
          </h3>
          <div className='h-1 w-36 bg-black rounded-full' />
        </div>
        <Button
          onClick={() => (window.location.href = seeMoreHref)}
          variant='outline'
          size='sm'
          rightIcon={<ChevronRightIcon className='w-4 h-4' />}
        >
          See More
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8'>
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={`${sectionKey}-skeleton-${i}`}
              className='relative w-full bg-slate-200 animate-pulse rounded-2xl'
              style={{ height: '340px' }}
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-slate-600'>{emptyMsg}</p>
        </div>
      ) : (
        <div className='relative group/carousel'>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={swiperBreakpoints}
            navigation={{ prevEl, nextEl }}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            className='!pb-12 px-1'
          >
            {items.map((book, index) => (
              <SwiperSlide key={(book as any)._id || book.id || index}>
                <BookCard
                  book={book}
                  index={index}
                  href={cardHref(book)}
                  subLabel={subLabel}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Nav Buttons */}
          <button
            className={`${sectionKey}-prev absolute -left-5 top-[40%] -translate-y-1/2 z-10 w-11 h-11 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 opacity-0 group-hover/carousel:opacity-100 transition-all hover:scale-110 disabled:opacity-30`}
          >
            <ChevronLeftIcon className='w-5 h-5' />
          </button>
          <button
            className={`${sectionKey}-next absolute -right-5 top-[40%] -translate-y-1/2 z-10 w-11 h-11 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 opacity-0 group-hover/carousel:opacity-100 transition-all hover:scale-110 disabled:opacity-30`}
          >
            <ChevronRightIcon className='w-5 h-5' />
          </button>
        </div>
      )}
    </div>
  );
}

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

export default function MediaContentDesktop() {
  const [books, setBooks] = useState<Book[]>([]);
  const [freeSummaries, setFreeSummaries] = useState<Book[]>([]);
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
  const [premiumSummaries, setPremiumSummaries] = useState<Book[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [isLoadingFreeSummaries, setIsLoadingFreeSummaries] = useState(true);
  const [isLoadingTrendingBooks, setIsLoadingTrendingBooks] = useState(true);
  const [isLoadingPremiumSummaries, setIsLoadingPremiumSummaries] = useState(true);

  // Fetch all data from APIs
  useEffect(() => {
    const fetchAllData = async () => {
      // Books
      try {
        setIsLoadingBooks(true);
        const response = await fetch(`${API_URL}/books`);
        if (!response.ok) throw new Error('Failed to fetch books');
        const data = await response.json();
        if (data.success && data.data) setBooks(data.data);
      } catch (err) {
        console.error('Error fetching books:', err);
      } finally {
        setIsLoadingBooks(false);
      }

      // Free Summaries
      try {
        setIsLoadingFreeSummaries(true);
        const res = await booksApi.getBooksByComponentType('free-summaries', 20);
        setFreeSummaries(res.data);
      } catch (err) {
        console.error('Error fetching free summaries:', err);
      } finally {
        setIsLoadingFreeSummaries(false);
      }

      // Trending Books
      try {
        setIsLoadingTrendingBooks(true);
        const res = await booksApi.getBooksByComponentType('trending-books', 20);
        setTrendingBooks(res.data);
      } catch (err) {
        console.error('Error fetching trending books:', err);
      } finally {
        setIsLoadingTrendingBooks(false);
      }

      // Premium Summaries
      try {
        setIsLoadingPremiumSummaries(true);
        const res = await booksApi.getBooksByComponentType('premium-summaries', 20);
        setPremiumSummaries(res.data);
      } catch (err) {
        console.error('Error fetching premium summaries:', err);
      } finally {
        setIsLoadingPremiumSummaries(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    if (!document.getElementById('blob-animations-desktop')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'blob-animations-desktop';
      styleElement.textContent = blobStyles;
      document.head.appendChild(styleElement);
    }
  }, []);

  return (
    <>
      {/* Background Elements shared */}
      <section className='pt-8 bg-gradient-to-br from-white via-slate-50 to-indigo-50/30 relative overflow-hidden'>
        <div className='absolute inset-0 opacity-20 pointer-events-none'>
          <div className='absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-transparent to-purple-600/5' />
          <div className='absolute top-20 right-10 w-32 h-32 bg-indigo-200/20 rounded-full blur-3xl animate-pulse' />
          <div className='absolute bottom-20 left-10 w-40 h-40 bg-purple-200/15 rounded-full blur-3xl animate-pulse delay-1000' />
        </div>

        <div className='max-w-7xl mx-auto px-8 relative'>
          {/* Books */}
          <SectionCarousel
            title='Books'
            seeMoreHref='/books'
            isLoading={isLoadingBooks}
            items={books}
            emptyMsg='No books available at the moment.'
            sectionKey='books-section'
            cardHref={(b) => `/books/${generateBookSlug(b.title)}`}
          />

          {/* Free Summaries */}
          <SectionCarousel
            title='Free Summaries'
            seeMoreHref='/free-summaries'
            isLoading={isLoadingFreeSummaries}
            items={freeSummaries}
            emptyMsg='No free summaries available at the moment.'
            sectionKey='free-summaries-section'
            cardHref={(b) => `/books/${generateBookSlug(b.title)}`}
            subLabel='Free Summary'
          />

          {/* Trending Books */}
          <SectionCarousel
            title='Trending Books'
            seeMoreHref='/trending-books'
            isLoading={isLoadingTrendingBooks}
            items={trendingBooks}
            emptyMsg='No trending books available at the moment.'
            sectionKey='trending-section'
            cardHref={(b) => `/books/${generateBookSlug(b.title)}`}
            subLabel='Trending'
          />

          {/* Premium Summaries */}
          <SectionCarousel
            title='New Premium Summaries'
            seeMoreHref='/premium-summaries'
            isLoading={isLoadingPremiumSummaries}
            items={premiumSummaries}
            emptyMsg='No premium summaries available at the moment.'
            sectionKey='premium-section'
            cardHref={(b) => `/books/${generateBookSlug(b.title)}`}
            subLabel='Premium Summary'
          />

          {/* Bottom Topic Chips + 21 Days */}
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12'>
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
                    onClick={() => (window.location.href = `/books?search=${encodeURIComponent(label)}`)}
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