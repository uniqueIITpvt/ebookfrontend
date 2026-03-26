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
import { categoriesApi, type Category } from '@/services/api/categoriesApi';

const API_URL = API_CONFIG.API_BASE_URL;

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
        height: '320px',
        borderRadius: '24px',
        zIndex: 10,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'white',
        border: '1px solid rgba(0, 0, 0, 0.03)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
      }}
    >
      <div
        className='absolute z-[2] overflow-hidden rounded-[18px]'
        style={{
          top: '10px',
          left: '10px',
          width: 'calc(100% - 20px)',
          height: 'calc(100% - 20px)',
          background: '#f8fafc',
        }}
      >
        <div className='relative w-full h-full overflow-hidden flex items-center justify-center'>
          {book.image ? (
            <Image
              src={book.image}
              alt={book.title}
              fill
              className='object-cover object-center transition-transform duration-500 group-hover:scale-110'
              sizes='(max-width: 1280px) 25vw, 20vw'
              loading={index < 5 ? 'eager' : 'lazy'}
              priority={index < 5}
              placeholder='blur'
              blurDataURL={BLUR_DATA_URL}
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center bg-slate-50'>
              <span className='text-gray-400 text-xs'>No Image</span>
            </div>
          )}

          <div className='absolute top-2.5 left-2.5 z-10'>
            <span className='bg-white/90 backdrop-blur-md text-slate-900 px-3 py-1.5 rounded-full text-[9px] font-bold tracking-widest uppercase border border-black/5 shadow-premium font-dm-sans'>
              {book.category}
            </span>
          </div>
        </div>

        <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 z-[3] flex flex-col justify-end'>
          <div className='p-6 text-white transform translate-y-10 group-hover:translate-y-0 transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1)'>
            <div className='mb-2 flex items-center gap-1.5'>
              <div className='h-px w-4 bg-indigo-400'></div>
              <span className='text-[8px] font-bold uppercase tracking-widest text-indigo-400'>{subLabel || 'New Release'}</span>
            </div>
            <h3 className='text-lg font-syne font-bold mb-1.5 leading-tight line-clamp-2 tracking-tight'>{book.title}</h3>
            <p className='text-[11px] font-dm-sans text-white/70 mb-4 leading-relaxed line-clamp-2'>{book.description}</p>
            <div className='flex items-center justify-between mb-6'>
              <div className='text-[11px] font-bold truncate max-w-[60%] text-white/90'>{book.author}</div>
              <div className='text-[10px] text-white/40 font-medium bg-white/5 px-2 py-0.5 rounded-full'>{book.pages ? `${book.pages} pp` : book.type}</div>
            </div>
            <Link href={href} className='block'>
              <button className='w-full py-3 bg-white text-black text-[12px] font-bold rounded-xl transition-all hover:bg-black hover:text-white active:scale-95 font-dm-sans shadow-lg'>
                Explore Now
              </button>
            </Link>
          </div>
        </div>
      </div>
      <div className='absolute -inset-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-md -z-10' />
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
    <div className='mb-8'>
      <div className='flex items-center justify-between mb-8'>
        <div className='flex-1'>
          <h3 className='text-2xl font-bold text-slate-900 mb-2 flex items-center font-syne tracking-tight'>
            <BookOpenIcon className='w-6 h-6 mr-3 text-indigo-600' />
            <span>{title}</span>
          </h3>
          <div className='h-0.5 w-24 bg-indigo-600 rounded-full' />
        </div>
        <Button
          onClick={() => (window.location.href = seeMoreHref)}
          variant='outline'
          size='sm'
          className='text-slate-600 border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-xs font-dm-sans'
          rightIcon={<ChevronRightIcon className='w-3 h-3' />}
        >
          See More
        </Button>
      </div>

      {isLoading ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6'>
          {Array.from({ length: 5 }, (_, i) => (
            <div key={`${sectionKey}-skeleton-${i}`} className='h-[320px] bg-slate-100 animate-pulse rounded-3xl border border-slate-200' />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className='text-center py-10 opacity-30'>
          <p className='text-slate-400 text-sm'>{emptyMsg}</p>
        </div>
      ) : (
        <div className='relative group/carousel px-1'>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={swiperBreakpoints}
            navigation={{ prevEl, nextEl }}
            pagination={{ clickable: true }}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            className='!pb-12'
          >
            {items.map((book, index) => (
              <SwiperSlide key={(book as any)._id || book.id || index}>
                <BookCard book={book} index={index} href={cardHref(book)} subLabel={subLabel} />
              </SwiperSlide>
            ))}
          </Swiper>

          <button className={`${sectionKey}-prev absolute -left-4 top-[40%] -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-slate-50 opacity-0 group-hover/carousel:opacity-100 transition-all disabled:hidden`}>
            <ChevronLeftIcon className='w-5 h-5' />
          </button>
          <button className={`${sectionKey}-next absolute -right-4 top-[40%] -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-slate-50 opacity-0 group-hover/carousel:opacity-100 transition-all disabled:hidden`}>
            <ChevronRightIcon className='w-5 h-5' />
          </button>
        </div>
      )}
    </div>
  );
}

export default function MediaContentDesktop() {
  const [books, setBooks] = useState<Book[]>([]);
  const [freeSummaries, setFreeSummaries] = useState<Book[]>([]);
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
  const [premiumSummaries, setPremiumSummaries] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [isLoadingFreeSummaries, setIsLoadingFreeSummaries] = useState(true);
  const [isLoadingTrendingBooks, setIsLoadingTrendingBooks] = useState(true);
  const [isLoadingPremiumSummaries, setIsLoadingPremiumSummaries] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [booksRes, freeRes, trendingRes, premiumRes, catsRes] = await Promise.all([
          fetch(`${API_URL}/books`).then(r => r.json()),
          booksApi.getBooksByComponentType('free-summaries', 20),
          booksApi.getBooksByComponentType('trending-books', 20),
          booksApi.getBooksByComponentType('premium-summaries', 20),
          categoriesApi.getActive()
        ]);

        if (booksRes.success && booksRes.data) setBooks(booksRes.data);
        setFreeSummaries(freeRes.data);
        setTrendingBooks(trendingRes.data);
        setPremiumSummaries(premiumRes.data);
        if (catsRes.success && catsRes.data) setCategories(catsRes.data);

      } catch (err) {
        console.error('Error fetching landing page data:', err);
      } finally {
        setIsLoadingBooks(false);
        setIsLoadingFreeSummaries(false);
        setIsLoadingTrendingBooks(false);
        setIsLoadingPremiumSummaries(false);
        setIsLoadingCategories(false);
      }
    };
    fetchAllData();
  }, []);

  return (
    <>
      {/* Background Elements shared */}
      <section className='py-2 bg-gradient-to-br from-white via-slate-50 to-indigo-50/30 relative overflow-hidden'>
        <div className='absolute inset-0 opacity-20 pointer-events-none'>
          <div className='absolute inset-0 bg-gradient-to-br from-indigo-100/20 via-transparent to-purple-100/20' />
          <div className='absolute top-20 right-10 w-32 h-32 bg-indigo-200/20 rounded-full blur-3xl animate-pulse' />
          <div className='absolute bottom-20 left-10 w-40 h-40 bg-purple-200/15 rounded-full blur-3xl animate-pulse delay-1000' />
        </div>

        <div className='max-w-7xl mx-auto px-8 relative z-10'>
          <SectionCarousel title='New Releases Books' seeMoreHref='/books' isLoading={isLoadingBooks} items={books} emptyMsg='No books available' sectionKey='books' cardHref={(b) => `/books/${generateBookSlug(b.title)}`} />
          <div id="free-summaries-section">
            <SectionCarousel title='Free Summaries' seeMoreHref='/free' isLoading={isLoadingFreeSummaries} items={freeSummaries} emptyMsg='No free summaries' sectionKey='free' cardHref={(b) => `/books/${generateBookSlug(b.title)}`} subLabel='Free' />
          </div>
          <SectionCarousel title='Trending Books' seeMoreHref='/trending' isLoading={isLoadingTrendingBooks} items={trendingBooks} emptyMsg='No trending books' sectionKey='trending' cardHref={(b) => `/books/${generateBookSlug(b.title)}`} subLabel='Trending' />
          <SectionCarousel title='Premium Content' seeMoreHref='/premium' isLoading={isLoadingPremiumSummaries} items={premiumSummaries} emptyMsg='No premium content' sectionKey='premium' cardHref={(b) => `/books/${generateBookSlug(b.title)}`} subLabel='Premium' />

          <div className='relative mt-4 mb-4 p-8 lg:p-10 bg-[#0B0F1A] rounded-[40px] overflow-hidden border border-white/5'>
            <div className='absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none' />
            <div className='absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none' />

            <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10'>
              <div className='lg:col-span-3 lg:sticky lg:top-24'>
                <div className='flex flex-col items-center pt-4'>
                  <div className='bg-gradient-to-r from-[#FF8C7E] to-[#FF4E74] text-white text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-full mb-6 shadow-lg shadow-pink-500/20'>
                    ✦ book of the day
                  </div>
                  <div className='font-syne text-center mb-6'>
                    <div className='text-[70px] font-extrabold text-white leading-[0.8] mb-1 tracking-tighter'>21</div>
                    <div className='text-[24px] font-bold text-[#00E5BC] tracking-[0.2em] leading-none mb-1'>DAYS</div>
                    <div className='text-[10px] font-medium text-white/30 tracking-[0.4em] uppercase'>Challenge</div>
                  </div>
                  <button 
                    onClick={() => {
                      const element = document.getElementById('free-summaries-section');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }} 
                    className='group relative flex items-center gap-2 px-7 py-3 bg-white text-black text-[12px] font-bold rounded-full transition-all hover:scale-105 hover:shadow-xl font-dm-sans'
                  >
                    <span>Start Now</span>
                    <ChevronRightIcon className='w-3.5 h-3.5 transition-transform group-hover:translate-x-1' />
                  </button>
                </div>
              </div>

              <div className='lg:col-span-9'>
                <div className='flex items-center gap-3 mb-6'>
                  <span className='text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] font-syne'>Browse Categories</span>
                  <div className='h-px flex-1 bg-white/5'></div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-3.5'>
                  {isLoadingCategories ? (
                    Array.from({ length: 9 }, (_, i) => <div key={i} className='h-[75px] bg-white/5 animate-pulse rounded-2xl border border-white/5' />)
                  ) : (
                    <>
                      {categories.map((category, idx) => {
                        const icons = ['🧠', '📈', '⚡', '🔥', '🔬', '💼', '👑', '🎯', '🏆', '📡', '🎓', '💬', '⭐'];
                        const colors = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#6366F1', '#EC4899', '#F97316', '#84CC16', '#3B82F6', '#A855F7', '#F43F5E', '#14B8A6'];
                        return (
                          <div key={category._id || category.id} className='col-span-1 group'>
                            <button onClick={() => window.location.href = `/books?category=${category.name}`} className='w-full min-h-[60px] h-full relative flex items-center gap-3 p-2.5 rounded-[18px] bg-[#1A1F2E] border border-white/5 transition-all hover:bg-[#23293D] hover:border-white/15 hover:scale-[1.01] overflow-hidden'>
                              <div className='w-8 h-8 shrink-0 rounded-[10px] flex items-center justify-center text-base transition-transform group-hover:scale-110' style={{ backgroundColor: `${colors[idx % colors.length]}15`, color: colors[idx % colors.length] }}>
                                {icons[idx % icons.length]}
                              </div>
                              <div className='flex-1 flex flex-col justify-center text-left min-w-0'>
                                <div className='flex items-center flex-wrap gap-1.5 mb-0.5'>
                                  <span className='font-syne font-bold text-[14px] text-white truncate'>{category.name}</span>
                                  {idx === 0 && <span className='px-1.5 py-0.5 rounded-full bg-[#FF4E74]/20 text-[#FF4E74] text-[6.5px] font-black uppercase tracking-widest'>HOT</span>}
                                </div>
                                <div className='font-dm-sans text-white/20 text-[10px]'>{Math.floor(Math.random() * 400 + 50)}+ summaries</div>
                              </div>
                              <div className='shrink-0 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 bg-white/5 p-1 rounded-full'>
                                <ChevronRightIcon className='w-2.5 h-2.5 text-white/50' />
                              </div>
                              <div className='absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity pointer-events-none' style={{ background: `radial-gradient(circle at center, ${colors[idx % colors.length]}, transparent 70%)` }} />
                            </button>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}