import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { uploadProductImagesToLocal } from '../../services/localUploadService';
import {
  productUrl,
  getProductUrl,
  addProductUrl,
  updateProductUrl,
  deleteProductUrl,
  getProductmineUrl,
  selectProductUrl,
  restockProductUrl,
  soldProductsUrl,
  boughtProductsUrl,
  getProductTransactionByIdUrl,
  getCategoriesUrl,
  addCategoryUrl,
  updateCategoryUrl,
  deleteCategoryUrl
} from '../../utilizes/endpoints';

// Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  sellerId: string;
  images: string[];
  condition: 'new' | 'used' | 'refurbished';
  availability: 'in_stock' | 'out_of_stock' | 'pre_order';
  quantity: number;
  minOrder: number;
  maxOrder?: number;
  shippingCost?: number;
  deliveryTime?: number;
  tags?: string[];
  specifications?: Record<string, any>;
  isActive: boolean;
  isApproved: boolean;
  rating: number;
  reviewCount: number;
  soldCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductTransaction {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentMethod: string;
  paymentReference?: string;
  shippingAddress: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceState {
  products: Product[];
  currentProduct: Product | null;
  myProducts: Product[];
  soldProducts: ProductTransaction[];
  boughtProducts: ProductTransaction[];
  categories: Category[];
  featuredProducts: Product[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    category?: string;
    priceRange?: [number, number];
    condition?: string;
    availability?: string;
    rating?: number;
    search?: string;
    sortBy?: 'price' | 'rating' | 'created_at' | 'name';
    sortOrder?: 'asc' | 'desc';
  };
  uploadProgress: number;
  isUploading: boolean;
}

// Initial state
const initialState: MarketplaceState = {
  products: [],
  currentProduct: null,
  myProducts: [],
  soldProducts: [],
  boughtProducts: [],
  categories: [],
  featuredProducts: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {},
  uploadProgress: 0,
  isUploading: false,
};

// Async thunks
export const fetchProductsAsync = createAsyncThunk(
  'marketplace/fetchProducts',
  async (params: { 
    page?: number; 
    limit?: number; 
    category?: string; 
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }, { rejectWithValue }) => {
    try {
      const response = await axios.get(productUrl, { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductByIdAsync = createAsyncThunk(
  'marketplace/fetchProductById',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(getProductUrl(productId));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
    }
  }
);

export const fetchMyProductsAsync = createAsyncThunk(
  'marketplace/fetchMyProducts',
  async (params: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await axios.get(getProductmineUrl, { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch my products');
    }
  }
);

export const createProductAsync = createAsyncThunk(
  'marketplace/createProduct',
  async (productData: Omit<Product, 'id' | 'sellerId' | 'rating' | 'reviewCount' | 'soldCount' | 'viewCount' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await axios.post(addProductUrl, productData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create product');
    }
  }
);

export const updateProductAsync = createAsyncThunk(
  'marketplace/updateProduct',
  async ({ id, data }: { id: string; data: Partial<Product> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(updateProductUrl(id), data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
  }
);

export const deleteProductAsync = createAsyncThunk(
  'marketplace/deleteProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(deleteProductUrl(id));
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
  }
);

export const uploadProductImagesAsync = createAsyncThunk(
  'marketplace/uploadProductImages',
  async (uris: string[], { rejectWithValue, dispatch }) => {
    try {
      dispatch(setUploadProgress(10));
      const urls = await uploadProductImagesToLocal(uris);
      dispatch(setUploadProgress(100));
      return { data: { urls } };
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to upload images');
    }
  }
);

export const selectProductAsync = createAsyncThunk(
  'marketplace/selectProduct',
  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await axios.post(selectProductUrl, { productId, quantity });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to select product');
    }
  }
);

export const restockProductAsync = createAsyncThunk(
  'marketplace/restockProduct',
  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await axios.post(restockProductUrl, { productId, quantity });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to restock product');
    }
  }
);

export const fetchSoldProductsAsync = createAsyncThunk(
  'marketplace/fetchSoldProducts',
  async (params: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await axios.get(soldProductsUrl, { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sold products');
    }
  }
);

export const fetchBoughtProductsAsync = createAsyncThunk(
  'marketplace/fetchBoughtProducts',
  async (params: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await axios.get(boughtProductsUrl, { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bought products');
    }
  }
);

export const fetchProductTransactionByIdAsync = createAsyncThunk(
  'marketplace/fetchProductTransactionById',
  async (transactionId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(getProductTransactionByIdUrl(transactionId));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transaction');
    }
  }
);

export const fetchCategoriesAsync = createAsyncThunk(
  'marketplace/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(getCategoriesUrl);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const createCategoryAsync = createAsyncThunk(
  'marketplace/createCategory',
  async (categoryData: Omit<Category, 'id' | 'productCount' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await axios.post(addCategoryUrl, categoryData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create category');
    }
  }
);

export const updateCategoryAsync = createAsyncThunk(
  'marketplace/updateCategory',
  async ({ id, data }: { id: string; data: Partial<Category> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(updateCategoryUrl(id), data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update category');
    }
  }
);

export const deleteCategoryAsync = createAsyncThunk(
  'marketplace/deleteCategory',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(deleteCategoryUrl(id));
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
  }
);

// Slice
const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentProduct: (state, action: PayloadAction<Product | null>) => {
      state.currentProduct = action.payload;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    setFilters: (state, action: PayloadAction<Partial<MarketplaceState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    setUploading: (state, action: PayloadAction<boolean>) => {
      state.isUploading = action.payload;
      if (!action.payload) {
        state.uploadProgress = 0;
      }
    },
    incrementProductView: (state, action: PayloadAction<string>) => {
      const product = state.products.find(p => p.id === action.payload);
      if (product) {
        product.viewCount += 1;
      }
      if (state.currentProduct?.id === action.payload) {
        state.currentProduct.viewCount += 1;
      }
    },
    updateProductRating: (state, action: PayloadAction<{ productId: string; rating: number; reviewCount: number }>) => {
      const { productId, rating, reviewCount } = action.payload;
      const product = state.products.find(p => p.id === productId);
      if (product) {
        product.rating = rating;
        product.reviewCount = reviewCount;
      }
      if (state.currentProduct?.id === productId) {
        state.currentProduct.rating = rating;
        state.currentProduct.reviewCount = reviewCount;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Products
    builder
      .addCase(fetchProductsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.data || action.payload.products || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchProductsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Product by ID
    builder
      .addCase(fetchProductByIdAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductByIdAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload.data || action.payload.product;
      })
      .addCase(fetchProductByIdAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch My Products
    builder
      .addCase(fetchMyProductsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyProductsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myProducts = action.payload.data || action.payload.products || [];
      })
      .addCase(fetchMyProductsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Product
    builder
      .addCase(createProductAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProductAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const product = action.payload.data || action.payload.product;
        if (product) {
          state.myProducts.push(product);
        }
      })
      .addCase(createProductAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Product
    builder
      .addCase(updateProductAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProductAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload.data || action.payload.product;
        if (updated) {
          // Update in all relevant arrays
          const updateArray = (arr: Product[]) => {
            const index = arr.findIndex(p => p.id === updated.id);
            if (index !== -1) arr[index] = updated;
          };
          updateArray(state.products);
          updateArray(state.myProducts);
          if (state.currentProduct?.id === updated.id) {
            state.currentProduct = updated;
          }
        }
      })
      .addCase(updateProductAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Product
    builder
      .addCase(deleteProductAsync.fulfilled, (state, action) => {
        const productId = action.payload;
        state.products = state.products.filter(p => p.id !== productId);
        state.myProducts = state.myProducts.filter(p => p.id !== productId);
        if (state.currentProduct?.id === productId) {
          state.currentProduct = null;
        }
      });

    // Upload Images
    builder
      .addCase(uploadProductImagesAsync.pending, (state) => {
        state.isUploading = true;
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(uploadProductImagesAsync.fulfilled, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 100;
      })
      .addCase(uploadProductImagesAsync.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 0;
        state.error = action.payload as string;
      });

    // Restock Product
    builder
      .addCase(restockProductAsync.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload.product;
        if (updated) {
          const updateArray = (arr: Product[]) => {
            const index = arr.findIndex(p => p.id === updated.id);
            if (index !== -1) arr[index] = updated;
          };
          updateArray(state.products);
          updateArray(state.myProducts);
        }
      });

    // Fetch Sold Products
    builder
      .addCase(fetchSoldProductsAsync.fulfilled, (state, action) => {
        state.soldProducts = action.payload.data || action.payload.transactions || [];
      });

    // Fetch Bought Products
    builder
      .addCase(fetchBoughtProductsAsync.fulfilled, (state, action) => {
        state.boughtProducts = action.payload.data || action.payload.transactions || [];
      });

    // Fetch Categories
    builder
      .addCase(fetchCategoriesAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoriesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload.data || action.payload.categories || [];
      })
      .addCase(fetchCategoriesAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Category
    builder
      .addCase(createCategoryAsync.fulfilled, (state, action) => {
        const category = action.payload.data || action.payload.category;
        if (category) {
          state.categories.push(category);
        }
      });

    // Update Category
    builder
      .addCase(updateCategoryAsync.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload.category;
        if (updated) {
          const index = state.categories.findIndex(c => c.id === updated.id);
          if (index !== -1) {
            state.categories[index] = updated;
          }
        }
      });

    // Delete Category
    builder
      .addCase(deleteCategoryAsync.fulfilled, (state, action) => {
        state.categories = state.categories.filter(c => c.id !== action.payload);
      });
  },
});

export const {
  clearError,
  setCurrentProduct,
  clearCurrentProduct,
  setFilters,
  clearFilters,
  setUploadProgress,
  setUploading,
  incrementProductView,
  updateProductRating,
} = marketplaceSlice.actions;

export default marketplaceSlice.reducer;
