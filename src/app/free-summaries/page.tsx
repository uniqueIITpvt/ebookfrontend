'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { freeSummariesApi, type FreeSummary } from '@/services/api/freeSummariesApi';
import { API_CONFIG } from '@/config/api';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/primitives/Button';
import { ArrowLeftIcon, FunnelIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const API_URL = API_CONFIG.API_BASE_URL;

export default function FreeSummariesPage() {
  const router = useRouter();
  const [summaries, setSummaries] = useState<FreeSummary[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await freeSummariesApi.getFreeSummaries({ limit: 100 });
        if (data.data) {
          setSummaries(data.data);
          const uniqueCategories = [...new Set(data.data.map((s: FreeSummary) => s.category))];
          setCategories(uniqueCategories as string[]);
        }
      } catch (err) {
        console.error('Error fetching free summaries:', err);
        setError('Failed to load free summaries. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredItems = summaries.filter(item => {
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category);
    const matchesSearch = !searchTerm || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const hasActiveFilters = searchTerm !== '' || selectedCategories.length > 0;

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 pt-20'>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading free summaries...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 pt-20'>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Free Summaries</h3>
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
      <div className="max-w-[1600px] mx-auto">
        {/* Header with Back Button */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Home
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Free Summaries</h1>
        </div>

        {/* Main Content with Sidebar Layout */}
        <div className="lg:flex lg:gap-6 xl:gap-8 px-4 sm:px-6 lg:px-8 pb-12">
          {/* Sidebar */}
          <div className="lg:w-80 xl:w-96 lg:flex-shrink-0">
            <div className="h-full lg:h-auto bg-white border-r lg:border border-gray-200 lg:rounded-xl lg:shadow-sm flex flex-col">
              <div className="p-4 lg:p-6 border-b border-gray-200 bg-white lg:bg-gray-50 lg:rounded-t-xl sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FunnelIcon className="w-5 h-5 mr-2 text-gray-600" />
                    Filters
                  </h2>
                </div>
              </div>

              <div className="flex-1 p-4 lg:p-6 space-y-6 overflow-y-auto">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search free summaries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          value={category}
                          checked={selectedCategories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, category]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(cat => cat !== category));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="ml-2 text-sm text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 lg:p-6 border-t border-gray-200 bg-white lg:bg-gray-50 lg:rounded-b-xl sticky bottom-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
                  </span>
                  {hasActiveFilters && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategories([]);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 lg:pt-6">
            {/* Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
              {filteredItems.length === 0 ? (
                <div className='col-span-full text-center py-12'>
                  <p className='text-slate-600'>No free summaries found.</p>
                </div>
              ) : (
                filteredItems.map((summary) => (
                  <div
                    key={summary._id}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                      {summary.image ? (
                        <Image
                          src={summary.image}
                          alt={summary.title}
                          fill
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400 text-sm">No Image</span>
                        </div>
                      )}
                      
                      <div className="absolute top-3 left-3">
                        <span className="bg-white/90 backdrop-blur-sm text-indigo-700 px-2 py-1 rounded-full text-xs font-semibold shadow-sm">
                          {summary.category}
                        </span>
                      </div>

                      {summary.featured && (
                        <div className="absolute top-3 right-3">
                          <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-sm">
                            Featured
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 leading-tight">
                        {summary.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{summary.author}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>{summary.pages ? `${summary.pages} pages` : 'Free Summary'}</span>
                      </div>

                      <Link href={`/free-summaries/${summary.slug}`}>
                        <Button variant="secondary" size="sm" fullWidth>
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
