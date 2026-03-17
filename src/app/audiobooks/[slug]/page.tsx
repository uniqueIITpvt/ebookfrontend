'use client';

import { notFound, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  PlayIcon,
  PauseIcon,
  ArrowDownTrayIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { API_CONFIG } from '@/config/api';
import { generateBookSlug } from '@/utils/slugify';

const API_URL = API_CONFIG.API_BASE_URL;

interface Audiobook {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  description: string;
  category: string;
  type: 'Audiobook';
  duration?: string;
  publishDate?: string;
  image?: string;
  files?: {
    audiobook?: {
      url?: string;
    };
  };
}

interface AudiobookSlugPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function AudiobookSlugPage({ params }: AudiobookSlugPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);

  const [audiobook, setAudiobook] = useState<Audiobook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  const audioUrl = useMemo(() => {
    return audiobook?.files?.audiobook?.url || '';
  }, [audiobook]);

  useEffect(() => {
    const fetchAudiobooks = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_URL}/audiobooks`);
        if (!res.ok) throw new Error('Failed to fetch audiobooks');

        const data = await res.json();
        const list: Audiobook[] = data?.success && Array.isArray(data?.data) ? data.data : [];

        const found = list.find((a) => generateBookSlug(a.title) === resolvedParams.slug) || null;
        setAudiobook(found);
      } catch {
        setAudiobook(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAudiobooks();
  }, [resolvedParams.slug]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, []);

  const handleTogglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audioUrl) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        return;
      }

      if (audio.src !== audioUrl) {
        audio.src = audioUrl;
      }

      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-white/80'>Loading audiobook...</div>
      </div>
    );
  }

  if (!audiobook) {
    notFound();
  }

  return (
    <div className='min-h-screen bg-black text-white'>
      <audio ref={audioRef} preload='metadata' />

      <div className='sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-white/10'>
        <div className='max-w-6xl mx-auto px-4 py-3 flex items-center gap-3'>
          <button
            onClick={() => router.back()}
            className='inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors'
          >
            <ArrowLeftIcon className='w-5 h-5' />
            <span className='font-medium'>Back</span>
          </button>
          <div className='flex-1' />
          <Link
            href='/books?type=Audiobook'
            className='text-sm text-white/70 hover:text-white transition-colors'
          >
            View all
          </Link>
        </div>
      </div>

      <div className='max-w-6xl mx-auto px-4 py-8'>
        <div className='bg-white/10 border border-white/10 rounded-2xl p-6 md:p-8'>
          <div className='flex flex-col md:flex-row gap-6 md:gap-8 items-start'>
            <div className='flex-1 min-w-0'>
              <div className='inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-3 py-1 text-xs text-white/80 mb-4'>
                <span className='font-semibold'>T</span>
                <span>Transcribed</span>
              </div>

              <h1 className='text-2xl md:text-3xl font-bold tracking-tight mb-2 line-clamp-2'>
                {audiobook.title}
              </h1>

              <div className='text-sm text-white/60 mb-6'>
                {audiobook.publishDate ? (
                  <span>
                    {new Date(audiobook.publishDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                ) : null}
                {audiobook.publishDate && audiobook.duration ? <span className='mx-2'>·</span> : null}
                {audiobook.duration ? <span>{audiobook.duration}</span> : null}
              </div>

              <div className='flex flex-wrap gap-3 items-center'>
                <button
                  onClick={handleTogglePlay}
                  disabled={!audioUrl}
                  className='inline-flex items-center gap-2 bg-yellow-400 text-black font-semibold px-5 py-2 rounded-full disabled:opacity-60 disabled:cursor-not-allowed'
                >
                  {isPlaying ? (
                    <PauseIcon className='w-5 h-5' />
                  ) : (
                    <PlayIcon className='w-5 h-5' />
                  )}
                  Play
                </button>

                <button
                  className='inline-flex items-center gap-2 bg-white/10 border border-white/10 text-white/90 px-4 py-2 rounded-full'
                  type='button'
                >
                  In queue
                </button>

                <a
                  href={audioUrl || '#'}
                  download
                  className='inline-flex items-center gap-2 bg-white/10 border border-white/10 text-white/90 px-4 py-2 rounded-full'
                  onClick={(e) => {
                    if (!audioUrl) e.preventDefault();
                  }}
                >
                  <ArrowDownTrayIcon className='w-5 h-5' />
                  Download
                </a>

                <button
                  className='inline-flex items-center gap-2 bg-white/10 border border-white/10 text-white/90 px-4 py-2 rounded-full'
                  type='button'
                >
                  Transcript
                </button>

                <button
                  className='inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/10 text-white/90'
                  type='button'
                >
                  <EllipsisHorizontalIcon className='w-5 h-5' />
                </button>
              </div>
            </div>

            <div className='w-full md:w-56 flex-shrink-0'>
              <div className='relative w-full aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10'>
                {audiobook.image ? (
                  <Image
                    src={audiobook.image}
                    alt={audiobook.title}
                    fill
                    className='object-cover'
                    sizes='224px'
                    priority
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center text-white/40 text-sm'>
                    No Image
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className='mt-8'>
          <h2 className='text-lg font-semibold mb-3'>Description</h2>
          <div className='text-white/70 leading-relaxed'>
            <div className={showFullDescription ? '' : 'line-clamp-3'}>{audiobook.description}</div>
            {audiobook.description && audiobook.description.length > 180 && (
              <button
                onClick={() => setShowFullDescription((v) => !v)}
                className='mt-3 text-white underline underline-offset-4'
              >
                {showFullDescription ? 'show less' : 'show more'}
              </button>
            )}
          </div>

          <div className='mt-10 text-white/60'>
            <div className='font-semibold text-white mb-2'>Comments</div>
            <div className='text-sm'>Coming soon</div>
          </div>
        </div>
      </div>
    </div>
  );
}
