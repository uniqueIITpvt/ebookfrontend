'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { generateBookSlug } from '@/utils/slugify';
import { API_CONFIG } from '@/config/api';
import {
  ChevronDownIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BookOpenIcon,
  SpeakerWaveIcon,
  NewspaperIcon,
  QuestionMarkCircleIcon,

} from '@heroicons/react/24/outline';
import MobileNavigation from './MobileNavigation';
import { SearchDropdown } from '../primitives/SearchComponent';
import MobileSearch from '../primitives/MobileSearch';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = API_CONFIG.API_BASE_URL;

// Login Button Component
function LoginButton() {
  const { isAuthenticated, user, setIsLoginModalOpen, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  if (isAuthenticated && user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className="hidden md:inline">{user.name.split(' ')[0]}</span>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
              {user.subscriptionPlan && user.subscriptionPlan !== 'none' && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {user.subscriptionPlan.charAt(0).toUpperCase() + user.subscriptionPlan.slice(1)}
                </span>
              )}
            </div>
            <Link
              href="/subscription"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setShowDropdown(false)}
            >
              Subscription
            </Link>
            {user.role === 'user' ? (
              <Link
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setShowDropdown(false)}
              >
                My Profile
              </Link>
            ) : (user.role === 'admin' || user.role === 'superadmin') && (
              <Link
                href="/admin/dashboard"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setShowDropdown(false)}
              >
                Admin Dashboard
              </Link>
            )}
            <button
              onClick={() => {
                logout();
                setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/user/auth?mode=signup"
        className="hidden sm:block px-4 py-2 rounded-xl border-2 border-blue-600 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-all duration-300"
      >
        Sign Up Free
      </Link>
      <Link
        href="/user/auth?mode=signin"
        className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
      >
        Sign In
      </Link>
    </div>
  );
}

interface BookItem {
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

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  hasDropdown?: boolean;
  dropdownItems?: {
    name: string;
    href: string;
    description?: string;
    featured?: boolean;
    icon?: React.ReactNode;
  }[];
  isBooks?: boolean;
  color?: string;
}

const navItems: NavItem[] = [
  
  {
    name: 'Books',
    href: '/books',
    icon: <BookOpenIcon className='w-5 h-5' />,
    color: 'from-blue-500 to-indigo-600',
    hasDropdown: true,
    isBooks: true,
  },

  {
    name: 'Audiobooks',
    href: '/books?type=Audiobook',
    icon: <SpeakerWaveIcon className='w-5 h-5' />,
    color: 'from-blue-500 to-indigo-600',
  },

  {
    name: 'Blog',
    href: '/blog',
    icon: <NewspaperIcon className='w-5 h-5' />,
    color: 'from-blue-500 to-indigo-600',
  },
  
  {
    name: 'About',
    href: '/about',
    icon: <UserIcon className='w-5 h-5' />,
    color: 'from-blue-500 to-indigo-600',
  },

  {
    name: 'FAQ',
    href: '/faq',
    icon: <QuestionMarkCircleIcon className='w-5 h-5' />,
    color: 'from-blue-500 to-indigo-600',
  },


];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bookItems, setBookItems] = useState<BookItem[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [siteLogo, setSiteLogo] = useState<string>('');

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isAudiobooksRoute = pathname === '/books' && (searchParams?.get('type') || '') === 'Audiobook';
  const isBooksRoute = pathname === '/books' && !isAudiobooksRoute;

  const isNavItemActive = (item: NavItem) => {
    if (item.name === 'Audiobooks') return isAudiobooksRoute;
    if (item.name === 'Books') return isBooksRoute;
    return pathname === item.href;
  };

  // Fetch books from API
  useEffect(() => {
    const fetchBooks = async () => {
      const requestUrl = `${API_URL}/books`;
      try {
        setIsLoadingBooks(true);
        const response = await fetch(requestUrl);
        
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          // Get first 8 books for navbar dropdown
          setBookItems(data.data.slice(0, 8));
        }
      } catch (err) {
        if (err instanceof Error) {
          console.error('Error fetching books for navbar:', err.message);
          console.error('Error fetching books for navbar requestUrl:', requestUrl);
          console.error('Error fetching books for navbar apiBaseUrl:', API_URL);
          if (err.stack) {
            console.error('Error fetching books for navbar stack:', err.stack);
          }
        } else {
          console.error('Error fetching books for navbar (non-Error):', err);
          console.error('Error fetching books for navbar requestUrl:', requestUrl);
          console.error('Error fetching books for navbar apiBaseUrl:', API_URL);
        }
        setBookItems([]);
      } finally {
        setIsLoadingBooks(false);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await fetch('/api/v1/settings/public');
        const data = await res.json();
        if (data?.success && data?.data?.site_logo) {
          setSiteLogo(String(data.data.site_logo));
          return;
        }

        const valueRes = await fetch('/api/v1/settings/value/site_logo');
        const valueData = await valueRes.json();
        if (valueData?.success && valueData?.value) {
          setSiteLogo(String(valueData.value));
        } else {
          setSiteLogo('');
        }
      } catch {
        setSiteLogo('');
      }
    };

    fetchLogo();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnter = (name: string) => {
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  const handleDropdownClose = () => {
    setActiveDropdown(null);
  };

  const renderBooksDropdown = () => {
    return (
      <div className='absolute left-1/2 -translate-x-1/2 mt-0 w-[800px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-blue-200/60 hover:border-blue-300/80 py-6 z-10 animate-in slide-in-from-top-2 duration-300 transition-all'>
        <div className='absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-blue-200/60 rotate-45'></div>

        <div className='px-8 mb-6'>
          <div className='flex items-center space-x-3 mb-2'>
            <div className='p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white'>
              <BookOpenIcon className='w-6 h-6' />
            </div>
            <h3 className='text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent'>
              uniqueIIT Research Center Books
            </h3>
          </div>
          <p className='text-sm text-slate-600 ml-14'>
            Therapeutic literature for mental wellness and personal growth
          </p>
        </div>

        {isLoadingBooks ? (
          <div className='px-8 py-12 text-center'>
            <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4'></div>
            <p className='text-slate-600'>Loading books...</p>
          </div>
        ) : bookItems.length === 0 ? (
          <div className='px-8 py-12 text-center'>
            <div className='text-slate-400 mb-4'>
              <BookOpenIcon className='w-20 h-20 mx-auto mb-4' />
            </div>
            <h4 className='text-xl font-semibold text-slate-700 mb-2'>
              No Books Available
            </h4>
            <p className='text-slate-500'>New publications coming soon!</p>
          </div>
        ) : (
          <div className='relative books-swiper'>
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={20}
              slidesPerView={4}
              navigation={{
                nextEl: '.books-swiper-next',
                prevEl: '.books-swiper-prev',
              }}
              pagination={{
                clickable: true,
                el: '.books-swiper-pagination',
              }}
              className='px-8'
            >
              {bookItems.map((book: BookItem) => (
                <SwiperSlide key={book.id}>
                  <Link
                    href={`/books/${generateBookSlug(book.title)}`}
                    onClick={handleDropdownClose}
                    className='group block bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/20 rounded-2xl p-5 hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 border-blue-200/60 hover:border-blue-300'
                  >
                    <div className='aspect-[3/4] mb-4 overflow-hidden rounded-xl bg-white shadow-lg group-hover:shadow-xl transition-shadow duration-300'>
                      <Image
                        src={book.image}
                        alt={book.title}
                        width={200}
                        height={267}
                        className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                        onError={(e) => {
                          console.error('Failed to load image:', book.image);
                          e.currentTarget.src = '/placeholder-book.jpg';
                        }}
                      />
                    </div>
                    <h4 className='font-bold text-sm text-slate-800 mb-2 line-clamp-1 group-hover:text-emerald-700 transition-colors'>
                      {book.title}
                    </h4>
                    <p className='text-xs text-slate-600 line-clamp-2 leading-relaxed'>
                      {book.description}
                    </p>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>

            {bookItems.length > 4 && (
              <>
                <button className='books-swiper-prev absolute left-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-xl border border-emerald-100/50 flex items-center justify-center text-slate-600 hover:text-emerald-600 transition-all duration-300 hover:scale-110'>
                  <ChevronLeftIcon className='w-6 h-6' />
                </button>
                <button className='books-swiper-next absolute right-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-xl border border-emerald-100/50 flex items-center justify-center text-slate-600 hover:text-emerald-600 transition-all duration-300 hover:scale-110'>
                  <ChevronRightIcon className='w-6 h-6' />
                </button>
              </>
            )}
          </div>
        )}

        {bookItems.length > 4 && (
          <div className='books-swiper-pagination flex justify-center mt-6 space-x-2'></div>
        )}

        {bookItems.length > 0 && (
          <div className='px-8 mt-4 pt-4 border-t border-emerald-100/50'>
            <Link
              href='/books'
              onClick={handleDropdownClose}
              className='flex items-center justify-center w-full py-2 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 hover:shadow-lg hover:scale-105'
            >
              <BookOpenIcon className='w-4 h-4 mr-2' />
              Explore All Books
            </Link>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled
            ? 'bg-gradient-to-r from-blue-50/95 via-indigo-50/95 to-purple-50/95 backdrop-blur-xl shadow-2xl border-b border-blue-200/50'
            : 'bg-gradient-to-r from-blue-100/80 via-indigo-100/70 to-purple-100/60 backdrop-blur-sm'
        }`}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center h-20'>
            {/* Logo - Far Left Corner */}
            <div className='flex-shrink-0 flex items-center'>
              <Link href='/'>
                <Image
                  src={siteLogo || '/file.svg'}
                  alt='TechUniqueIIT Research Center'
                  width={200}
                  height={100}
                  loading='eager'
                  className='h-14 sm:h-16 w-auto object-contain'
                />
              </Link>
            </div>

            {/* Desktop Navigation - Center-Right Area */}
            <div className='hidden lg:block flex-1'>
              <div className='flex items-center space-x-2 justify-center ml-8'>
                {navItems.map((item) => (
                  <div
                    key={item.name}
                    className='relative group'
                    onMouseEnter={() =>
                      item.hasDropdown && handleMouseEnter(item.name)
                    }
                    onMouseLeave={() => item.hasDropdown && handleMouseLeave()}
                  >
                    <div
                      className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer border border-transparent hover:border-white/50 ${
                        isNavItemActive(item)
                          ? 'bg-white/70 shadow-lg border-blue-200/60'
                          : 'hover:shadow-lg'
                      } bg-gradient-to-r ${
                        item.color || 'from-slate-500 to-gray-500'
                      } bg-clip-text text-transparent hover:from-blue-600 hover:to-indigo-600 hover:bg-white/10`}
                    >
                      <div
                        className={`p-1.5 rounded-lg bg-gradient-to-r ${
                          item.color || 'from-slate-500 to-gray-500'
                        } text-white`}
                      >
                        {item.icon}
                      </div>
                      {item.hasDropdown ? (
                        <Link href={item.href} className='mr-1'>
                          {item.name}
                        </Link>
                      ) : (
                        <Link href={item.href}>{item.name}</Link>
                      )}
                      {item.hasDropdown && (
                        <ChevronDownIcon
                          className={`w-4 h-4 transition-all duration-300 ${
                            activeDropdown === item.name
                              ? 'rotate-180 text-blue-600'
                              : 'text-slate-500'
                          }`}
                        />
                      )}
                    </div>

                    {/* Dropdown Menu */}
                    {item.hasDropdown && activeDropdown === item.name && (
                      <>
                        {/* Invisible bridge to prevent dropdown from disappearing */}
                        <div className='absolute left-0 top-full w-full h-2 bg-transparent z-10'></div>
                        {item.isBooks ? (
                          renderBooksDropdown()
                        ) : (
                          <div className='absolute left-0 mt-0 w-96 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-blue-200/60 hover:border-blue-300/80 py-4 z-10 animate-in slide-in-from-top-2 duration-300 transition-all'>
                            <div className='absolute -top-2 left-8 w-4 h-4 bg-white border-l border-t border-blue-200/60 rotate-45'></div>
                            <div className='px-6 mb-4'>
                              <div className='flex items-center space-x-3'>
                                <div
                                  className={`p-2 rounded-xl bg-gradient-to-r ${
                                    item.color || 'from-slate-500 to-gray-500'
                                  } text-white`}
                                >
                                  {item.icon}
                                </div>
                                <h3
                                  className={`text-lg font-bold bg-gradient-to-r ${
                                    item.color || 'from-slate-500 to-gray-500'
                                  } bg-clip-text text-transparent`}
                                >
                                  {item.name}
                                </h3>
                              </div>
                            </div>
                            {item.dropdownItems?.map((dropdownItem) => (
                              <Link
                                key={dropdownItem.name}
                                href={dropdownItem.href}
                                onClick={handleDropdownClose}
                                className={`group flex items-start mt-1 px-6 py-4 text-sm transition-all duration-300 mx-2 rounded-2xl ${
                                  dropdownItem.featured
                                    ? 'text-blue-700 bg-blue-100/60 hover:bg-blue-200/90 hover:text-blue-800 border-l-4 border-blue-500 shadow-sm'
                                    : 'text-slate-700 bg-transparent hover:bg-blue-100/70 hover:text-blue-800 border-l-4 border-transparent hover:border-blue-400 hover:shadow-md'
                                }`}
                              >
                                <div
                                  className={`mr-4 mt-0.5 p-2 rounded-xl transition-all duration-300 ${
                                    dropdownItem.featured
                                      ? 'bg-blue-200 text-blue-700 group-hover:bg-blue-300 group-hover:text-blue-800'
                                      : 'bg-slate-100 text-slate-600 group-hover:bg-blue-200 group-hover:text-blue-700'
                                  }`}
                                >
                                  {dropdownItem.icon}
                                </div>
                                <div className='flex-1'>
                                  <div className='font-bold mb-1'>
                                    {dropdownItem.name}
                                  </div>
                                  {dropdownItem.description && (
                                    <div
                                      className={`text-xs leading-relaxed ${
                                        dropdownItem.featured
                                          ? 'text-blue-600/80'
                                          : 'text-slate-500'
                                      }`}
                                    >
                                      {dropdownItem.description}
                                    </div>
                                  )}
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Search and Mobile Menu - Far Right */}
            <div className='flex items-center space-x-2 sm:space-x-3 ml-auto'>
              {/* Mobile Search Button (visible only on mobile) */}
              <div className='sm:hidden'>
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className='text-slate-600 hover:text-blue-700 p-2 rounded-xl hover:bg-blue-50 transition-all duration-300 hover:shadow-md border border-transparent hover:border-blue-100'
                >
                  <MagnifyingGlassIcon className='w-5 h-5' />
                </button>
              </div>

              {/* Desktop Search (visible only on desktop) */}
              <div className='hidden sm:block relative'>
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className='text-slate-600 hover:text-blue-700 p-3 rounded-xl hover:bg-blue-50 transition-all duration-300 hover:shadow-md border border-transparent hover:border-blue-100'
                >
                  <MagnifyingGlassIcon className='w-5 h-5' />
                </button>
                <SearchDropdown 
                  isOpen={searchOpen} 
                  onClose={() => setSearchOpen(false)} 
                />
              </div>

              {/* Login/User Button */}
              <LoginButton />

              <div className='lg:hidden'>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className='text-slate-600 hover:text-blue-700 p-2 sm:p-3 rounded-xl hover:bg-blue-50 transition-all duration-300 hover:shadow-md border border-transparent hover:border-blue-100'
                >
                  <Bars3Icon className='w-5 h-5 sm:w-6 sm:h-6' />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <MobileNavigation
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        navItems={navItems}
        bookItems={bookItems}
      />

      {/* Mobile Search Overlay (only visible on mobile) */}
      <div className='sm:hidden'>
        <MobileSearch 
          isOpen={searchOpen} 
          onClose={() => setSearchOpen(false)} 
        />
      </div>
    </>
  );
}
