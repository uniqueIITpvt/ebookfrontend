'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip as MuiChip,
  Alert,
  Snackbar,
  Backdrop,
  CircularProgress,
  Autocomplete,
  Pagination,
  InputAdornment,
  Tooltip,
  Menu,
  Card,
  CardContent,
  Chip,
  Skeleton,
  InputBase,
  Avatar,
  FormHelperText,
  AlertTitle,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  FilterList,
  CloudUpload,
  Close,
  MoreVert,
  Refresh,
  Download,
  TrendingUp,
  BookmarkBorder,
  Star,
  Archive,
} from '@mui/icons-material';
import { booksApi, type Book, type BookPayload, type BookFile } from '@/services/api/booksApi';
import { categoriesApi, type Category } from '@/services/api/categoriesApi';
import { bookTypesApi, type BookType } from '@/services/api/bookTypesApi';
import { bookHubsApi, type BookHub } from '@/services/api/bookHubsApi';
import { bookStatusesApi, type BookStatus } from '@/services/api/bookStatusesApi';
import { ImageIcon } from 'lucide-react';

// Form data interface for admin operations
interface BookFormData extends Omit<BookPayload, 'price' | 'originalPrice' | 'tags'> {
  _id?: string;
  id?: string;
  price: number; // Form uses numbers
  originalPrice?: number;
  sales?: number;
  createdAt?: string;
  updatedAt?: string;
  coverImage?: string;
  views?: number;
  downloads?: number;
  slug?: string;
  // Override fields to make them optional for form
  tags?: string[]; // Optional in form, will default to empty array
  componentType?: 'none' | 'free-summaries' | 'trending-books' | 'premium-summaries';
}

interface ValidationErrors {
  title?: string;
  author?: string;
  category?: string;
  description?: string;
  price?: string;
  pages?: string;
  isbn?: string;
  publishDate?: string;
  rating?: string;
  reviews?: string;
  sales?: string;
  format?: string;
  coverImage?: string;
}

