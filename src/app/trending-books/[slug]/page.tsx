'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { trendingBooksApi, type TrendingBook } from '@/services/api/trendingBooksApi';
import { API_CONFIG } from '@/config/api';
import { Button } from '@/components/ui/primitives/Button';

const API_URL = API_CONFIG.API_BASE_URL;

export default function TrendingBookDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [book, setBook] = useState<TrendingBook | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/trending-books`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch trending books');
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          const foundBook = data.data.find((b: TrendingBook) => b.slug === params.slug);
          setBook(foundBook || null);
        }
      } catch (err) {
        console.error('Error fetching trending book:', err);
        setBook(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [params.slug]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back to Trending Books</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Image */}
          <div className="space-y-6">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-xl">
              {book.image ? (
                <Image
                  src={book.image}
                  alt={book.title}
                  fill
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
              {book.featured && (
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Featured
                </div>
              )}
              {book.sales > 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Hot
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Category Badge */}
            <div>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {book.category}
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {book.title}
              </h1>
            </div>

            {/* Author */}
            <div className="flex items-center gap-2">
              <span className="text-gray-600">by</span>
              <span className="font-semibold text-gray-900">{book.author}</span>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About This Book</h2>
              <p className="text-gray-600 leading-relaxed">
                {book.description}
              </p>
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              {book.pages && (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <div>
                    <div className="text-sm text-gray-500">Pages</div>
                    <div className="font-semibold">{book.pages}</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <div>
                  <div className="text-sm text-gray-500">Views</div>
                  <div className="font-semibold">{book.views.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6">
              <Button variant="primary" fullWidth>
                View Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
