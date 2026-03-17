'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { XMarkIcon, MagnifyingGlassIcon, PlayIcon, ClockIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface Podcast {
  id: number;
  title: string;
  description: string;
  duration: string;
  publishDate: string;
  category: string;
  audioUrl: string;
  coverImage: string;
  featured: boolean;
  views?: number;
  likes?: number;
  downloads?: number;
  host?: string;
  episodeNumber?: number;
}

interface PodcastSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  podcasts: Podcast[];
  categories: string[];
}

export default function PodcastSearchModal({ isOpen, onClose, podcasts, categories }: PodcastSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredPodcasts, setFilteredPodcasts] = useState<Podcast[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter podcasts based on search and category
  useEffect(() => {
    let filtered = podcasts;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(
        (podcast) => podcast.category === selectedCategory
      );
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (podcast) =>
          podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          podcast.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          podcast.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPodcasts(filtered);
  }, [podcasts, selectedCategory, searchQuery]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Reset search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedCategory('All');
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handlePodcastClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return null;
}