interface ConfirmDialog {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

// Pagination state
interface PaginationState {
  page: number;
  totalPages: number;
  totalBooks: number;
  limit: number;
}

const statuses = ['draft', 'review', 'published', 'archived'];

// Default categories for fallback
const defaultCategories = [
  'Technology & Innovation',
  'Science & Education',
  'Business & Economics',
  'Personal Development',
  'Exam Prep',
  'Programming',
  'AI & Data Science',
  'Research Methods',
  'Audiobook Summaries',
  'Community',
];

export default function BooksPage() {
  const searchParams = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bookTypes, setBookTypes] = useState<BookType[]>([]);
  const [bookHubs, setBookHubs] = useState<BookHub[]>([]);
  const [bookStatusesList, setBookStatusesList] = useState<BookStatus[]>([]);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [bookTypeDialogOpen, setBookTypeDialogOpen] = useState(false);
  const [bookHubDialogOpen, setBookHubDialogOpen] = useState(false);
  const [bookStatusDialogOpen, setBookStatusDialogOpen] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({ name: '', description: '', color: '#1976d2' });
  const [newBookTypeData, setNewBookTypeData] = useState({ name: '', description: '', color: '#1976d2' });
  const [newBookHubData, setNewBookHubData] = useState({ name: '', value: '', description: '', color: '#9c27b0' });
  const [newBookStatusData, setNewBookStatusData] = useState({ name: '', value: '', description: '', color: '#757575' });
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    featured: 0,
    bestsellers: 0,
    totalSales: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedBook, setSelectedBook] = useState<Partial<BookFormData> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuBookId, setMenuBookId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [apiAvailable, setApiAvailable] = useState(true);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [bookFilePreview, setBookFilePreview] = useState<string | null>(null);
  const [audioFilePreview, setAudioFilePreview] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Filter books based on search and filters
  useEffect(() => {
    fetchBooks();
  }, [searchQuery, filterCategory, filterStatus, filterType]);

  useEffect(() => {
    const typeParam = searchParams?.get('type');
    if (typeParam === 'Audiobook' || typeParam === 'Books') {
      setFilterType(typeParam);
    }
  }, [searchParams]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Try to load categories first
      try {
        const categoriesResponse = await categoriesApi.getActive();
        if (categoriesResponse.success && categoriesResponse.data && categoriesResponse.data.length > 0) {
          setCategories(categoriesResponse.data);
        } else {
          // Use default categories if API returns empty
          const fallbackCategories = defaultCategories.map((name, index) => ({
            _id: `fallback-${index}`,
            id: `fallback-${index}`,
            name,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            color: '#1976d2',
            icon: 'book',
            isActive: true,
            sortOrder: index,
            bookCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as Category));
          setCategories(fallbackCategories);
        }
      } catch (error) {
        console.warn('Categories API not available, using default categories');
        // Fallback to default categories
        const fallbackCategories = defaultCategories.map((name, index) => ({
          _id: `fallback-${index}`,
          id: `fallback-${index}`,
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          color: '#1976d2',
          icon: 'book',
          isActive: true,
          sortOrder: index,
          bookCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Category));
        setCategories(fallbackCategories);
      }

      // Try to load book types
      try {
        const bookTypesResponse = await bookTypesApi.getActive();
        if (bookTypesResponse.success && bookTypesResponse.data && bookTypesResponse.data.length > 0) {
          setBookTypes(bookTypesResponse.data);
        }
      } catch (error) {
        console.warn('Book Types API not available, using default types');
      }

      // Try to load book hubs (component types)
      try {
        const bookHubsResponse = await bookHubsApi.getActive();
        if (bookHubsResponse.success && bookHubsResponse.data && bookHubsResponse.data.length > 0) {
          setBookHubs(bookHubsResponse.data);
        }
      } catch (error) {
        console.warn('Book Hubs API not available, using default hubs');
      }

      // Try to load book statuses
      try {
        const bookStatusesResponse = await bookStatusesApi.getActive();
        if (bookStatusesResponse.success && bookStatusesResponse.data && bookStatusesResponse.data.length > 0) {
          setBookStatusesList(bookStatusesResponse.data);
        }
      } catch (error) {
        console.warn('Book Statuses API not available, using default statuses');
      }

      // Try to load books
      let booksData: Book[] = [];
      try {
        const booksResponse = await booksApi.getAllBooks();
        booksData = booksResponse.data;
        setBooks(booksData);
        setFilteredBooks(booksData);
      } catch (error) {
        console.warn('Books API not available, using fallback data');
        setApiAvailable(false);
        booksData = [];
        setBooks(booksData);
        setFilteredBooks(booksData);
      }
      
      try {
        const statsResponse = await booksApi.getStats();
        if (statsResponse.success) {
          setStats(statsResponse.data);
        }
      } catch (error) {
        console.warn('Stats API not available, calculating from books data');
        // Calculate stats from books data
        const calculatedStats = {
          total: booksData.length,
          published: booksData.filter(b => b.status === 'published').length,
          featured: booksData.filter(b => b.featured).length,
          bestsellers: booksData.filter(b => b.bestseller).length,
          totalSales: booksData.reduce((sum, book) => sum + (book.sales || 0), 0)
        };
        setStats(calculatedStats);
      }

    } catch (error: any) {
      console.error('Error loading initial data:', error);
      showErrorAlert(
        'Failed to load data',
        'Some features may not be available. Please check your connection and try again.'
      );
      setApiAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (filterCategory) params.category = filterCategory;
      if (filterStatus) params.status = filterStatus;
      if (filterType) params.type = filterType;

      const response = await booksApi.getAllBooks(params);
      if (response.success) {
        setFilteredBooks(response.data);
      }
    } catch (error) {
      console.warn('Error fetching books, using local filtering:', error);
      // Fallback to local filtering if API is not available
      let filtered = books;

      if (searchQuery) {
        filtered = filtered.filter(book =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (filterCategory) {
        filtered = filtered.filter(book => book.category === filterCategory);
      }

      if (filterStatus) {
        filtered = filtered.filter(book => book.status === filterStatus);
      }

      if (filterType) {
        filtered = filtered.filter(book => (book as any).type === filterType);
      }

      setFilteredBooks(filtered);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, bookId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuBookId(bookId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuBookId(null);
  };

  // Validation functions
  const validateBook = (book: Partial<BookFormData>): ValidationErrors => {
    const errors: ValidationErrors = {};

    // Title validation
    if (!book.title?.trim()) {
      errors.title = 'Title is required';
    } else if (book.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters long';
    } else if (book.title.trim().length > 200) {
      errors.title = 'Title must be less than 200 characters';
    }

    // Author validation
    if (!book.author?.trim()) {
      errors.author = 'Author is required';
    } else if (book.author.trim().length < 2) {
      errors.author = 'Author name must be at least 2 characters long';
    }

    // Category validation
    if (!book.category?.trim()) {
      errors.category = 'Category is required';
    }

    // Description validation
    if (!book.description?.trim()) {
      errors.description = 'Description is required';
    } else if (book.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters long';
    } else if (book.description.trim().length > 2000) {
      errors.description = 'Description must be less than 2000 characters';
    }

    // Price validation
    if (book.price === undefined || book.price === null) {
      errors.price = 'Price is required';
    } else {
      const priceValue = typeof book.price === 'string' ? parseFloat(book.price) : book.price;
      if (isNaN(priceValue)) {
        errors.price = 'Price must be a valid number';
      } else if (priceValue < 0) {
        errors.price = 'Price cannot be negative';
      } else if (priceValue > 10000) { 
        errors.price = 'Price seems too high (max $10,000)';
      }
    }

    // Pages validation
    if (book.pages !== undefined && book.pages !== null) {
      const pagesValue = typeof book.pages === 'string' ? parseInt(book.pages) : book.pages;
      if (isNaN(pagesValue)) {
        errors.pages = 'Pages must be a valid number';
      } else if (pagesValue < 1) {
        errors.pages = 'Pages must be at least 1';
      } else if (pagesValue > 10000) {
        errors.pages = 'Pages seems too high (max 10,000)';
      }
    }

    // ISBN validation (basic format check)
    if (book.isbn && book.isbn.trim()) {
      const isbnRegex = /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/;
      if (!isbnRegex.test(book.isbn.replace(/[- ]/g, ''))) {
        errors.isbn = 'Please enter a valid ISBN format';
      }
    }

    // Format validation
    const validFormats = ['Hardcover', 'Paperback', 'E-book', 'Audiobook', 'PDF', 'Digital Download'];
    if (!book.format || !Array.isArray(book.format) || book.format.length === 0) {
      errors.format = 'At least one format is required';
    } else {
      const invalidFormats = book.format.filter(format => !validFormats.includes(format));
      if (invalidFormats.length > 0) {
        errors.format = `Invalid format(s): ${invalidFormats.join(', ')}. Valid formats are: ${validFormats.join(', ')}`;
      }
    }

    // Publish Date validation
    if (!book.publishDate) {
      errors.publishDate = 'Publish date is required';
    } else {
      const publishDate = new Date(book.publishDate);
      const today = new Date();
      if (publishDate > today) {
        errors.publishDate = 'Publish date cannot be in the future';
      }
    }

    // Rating validation
    if (book.rating !== undefined && book.rating !== null) {
      if (book.rating < 0 || book.rating > 5) {
        errors.rating = 'Rating must be between 0 and 5';
      }
    }

    // Reviews validation
    if (book.reviews !== undefined && book.reviews !== null) {
      if (book.reviews < 0) {
        errors.reviews = 'Reviews count cannot be negative';
      }
    }

    // Sales validation
    if (book.sales !== undefined && book.sales !== null) {
      if (book.sales < 0) {
        errors.sales = 'Sales count cannot be negative';
      }
    }

    return errors;
  };

  const showErrorAlert = (message: string, details?: string) => {
    setSnackbar({
      open: true,
      message: details ? `${message}: ${details}` : message,
      severity: 'error'
    });
  };

  const showSuccessAlert = (message: string) => {
    setSnackbar({
      open: true,
      message,
      severity: 'success'
    });
  };

  const showWarningAlert = (message: string) => {
    setSnackbar({
      open: true,
      message,
      severity: 'warning'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'default';
      case 'review': return 'warning';
      case 'archived': return 'secondary';
      default: return 'default';
    }
  };

  // Image handling functions
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showErrorAlert('Invalid file type', 'Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showErrorAlert('File too large', 'Please select an image smaller than 5MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
        setSelectedBook({...selectedBook, coverImage: e.target?.result as string, image: e.target?.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setSelectedBook({...selectedBook, coverImage: ''});
  };

  // Book file handling functions
  const handleBookFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type for e-books
      const allowedTypes = ['application/pdf', 'application/epub+zip', 'text/plain'];
      if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.epub')) {
        showErrorAlert('Invalid file type', 'Please select a PDF, EPUB, or TXT file');
        return;
      }
      
      // Validate file size (max 50MB for books)
      if (file.size > 50 * 1024 * 1024) {
        showErrorAlert('File too large', 'Please select a book file smaller than 50MB');
        return;
      }

      setBookFile(file);
      setBookFilePreview(file.name);
    }
  };

  const handleRemoveBookFile = () => {
    setBookFile(null);
    setBookFilePreview(null);
  };

  // Audio file handling functions
  const handleAudioFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type for audiobooks
      const allowedTypes = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg'];
      if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().match(/\.(mp3|m4a|wav|ogg)$/)) {
        showErrorAlert('Invalid file type', 'Please select an MP3, M4A, WAV, or OGG audio file');
        return;
      }
      
      // Validate file size (max 500MB for audio)
      if (file.size > 500 * 1024 * 1024) {
        showErrorAlert('File too large', 'Please select an audio file smaller than 500MB');
        return;
      }

      setAudioFile(file);
      setAudioFilePreview(file.name);
    }
  };

  const handleRemoveAudioFile = () => {
    setAudioFile(null);
    setAudioFilePreview(null);
  };

  const handleDialogOpen = (mode: 'add' | 'edit' | 'view', book?: Book) => {
    setDialogMode(mode);
    setValidationErrors({}); // Clear previous validation errors
    
    // Debug: Log book data structure to understand file structure
    if (book && (mode === 'edit' || mode === 'view')) {
      console.log('Book data for preview:', book);
      console.log('Book files:', book.files);
      console.log('All book properties:', Object.keys(book));
      // Log actual file URLs for debugging
      if (book.files?.ebook) {
        console.log('Ebook file details:', book.files.ebook);
      }
      if (book.files?.audiobook) {
        console.log('Audiobook file details:', book.files.audiobook);
      }
      // Check for alternative file storage patterns
      console.log('Alternative file fields:', {
        ebookUrl: (book as any).ebookUrl,
        audiobookUrl: (book as any).audiobookUrl,
        fileUrls: (book as any).fileUrls,
        attachments: (book as any).attachments
      });
    }
    
    if (book) {
      // Convert API Book to form data
      const formData: Partial<BookFormData> = {
        ...book,
        _id: (book as any)._id || book.id,
        price: typeof book.price === 'string' ? parseFloat(book.price.replace(/[^0-9.]/g, '')) || 0 : book.price,
        originalPrice: book.originalPrice ? (typeof book.originalPrice === 'string' ? parseFloat(book.originalPrice.replace(/[^0-9.]/g, '')) : book.originalPrice) : undefined,
        sales: book.sales || 0, // Ensure sales is properly set
        coverImage: book.image || (book as any).coverImage,
        // Format publishDate for HTML date input (YYYY-MM-DD)
        publishDate: book.publishDate ? new Date(book.publishDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      };
      
      // Debug sales data
      console.log('📊 SALES DEBUG:', { originalSales: book.sales, convertedSales: book.sales || 0, formDataSales: formData.sales });
      console.log('📝 FORMAT DEBUG:', { originalFormat: book.format, formDataFormat: formData.format, includesEbook: formData.format?.includes('E-book') });
      
      setSelectedBook(formData);
      setImagePreview(book.image || (book as any).coverImage || null);
      
      // Clear any uploaded files to show existing file previews
      setBookFile(null);
      setAudioFile(null);
      setBookFilePreview(null);
      setAudioFilePreview(null);
    } else {
      setSelectedBook({
        title: '',
        author: 'UniqueIIT Research Center',
        category: '',
        status: 'draft',
        featured: false,
        bestseller: false,
        price: 0,
        description: '',
        pages: 0,
        format: ['E-book'], // Default format to prevent validation errors
        isbn: '',
        publishDate: new Date().toISOString().split('T')[0],
        coverImage: '',
        rating: 0,
        reviews: 0,
        sales: 0,
        // New fields
        subtitle: '',
        tags: [],
        originalPrice: undefined,
        duration: '',
        narrator: '',
      });
      setImagePreview(null);
    }
    
    setImageFile(null);
    setBookFile(null);
    setAudioFile(null);
    setBookFilePreview(null);
    setAudioFilePreview(null);
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedBook(null);
    setValidationErrors({});
    setImagePreview(null);
    
    // Clean up file URLs to prevent memory leaks
    if (imageFile) {
      URL.revokeObjectURL(imageFile as any);
    }
    if (bookFile) {
      URL.revokeObjectURL(bookFile as any);
    }
    if (audioFile) {
      URL.revokeObjectURL(audioFile as any);
    }
    
    setImageFile(null);
    setBookFile(null);
    setAudioFile(null);
    setBookFilePreview(null);
    setAudioFilePreview(null);
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog({
      open: false,
      title: '',
      message: '',
      onConfirm: () => {}
    });
  };

  const handleSaveBook = async () => {
    if (!selectedBook) return;

    const isAudiobook =
      (selectedBook as any)?.type === 'Audiobook' ||
      (Array.isArray(selectedBook.format) ? selectedBook.format.includes('Audiobook') : false);

    const existingAudiobookUrl =
      (selectedBook as any)?.files?.audiobook?.url ||
      (selectedBook as any)?.audiobookUrl ||
      (selectedBook as any)?.fileUrls?.audiobook;

    if (isAudiobook && !audioFile && !existingAudiobookUrl) {
      showErrorAlert('Audiobook file is required', 'Please upload an audiobook file before saving.');
      return;
    }
    
    // Validate the book data
    const errors = validateBook(selectedBook);
    setValidationErrors(errors);
    
    // If there are validation errors, don't proceed
    if (Object.keys(errors).length > 0) {
      showErrorAlert('Please fix the validation errors before saving');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Sanitize the data
      const coercedFormat = selectedBook.format && selectedBook.format.length > 0
        ? selectedBook.format
        : ['E-book'];

      const normalizedFormat = isAudiobook
        ? Array.from(new Set([...coercedFormat, 'Audiobook']))
        : coercedFormat;

      const sanitizedBook: BookPayload = {
        title: selectedBook.title?.trim() || '',
        author: selectedBook.author?.trim() || '',
        category: selectedBook.category?.trim() || '',
        description: selectedBook.description?.trim() || '',
        type: isAudiobook ? 'Audiobook' : (selectedBook.type || 'Books'),
        componentType: selectedBook.componentType || 'none',
        price: Number(selectedBook.price) || 0,
        format: normalizedFormat, // Default to E-book if no format specified; ensure Audiobook format matches type
        featured: selectedBook.featured || false,
        bestseller: selectedBook.bestseller || false,
        status: selectedBook.status || 'draft',
        tags: selectedBook.tags || [],
        publishDate: selectedBook.publishDate || new Date().toISOString().split('T')[0],
        isbn: selectedBook.isbn?.trim(),
        pages: selectedBook.pages ? Number(selectedBook.pages) : undefined,
        rating: selectedBook.rating,
        reviews: selectedBook.reviews,
        originalPrice: selectedBook.originalPrice,
        duration: selectedBook.duration,
        narrator: selectedBook.narrator,
        // Only include image if no new image file is being uploaded
        image: imageFile ? undefined : (selectedBook.coverImage || selectedBook.image),
        subtitle: selectedBook.subtitle
      };
      
      // Collect files for upload
      const filesToUpload = {
        coverImage: imageFile || undefined,
        ebookFile: bookFile || undefined,
        audiobookFile: audioFile || undefined
      };
      
      // Check if we have any files to upload
      const hasFiles = Object.values(filesToUpload).some(file => file !== undefined);
      
      if (dialogMode === 'add') {
        try {
          console.log('Creating book with files:', { hasFiles, filesToUpload, sanitizedBook });
          let response;
          if (hasFiles) {
            response = await booksApi.createBookWithFiles(sanitizedBook, filesToUpload);
          } else {
            response = await booksApi.createBook(sanitizedBook);
          }
          
          if (response.success) {
            showSuccessAlert('Book added successfully!');
            await loadInitialData(); // Refresh data
            handleDialogClose();
          } else {
            showErrorAlert('Failed to add book', 'Server returned an error');
          }
        } catch (error: any) {
          console.error('Error creating book:', error);
          
          // Parse error message for better user feedback
          let errorMessage = 'Failed to create book';
          let errorDetails = 'Please try again';
          
          if (error.response?.data?.message) {
            errorMessage = 'Validation Error';
            errorDetails = error.response.data.message;
            
            // Handle specific validation errors
            if (errorDetails.includes('format')) {
              errorDetails = 'Invalid book format. Please select a valid format (Hardcover, Paperback, E-book, etc.)';
            } else if (errorDetails.includes('Category does not exist')) {
              errorDetails = 'Selected category is not valid. Please choose an existing category.';
            } else if (errorDetails.includes('required')) {
              errorDetails = 'Required fields are missing. Please fill in all required information.';
            }
          } else if (error.message) {
            errorDetails = error.message;
          }
          
          // Check if it's a network error (API not available)
          if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error') || !error.response) {
            console.warn('API not available, adding book locally');
            // Fallback: add book locally
            const newBook = {
              ...sanitizedBook,
              id: Date.now().toString(), // Temporary ID
              _id: Date.now().toString(), // Temporary ID
              price: `$${sanitizedBook.price}`, // Convert to string format
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              publishDate: sanitizedBook.publishDate || new Date().toISOString().split('T')[0],
            } as Book;
            
            setBooks([...books, newBook]);
            showWarningAlert('Book added locally (API not available)');
            handleDialogClose();
          } else {
            // Show specific error to user
            showErrorAlert(errorMessage, errorDetails);
          }
        }
      } else if (dialogMode === 'edit' && selectedBook._id) {
        try {
          console.log('Updating book with files:', { hasFiles, filesToUpload, sanitizedBook });
          let response;
          if (hasFiles) {
            response = await booksApi.updateBookWithFiles(selectedBook._id, sanitizedBook, filesToUpload);
          } else {
            response = await booksApi.updateBook(selectedBook._id, sanitizedBook);
          }
          
          if (response.success) {
            showSuccessAlert('Book updated successfully!');
            await loadInitialData(); // Refresh data
            handleDialogClose();
          } else {
            showErrorAlert('Failed to update book', 'Server returned an error');
          }
        } catch (error: any) {
          console.error('Error updating book:', error);
          
          // Parse error message for better user feedback
          let errorMessage = 'Failed to update book';
          let errorDetails = 'Please try again';
          
          if (error.response?.data?.message) {
            errorMessage = 'Validation Error';
            errorDetails = error.response.data.message;
            
            // Handle specific validation errors
            if (errorDetails.includes('format')) {
              errorDetails = 'Invalid book format. Please select a valid format (Hardcover, Paperback, E-book, etc.)';
            } else if (errorDetails.includes('Category does not exist')) {
              errorDetails = 'Selected category is not valid. Please choose an existing category.';
            } else if (errorDetails.includes('required')) {
              errorDetails = 'Required fields are missing. Please fill in all required information.';
            }
          } else if (error.message) {
            errorDetails = error.message;
          }
          
          // Check if it's a network error (API not available)
          if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error') || !error.response) {
            console.warn('API not available, updating book locally');
            // Fallback: update book locally
            const updatedBooks = books.map(book => 
              (book as any)._id === selectedBook._id || book.id === selectedBook._id
                ? { 
                    ...sanitizedBook, 
                    id: selectedBook._id || selectedBook.id || book.id,
                    _id: selectedBook._id || selectedBook.id || book.id,
                    price: `$${sanitizedBook.price}`, // Convert to string format
                    createdAt: (book as any).createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString() 
                  } as Book
                : book
            );
            setBooks(updatedBooks);
            showWarningAlert('Book updated locally (API not available)');
            handleDialogClose();
          } else {
            // Show specific error to user
            showErrorAlert(errorMessage, errorDetails);
          }
        }
      }
    } catch (error: any) {
      console.error('Error saving book:', error);
      showErrorAlert(
        `Failed to ${dialogMode === 'add' ? 'add' : 'update'} book`,
        error.message || 'Please try again'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBook = (bookId: string) => {
    const book = books.find(b => (b as any)._id === bookId || b.id === bookId);
    if (!book) return;

    setConfirmDialog({
      open: true,
      title: 'Delete Book',
      message: `Are you sure you want to delete "${book.title}"? This action cannot be undone.`,
      onConfirm: () => confirmDeleteBook(bookId)
    });
    handleMenuClose();
  };

  const confirmDeleteBook = async (bookId: string) => {
    try {
      try {
        const response = await booksApi.deleteBook(bookId);
        if (response.success) {
          showSuccessAlert('Book deleted successfully!');
          await loadInitialData(); // Refresh data
        } else {
          showErrorAlert('Failed to delete book', 'Server returned an error');
        }
      } catch (error: any) {
        console.warn('API not available, deleting book locally');
        // Fallback: delete book locally
        const updatedBooks = books.filter(book => (book as any)._id !== bookId && book.id !== bookId);  
        setBooks(updatedBooks);
        showWarningAlert('Book deleted locally (API not available)');
      }
    } catch (error: any) {
      console.error('Error deleting book:', error);
      showErrorAlert('Failed to delete book', error.message || 'Please try again');
    }
    handleConfirmDialogClose();
  };

  const toggleFeatured = async (bookId: string) => {
    try {
      const book = books.find(b => (b as any)._id === bookId || b.id === bookId);
      if (!book) return;

      try {
        const response = await booksApi.updateBook(bookId, { featured: !book.featured });
        if (response.success) {
          setSnackbar({ 
            open: true, 
            message: `Book ${!book.featured ? 'featured' : 'unfeatured'} successfully!`, 
            severity: 'success' 
          });
          await loadInitialData(); // Refresh data
        }
      } catch (error) {
        console.warn('API not available, updating book locally');
        // Fallback: update book locally
        const updatedBooks = books.map(b => 
          (b as any)._id === bookId || b.id === bookId
            ? { ...b, featured: !b.featured, updatedAt: new Date().toISOString() }
            : b
        );
        setBooks(updatedBooks);
        setSnackbar({ 
          open: true, 
          message: `Book ${!book.featured ? 'featured' : 'unfeatured'} locally (API not available)`, 
          severity: 'warning' 
        });
      }
    } catch (error) {
      console.error('Error toggling featured status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update book status. Please try again.',
        severity: 'error'
      });
    }
    handleMenuClose();
  };

  const handleArchiveBook = async (bookId: string) => {
    try {
      const book = books.find(b => (b as any)._id === bookId || b.id === bookId);
      if (!book) return;

      const isCurrentlyArchived = book.status === 'archived';
      const newStatus = isCurrentlyArchived ? 'published' : 'archived';
      const actionText = isCurrentlyArchived ? 'unarchived' : 'archived';

      try {
        const response = await booksApi.updateBook(bookId, { status: newStatus });
        if (response.success) {
          setSnackbar({ 
            open: true, 
            message: `Book ${actionText} successfully!`, 
            severity: 'success' 
          });
          await loadInitialData(); // Refresh data
        }
      } catch (error) {
        console.warn('API not available, updating book locally');
        // Fallback: update book locally
        const updatedBooks = books.map(b => 
          (b as any)._id === bookId || b.id === bookId
            ? { ...b, status: newStatus as 'draft' | 'review' | 'published' | 'archived', updatedAt: new Date().toISOString() }
            : b
        );
        setBooks(updatedBooks); 
        setSnackbar({ 
          open: true, 
          message: `Book ${actionText} locally (API not available)`, 
          severity: 'warning' 
        });
      }
    } catch (error) {
      console.error('Error archiving book:', error);
      setSnackbar({
        open: true,
        message: 'Failed to archive book. Please try again.',
        severity: 'error'
      });
    }
    handleMenuClose();
  };

  const handleCreateCategory = async () => {
    if (!newCategoryData.name.trim()) {
      showErrorAlert('Category name is required');
      return;
    }

    try {
      const response = await categoriesApi.create({
        name: newCategoryData.name.trim(),
        description: newCategoryData.description.trim() || undefined,
        color: newCategoryData.color
      });

      if (response.success) {
        // Add new category to list
        setCategories([...categories, response.data]);
        // Auto-select the new category
        setSelectedBook({
          ...selectedBook,
          category: response.data.name
        });
        // Reset form and close dialog
        setNewCategoryData({ name: '', description: '', color: '#1976d2' });
        setCategoryDialogOpen(false);
        showSuccessAlert(`Category "${response.data.name}" created successfully!`);
      }
    } catch (error: any) {
      console.error('Error creating category:', error);
      showErrorAlert('Failed to create category', error.message || 'Please try again');
    }
  };

  // Handler for creating new book type
  const handleCreateBookType = async () => {
    if (!newBookTypeData.name.trim()) {
      showErrorAlert('Book type name is required');
      return;
    }

    try {
      const response = await bookTypesApi.create({
        name: newBookTypeData.name.trim(),
        description: newBookTypeData.description.trim() || undefined,
        color: newBookTypeData.color
      });

      if (response.success) {
        setBookTypes([...bookTypes, response.data]);
        setSelectedBook({ ...selectedBook, type: response.data.name as any });
        setNewBookTypeData({ name: '', description: '', color: '#1976d2' });
        setBookTypeDialogOpen(false);
        showSuccessAlert(`Book Type "${response.data.name}" created successfully!`);
      }
    } catch (error: any) {
      console.error('Error creating book type:', error);
      showErrorAlert('Failed to create book type', error.message || 'Please try again');
    }
  };

  // Handler for creating new book hub
  const handleCreateBookHub = async () => {
    if (!newBookHubData.name.trim() || !newBookHubData.value.trim()) {
      showErrorAlert('Book hub name and value are required');
      return;
    }

    try {
      const response = await bookHubsApi.create({
        name: newBookHubData.name.trim(),
        value: newBookHubData.value.trim(),
        description: newBookHubData.description.trim() || undefined,
        color: newBookHubData.color
      });

      if (response.success) {
        setBookHubs([...bookHubs, response.data]);
        setSelectedBook({ ...selectedBook, componentType: response.data.value as any });
        setNewBookHubData({ name: '', value: '', description: '', color: '#9c27b0' });
        setBookHubDialogOpen(false);
        showSuccessAlert(`Books Hub "${response.data.name}" created successfully!`);
      }
    } catch (error: any) {
      console.error('Error creating book hub:', error);
      showErrorAlert('Failed to create book hub', error.message || 'Please try again');
    }
  };

  // Handler for creating new book status
  const handleCreateBookStatus = async () => {
    if (!newBookStatusData.name.trim() || !newBookStatusData.value.trim()) {
      showErrorAlert('Status name and value are required');
      return;
    }

    try {
      const response = await bookStatusesApi.create({
        name: newBookStatusData.name.trim(),
        value: newBookStatusData.value.trim(),
        description: newBookStatusData.description.trim() || undefined,
        color: newBookStatusData.color
      });

      if (response.success) {
        setBookStatusesList([...bookStatusesList, response.data]);
        setSelectedBook({ ...selectedBook, status: response.data.value as any });
        setNewBookStatusData({ name: '', value: '', description: '', color: '#757575' });
        setBookStatusDialogOpen(false);
        showSuccessAlert(`Status "${response.data.name}" created successfully!`);
      }
    } catch (error: any) {
      console.error('Error creating book status:', error);
      showErrorAlert('Failed to create status', error.message || 'Please try again');
    }
  };

  return <Box>
      {/* API Status Banner */}
      {!apiAvailable && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Backend API is not available. You can still manage books locally, but changes won't be saved to the server.
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Books Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your book catalog, track sales, and update content
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadInitialData}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleDialogOpen('add')}
            size="large"
          >
            Add New Book
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  {loading ? (
                    <Skeleton variant="text" width={60} height={40} />
                  ) : (
                    <Typography variant="h4" fontWeight="bold">
                      {stats.total}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Total Books
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <BookmarkBorder />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  {loading ? (
                    <Skeleton variant="text" width={60} height={40} />
                  ) : (
                    <Typography variant="h4" fontWeight="bold">
                      {stats.published}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Published
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <Visibility />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  {loading ? (
                    <Skeleton variant="text" width={60} height={40} />
                  ) : (
                    <Typography variant="h4" fontWeight="bold">
                      {stats.bestsellers}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Bestsellers
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  {loading ? (
                    <Skeleton variant="text" width={60} height={40} />
                  ) : (
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalSales.toLocaleString()}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Total Sales
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <Download />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Paper
                component="form"
                sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}
              >
                <Search sx={{ p: '10px' }} />
                <InputBase
                  sx={{ ml: 1, flex: 1 }}
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Book Type</InputLabel>
                <Select
                  value={filterType}
                  label="Book Type"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="Books">Books</MenuItem>
                  <MenuItem value="Audiobook">Audiobooks</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Book Category</InputLabel>
                <Select
                  value={filterCategory}
                  label="Book Category"
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category._id} value={category.name}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: category.color
                          }}
                        />
                        {category.name}
                        {category.bookCount > 0 && (
                          <Chip size="small" label={category.bookCount} sx={{ ml: 'auto' }} />
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={12}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                fullWidth
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('');
                  setFilterCategory('');
                  setFilterStatus('');
                }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Books Grid */}
      {loading ? (
        <Grid container spacing={3}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card sx={{ height: '100%' }}>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={20} width="60%" />
                  <Box sx={{ display: 'flex', gap: 1, my: 1 }}>
                    <Skeleton variant="rounded" width={80} height={24} />
                    <Skeleton variant="rounded" width={60} height={24} />
                  </Box>
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={28} width="40%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : filteredBooks.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <BookmarkBorder sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No books found
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {searchQuery || filterCategory || filterStatus 
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first book'
              }
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleDialogOpen('add')}
              sx={{ mt: 2 }}
            >
              Add New Book
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredBooks.map((book) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={(book as any)._id || book.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                opacity: book.status === 'archived' ? 0.7 : 1,
                filter: book.status === 'archived' ? 'grayscale(0.3)' : 'none'
              }}>
                <Box sx={{ position: 'relative' }}>
                  <Box
                    sx={{
                      height: 200,
                      bgcolor: 'grey.200',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      backgroundImage: book.image ? `url(${book.image})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {!book.image && (
                      <Typography variant="body2" color="text.secondary">
                        Book Cover
                      </Typography>
                    )}
                    {book.featured && (
                      <Chip
                        label="Featured"
                        color="primary"
                        size="small"
                        sx={{ position: 'absolute', top: 8, left: 8 }}
                      />
                    )}
                    {book.bestseller && (
                      <Chip
                        label="Bestseller"
                        color="warning"
                        size="small"
                        sx={{ position: 'absolute', top: 8, right: 40 }}
                      />
                    )}
                    {book.status === 'archived' && (
                      <Chip
                        icon={<Archive fontSize="small" />}
                        label="Archived"
                        color="secondary"
                        size="small"
                        sx={{ position: 'absolute', bottom: 8, left: 8 }}
                      />
                    )}
                  </Box>
                  <IconButton
                    sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.8)' }}
                    onClick={(e) => handleMenuOpen(e, (book as any)._id || book.id)}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h3" gutterBottom noWrap title={book.title}>
                    {book.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    by {book.author}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={book.category}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={book.status}
                      size="small"
                      color={getStatusColor(book.status) as any}
                    />
                  </Box>

                  {book.rating && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Star sx={{ color: 'warning.main', fontSize: 16 }} />
                      <Typography variant="body2">
                        {book.rating} ({book.reviews || 0} reviews)
                      </Typography>
                    </Box>
                  )}

                  <Typography variant="h6" color="primary.main" gutterBottom>
                    {book.price}
                  </Typography>

                  {book.sales && (
                    <Typography variant="body2" color="text.secondary">
                      Sales: {book.sales.toLocaleString()}
                    </Typography>
                  )}

                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Updated: {new Date(book.updatedAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleDialogOpen('view', books.find(b => (b as any)._id === menuBookId || b.id === menuBookId))}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleDialogOpen('edit', books.find(b => (b as any)._id === menuBookId || b.id === menuBookId))}>
          <Edit sx={{ mr: 1 }} />
          Edit Book
        </MenuItem>
        <MenuItem onClick={() => toggleFeatured(menuBookId!)}>
          <Star sx={{ mr: 1 }} />
          Toggle Featured
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleArchiveBook(menuBookId!)} sx={{ color: 'warning.main' }}>
          <Archive sx={{ mr: 1 }} />
          {books.find(b => (b as any)._id === menuBookId || b.id === menuBookId)?.status === 'archived' ? 'Unarchive Book' : 'Archive Book'}
        </MenuItem>
        <MenuItem onClick={() => handleDeleteBook(menuBookId!)} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete Book
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Book' : 
           dialogMode === 'edit' ? 'Edit Book' : 'Book Details'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Title"
                value={selectedBook?.title || ''}
                onChange={(e) => {
                  setSelectedBook({...selectedBook, title: e.target.value});
                  // Clear validation error when user starts typing
                  if (validationErrors.title) {
                    setValidationErrors({...validationErrors, title: undefined});
                  }
                }}
                disabled={dialogMode === 'view'}
                error={!!validationErrors.title}
                helperText={validationErrors.title}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Author"
                value={selectedBook?.author || ''}
                onChange={(e) => {
                  setSelectedBook({...selectedBook, author: e.target.value});
                  if (validationErrors.author) {
                    setValidationErrors({...validationErrors, author: undefined});
                  }
                }}
                disabled={dialogMode === 'view'}
                error={!!validationErrors.author}
                helperText={validationErrors.author}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subtitle"
                value={selectedBook?.subtitle || ''}
                onChange={(e) => setSelectedBook({...selectedBook, subtitle: e.target.value})}
                disabled={dialogMode === 'view'}
                placeholder="Optional subtitle for the book"
                helperText="Optional: Add a subtitle to provide more context"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <FormControl fullWidth error={!!validationErrors.category}>
                  <InputLabel>Book Category *</InputLabel>
                  <Select
                    value={selectedBook?.category || ''}
                    label="Book Category *"
                    onChange={(e) => setSelectedBook({...selectedBook, category: e.target.value})}
                    disabled={dialogMode === 'view'}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category._id} value={category.name}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.category && (
                    <FormHelperText>{validationErrors.category}</FormHelperText>
                  )}
                </FormControl>
                <Tooltip title="Add New Category">
                  <IconButton
                    onClick={() => setCategoryDialogOpen(true)}
                    disabled={dialogMode === 'view'}
                    sx={{
                      mt: 1,
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '&.Mui-disabled': {
                        bgcolor: 'grey.300',
                        color: 'grey.500'
                      }
                    }}
                  >
                    <Add />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <FormControl fullWidth>
                  <InputLabel>Book Type</InputLabel>
                  <Select
                    value={selectedBook?.type || 'Books'}
                    label="Book Type"
                    onChange={(e) => setSelectedBook({ ...selectedBook, type: e.target.value as any })}
                    disabled={dialogMode === 'view'}
                  >
                    {bookTypes.length > 0 ? (
                      bookTypes.map((type) => (
                        <MenuItem key={type._id} value={type.name}>
                          {type.name}
                        </MenuItem>
                      ))
                    ) : (
                      <>
                        <MenuItem value="Books">Books</MenuItem>
                        <MenuItem value="Audiobook">Audiobook</MenuItem>
                      </>
                    )}
                  </Select>
                </FormControl>
                <Tooltip title="Add New Book Type">
                  <IconButton
                    onClick={() => setBookTypeDialogOpen(true)}
                    disabled={dialogMode === 'view'}
                    sx={{
                      mt: 1,
                      bgcolor: 'secondary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'secondary.dark',
                      },
                      '&.Mui-disabled': {
                        bgcolor: 'grey.300',
                        color: 'grey.500'
                      }
                    }}
                  >
                    <Add />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <FormControl fullWidth>
                  <InputLabel>Books Hub</InputLabel>
                  <Select
                    value={selectedBook?.componentType || 'none'}
                    label="Books Hub"
                    onChange={(e) => setSelectedBook({ ...selectedBook, componentType: e.target.value as any })}
                    disabled={dialogMode === 'view'}
                  >
                    {/* Always include None option first */}
                    <MenuItem value="none">None (Regular Book)</MenuItem>
                    {bookHubs.length > 0 ? (
                      bookHubs.map((hub) => (
                        <MenuItem key={hub._id} value={hub.value}>
                          {hub.name}
                        </MenuItem>
                      ))
                    ) : (
                      <>
                        <MenuItem value="free-summaries">Free Summaries</MenuItem>
                        <MenuItem value="trending-books">Trending Books</MenuItem>
                        <MenuItem value="premium-summaries">Premium Summaries</MenuItem>
                      </>
                    )}
                  </Select>
                </FormControl>
                <Tooltip title="Add New Books Hub">
                  <IconButton
                    onClick={() => setBookHubDialogOpen(true)}
                    disabled={dialogMode === 'view'}
                    sx={{
                      mt: 1,
                      bgcolor: 'success.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'success.dark',
                      },
                      '&.Mui-disabled': {
                        bgcolor: 'grey.300',
                        color: 'grey.500'
                      }
                    }}
                  >
                    <Add />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedBook?.status || ''}
                    label="Status"
                    onChange={(e) =>
                      setSelectedBook({
                        ...selectedBook,
                        status: e.target.value as 'draft' | 'review' | 'published' | 'archived'
                      })
                    }
                    disabled={dialogMode === 'view'}
                  >
                    {bookStatusesList.length > 0 ? (
                      bookStatusesList.map((status) => (
                        <MenuItem key={status._id} value={status.value}>
                          {status.name}
                        </MenuItem>
                      ))
                    ) : (
                      statuses.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
                <Tooltip title="Add New Status">
                  <IconButton
                    onClick={() => setBookStatusDialogOpen(true)}
                    disabled={dialogMode === 'view'}
                    sx={{
                      mt: 1,
                      bgcolor: 'warning.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'warning.dark',
                      },
                      '&.Mui-disabled': {
                        bgcolor: 'grey.300',
                        color: 'grey.500'
                      }
                    }}
                  >
                    <Add />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={selectedBook?.price || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  setSelectedBook({...selectedBook, price: value});
                  if (validationErrors.price) {
                    setValidationErrors({...validationErrors, price: undefined});
                  }
                }}
                disabled={dialogMode === 'view'}
                InputProps={{ startAdornment: '$' }}
                error={!!validationErrors.price}
                helperText={validationErrors.price}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Original Price"
                type="number"
                value={selectedBook?.originalPrice || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                  setSelectedBook({...selectedBook, originalPrice: value});
                }}
                disabled={dialogMode === 'view'}
                InputProps={{ startAdornment: '$' }}
                helperText="For discount calculations (optional)"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pages"
                type="number"
                value={selectedBook?.pages || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                  setSelectedBook({...selectedBook, pages: value});
                  if (validationErrors.pages) {
                    setValidationErrors({...validationErrors, pages: undefined});
                  }
                }}
                disabled={dialogMode === 'view'}
                error={!!validationErrors.pages}
                helperText={validationErrors.pages}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ISBN"
                value={selectedBook?.isbn || ''}
                onChange={(e) => {
                  setSelectedBook({...selectedBook, isbn: e.target.value});
                  if (validationErrors.isbn) {
                    setValidationErrors({...validationErrors, isbn: undefined});
                  }
                }}
                disabled={dialogMode === 'view'}
                error={!!validationErrors.isbn}
                helperText={validationErrors.isbn || 'Optional: Enter ISBN-10 or ISBN-13 format'}
                placeholder="978-0-123456-78-9 or 0123456789"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={selectedBook?.description || ''}
                onChange={(e) => {
                  setSelectedBook({...selectedBook, description: e.target.value});
                  if (validationErrors.description) {
                    setValidationErrors({...validationErrors, description: undefined});
                  }
                }}
                disabled={dialogMode === 'view'}
                error={!!validationErrors.description}
                helperText={validationErrors.description}
                required
                placeholder="Enter a detailed description of the book..."
              />
            </Grid>
            
            {/* Publish Date */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Publish Date"
                type="date"
                value={selectedBook?.publishDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setSelectedBook({...selectedBook, publishDate: e.target.value});
                  if (validationErrors.publishDate) {
                    setValidationErrors({...validationErrors, publishDate: undefined});
                  }
                }}
                disabled={dialogMode === 'view'}
                error={!!validationErrors.publishDate}
                helperText={validationErrors.publishDate || 'Date when the book was published'}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Rating */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Rating"
                type="number"
                inputProps={{ min: 0, max: 5, step: 0.1 }}
                value={selectedBook?.rating || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  setSelectedBook({...selectedBook, rating: value});
                  if (validationErrors.rating) {
                    setValidationErrors({...validationErrors, rating: undefined});
                  }
                }}
                disabled={dialogMode === 'view'}
                error={!!validationErrors.rating}
                helperText={validationErrors.rating || 'Rating out of 5 stars'}
              />
            </Grid>

            {/* Reviews Count */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Reviews Count"
                type="number"
                value={selectedBook?.reviews || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                  setSelectedBook({...selectedBook, reviews: value});
                  if (validationErrors.reviews) {
                    setValidationErrors({...validationErrors, reviews: undefined});
                  }
                }}
                disabled={dialogMode === 'view'}
                error={!!validationErrors.reviews}
                helperText={validationErrors.reviews}
              />
            </Grid>

            {/* Sales Count */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sales Count"
                type="number"
                value={selectedBook?.sales || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                  setSelectedBook({...selectedBook, sales: value});
                  if (validationErrors.sales) {
                    setValidationErrors({...validationErrors, sales: undefined});
                  }
                }}
                disabled={dialogMode === 'view'}
                error={!!validationErrors.sales}
                helperText={validationErrors.sales}
              />
            </Grid>

            {/* Book Formats */}
            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={['Hardcover', 'Paperback', 'E-book', 'Audiobook']}
                value={selectedBook?.format || ['E-book']}
                onChange={(event, newValue) => {
                  // Ensure format is never empty - default to E-book
                  const formatValue = newValue && newValue.length > 0 ? newValue : ['E-book'];
                  setSelectedBook({...selectedBook, format: formatValue});
                  if (validationErrors.format) {
                    setValidationErrors({...validationErrors, format: undefined});
                  }
                }}
                disabled={dialogMode === 'view'}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <MuiChip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      key={index}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Book Formats"
                    placeholder="Add formats..."
                    error={!!validationErrors.format}
                    helperText={validationErrors.format || 'Select or type book formats'}
                  />
                )}
              />
            </Grid>

            {/* Tags */}
            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={selectedBook?.tags || []}
                onChange={(event, newValue) => {
                  // Convert to lowercase as per backend schema
                  const lowercaseTags = newValue.map(tag => typeof tag === 'string' ? tag.toLowerCase().trim() : tag);
                  setSelectedBook({...selectedBook, tags: lowercaseTags});
                }}
                disabled={dialogMode === 'view'}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <MuiChip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      key={index}
                      size="small"
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder="Add tags for better searchability..."
                    helperText="Press Enter to add tags. Tags help users find your book."
                  />
                )}
              />
            </Grid>

            {/* Conditional File Uploads based on Format */}
            {selectedBook?.format?.includes('E-book') && (
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    E-book File *
                  </Typography>
                  
                  {bookFilePreview ? (
                    <Box sx={{ mb: 2 }}>
                      {/* File Info */}
                      <Box sx={{ 
                        p: 2, 
                        border: '1px solid #ddd', 
                        borderRadius: 1, 
                        bgcolor: 'grey.50',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CloudUpload color="primary" />
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {bookFilePreview}
                            </Typography>
                            {bookFile && (
                              <Typography variant="caption" color="text.secondary">
                                Size: {(bookFile.size / 1024 / 1024).toFixed(2)} MB • Type: {bookFile.type}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      {dialogMode !== 'view' && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={handleRemoveBookFile}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    
                    {/* PDF Preview */}
                    {bookFile && bookFile.type === 'application/pdf' && (
                      <Box sx={{ 
                        border: '1px solid #ddd', 
                        borderRadius: 1, 
                        overflow: 'hidden',
                        bgcolor: 'white'
                      }}>
                        <Box sx={{ p: 2, bgcolor: 'grey.100', borderBottom: '1px solid #ddd' }}>
                          <Typography variant="subtitle2" color="primary">
                            📄 PDF Preview
                          </Typography>
                        </Box>
                        <Box sx={{ height: 400, overflow: 'auto' }}>
                          <iframe
                            src={URL.createObjectURL(bookFile)}
                            width="100%"
                            height="400"
                            style={{ border: 'none' }}
                            title="PDF Preview"
                          />
                        </Box>
                      </Box>
                    )}
                    
                    {/* Other file types preview */}
                    {bookFile && bookFile.type !== 'application/pdf' && (
                      <Box sx={{ 
                        p: 3, 
                        border: '1px solid #ddd', 
                        borderRadius: 1, 
                        textAlign: 'center',
                        bgcolor: 'grey.50'
                      }}>
                        <Typography variant="body2" color="text.secondary">
                          📄 {bookFile.type.includes('epub') ? 'EPUB' : bookFile.type.includes('text') ? 'Text' : 'Document'} file ready for upload
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Preview not available for this file type
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Existing E-book File Preview */}
                    {(() => {
                      const hasEbook = selectedBook && (selectedBook as any)?.files?.ebook;
                      return hasEbook;
                    })() && (
                      <Box sx={{ 
                        border: '1px solid #ddd', 
                        borderRadius: 1, 
                        overflow: 'hidden',
                        bgcolor: 'white'
                      }}>
                        <Box sx={{ p: 2, bgcolor: 'success.light', borderBottom: '1px solid #ddd' }}>
                          <Typography variant="subtitle2" color="white" sx={{ fontWeight: 'bold' }}>
                            ✅ EXISTING E-BOOK FILE FOUND!
                          </Typography>
                        </Box>
                        <Box sx={{ p: 3 }}>
                          {(() => {
                            const book = selectedBook as any;
                            const ebookFile = book?.files?.ebook;
                            const ebookUrl = ebookFile?.url || book?.ebookUrl || book?.fileUrls?.ebook;
                            const fileName = ebookFile?.originalName || 'E-book File';
                            const fileSize = ebookFile?.fileSize;
                            const mimeType = ebookFile?.mimeType;
                            
                            return (
                              <>
                                <Typography variant="body2" gutterBottom>
                                  {fileName}
                                </Typography>
                                {fileSize && (
                                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                    Size: {(fileSize / 1024 / 1024).toFixed(2)} MB
                                  </Typography>
                                )}
                                {/* PDF Preview for existing files */}
                                {(mimeType === 'application/pdf' || ebookUrl?.includes('.pdf')) && ebookUrl && (
                                  <Box sx={{ mb: 2 }}>
                                    <iframe
                                      src={ebookUrl}
                                      width="100%"
                                      height="300"
                                      style={{ border: '1px solid #ddd', borderRadius: '4px' }}
                                      title="PDF Preview"
                                      onError={(e) => {
                                        console.error('PDF iframe failed to load:', ebookUrl);
                                        (e.target as HTMLIFrameElement).style.display = 'none';
                                      }}
                                      onLoad={() => {
                                        console.log('PDF iframe loaded successfully:', ebookUrl);
                                      }}
                                    />
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                      📄 PDF Preview - Click download button if preview doesn't load
                                    </Typography>
                                  </Box>
                                )}
                                {ebookUrl && (
                                  <Button 
                                    variant="outlined" 
                                    size="small" 
                                    href={ebookUrl} 
                                    target="_blank"
                                    startIcon={<CloudUpload />}
                                  >
                                    Download/Preview
                                  </Button>
                                )}
                              </>
                            );
                          })()}
                        </Box>
                      </Box>
                    )}
                  </Box>
                  ) : (
                    <Box
                      sx={{
                        border: '2px dashed #ddd',
                        borderRadius: 1,
                        p: 3,
                        textAlign: 'center',
                        bgcolor: 'grey.50'
                      }}
                    >
                      <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Upload E-book File
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        PDF, EPUB, or TXT format
                      </Typography>
                    </Box>
                  )}

                  {dialogMode !== 'view' && (
                    <Box sx={{ mt: 2 }}>
                      <input
                        accept=".pdf,.epub,.txt,application/pdf,application/epub+zip,text/plain"
                        style={{ display: 'none' }}
                        id="book-file-upload"
                        type="file"
                        onChange={handleBookFileUpload}
                      />
                      <label htmlFor="book-file-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<CloudUpload />}
                          sx={{ mr: 1 }}
                        >
                          {bookFilePreview ? 'Change File' : 'Upload E-book'}
                        </Button>
                      </label>
                      {bookFilePreview && (
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<Delete />}
                          onClick={handleRemoveBookFile}
                        >
                          Remove
                        </Button>
                      )}
                      <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                        Supported formats: PDF, EPUB, TXT. Max size: 50MB
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            )}

            {((selectedBook as any)?.type === 'Audiobook' || selectedBook?.format?.includes('Audiobook')) && (
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Audiobook File *
                  </Typography>
                  
                  {audioFilePreview ? (
                    <Box sx={{ mb: 2 }}>
                      {/* File Info */}
                      <Box sx={{ 
                        p: 2, 
                        border: '1px solid #ddd', 
                        borderRadius: 1, 
                        bgcolor: 'grey.50',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CloudUpload color="primary" />
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {audioFilePreview}
                            </Typography>
                            {audioFile && (
                              <Typography variant="caption" color="text.secondary">
                                Size: {(audioFile.size / 1024 / 1024).toFixed(2)} MB • Type: {audioFile.type}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      {dialogMode !== 'view' && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={handleRemoveAudioFile}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    
                    {/* Audio Preview */}
                    {audioFile && (
                      <Box sx={{ 
                        border: '1px solid #ddd', 
                        borderRadius: 1, 
                        overflow: 'hidden',
                        bgcolor: 'white'
                      }}>
                        <Box sx={{ p: 2, bgcolor: 'grey.100', borderBottom: '1px solid #ddd' }}>
                          <Typography variant="subtitle2" color="primary">
                            🎧 Audio Preview
                          </Typography>
                        </Box>
                        <Box sx={{ p: 3 }}>
                          <audio 
                            controls 
                            style={{ width: '100%' }}
                            preload="metadata"
                          >
                            <source src={URL.createObjectURL(audioFile)} type={audioFile.type} />
                            Your browser does not support the audio element.
                          </audio>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Duration will be calculated after upload
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    
                    {/* Existing Audio File Preview */}
                    {(() => {
                      const hasAudio = selectedBook && (selectedBook as any)?.files?.audiobook;
                      return hasAudio;
                    })() && (
                      <Box sx={{ 
                        border: '1px solid #ddd', 
                        borderRadius: 1, 
                        overflow: 'hidden',
                        bgcolor: 'white'
                      }}>
                        <Box sx={{ p: 2, bgcolor: 'info.light', borderBottom: '1px solid #ddd' }}>
                          <Typography variant="subtitle2" color="white" sx={{ fontWeight: 'bold' }}>
                            ✅ EXISTING AUDIO FILE FOUND!
                          </Typography>
                        </Box>
                        <Box sx={{ p: 3 }}>
                          {(() => {
                            const book = selectedBook as any;
                            const audioFile = book?.files?.audiobook;
                            const audioUrl = audioFile?.url || book?.audiobookUrl || book?.fileUrls?.audiobook;
                            const fileName = audioFile?.originalName || 'Audio File';
                            const fileSize = audioFile?.fileSize;
                            const duration = audioFile?.duration;
                            const mimeType = audioFile?.mimeType || 'audio/mpeg';
                            
                            return (
                              <>
                                <Typography variant="body2" gutterBottom>
                                  {fileName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                  {fileSize && `Size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`}
                                  {duration && (
                                    <> • Duration: {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}</>
                                  )}
                                </Typography>
                                {audioUrl && (
                                  <>
                                    <audio 
                                      controls 
                                      style={{ width: '100%', marginBottom: '8px' }}
                                      preload="metadata"
                                      onError={(e) => {
                                        console.error('Audio failed to load:', audioUrl);
                                      }}
                                      onLoadedMetadata={() => {
                                        console.log('Audio loaded successfully:', audioUrl);
                                      }}
                                    >
                                      <source src={audioUrl} type={mimeType} />
                                      Your browser does not support the audio element.
                                    </audio>
                                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                      🎧 Audio Player - Click download if playback doesn't work
                                    </Typography>
                                    <Button 
                                      variant="outlined" 
                                      size="small" 
                                      href={audioUrl} 
                                      target="_blank"
                                      startIcon={<CloudUpload />}
                                    >
                                      Download
                                    </Button>
                                  </>
                                )}
                              </>
                            );
                          })()}
                        </Box>
                      </Box>
                    )}
                  </Box>
                  ) : (
                    <Box
                      sx={{
                        border: '2px dashed #ddd',
                        borderRadius: 1,
                        p: 3,
                        textAlign: 'center',
                        bgcolor: 'grey.50'
                      }}
                    >
                      <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Upload Audio File
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        MP3, M4A, WAV, or OGG format
                      </Typography>
                    </Box>
                  )}

                  {dialogMode !== 'view' && (
                    <Box sx={{ mt: 2 }}>
                      <input
                        accept=".mp3,.m4a,.wav,.ogg,audio/*"
                        style={{ display: 'none' }}
                        id="audio-file-upload"
                        type="file"
                        onChange={handleAudioFileUpload}
                      />
                      <label htmlFor="audio-file-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<CloudUpload />}
                          sx={{ mr: 1 }}
                        >
                          {audioFilePreview ? 'Change File' : 'Upload Audio'}
                        </Button>
                      </label>
                      {audioFilePreview && (
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<Delete />}
                          onClick={handleRemoveAudioFile}
                        >
                          Remove
                        </Button>
                      )}
                      <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                        Supported formats: MP3, M4A, WAV, OGG. Max size: 500MB
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            )}

            {/* Audiobook-specific fields */}
            {((selectedBook as any)?.type === 'Audiobook' || selectedBook?.format?.includes('Audiobook')) && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Duration"
                    value={selectedBook?.duration || ''}
                    onChange={(e) => setSelectedBook({...selectedBook, duration: e.target.value})}
                    disabled={dialogMode === 'view'}
                    placeholder="e.g., 5h 30m"
                    helperText="Audio duration (e.g., 5h 30m, 3 hours 15 minutes)"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Narrator"
                    value={selectedBook?.narrator || ''}
                    onChange={(e) => setSelectedBook({...selectedBook, narrator: e.target.value})}
                    disabled={dialogMode === 'view'}
                    placeholder="Narrator name"
                    helperText="Name of the person who narrated the audiobook"
                  />
                </Grid>
              </>
            )}

            {/* Existing Files Preview - Always show when files exist */}
            {selectedBook && (selectedBook as any)?.files?.ebook && (
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    ✅ Existing E-book File
                  </Typography>
                  {(() => {
                    const hasEbook = selectedBook && (selectedBook as any)?.files?.ebook;
                    console.log('🔴 EBOOK SECTION RENDERING:', hasEbook);
                    if (hasEbook) {
                      console.log('🔴 EBOOK DATA:', (selectedBook as any)?.files?.ebook);
                    }
                    return hasEbook;
                  })() && (
                    <Box sx={{ 
                      border: '1px solid #ddd', 
                      borderRadius: 1, 
                      overflow: 'hidden',
                      bgcolor: 'white'
                    }}>
                      <Box sx={{ p: 2, bgcolor: 'success.light', borderBottom: '1px solid #ddd' }}>
                        <Typography variant="subtitle2" color="white" sx={{ fontWeight: 'bold' }}>
                          ✅ EXISTING E-BOOK FILE FOUND!
                        </Typography>
                      </Box>
                      <Box sx={{ p: 3 }}>
                        {(() => {
                          const book = selectedBook as any;
                          const ebookFile = book?.files?.ebook;
                          const originalUrl = ebookFile?.url || book?.ebookUrl || book?.fileUrls?.ebook;
                          // Modify Cloudinary URL to force inline viewing instead of download
                          const ebookUrl = originalUrl ? originalUrl.replace('/upload/', '/upload/fl_attachment:false/') : null;
                          const fileName = ebookFile?.originalName || 'E-book File';
                          const fileSize = ebookFile?.fileSize;
                          const mimeType = ebookFile?.mimeType;
                          
                          console.log('Ebook preview data:', {
                            ebookFile,
                            originalUrl,
                            modifiedUrl: ebookUrl,
                            fileName,
                            fileSize,
                            mimeType
                          });
                          console.log('PDF iframe will show:', (mimeType === 'application/pdf' || ebookUrl?.includes('.pdf')) && ebookUrl);
                          
                          return (
                            <>
                              <Typography variant="body2" gutterBottom>
                                {fileName}
                              </Typography>
                              {fileSize && (
                                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                  Size: {(fileSize / 1024 / 1024).toFixed(2)} MB
                                </Typography>
                              )}
                              {/* PDF Preview for existing files */}
                              {(mimeType === 'application/pdf' || ebookUrl?.includes('.pdf')) && ebookUrl && (
                                <Box sx={{ mb: 2 }}>
                                  <Box sx={{ mb: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                      📄 PDF Preview
                                    </Typography>
                                  </Box>
                                  
                                  {/* PDF Thumbnail/Preview Card */}
                                  <Box sx={{ 
                                    border: '2px solid #e0e0e0', 
                                    borderRadius: 2, 
                                    p: 3,
                                    bgcolor: '#f8f9fa',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      borderColor: '#1976d2',
                                      bgcolor: '#f0f7ff'
                                    }
                                  }}>
                                    {/* PDF Icon */}
                                    <Box sx={{ mb: 2 }}>
                                      <svg width="48" height="48" viewBox="0 0 24 24" fill="#d32f2f">
                                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                                        <text x="12" y="16" textAnchor="middle" fontSize="6" fill="white" fontWeight="bold">PDF</text>
                                      </svg>
                                    </Box>
                                    
                                    <Typography variant="body2" fontWeight="medium" gutterBottom>
                                      {fileName}
                                    </Typography>
                                    
                                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                      PDF Document • {(fileSize / 1024 / 1024).toFixed(2)} MB
                                    </Typography>
                                    
                                    <Typography variant="caption" color="primary" sx={{ fontStyle: 'italic' }}>
                                      Click to view PDF in new tab
                                    </Typography>
                                  </Box>
                                  
                                  {/* Action Buttons */}
                                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                                    <Button 
                                      variant="contained" 
                                      size="small" 
                                      href={originalUrl} 
                                      target="_blank"
                                      startIcon={<CloudUpload />}
                                      sx={{ minWidth: '140px' }}
                                    >
                                      View PDF
                                    </Button>
                                    <Button 
                                      variant="outlined" 
                                      size="small" 
                                      href={`https://docs.google.com/viewer?url=${encodeURIComponent(originalUrl)}`} 
                                      target="_blank"
                                      sx={{ minWidth: '140px' }}
                                    >
                                      Google Viewer
                                    </Button>
                                    <Button 
                                      variant="text" 
                                      size="small" 
                                      href={originalUrl}
                                      download={fileName}
                                      startIcon={<CloudUpload />}
                                      sx={{ minWidth: '100px' }}
                                    >
                                      Download
                                    </Button>
                                  </Box>
                                </Box>
                              )}
                            </>
                          );
                        })()}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Grid>
            )}

            {selectedBook && (selectedBook as any)?.files?.audiobook && (
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    ✅ Existing Audio File
                  </Typography>
                  {(() => {
                    const hasAudio = selectedBook && (selectedBook as any)?.files?.audiobook;
                    console.log('🔵 AUDIO SECTION RENDERING:', hasAudio);
                    if (hasAudio) {
                      console.log('🔵 AUDIO DATA:', (selectedBook as any)?.files?.audiobook);
                    }
                    return hasAudio;
                  })() && (
                    <Box sx={{ 
                      border: '1px solid #ddd', 
                      borderRadius: 1, 
                      overflow: 'hidden',
                      bgcolor: 'white'
                    }}>
                      <Box sx={{ p: 2, bgcolor: 'info.light', borderBottom: '1px solid #ddd' }}>
                        <Typography variant="subtitle2" color="white" sx={{ fontWeight: 'bold' }}>
                          ✅ EXISTING AUDIO FILE FOUND!
                        </Typography>
                      </Box>
                      <Box sx={{ p: 3 }}>
                        {(() => {
                          const book = selectedBook as any;
                          const audioFile = book?.files?.audiobook;
                          const audioUrl = audioFile?.url || book?.audiobookUrl || book?.fileUrls?.audiobook;
                          const fileName = audioFile?.originalName || 'Audio File';
                          const fileSize = audioFile?.fileSize;
                          const duration = audioFile?.duration;
                          const mimeType = audioFile?.mimeType || 'audio/mpeg';
                          
                          console.log('Audio preview data:', {
                            audioFile,
                            audioUrl,
                            fileName,
                            fileSize,
                            duration,
                            mimeType
                          });
                          console.log('Audio player will show:', !!audioUrl);
                          
                          return (
                            <>
                              <Typography variant="body2" gutterBottom>
                                {fileName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                {fileSize && `Size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`}
                                {duration && (
                                  <> • Duration: {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}</>
                                )}
                              </Typography>
                              {audioUrl && (
                                <>
                                  {/* Enhanced Audio Player */}
                                  <Box sx={{ 
                                    border: '1px solid #e0e0e0', 
                                    borderRadius: 2, 
                                    p: 2,
                                    bgcolor: '#fafafa',
                                    mb: 2
                                  }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                      {/* Audio Icon */}
                                      <Box sx={{ 
                                        width: 40, 
                                        height: 40, 
                                        borderRadius: '50%', 
                                        bgcolor: '#1976d2', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        flexShrink: 0
                                      }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                          <path d="M12,3V9.28C11.47,9.1 10.92,9 10.34,9C7.95,9 6.05,10.9 6.05,13.29C6.05,15.68 7.95,17.58 10.34,17.58C12.73,17.58 14.63,15.68 14.63,13.29V7.58L19,6.84V11.28C18.47,11.1 17.92,11 17.34,11C14.95,11 13.05,12.9 13.05,15.29C13.05,17.68 14.95,19.58 17.34,19.58C19.73,19.58 21.63,17.68 21.63,15.29V3H12Z" />
                                        </svg>
                                      </Box>
                                      
                                      <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="body2" fontWeight="medium" noWrap>
                                          {fileName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {duration && `Duration: ${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')} • `}
                                          {(fileSize / 1024 / 1024).toFixed(2)} MB
                                        </Typography>
                                      </Box>
                                    </Box>
                                    
                                    {/* Audio Controls */}
                                    <audio 
                                      controls 
                                      style={{ 
                                        width: '100%', 
                                        height: '40px',
                                        borderRadius: '8px'
                                      }}
                                      preload="metadata"
                                      onError={(e) => {
                                        console.error('Audio failed to load:', audioUrl);
                                      }}
                                      onLoadedMetadata={() => {
                                        console.log('Audio loaded successfully:', audioUrl);
                                      }}
                                    >
                                      <source src={audioUrl} type={mimeType} />
                                      Your browser does not support the audio element.
                                    </audio>
                                  </Box>
                                  
                                  {/* Audio Action Buttons */}
                                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                    <Button 
                                      variant="outlined" 
                                      size="small" 
                                      href={audioUrl} 
                                      target="_blank"
                                      startIcon={<CloudUpload />}
                                      sx={{ minWidth: '120px' }}
                                    >
                                      Open Audio
                                    </Button>
                                    <Button 
                                      variant="text" 
                                      size="small" 
                                      href={audioUrl}
                                      download={fileName}
                                      startIcon={<CloudUpload />}
                                      sx={{ minWidth: '100px' }}
                                    >
                                      Download
                                    </Button>
                                  </Box>
                                </>
                              )}
                            </>
                          );
                        })()}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Grid>
            )}

            {/* Cover Image Upload */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Cover Image
                </Typography>
                
                {imagePreview ? (
                  <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                    <img
                      src={imagePreview}
                      alt="Cover preview"
                      style={{
                        width: '150px',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #ddd'
                      }}
                    />
                    {dialogMode !== 'view' && (
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          bgcolor: 'error.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'error.dark' }
                        }}
                        onClick={handleRemoveImage}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: '150px',
                      height: '200px',
                      border: '2px dashed #ddd',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      bgcolor: 'grey.50'
                    }}
                  >
                    <Box sx={{ fontSize: 48, color: 'grey.400', mb: 1 }}>
                      <ImageIcon size={48} />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      No image
                    </Typography>
                  </Box>
                )}

                {dialogMode !== 'view' && (
                  <Box>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="cover-image-upload"
                      type="file"
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="cover-image-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<CloudUpload />}
                        sx={{ mr: 1 }}
                      >
                        Upload Image
                      </Button>
                    </label>
                    {imagePreview && (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={handleRemoveImage}
                      >
                        Remove
                      </Button>
                    )}
                    <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                      Supported formats: JPG, PNG, GIF. Max size: 5MB
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={selectedBook?.featured || false}
                    onChange={(e) => setSelectedBook({...selectedBook, featured: e.target.checked})}
                    disabled={dialogMode === 'view'}
                  />
                }
                label="Featured Book"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={selectedBook?.bestseller || false}
                    onChange={(e) => setSelectedBook({...selectedBook, bestseller: e.target.checked})}
                    disabled={dialogMode === 'view'}
                  />
                }
                label="Bestseller"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>
            {dialogMode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {dialogMode !== 'view' && (
            <Button 
              onClick={handleSaveBook} 
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : null}
            >
              {submitting 
                ? 'Saving...' 
                : dialogMode === 'add' ? 'Add Book' : 'Save Changes'
              }
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleConfirmDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Delete color="error" />
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>Warning</AlertTitle>
            This action cannot be undone.
          </Alert>
          <Typography>
            {confirmDialog.message}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDialogClose}>
            Cancel
          </Button>
          <Button 
            onClick={confirmDialog.onConfirm} 
            variant="contained" 
            color="error"
            startIcon={<Delete />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === 'error' ? 8000 : 6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({...snackbar, open: false})}
          variant="filled"
          sx={{ minWidth: '300px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Category Creation Dialog */}
      <Dialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add New Category
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Category Name"
              value={newCategoryData.name}
              onChange={(e) => setNewCategoryData({...newCategoryData, name: e.target.value})}
              sx={{ mb: 2 }}
              required
              autoFocus
            />
            <TextField
              fullWidth
              label="Description (Optional)"
              value={newCategoryData.description}
              onChange={(e) => setNewCategoryData({...newCategoryData, description: e.target.value})}
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">Color:</Typography>
              <input
                type="color"
                value={newCategoryData.color}
                onChange={(e) => setNewCategoryData({...newCategoryData, color: e.target.value})}
                style={{
                  width: 50,
                  height: 40,
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              />
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: newCategoryData.color,
                  border: '1px solid #ddd'
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateCategory}
            variant="contained"
            disabled={!newCategoryData.name.trim()}
          >
            Create Category
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading && books.length === 0}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading books...
          </Typography>
        </Box>
      </Backdrop>

      {/* Book Type Creation Dialog */}
      <Dialog
        open={bookTypeDialogOpen}
        onClose={() => setBookTypeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Book Type</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Book Type Name"
              value={newBookTypeData.name}
              onChange={(e) => setNewBookTypeData({...newBookTypeData, name: e.target.value})}
              sx={{ mb: 2 }}
              required
              autoFocus
              placeholder="e.g., E-Book, Hardcover"
            />
            <TextField
              fullWidth
              label="Description (Optional)"
              value={newBookTypeData.description}
              onChange={(e) => setNewBookTypeData({...newBookTypeData, description: e.target.value})}
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">Color:</Typography>
              <input
                type="color"
                value={newBookTypeData.color}
                onChange={(e) => setNewBookTypeData({...newBookTypeData, color: e.target.value})}
                style={{
                  width: 50,
                  height: 40,
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              />
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: newBookTypeData.color,
                  border: '1px solid #ddd'
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookTypeDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateBookType}
            variant="contained"
            disabled={!newBookTypeData.name.trim()}
          >
            Create Book Type
          </Button>
        </DialogActions>
      </Dialog>

      {/* Books Hub Creation Dialog */}
      <Dialog
        open={bookHubDialogOpen}
        onClose={() => setBookHubDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Books Hub</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Hub Name"
              value={newBookHubData.name}
              onChange={(e) => {
                const name = e.target.value;
                setNewBookHubData({
                  ...newBookHubData, 
                  name,
                  value: name.toLowerCase().replace(/\s+/g, '-')
                });
              }}
              sx={{ mb: 2 }}
              required
              autoFocus
              placeholder="e.g., Free Summaries"
            />
            <TextField
              fullWidth
              label="Hub Value (System Name)"
              value={newBookHubData.value}
              onChange={(e) => setNewBookHubData({...newBookHubData, value: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
              sx={{ mb: 2 }}
              required
              helperText="Auto-generated from name. Used internally."
            />
            <TextField
              fullWidth
              label="Description (Optional)"
              value={newBookHubData.description}
              onChange={(e) => setNewBookHubData({...newBookHubData, description: e.target.value})}
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">Color:</Typography>
              <input
                type="color"
                value={newBookHubData.color}
                onChange={(e) => setNewBookHubData({...newBookHubData, color: e.target.value})}
                style={{
                  width: 50,
                  height: 40,
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              />
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: newBookHubData.color,
                  border: '1px solid #ddd'
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookHubDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateBookHub}
            variant="contained"
            disabled={!newBookHubData.name.trim() || !newBookHubData.value.trim()}
          >
            Create Books Hub
          </Button>
        </DialogActions>
      </Dialog>

      {/* Book Status Creation Dialog */}
      <Dialog
        open={bookStatusDialogOpen}
        onClose={() => setBookStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Status Name"
              value={newBookStatusData.name}
              onChange={(e) => {
                const name = e.target.value;
                setNewBookStatusData({
                  ...newBookStatusData,
                  name,
                  value: name.toLowerCase().replace(/\s+/g, '-')
                });
              }}
              sx={{ mb: 2 }}
              required
              autoFocus
              placeholder="e.g., In Review"
            />
            <TextField
              fullWidth
              label="Status Value (System Name)"
              value={newBookStatusData.value}
              onChange={(e) => setNewBookStatusData({...newBookStatusData, value: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
              sx={{ mb: 2 }}
              required
              helperText="Auto-generated from name. Used internally."
            />
            <TextField
              fullWidth
              label="Description (Optional)"
              value={newBookStatusData.description}
              onChange={(e) => setNewBookStatusData({...newBookStatusData, description: e.target.value})}
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">Color:</Typography>
              <input
                type="color"
                value={newBookStatusData.color}
                onChange={(e) => setNewBookStatusData({...newBookStatusData, color: e.target.value})}
                style={{
                  width: 50,
                  height: 40,
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              />
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: newBookStatusData.color,
                  border: '1px solid #ddd'
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookStatusDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateBookStatus}
            variant="contained"
            disabled={!newBookStatusData.name.trim() || !newBookStatusData.value.trim()}
          >
            Create Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>;
}
