const API_BASE_URL = 'https://genai-artowork-b.onrender.com/api';

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
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
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: userData,
  }),

  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: credentials,
  }),

  getProfile: () => apiRequest('/auth/me'),

  updateProfile: (formData) => apiRequest('/auth/profile', {
    method: 'PUT',
    headers: {},
    body: formData,
  }),

  followUser: (userId) => apiRequest(`/auth/follow/${userId}`, {
    method: 'POST',
  }),

  unfollowUser: (userId) => apiRequest(`/auth/follow/${userId}`, {
    method: 'DELETE',
  }),
};

export const productAPI = {
  getProducts: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiRequest(`/products?${searchParams}`);
  },

  getProduct: (id) => apiRequest(`/products/${id}`),

  createProduct: (formData) => apiRequest('/products', {
    method: 'POST',
    headers: {},
    body: formData,
  }),

  updateProduct: (id, formData) => apiRequest(`/products/${id}`, {
    method: 'PUT',
    headers: {},
    body: formData,
  }),

  deleteProduct: (id) => apiRequest(`/products/${id}`, {
    method: 'DELETE',
  }),

  likeProduct: (id) => apiRequest(`/products/${id}/like`, {
    method: 'POST',
  }),

  addToFavorites: (id) => apiRequest(`/products/${id}/favorite`, {
    method: 'POST',
  }),

  getFeaturedProducts: () => apiRequest('/products/featured'),

  generateAIContent: (data) => apiRequest('/products/ai/generate-content', {
    method: 'POST',
    body: data,
  }),

  getAnalytics: (id) => apiRequest(`/products/${id}/analytics`),
};

export const postAPI = {
  getPosts: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiRequest(`/posts?${searchParams}`);
  },

  getPost: (id) => apiRequest(`/posts/${id}`),

  createPost: (formData) => apiRequest('/posts', {
    method: 'POST',
    headers: {},
    body: formData,
  }),

  updatePost: (id, formData) => apiRequest(`/posts/${id}`, {
    method: 'PUT',
    headers: {},
    body: formData,
  }),

  deletePost: (id) => apiRequest(`/posts/${id}`, {
    method: 'DELETE',
  }),

  likePost: (id) => apiRequest(`/posts/${id}/like`, {
    method: 'POST',
  }),

  addComment: (id, comment) => apiRequest(`/posts/${id}/comments`, {
    method: 'POST',
    body: comment,
  }),

  generateAIPostContent: (data) => apiRequest('/posts/ai/generate-content', {
    method: 'POST',
    body: data,
  }),
};

export const commentAPI = {
  updateComment: (id, content) => apiRequest(`/comments/${id}`, {
    method: 'PUT',
    body: { content },
  }),

  deleteComment: (id) => apiRequest(`/comments/${id}`, {
    method: 'DELETE',
  }),

  likeComment: (id) => apiRequest(`/comments/${id}/like`, {
    method: 'POST',
  }),
};

export const recommendationAPI = {
  getRecommendations: () => apiRequest('/recommendations/products'),

  getSimilarProducts: (id) => apiRequest(`/recommendations/products/${id}/similar`),

  getTrendingProducts: () => apiRequest('/recommendations/trending'),

  getTopArtists: () => apiRequest('/recommendations/artists/top'),

  getAIInsights: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiRequest(`/recommendations/insights?${searchParams}`);
  },

  getPersonalizedFeed: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiRequest(`/recommendations/feed?${searchParams}`);
  },
};

export default {
  auth: authAPI,
  products: productAPI,
  posts: postAPI,
  comments: commentAPI,
  recommendations: recommendationAPI,
};