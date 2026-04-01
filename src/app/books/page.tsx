'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import BooksHero from '@/components/ui/books/BooksHero';
import BooksSidebar from '@/components/ui/books/BooksSidebar';
import BooksGrid from '@/components/ui/books/BooksGrid';
// import BooksCTA from '@/components/ui/books/BooksCTA';

import { API_CONFIG } from '@/config/api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { categoriesApi } from '@/services/api/categoriesApi';
import { languageApi, type LanguageRecord } from '@/services/api/languageApi';
import type { Category } from '@/services/api/categoriesApi';

const API_URL = API_CONFIG.API_BASE_URL;

// Loading fallback for Suspense
const BooksPageLoading = () => (
  <div className='min-h-screen bg-gray-50 pt-20'>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    </div>
  </div>
);

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
  slug?: string;
  language?: string;
  componentType?: string;
  files?: {
    audiobook?: {
      url?: string;
    };
  };
}

const BooksPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedComponentType, setSelectedComponentType] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [languages, setLanguages] = useState<LanguageRecord[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [formats, setFormats] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedAudiobook, setSelectedAudiobook] = useState<Book | null>(null);
  const [isAudiobookPlaying, setIsAudiobookPlaying] = useState(false);
  const audiobookAudioRef = useRef<HTMLAudioElement>(null);

  const selectedAudiobookUrl = useMemo(() => {
    return selectedAudiobook?.files?.audiobook?.url || '';
  }, [selectedAudiobook]);

  // Fetch books from backend API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [booksRes, audiobooksRes] = await Promise.all([
          fetch(`${API_URL}/books`),
          fetch(`${API_URL}/audiobooks`),
        ]);

        if (!booksRes.ok) {
          throw new Error('Failed to fetch books');
        }

        if (!audiobooksRes.ok) {
          throw new Error('Failed to fetch audiobooks');
        }

        const [booksData, audiobooksData] = await Promise.all([
          booksRes.json(),
          audiobooksRes.json(),
        ]);

        const books: Book[] = booksData?.success && booksData?.data ? booksData.data : [];
        const audiobooks: Book[] = audiobooksData?.success && audiobooksData?.data ? audiobooksData.data : [];

        const merged: Book[] = [...books, ...audiobooks];

        if (merged.length > 0) {
          setAllBooks(merged);
        } else {
          setAllBooks([]);
        }
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to load books. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await categoriesApi.getActive();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    const fetchLanguages = async () => {
      try {
        const res = await languageApi.getAllLanguages();
        if (res.success && res.data) {
          setLanguages(res.data);
        }
      } catch (err) {
        console.error('Error fetching languages:', err);
      }
    };

    fetchBooks();
    fetchCategories();
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (allBooks.length > 0) {
      const allFormats = new Set<string>();
      allBooks.forEach(book => {
        if (book.format && Array.isArray(book.format)) {
          book.format.forEach(f => allFormats.add(f));
        }
      });
      setFormats(Array.from(allFormats).sort());
    }
  }, [allBooks]);

  useEffect(() => {
    const typeParam = searchParams.get('type');
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    const componentTypeParam = searchParams.get('componentType');
    const languageParam = searchParams.get('language');
    const formatParam = searchParams.get('format');

    if (typeParam === 'Audiobook') {
      setSelectedTypes(['Audiobook']);
    } else if (typeParam === 'Books') {
      setSelectedTypes(['Books']);
    }

    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }

    if (searchParam) {
      setSearchTerm(searchParam);
    }

    if (componentTypeParam) {
      setSelectedComponentType(componentTypeParam);
    }

    if (languageParam) {
      setSelectedLanguages([languageParam]);
    }

    if (formatParam) {
      setSelectedFormats([formatParam]);
    }

    // Smart Auto-Selection for Category Browsing
    // If we have a category but no specific language/type/format filters in URL,
    // we should auto-select all available ones for that category once books load.
    if (categoryParam && !languageParam && !typeParam && !formatParam && allBooks.length > 0) {
      const categoryBooks = allBooks.filter(b => b.category === categoryParam);
      
      const availableLangs = Array.from(new Set(categoryBooks.map(b => b.language).filter(Boolean))) as string[];
      const availableTypes = Array.from(new Set(categoryBooks.map(b => b.type).filter(Boolean))) as ('Books' | 'Audiobook')[];
      const availableFormats = new Set<string>();
      categoryBooks.forEach(b => b.format?.forEach(f => availableFormats.add(f)));

      if (availableLangs.length > 0) setSelectedLanguages(availableLangs);
      if (availableTypes.length > 0) setSelectedTypes(availableTypes);
      if (Array.from(availableFormats).length > 0) setSelectedFormats(Array.from(availableFormats));
    }
  }, [searchParams, allBooks.length]); // Added allBooks.length to re-run when books are loaded


  // Update URL when filters change
  useEffect(() => {
    // Only update if we're not in the initial loading state
    if (isLoading) return;

    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategories.length > 0) params.set('category', selectedCategories[0]);
    if (selectedTypes.length > 0) params.set('type', selectedTypes[0]);
    if (selectedLanguages.length > 0) params.set('language', selectedLanguages[0]);
    if (selectedFormats.length > 0) params.set('format', selectedFormats[0]);
    if (selectedComponentType) params.set('componentType', selectedComponentType);

    const queryString = params.toString();
    const newUrl = `/books${queryString ? `?${queryString}` : ''}`;
    
    // Only push if different to avoid redundant history entries
    if (window.location.search !== `?${queryString}` && (window.location.search !== '' || queryString !== '')) {
      router.replace(newUrl, { scroll: false });
    }
  }, [searchTerm, selectedCategories, selectedTypes, selectedLanguages, selectedFormats, selectedComponentType, router, isLoading]);


  const filteredItems = allBooks.filter(item => {
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category);
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFormat = selectedFormats.length === 0 || selectedFormats.some(format => item.format.includes(format));
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(item.type);
    const matchesLanguage = selectedLanguages.length === 0 || (item.language && selectedLanguages.includes(item.language));
    const matchesComponentType = !selectedComponentType || item.componentType === selectedComponentType;
    
    return matchesCategory && matchesSearch && matchesFormat && matchesType && matchesLanguage && matchesComponentType;
  });


  useEffect(() => {
    setSelectedAudiobook((current) => {
      if (!current) return null;
      const stillExists = filteredItems.some((b) => b.id === current.id);
      return stillExists ? current : null;
    });
  }, [filteredItems]);

  useEffect(() => {
    const audio = audiobookAudioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsAudiobookPlaying(false);
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, []);

  const handleToggleAudiobookPlay = async () => {
    const audio = audiobookAudioRef.current;
    if (!audio) return;
    if (!selectedAudiobookUrl) return;

    try {
      if (isAudiobookPlaying) {
        audio.pause();
        setIsAudiobookPlaying(false);
        return;
      }

      if (audio.src !== selectedAudiobookUrl) {
        audio.src = selectedAudiobookUrl;
      }

      await audio.play();
      setIsAudiobookPlaying(true);
    } catch {
      setIsAudiobookPlaying(false);
    }
  };

  const hasActiveFilters = 
    searchTerm !== '' || 
    selectedCategories.length > 0 || 
    selectedFormats.length > 0 || 
    selectedTypes.length > 0 ||
    selectedLanguages.length > 0 ||
    selectedComponentType !== null;

  // Show error state
  if (error && !isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 pt-20'>
        <BooksHero />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Books</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 pt-20'>
      {/* Hero Section */}
      <BooksHero />

      {/* Main Content Container */}
      <div className="max-w-[1600px] mx-auto">
        {/* Header with Back Button */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Home
            </button>
            
            
          </div>
        </div>

        {/* Main Content with Sidebar Layout */}
        <div className="lg:flex lg:gap-6 xl:gap-8 px-4 sm:px-6 lg:px-8 pb-12">
          {/* Sidebar */}
          <div className="lg:w-80 xl:w-96 lg:flex-shrink-0">
            <BooksSidebar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategories={selectedCategories}
              setSelectedCategories={(cats) => {
                setSelectedCategories(cats);
                if (searchTerm) setSearchTerm(''); // Clear search when browsing categories
              }}
              selectedFormats={selectedFormats}
              setSelectedFormats={(fmts) => {
                setSelectedFormats(fmts);
                if (searchTerm) setSearchTerm(''); 
              }}
              selectedTypes={selectedTypes}
              setSelectedTypes={(types) => {
                setSelectedTypes(types);
                if (searchTerm) setSearchTerm('');
              }}
              selectedLanguages={selectedLanguages}
              setSelectedLanguages={(langs) => {
                setSelectedLanguages(langs);
                if (searchTerm) setSearchTerm('');
              }}
              categories={categories.map(c => c.name)}
              languages={languages.map(l => l.name)}
              formats={formats}
              resultsCount={filteredItems.length}
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 lg:pt-0">
            {selectedAudiobook && selectedAudiobook.type === 'Audiobook' ? (
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-[#1f1f1f] text-white rounded-2xl overflow-hidden shadow-xl border border-black/10">
                  <audio ref={audiobookAudioRef} preload="metadata" />

                  <div className="p-6 sm:p-8 border-b border-white/10">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="inline-flex items-center px-3 py-1 rounded-md bg-white/10 text-xs font-semibold tracking-wide mb-4">
                          Transcribed
                        </div>

                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight line-clamp-3">
                          {selectedAudiobook.title}
                        </h1>

                        <div className="text-sm text-white/60 mt-2">
                          {selectedAudiobook.publishDate ? new Date(selectedAudiobook.publishDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                          {selectedAudiobook.duration ? ` • ${selectedAudiobook.duration}` : ''}
                        </div>

                        <div className="mt-6 flex flex-wrap items-center gap-3">
                          <button
                            onClick={handleToggleAudiobookPlay}
                            disabled={!selectedAudiobookUrl}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-yellow-400 text-black font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                            type="button"
                          >
                            {isAudiobookPlaying ? 'Pause' : 'Play'}
                          </button>

                          <button
                            className="inline-flex items-center px-5 py-2.5 rounded-full bg-white/10 border border-white/10 text-white/80"
                            type="button"
                          >
                            In queue
                          </button>

                          <a
                            href={selectedAudiobookUrl || '#'}
                            download
                            onClick={(e) => {
                              if (!selectedAudiobookUrl) e.preventDefault();
                            }}
                            className="inline-flex items-center px-5 py-2.5 rounded-full bg-white/10 border border-white/10 text-white/90"
                          >
                            Download
                          </a>

                          <button
                            className="inline-flex items-center px-5 py-2.5 rounded-full bg-white/10 border border-white/10 text-white/80"
                            type="button"
                          >
                            Transcript
                          </button>

                          <button
                            className="w-10 h-10 rounded-full bg-white/10 border border-white/10 text-white/80"
                            type="button"
                          >
                            …
                          </button>

                          <button
                            onClick={() => {
                              setSelectedAudiobook(null);
                              setIsAudiobookPlaying(false);
                              if (audiobookAudioRef.current) audiobookAudioRef.current.pause();
                            }}
                            className="ml-auto inline-flex items-center px-5 py-2.5 rounded-full bg-white/10 border border-white/10 text-white/90"
                            type="button"
                          >
                            Back
                          </button>
                        </div>
                      </div>

                      <div className="hidden sm:block flex-shrink-0">
                        <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-xl overflow-hidden bg-black/30 border border-white/10 relative">
                          {selectedAudiobook.image ? (
                            <Image
                              src={selectedAudiobook.image}
                              alt={selectedAudiobook.title}
                              fill
                              sizes="160px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">
                              No Image
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8">
                    <div className="text-lg font-semibold mb-3">Description</div>
                    <div className="text-sm sm:text-base text-white/75 leading-relaxed whitespace-pre-line">
                      {selectedAudiobook.description}
                    </div>

                    <div className="mt-10">
                      <div className="text-lg font-semibold mb-3">Information</div>
                      <div className="text-sm sm:text-base text-white/75">
                        <div className="flex justify-between gap-4 border-b border-white/10 py-3">
                          <span className="text-white/50">Author</span>
                          <span className="text-right">{selectedAudiobook.author}</span>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-white/10 py-3">
                          <span className="text-white/50">Category</span>
                          <span className="text-right">{selectedAudiobook.category}</span>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-white/10 py-3">
                          <span className="text-white/50">Website</span>
                          <span className="text-right">-</span>
                        </div>
                        <div className="flex justify-between gap-4 py-3">
                          <span className="text-white/50">Tags</span>
                          <span className="text-right break-words max-w-[70%]">{selectedAudiobook.tags?.map((t) => `#${t}`).join(' ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <BooksGrid 
                items={filteredItems} 
                isLoading={isLoading}
                className="bg-gray-50"
                onFilterClick={() => setIsSidebarOpen(true)}
                hasActiveFilters={hasActiveFilters}
                onAudiobookSelect={(item) => {
                  if (item.type !== 'Audiobook') return;
                  setSelectedAudiobook(item);
                  setIsAudiobookPlaying(false);
                  if (audiobookAudioRef.current) {
                    audiobookAudioRef.current.pause();
                  }
                }}
              />
            )}

            {/* Call to Action */}
            {/* <BooksCTA /> */}
          </div>
        </div>
      </div>
    </div>
  );
};

const BooksPageWrapper = () => (
  <Suspense fallback={<BooksPageLoading />}>
    <BooksPage />
  </Suspense>
);

export default BooksPageWrapper;