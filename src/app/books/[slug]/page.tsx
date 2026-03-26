'use client';

import { notFound, useRouter } from 'next/navigation';
import { useState, useEffect, use } from 'react';
import { 
  ArrowLeftIcon, 
  StarIcon, 
  ClockIcon,
  BookOpenIcon,
  SpeakerWaveIcon,
  ShareIcon,
  HeartIcon,
  ShoppingCartIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as SolidStarIcon, HeartIcon as SolidHeartIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import Image from 'next/image';
import { generateBookSlug } from '@/utils/slugify';

import { API_CONFIG } from '@/config/api';
import { booksApi, type Book } from '@/services/api/booksApi';

const API_URL = API_CONFIG.API_BASE_URL;


interface BookSlugPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function BookSlugPage({ params }: BookSlugPageProps) {
  const router = useRouter();
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [isFavorited, setIsFavorited] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [book, setBook] = useState<Book | null>(null);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setUserRating] = useState<number>(0);
  const [cartFeedback, setCartFeedback] = useState<string | null>(null);

  // Unwrap params Promise
  const resolvedParams = use(params);

  // Fetch books from API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/books`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          setAllBooks(data.data);
          
          // Find book by slug
          const foundBook = data.data.find((b: Book) => 
            generateBookSlug(b.title) === resolvedParams.slug
          );
          
          setBook(foundBook || null);
        }
      } catch (err) {
        console.error('Error fetching books:', err);
        setBook(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [resolvedParams.slug]);

  useEffect(() => {
    if (book && book.format.length > 0) {
      setSelectedFormat(book.format[0]);
    }
  }, [book]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    notFound();
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: book.title,
          text: book.subtitle,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleAddToCart = async () => {
    if (!book) return;
    
    try {
      const response = await fetch(`${API_URL}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: book.id,
          title: book.title,
          price: parseFloat(book.price.replace('$', '')),
          quantity: quantity,
          totalAmount: parseFloat(book.price.replace('$', '')) * quantity,
          type: 'cart',
          customerName: 'Demo User', // In production, get from auth context
          customerEmail: 'demo@example.com'
        })
      });

      if (response.ok) {
        setCartFeedback('Item saved to database cart!');
        setTimeout(() => setCartFeedback(null), 3000);
      }
    } catch (error) {
      console.error('Error adding to database cart:', error);
    }
  };

  const handleBuyNow = async () => {
    if (!book) return;
    const bookId = book.id || (book as any)._id;
    if (!bookId) return;

    // Redirect to checkout with book ID and current quantity
    router.push(`/checkout?id=${bookId}&qty=${quantity}`);
  };

  const handleRatingClick = async (newRating: number) => {
    if (!book) return;
    const bookId = book.id || (book as any)._id;
    if (!bookId) return;

    // Optimistic update
    setUserRating(newRating);

    try {
      console.log(`Submitting rating ${newRating} for book ${bookId}`);
      const response = await booksApi.updateRating(bookId, newRating);
      
      console.log('Rating update response:', response);
      
      if (response.success) {
        // Refresh book data with the actual calculated average from backend
        setBook(response.data);
      }
    } catch (error) {
      console.error('Error updating rating:', error);
      // Revert optmistic update or show error to user
    }
  };

  const calculateTotalPrice = () => {
    if (!book) return '';
    const unitPrice = parseFloat(book.price.replace('$', ''));
    return `$${(unitPrice * quantity).toFixed(2)}`;
  };

  const relatedBooks = allBooks
    .filter(b => b.id !== book.id && (b.category === book.category || b.tags.some(tag => book.tags.includes(tag))))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="font-medium">Back to Books</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Book Image */}
          <div className="space-y-6">
            <div className="relative h-[400px] lg:h-[480px] w-full max-w-[380px] mx-auto rounded-2xl overflow-hidden bg-white shadow-xl border border-gray-100">
              {book.image ? (
                <Image
                  src={book.image}
                  alt={book.title}
                  fill
                  className="object-contain p-4"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
              {book.bestseller && (
                <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Bestseller
                </div>
              )}
              {book.featured && (
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Featured
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsFavorited(!isFavorited)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {isFavorited ? (
                  <SolidHeartIcon className="w-5 h-5 text-red-500" />
                ) : (
                  <HeartIcon className="w-5 h-5" />
                )}
                <span className="font-medium">
                  {isFavorited ? 'Saved' : 'Save'}
                </span>
              </button>
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ShareIcon className="w-5 h-5" />
                <span className="font-medium">Share</span>
              </button>
            </div>
          </div>

          {/* Right Column - Book Details */}
          <div className="space-y-6">
            {/* Category Badge */}
            <div>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {book.category}
              </span>
            </div>

            {/* Title & Subtitle */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {book.title}
              </h1>
              <p className="text-lg text-gray-600">
                {book.subtitle}
              </p>
            </div>

            {/* Author */}
            <div className="flex items-center gap-2">
              <span className="text-gray-600">by</span>
              <span className="font-semibold text-gray-900">{book.author}</span>
            </div>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 group">
                {[...Array(5)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleRatingClick(i + 1)}
                    className="transition-transform active:scale-90"
                  >
                    {i < (userRating || Math.floor(book.rating)) ? (
                      <SolidStarIcon className="w-6 h-6 text-yellow-500" />
                    ) : (
                      <StarIcon className="w-6 h-6 text-gray-300 hover:text-yellow-200 transition-colors" />
                    )}
                  </button>
                ))}
              </div>
              <span className="font-syne font-bold text-gray-900 text-lg">{userRating || book.rating}</span>
              <span className="text-gray-400 font-medium font-dm-sans">({book.reviews + (userRating ? 1 : 0)} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              <span className="text-4xl font-bold text-slate-900 font-syne">{calculateTotalPrice()}</span>
              {book.originalPrice && (
                <span className="text-xl text-gray-400 line-through">{book.originalPrice}</span>
              )}
              {book.originalPrice && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-semibold">
                  Save {Math.round((1 - parseFloat(book.price.replace('$', '')) / parseFloat(book.originalPrice.replace('$', ''))) * 100)}%
                </span>
              )}
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format
              </label>
              <div className="flex flex-wrap gap-2">
                {book.format.map((format) => (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedFormat === format
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center justify-center font-semibold"
                >
                  −
                </button>
                <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center justify-center font-semibold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-[15px] hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-slate-200 font-syne"
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  Add to Cart
                </button>
                <button 
                  onClick={handleBuyNow}
                  className="flex-1 px-8 py-4 border-2 border-slate-900 text-slate-900 rounded-2xl font-bold text-[15px] hover:bg-slate-50 transition-all active:scale-[0.98] font-syne"
                >
                  Buy Now
                </button>
              </div>
              {cartFeedback && (
                <div className="text-center font-bold text-emerald-600 bg-emerald-50 py-2 rounded-xl border border-emerald-100 animate-fade-in text-sm">
                  ✓ {cartFeedback}
                </div>
              )}
            </div>

            {/* Book Info */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              {book.pages && (
                <div className="flex items-center gap-3">
                  <BookOpenIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Pages</div>
                    <div className="font-semibold">{book.pages}</div>
                  </div>
                </div>
              )}
              {book.duration && (
                <div className="flex items-center gap-3">
                  <ClockIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Duration</div>
                    <div className="font-semibold">{book.duration}</div>
                  </div>
                </div>
              )}
              {book.type && (
                <div className="flex items-center gap-3">
                  {book.type === 'Audiobook' ? (
                    <SpeakerWaveIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <BookOpenIcon className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <div className="text-sm text-gray-500">Type</div>
                    <div className="font-semibold">{book.type}</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <CheckIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Published</div>
                  <div className="font-semibold">
                    {new Date(book.publishDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-12 lg:mt-16">
          <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Book</h2>
            <div className={`text-gray-600 leading-relaxed ${!showFullDescription ? 'line-clamp-4' : ''}`}>
              {book.description}
            </div>
            {book.description.length > 200 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="mt-4 text-blue-600 font-semibold hover:text-blue-700"
              >
                {showFullDescription ? 'Show Less' : 'Read More'}
              </button>
            )}

            {/* Additional Details */}
            <div className="mt-8 pt-8 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">ISBN</h3>
                <p className="text-gray-600">{book.isbn}</p>
              </div>
              {book.narrator && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Narrator</h3>
                  <p className="text-gray-600">{book.narrator}</p>
                </div>
              )}
            </div>

            {/* Tags */}
            {book.tags && book.tags.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {book.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <div className="mt-12 lg:mt-16">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedBooks.map((relatedBook) => (
                <Link
                  key={relatedBook.id}
                  href={`/books/${generateBookSlug(relatedBook.title)}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative aspect-[4/5] bg-gray-50">
                      {relatedBook.image ? (
                        <Image
                          src={relatedBook.image}
                          alt={relatedBook.title}
                          fill
                          className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <span className="text-gray-400 text-sm">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                        {relatedBook.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <SolidStarIcon className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm font-medium">{relatedBook.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">({relatedBook.reviews})</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-900">{relatedBook.price}</span>
                        {relatedBook.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            {relatedBook.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
