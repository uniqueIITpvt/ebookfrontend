'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  XMarkIcon,
  ChevronDownIcon,
  BookOpenIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';

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

interface MobileNavigationProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  navItems: NavItem[];
  bookItems: BookItem[];
}

export default function MobileNavigation({
  isOpen,
  setIsOpen,
  navItems,
  bookItems,
}: MobileNavigationProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isAudiobooksRoute = pathname === '/books' && (searchParams?.get('type') || '') === 'Audiobook';
  const isBooksRoute = pathname === '/books' && !isAudiobooksRoute;

  const isNavItemActive = (item: NavItem) => {
    if (item.name === 'Audiobooks') return isAudiobooksRoute;
    if (item.name === 'Books') return isBooksRoute;
    return pathname === item.href;
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
    setActiveDropdown(null);
  };

  const renderMobileBooksDropdown = () => (
    <div className='mt-3 space-y-3'>
      {/* Search Books */}
      <div className='px-4'>
        <div className='relative'>
          <MagnifyingGlassIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
          <input
            type='text'
            placeholder='Search books...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all'
          />
        </div>
      </div>

      {/* Books List */}
      <div className='px-4'>
        <div className='space-y-2'>
          {bookItems
            .filter(
              (book) =>
                book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.description
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                book.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            )
            .slice(0, 4)
            .map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                onClick={handleLinkClick}
                className='flex items-center space-x-3 p-3 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-blue-200 transition-colors'
              >
                <div className='relative w-10 h-12 flex-shrink-0 overflow-hidden rounded-md bg-slate-100'>
                  <Image
                    src={book.image}
                    alt={book.title}
                    width={40}
                    height={48}
                    className='w-full h-full object-cover'
                  />
                </div>
                <div className='flex-1 min-w-0'>
                  <h4 className='font-medium text-sm text-slate-900 line-clamp-1'>
                    {book.title}
                  </h4>
                  <p className='text-xs text-slate-600 line-clamp-1'>
                    {book.description}
                  </p>
                </div>
                <ChevronDownIcon className='w-4 h-4 text-slate-400 rotate-[-90deg]' />
              </Link>
            ))}
        </div>
      </div>

      {/* View All Books Button */}
      <div className='px-4'>
        <Link
          href='/books'
          onClick={handleLinkClick}
          className='flex items-center justify-center w-full py-3 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors'
        >
          <BookOpenIcon className='w-4 h-4 mr-2' />
          View All Books ({bookItems.length})
        </Link>
      </div>
    </div>
  );

  const renderMobileDropdown = (item: NavItem) => (
    <div className='mt-3 space-y-2 px-4'>
      {item.dropdownItems?.map((dropdownItem) => (
        <Link
          key={dropdownItem.name}
          href={dropdownItem.href}
          onClick={handleLinkClick}
          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
            dropdownItem.featured
              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <div
            className={`p-2 rounded-lg flex-shrink-0 ${
              dropdownItem.featured
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {dropdownItem.icon}
          </div>
          <div className='flex-1 min-w-0'>
            <div className='font-medium text-sm'>{dropdownItem.name}</div>
            {dropdownItem.description && (
              <div className='text-xs text-slate-500'>
                {dropdownItem.description}
              </div>
            )}
          </div>
          <ChevronDownIcon className='w-4 h-4 text-slate-400 rotate-[-90deg]' />
        </Link>
      ))}
    </div>
  );

  return (
    <div
      className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${
        isOpen ? 'visible' : 'invisible'
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl overflow-y-auto transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >

        {/* Search Section */}
        <div className='p-4 border-b border-slate-200'>
          <div className='relative'>
            <MagnifyingGlassIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
            <input
              type='text'
              placeholder='Search everything...'
              className='w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all'
            />
          </div>
        </div>

        {/* Navigation Items */}
        <div className='p-4 space-y-2'>
          {navItems.map((item) => (
            <div key={item.name}>
              <div className='flex items-center justify-between'>
                <Link
                  href={item.href}
                  onClick={() => !item.hasDropdown && handleLinkClick()}
                  className={`flex-1 flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isNavItemActive(item)
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : item.hasDropdown
                        ? 'bg-slate-50 text-slate-700'
                        : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className='p-2 bg-blue-100 rounded-lg text-blue-600'>
                    {item.icon}
                  </div>
                  <div className='flex-1'>
                    <div className='font-medium text-sm'>{item.name}</div>
                    <div className='text-xs text-slate-500'>
                      {item.name === 'Books' && 'Read & Grow'}
                      {item.name === 'Audiobooks' && 'Listen & Learn'}
                      {item.name === 'Blog' && 'Read Insights'}
                      {item.name === 'About' && 'Know More'}
                      {item.name === 'FAQ' && 'Help & Support'}
                    </div>
                  </div>
                </Link>
                {item.hasDropdown && (
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className='p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors'
                  >
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform duration-200 ${
                        activeDropdown === item.name ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Mobile Dropdown */}
              {item.hasDropdown && activeDropdown === item.name && (
                <div className='mt-2'>
                  {item.isBooks
                    ? renderMobileBooksDropdown()
                    : renderMobileDropdown(item)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className='mt-auto p-4 border-t border-slate-200 bg-slate-50'>
          <div className='text-center space-y-3'>
            <div className='flex items-center justify-center space-x-2'>
              <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
                <UserIcon className='w-4 h-4 text-white' />
              </div>
              <div className='text-left'>
                <div className='font-semibold text-slate-800 text-sm'>
                  UniqueIIT Research Center
                </div>
                <div className='text-xs text-slate-600'>
                  Research & Learning
                </div>
              </div>
            </div>
            
            <Link
              href='/about/contact'
              onClick={handleLinkClick}
              className='block w-full bg-blue-600 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors'
            >
              Book Consultation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
