/**
 * Treatments API Service
 * Handles all API calls related to treatments
 */

import { API_CONFIG } from '@/config/api';

const API_BASE_URL = API_CONFIG.API_BASE_URL;

export interface Treatment {
  _id: string;
  name: string;
  slug: string;
  description: string;
  detailedDescription?: string;
  category: 'Mental Health' | 'General Health';
  subcategory?: string;
  image?: string;
  imageCloudinary?: {
    publicId: string;
    url: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    width: number;
    height: number;
  };
  gradient?: string;
  icon?: string;
  duration?: string;
  methods?: string[];
  conditions?: string[];
  sections?: Array<{
    id: string;
    title: string;
    content: string;
    order: number;
  }>;
  onThisPage?: Array<{
    name: string;
    href: string;
    order: number;
  }>;
  informationCards?: Array<{
    title: string;
    description: string;
    icon?: string;
    bgColor?: string;
    link?: string;
  }>;
  keyPoints?: string[];
  relatedResources?: Array<{
    title: string;
    description?: string;
    url: string;
    type: 'internal' | 'external' | 'pdf' | 'video';
  }>;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  active: boolean;
  views: number;
  inquiries: number;
  bookings: number;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  pricing?: {
    sessionCost?: number;
    packageCost?: number;
    insuranceAccepted?: boolean;
    notes?: string;
  };
  availability?: {
    inPerson?: boolean;
    telehealth?: boolean;
    emergency?: boolean;
  };
  contactInfo?: {
    phone?: string;
    email?: string;
    bookingUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface TreatmentStats {
  total: number;
  published: number;
  draft: number;
  featured: number;
  byCategory: {
    mentalHealth: number;
    generalHealth: number;
  };
  engagement: {
    totalViews: number;
    totalInquiries: number;
    totalBookings: number;
  };
  mostPopular?: Array<{
    name: string;
    slug: string;
    views: number;
    category: string;
  }>;
}

export interface Category {
  name: string;
  slug: string;
  count: number;
}

export const treatmentsApi = {
  /**
   * Get all treatments with optional filters
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    featured?: boolean;
    active?: boolean;
    sortBy?: string;
    adminView?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(
      `${API_BASE_URL}/treatments?${queryParams.toString()}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch treatments');
    }
    
    return response.json();
  },

  /**
   * Get single treatment by ID or slug
   */
  async getById(identifier: string) {
    const response = await fetch(`${API_BASE_URL}/treatments/${identifier}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch treatment');
    }
    
    return response.json();
  },

  /**
   * Get featured treatments
   */
  async getFeatured(category?: string) {
    const queryParams = category ? `?category=${encodeURIComponent(category)}` : '';
    const response = await fetch(`${API_BASE_URL}/treatments/featured${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch featured treatments');
    }
    
    return response.json();
  },

  /**
   * Get treatment statistics
   */
  async getStats() {
    const response = await fetch(`${API_BASE_URL}/treatments/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch treatment statistics');
    }
    
    return response.json();
  },

  /**
   * Get all categories with counts
   */
  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/treatments/categories`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    return response.json();
  },

  /**
   * Search treatments
   */
  async search(query: string, page = 1, limit = 20) {
    const response = await fetch(
      `${API_BASE_URL}/treatments/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search treatments');
    }
    
    return response.json();
  },

  /**
   * Get treatments by category
   */
  async getByCategory(category: string) {
    const response = await fetch(
      `${API_BASE_URL}/treatments/category/${category.toLowerCase().replace(/\s+/g, '-')}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch treatments by category');
    }
    
    return response.json();
  },

  /**
   * Create new treatment
   */
  async create(data: FormData | Partial<Treatment>) {
    const isFormData = data instanceof FormData;
    
    const response = await fetch(`${API_BASE_URL}/treatments`, {
      method: 'POST',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? data : JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create treatment');
    }
    
    return response.json();
  },

  /**
   * Update treatment
   */
  async update(id: string, data: FormData | Partial<Treatment>) {
    const isFormData = data instanceof FormData;
    
    const response = await fetch(`${API_BASE_URL}/treatments/${id}`, {
      method: 'PUT',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? data : JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update treatment');
    }
    
    return response.json();
  },

  /**
   * Delete treatment (soft delete)
   */
  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/treatments/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete treatment');
    }
    
    return response.json();
  },

  /**
   * Track engagement (views, inquiries, bookings)
   */
  async trackEngagement(identifier: string, action: 'view' | 'inquiry' | 'booking') {
    const response = await fetch(`${API_BASE_URL}/treatments/${identifier}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to track engagement');
    }
    
    return response.json();
  },

  /**
   * Seed treatments from JSON data
   */
  async seed(treatments: Partial<Treatment>[], clearExisting = false) {
    const response = await fetch(
      `${API_BASE_URL}/treatments/seed?clear=${clearExisting}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(treatments),
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to seed treatments');
    }
    
    return response.json();
  },
};

export default treatmentsApi;
