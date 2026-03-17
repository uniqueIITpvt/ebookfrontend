import { notFound } from 'next/navigation';
import BlogPostClient from './BlogPostClient';
import { API_CONFIG } from '@/config/api';

const API_BASE_URL = API_CONFIG.API_BASE_URL;

// BlogPost type definition
interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorBio?: string;
  authorAvatar?: string;
  publishDate: string;
  readTime: string;
  category: string;
  tags?: string[];
  image?: string;
  views?: number;
  likes?: number;
  featured?: boolean;
  slug?: string;
}

// Get blog post by slug from API only - NO fallback
async function getBlogPostFromAPI(slug: string): Promise<any | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/slug/${slug}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching blog from API:', error);
    return null;
  }
}

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  
  // Fetch from API only - NO hardcoded fallback
  const post = await getBlogPostFromAPI(slug);

  if (!post) {
    notFound();
  }

  return <BlogPostClient post={post} />;
}
