import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { productAPI } from '../services/api';
import toast from 'react-hot-toast';

interface ArtistProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  createdAt: string;
  likes: string[];
  orderCount?: number;
}

const ArtistDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<ArtistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (user?.userType === 'artisan') {
      fetchArtistProducts();
      fetchArtistOrders();
    }
  }, [user]);

  const fetchArtistProducts = async () => {
    try {
      const API_BASE_URL = 'https://genai-artowork-b.onrender.com/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/products/artist/my-products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch products');
      }
      
      setProducts(data.data || []);
    } catch (error) {
      console.error('Error fetching artist products:', error);
      toast.error('Failed to load your products');
    } finally {
      setLoading(false);
    }
  };

  const fetchArtistOrders = async () => {
    try {
      // This would be an API call to get artisan orders
      // For now, we'll simulate order counts
      const apiRequest = async (endpoint: string, options: any = {}) => {
        const API_BASE_URL = 'https://genai-artowork-b.onrender.com/api';
        const url = `${API_BASE_URL}${endpoint}`;
        const token = localStorage.getItem('token');
        
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

        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Something went wrong');
        }

        return data;
      };

      const orderResponse = await apiRequest('/orders/artisan');
      setOrders(orderResponse.data || orderResponse || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productAPI.deleteProduct(productId);
      setProducts(products.filter(p => p._id !== productId));
      toast.success('Product deleted successfully');
      
      // Emit event for real-time updates
      window.dispatchEvent(new CustomEvent('productDeleted', { 
        detail: { productId }
      }));
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleEditProduct = (productId: string) => {
    // Navigate to edit page (for now, redirect to create page with product data)
    window.location.href = `/create?edit=${productId}`;
  };

  const getProductImageUrl = (imagePath: string | undefined | null) => {
    // Check if imagePath exists and is a string
    if (!imagePath || typeof imagePath !== 'string') {
      return '/placeholder-image.jpg';
    }
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    
    // Construct the full URL for backend images
    const baseUrl = 'https://genai-artowork-b.onrender.com';
    
    // Handle different image path formats
    if (imagePath.startsWith('/uploads/')) {
      return `${baseUrl}${imagePath}`;
    } else if (imagePath.startsWith('uploads/')) {
      return `${baseUrl}/${imagePath}`;
    } else {
      return `${baseUrl}/uploads/${imagePath}`;
    }
  };

  const getOrderCountForProduct = (productId: string) => {
    // Now using orderCount from product data directly
    const product = products.find(p => p._id === productId);
    return product?.orderCount || 0;
  };

  if (user?.userType !== 'artisan') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only available for artists.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Artist Dashboard</h1>
          <p className="text-gray-600 mb-6">Welcome back, {user?.name}! Manage your artworks and track orders.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
              <div className="text-2xl font-bold">{products.length}</div>
              <div className="text-blue-100">Total Products</div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
              <div className="text-2xl font-bold">{orders.length}</div>
              <div className="text-green-100">Total Orders</div>
            </div>
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 rounded-xl">
              <div className="text-2xl font-bold">{products.reduce((sum, p) => sum + p.likes.length, 0)}</div>
              <div className="text-amber-100">Total Likes</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Your Products</h2>
            <a 
              href="/create" 
              className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-amber-700 hover:to-orange-700 transition-all transform hover:scale-105 shadow-md"
            >
              + Create New Product
            </a>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No products yet</h3>
              <p className="text-gray-600 mb-6">Start creating your first artwork to showcase your talent!</p>
              <a 
                href="/create" 
                className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-amber-700 hover:to-orange-700 transition-all transform hover:scale-105 shadow-md"
              >
                Create Your First Product
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product._id} className="bg-gray-50 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <div className="aspect-w-16 aspect-h-9">
                    <img 
                      src={getProductImageUrl(product.images?.[0])} 
                      alt={product.title}
                      className="w-full h-48 object-cover"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 truncate">{product.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-amber-600">${product.price}</span>
                      <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-semibold">
                        {product.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-3">
                        <span>❤️ {product.likes.length}</span>
                        <span>📦 {getOrderCountForProduct(product._id)} orders</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleDeleteProduct(product._id)}
                        className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                      <button 
                        onClick={() => handleEditProduct(product._id)}
                        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistDashboard;