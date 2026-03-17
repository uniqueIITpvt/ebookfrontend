import { API_CONFIG } from '@/config/api';

const API_BASE_URL = API_CONFIG.API_BASE_URL;

export interface Subcategory {
  _id?: string;
  name: string;
  description?: string;
  createdAt?: Date;
}

export interface TreatmentCategory {
  _id: string;
  name: string;
  type: 'Mental Health' | 'General Health';
  subcategories: Subcategory[];
  description?: string;
  icon?: string;
  order?: number;
  isActive: boolean;
  treatmentCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryResponse {
  success: boolean;
  data: TreatmentCategory | TreatmentCategory[];
  message?: string;
  created?: boolean;
}

/**
 * Get all treatment categories
 */
export const getAllCategories = async (type?: 'Mental Health' | 'General Health'): Promise<TreatmentCategory[]> => {
  try {
    const url = type 
      ? `${API_BASE_URL}/treatment-categories?type=${encodeURIComponent(type)}`
      : `${API_BASE_URL}/treatment-categories`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch categories');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Get category by ID
 */
export const getCategoryById = async (id: string): Promise<TreatmentCategory> => {
  try {
    const response = await fetch(`${API_BASE_URL}/treatment-categories/${id}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch category');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};

/**
 * Create a new category
 */
export const createCategory = async (categoryData: {
  name: string;
  type: 'Mental Health' | 'General Health';
  description?: string;
  icon?: string;
  subcategories?: Subcategory[];
}): Promise<TreatmentCategory> => {
  try {
    const response = await fetch(`${API_BASE_URL}/treatment-categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create category');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

/**
 * Get or create category (auto-create if doesn't exist)
 */
export const getOrCreateCategory = async (
  name: string,
  type: 'Mental Health' | 'General Health'
): Promise<{ category: TreatmentCategory; created: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/treatment-categories/get-or-create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, type }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get or create category');
    }
    
    return {
      category: data.data,
      created: data.created || false,
    };
  } catch (error) {
    console.error('Error getting/creating category:', error);
    throw error;
  }
};

/**
 * Add subcategory to a category
 */
export const addSubcategory = async (
  categoryName: string,
  type: 'Mental Health' | 'General Health',
  subcategoryName: string,
  description?: string
): Promise<{ category: TreatmentCategory; created: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/treatment-categories/subcategory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        categoryName,
        type,
        subcategoryName,
        description,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to add subcategory');
    }
    
    return {
      category: data.data,
      created: data.created || false,
    };
  } catch (error) {
    console.error('Error adding subcategory:', error);
    throw error;
  }
};

/**
 * Get subcategories for a category
 */
export const getSubcategories = async (
  categoryName: string,
  type: 'Mental Health' | 'General Health'
): Promise<Subcategory[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/treatment-categories/subcategories/list?categoryName=${encodeURIComponent(categoryName)}&type=${encodeURIComponent(type)}`
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch subcategories');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return []; // Return empty array on error
  }
};

/**
 * Update category
 */
export const updateCategory = async (
  id: string,
  updates: Partial<TreatmentCategory>
): Promise<TreatmentCategory> => {
  try {
    const response = await fetch(`${API_BASE_URL}/treatment-categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update category');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

/**
 * Delete category
 */
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/treatment-categories/${id}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete category');
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

/**
 * Sync categories from existing treatments
 */
export const syncCategoriesFromTreatments = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/treatment-categories/sync`, {
      method: 'POST',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to sync categories');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error syncing categories:', error);
    throw error;
  }
};

export const treatmentCategoriesApi = {
  getAllCategories,
  getCategoryById,
  createCategory,
  getOrCreateCategory,
  addSubcategory,
  getSubcategories,
  updateCategory,
  deleteCategory,
  syncCategoriesFromTreatments,
};
