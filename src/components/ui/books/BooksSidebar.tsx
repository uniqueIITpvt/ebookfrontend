'use client';

import React from 'react';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

interface BooksSidebarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  selectedFormats: string[];
  setSelectedFormats: (formats: string[]) => void;
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  categories: string[];
  formats: string[];
  resultsCount: number;
  className?: string;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export default function BooksSidebar({
  searchTerm,
  setSearchTerm,
  selectedCategories,
  setSelectedCategories,
  selectedFormats,
  setSelectedFormats,
  selectedTypes,
  setSelectedTypes,
  categories,
  formats,
  resultsCount,
  className = '',
  isSidebarOpen,
  setIsSidebarOpen
}: BooksSidebarProps) {

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedFormats([]);
    setSelectedTypes([]);
  };

  const hasActiveFilters = 
    searchTerm !== '' || 
    selectedCategories.length > 0 || 
    selectedFormats.length > 0 || 
    selectedTypes.length > 0;

  const SidebarContent = () => (
    <div className="h-full lg:h-auto bg-white border-r lg:border border-gray-200 lg:rounded-xl lg:shadow-sm flex flex-col">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-200 bg-white lg:bg-gray-50 lg:rounded-t-xl sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FunnelIcon className="w-5 h-5 mr-2 text-gray-600" />
            Filters
          </h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Filter Content */}
      <div className="flex-1 p-4 lg:p-6 space-y-6 overflow-y-auto">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search books..."
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
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
            {categories.filter(cat => cat !== 'All Books').map(category => (
              <label key={category} className="flex items-center group cursor-pointer">
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
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-700 group-hover:text-blue-600 transition-colors">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Type</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                value="Books"
                checked={selectedTypes.includes('Books')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedTypes([...selectedTypes, 'Books']);
                  } else {
                    setSelectedTypes(selectedTypes.filter(type => type !== 'Books'));
                  }
                }}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-700">Books</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                value="Audiobook"
                checked={selectedTypes.includes('Audiobook')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedTypes([...selectedTypes, 'Audiobook']);
                  } else {
                    setSelectedTypes(selectedTypes.filter(type => type !== 'Audiobook'));
                  }
                }}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-700">Audiobooks</span>
            </label>
          </div>
        </div>

        {/* Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Format</label>
          <div className="space-y-2">
            {formats.map(format => (
              <label key={format} className="flex items-center">
                <input
                  type="checkbox"
                  value={format}
                  checked={selectedFormats.includes(format)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedFormats([...selectedFormats, format]);
                    } else {
                      setSelectedFormats(selectedFormats.filter(fmt => fmt !== format));
                    }
                  }}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-700">{format}</span>
              </label>
            ))}
          </div>
        </div>

      </div>

      {/* Sticky Footer - Results and Clear */}
      <div className="p-4 lg:p-6 border-t border-gray-200 bg-white lg:bg-gray-50 lg:rounded-b-xl sticky bottom-0">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {resultsCount} result{resultsCount !== 1 ? 's' : ''}
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

            {/* Sidebar */}
      <div className={`
        fixed lg:static
        top-0 lg:top-0
        left-0 h-screen lg:h-auto
        w-80 lg:w-full
        z-50 lg:z-10
        transform lg:transform-none transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${className}
      `}>
        <SidebarContent />
      </div>
    </>
  );
}
