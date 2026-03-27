import { API_CONFIG } from '@/config/api';
import type { ApiResponse, PaginatedResponse, Book, BookPayload } from './booksApi';

const API_BASE_URL = API_CONFIG.API_BASE_URL;

class AudiobooksApiService {
  private async fetchWithErrorHandling<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const defaultHeaders: Record<string, string> = {
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      ...options,
    });


    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getAll(params: {
    page?: number;
    limit?: number;
    category?: string;
    featured?: boolean;
    bestseller?: boolean;
    search?: string;
    sortBy?: string;
    status?: string;
  } = {}): Promise<PaginatedResponse<Book>> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const url = `/audiobooks${queryString ? `?${queryString}` : ''}`;

    return this.fetchWithErrorHandling<PaginatedResponse<Book>>(url);
  }

  async getById(identifier: string): Promise<ApiResponse<Book>> {
    return this.fetchWithErrorHandling<ApiResponse<Book>>(`/audiobooks/${identifier}`);
  }

  async create(payload: BookPayload): Promise<ApiResponse<Book>> {
    return this.fetchWithErrorHandling<ApiResponse<Book>>('/audiobooks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async createWithFiles(payload: BookPayload, files: { coverImage?: File; audiobookFile?: File }): Promise<ApiResponse<Book>> {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          if (key === 'format') {
            value.forEach((format, index) => {
              formData.append(`format[${index}]`, format);
            });
          } else {
            formData.append(key, JSON.stringify(value));
          }
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    if (files.coverImage) formData.append('coverImage', files.coverImage);
    if (files.audiobookFile) formData.append('audiobookFile', files.audiobookFile);

    return this.fetchWithErrorHandling<ApiResponse<Book>>('/audiobooks', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  async update(id: string, payload: Partial<BookPayload>): Promise<ApiResponse<Book>> {
    return this.fetchWithErrorHandling<ApiResponse<Book>>(`/audiobooks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async updateWithFiles(id: string, payload: Partial<BookPayload>, files: { coverImage?: File; audiobookFile?: File }): Promise<ApiResponse<Book>> {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'image' && files.coverImage) return;
        if (Array.isArray(value)) {
          if (key === 'format') {
            value.forEach((format, index) => {
              formData.append(`format[${index}]`, format);
            });
          } else {
            formData.append(key, JSON.stringify(value));
          }
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    if (files.coverImage) formData.append('coverImage', files.coverImage);
    if (files.audiobookFile) formData.append('audiobookFile', files.audiobookFile);

    return this.fetchWithErrorHandling<ApiResponse<Book>>(`/audiobooks/${id}`, {
      method: 'PUT',
      body: formData,
      headers: {},
    });
  }

  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.fetchWithErrorHandling<ApiResponse<{ message: string }>>(`/audiobooks/${id}`, {
      method: 'DELETE',
    });
  }
}

export const audiobooksApi = new AudiobooksApiService();
