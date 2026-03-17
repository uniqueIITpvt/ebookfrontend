'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon,
  TagIcon,
  ArrowLeftIcon,
  ShareIcon,
  HeartIcon,
  BookmarkIcon,
  PrinterIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import LoadingAnimation from '@/components/ui/LoadingAnimation';

// Type definitions
interface JSONBlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  authorAvatar: string;
  publishDate: string;
  readTime: string;
  category: string;
  tags: string[];
  image: string;
  views: number;
  likes: number;
  featured: boolean;
  content?: string;
}

interface HardcodedBlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  authorDetails: {
    name: string;
    title: string;
    bio: string;
  };
  category: string;
  publishedAt: string;
  readTime: string;
  image: string;
  tags: string[];
  engagement: {
    likes: number;
    views: number;
    comments: number;
    saves: number;
  };
  content: string;
}

type BlogPost = JSONBlogPost | HardcodedBlogPost;

interface BlogPostClientProps {
  post: BlogPost;
}

export default function BlogPostClient({ post }: BlogPostClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (post) {
      // Handle different post types
      const likesCount = 'engagement' in post ? post.engagement.likes : post.likes;
      setLikes(likesCount || 0);
    }
  }, [post]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 sm:pt-20 lg:pt-24 bg-white flex items-center justify-center">
        <div className="text-center">
          <LoadingAnimation className="text-blue-600 scale-150 mb-8" />
          <p className="text-slate-600 text-lg font-medium">Loading Article...</p>
        </div>
      </div>
    );
  }

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = post.title;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`);
        break;
    }
  };

  return (
    <div className="min-h-screen pt-16 sm:pt-20 lg:pt-24 bg-white">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-blue-500 hover:text-blue-700">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/blog" className="text-blue-500 hover:text-blue-700">
              Blog
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium truncate">{post.title}</span>
          </nav>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Article Header */}
        <header className="mb-8 lg:mb-12">
          {/* Back Button */}
          <Link
            href="/blog"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 text-sm font-medium"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>

          {/* Category Badge */}
          <div className="mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              ['Book Summaries', 'Audiobooks'].includes(post.category)
                ? 'bg-blue-100 text-blue-800'
                : ['Self Development', 'Business'].includes(post.category)
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-teal-100 text-teal-800'
            }`}>
              <TagIcon className="w-4 h-4 mr-1" />
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-slate-600 mb-6">
            <div className="flex items-center">
              <UserIcon className="w-4 h-4 mr-2" />
              {post.author}
            </div>
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2" />
              {new Date('publishedAt' in post ? post.publishedAt : post.publishDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-2" />
              {post.readTime}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isLiked 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isLiked ? (
                <HeartSolidIcon className="w-5 h-5" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
              {likes}
            </button>

            <button
              onClick={handleBookmark}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isBookmarked 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <BookmarkIcon className="w-5 h-5" />
              {isBookmarked ? 'Saved' : 'Save'}
            </button>

            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                <ShareIcon className="w-5 h-5" />
                Share
              </button>
              
              {/* Share Dropdown */}
              <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <button
                  onClick={() => handleShare('twitter')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Share on Twitter
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Share on Facebook
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Share on LinkedIn
                </button>
                <button
                  onClick={() => handleShare('email')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Share via Email
                </button>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <PrinterIcon className="w-5 h-5" />
              Print
            </button>
          </div>

          {/* Featured Image */}
          <div className="relative h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden mb-8">
            {post.image ? (
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
          </div>

          {/* Excerpt */}
          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed italic border-l-4 border-blue-500 pl-6">
            {post.excerpt}
          </p>
        </header>

        {/* Article Content */}
        {'content' in post && post.content ? (
          <div 
            className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3 prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-700 prose-strong:text-slate-900"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <div className="prose prose-lg max-w-none">
            <p className="text-slate-700 leading-relaxed text-lg mb-8">
              {post.excerpt}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <p className="text-blue-800 font-medium">
                This article is currently being expanded with full content. Please check back soon for the complete article.
              </p>
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Author Bio */}
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              DS
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {'authorDetails' in post ? post.authorDetails.name : post.author}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                TechUniqueIIT Research Center publishes research-driven learning resources and evidence-based content.
              </p>
              <div className="mt-4">
                <Link
                  href="/about"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  Learn more about TechUniqueIIT Research Center
                  <ArrowLeftIcon className="w-4 h-4 ml-2 rotate-180" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      <section className="bg-gray-50 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8 text-center">
            You Might Also Like
          </h2>
          <div className="text-center">
            <Link
              href="/blog"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Articles
              <ArrowLeftIcon className="w-4 h-4 ml-2 rotate-180" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
