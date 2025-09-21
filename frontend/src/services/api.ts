const API_BASE_URL = 'https://genai-artowork-b.onrender.com/api';

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    next?: { page: number; limit: number };
    prev?: { page: number; limit: number };
  };
}

interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: any;
}

const apiRequest = async <T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');
  
  console.log('API Request URL:', url);
  console.log('API Request body:', options.body);
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (token) {
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
    console.log('API Request - Endpoint:', endpoint);
    console.log('API Request - Body:', options.body);
    console.log('API Request - Stringified Body:', config.body);
    console.log('API Request - Headers:', config.headers);
  } else if (options.body instanceof FormData) {
    delete (config.headers as any)['Content-Type'];
    config.body = options.body;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

export const authAPI = {
  register: (userData: { name: string; email: string; password: string; userType: string }) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: userData,
    }),

  login: (credentials: { email: string; password: string }) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: credentials,
    }),

  getProfile: () => apiRequest('/auth/me'),

  getUserProfile: () => apiRequest('/auth/profile'),

  updateProfile: (profileData: {
    fullName?: string;
    age?: number;
    location?: string;
    skills?: string;
    experienceLevel?: string;
    aiProfileSummary?: string;
  }) =>
    apiRequest('/auth/profile', {
      method: 'PUT',
      body: profileData,
    }),

  updateProfileWithAvatar: (formData: FormData) =>
    apiRequest('/auth/profile', {
      method: 'PUT',
      headers: {},
      body: formData,
    }),

  followUser: (userId: string) =>
    apiRequest(`/auth/follow/${userId}`, {
      method: 'POST',
    }),

  unfollowUser: (userId: string) =>
    apiRequest(`/auth/follow/${userId}`, {
      method: 'DELETE',
    }),
};

export const productAPI = {
  getProducts: (params: Record<string, string> = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiRequest(`/products?${searchParams}`);
  },

  getProduct: (id: string) => apiRequest(`/products/${id}`),

  createProduct: (formData: FormData) =>
    apiRequest('/products', {
      method: 'POST',
      headers: {},
      body: formData,
    }),

  updateProduct: (id: string, formData: FormData) =>
    apiRequest(`/products/${id}`, {
      method: 'PUT',
      headers: {},
      body: formData,
    }),

  deleteProduct: (id: string) =>
    apiRequest(`/products/${id}`, {
      method: 'DELETE',
    }),

  likeProduct: (id: string) =>
    apiRequest(`/products/${id}/like`, {
      method: 'POST',
    }),

  addToFavorites: (id: string) =>
    apiRequest(`/products/${id}/favorite`, {
      method: 'POST',
    }),

  getFeaturedProducts: () => apiRequest('/products/featured'),

  generateAIContent: (data: any) =>
    apiRequest('/products/ai/generate-content', {
      method: 'POST',
      body: data,
    }),

  generateAIDescription: (productData: any) =>
    apiRequest('/products/ai/generate-description', {
      method: 'POST',
      body: productData,
    }),

  generateAIPriceSuggestion: (productData: any) =>
    apiRequest('/products/ai/price-suggestion', {
      method: 'POST',
      body: productData,
    }),

  generateAITags: (productData: any) =>
    apiRequest('/products/ai/generate-tags', {
      method: 'POST',
      body: productData,
    }),

  getAnalytics: (id: string) => apiRequest(`/products/${id}/analytics`),
};

export const postAPI = {
  getPosts: (params: Record<string, string> = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiRequest(`/posts?${searchParams}`);
  },

  getPost: (id: string) => apiRequest(`/posts/${id}`),

  createPost: (formData: FormData) =>
    apiRequest('/posts', {
      method: 'POST',
      headers: {},
      body: formData,
    }),

  updatePost: (id: string, formData: FormData) =>
    apiRequest(`/posts/${id}`, {
      method: 'PUT',
      headers: {},
      body: formData,
    }),

  deletePost: (id: string) =>
    apiRequest(`/posts/${id}`, {
      method: 'DELETE',
    }),

  likePost: (id: string) =>
    apiRequest(`/posts/${id}/like`, {
      method: 'POST',
    }),

  addComment: (id: string, comment: { content: string; parentComment?: string }) =>
    apiRequest(`/posts/${id}/comments`, {
      method: 'POST',
      body: comment,
    }),

  generateAIPostContent: (data: any) =>
    apiRequest('/posts/ai/generate-content', {
      method: 'POST',
      body: data,
    }),
};

export const commentAPI = {
  updateComment: (id: string, content: string) =>
    apiRequest(`/comments/${id}`, {
      method: 'PUT',
      body: { content },
    }),

  deleteComment: (id: string) =>
    apiRequest(`/comments/${id}`, {
      method: 'DELETE',
    }),

  likeComment: (id: string) =>
    apiRequest(`/comments/${id}/like`, {
      method: 'POST',
    }),
};

export const recommendationAPI = {
  getRecommendations: () => apiRequest('/recommendations/products'),

  getSimilarProducts: (id: string) => apiRequest(`/recommendations/products/${id}/similar`),

  getTrendingProducts: () => apiRequest('/recommendations/trending'),

  getTopArtists: () => apiRequest('/recommendations/artists/top'),

  getAIInsights: (params: Record<string, string> = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiRequest(`/recommendations/insights?${searchParams}`);
  },

  getPersonalizedFeed: (params: Record<string, string> = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiRequest(`/recommendations/feed?${searchParams}`);
  },
};

export const orderAPI = {
  createOrder: (orderData: {
    productId: string;
    paymentMethod?: string;
    shippingAddress?: string;
  }) =>
    apiRequest('/orders', {
      method: 'POST',
      body: orderData,
    }),

  getUserOrders: () => apiRequest('/orders/user'),

  getArtisanOrders: () => apiRequest('/orders/artisan'),
};

export default {
  auth: authAPI,
  products: productAPI,
  posts: postAPI,
  comments: commentAPI,
  recommendations: recommendationAPI,
  orders: orderAPI,
};