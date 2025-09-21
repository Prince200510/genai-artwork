import { useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { productAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Direct import to avoid module resolution issues
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

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

interface ProductCardProps {
  id: string;
  title: string;
  artist: string;
  category: string;
  price: number;
  image: string;
  description: string;
  likes: number;
  isFavorite?: boolean;
  isLiked?: boolean;
  views?: number;
}

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductCardProps;
}

function ProductDetailsModal({ isOpen, onClose, product }: ProductDetailsModalProps) {
  const generateReceipt = async () => {
    try {
      // Place order through API
      const orderResponse = await apiRequest('/orders', {
        method: 'POST',
        body: {
          productId: product.id,
          paymentMethod: 'Digital Payment',
          shippingAddress: 'Digital Delivery'
        }
      });

      const order = orderResponse.data;
      
      // Validate order response
      if (!order) {
        throw new Error('Invalid order response from server');
      }
      
      // Generate unique order ID if not provided
      const orderId = order._id || order.id || `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate receipt
      const receiptContent = `
=== ARTISAN HUB ORDER RECEIPT ===

Product: ${product.title}
Artist: ${product.artist}
Category: ${product.category}
Price: $${product.price}

Order ID: ${orderId}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

Customer Information:
Status: Order Confirmed
Payment Method: Digital Payment
Processing Time: 3-5 business days

IMPORTANT:
- The artisan has been notified of your order
- You will receive updates on order status
- For questions, contact support@artisanhub.com

Thank you for supporting traditional artisans!

=== ARTISAN HUB ===
Connecting traditional artisans with art lovers worldwide.
      `;

      const blob = new Blob([receiptContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ArtisanHub_Order_${product.title.replace(/\s+/g, '_')}_${orderId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(orderResponse.message || 'Order confirmed! Receipt downloaded successfully!');
      
      // Emit order event for real-time updates
      window.dispatchEvent(new CustomEvent('orderPlaced', { 
        detail: { productId: product.id, artistName: product.artist, orderId: orderId }
      }));
      
    } catch (error) {
      console.error('Error processing order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process order. Please try again.';
      toast.error(errorMessage);
    }
  };

  if (!isOpen) return null;

  // Use createPortal to render modal outside of the card's DOM hierarchy
  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl transform transition-all duration-300">
        <div className="relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all shadow-lg"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Product Image - Full Width */}
          <div className="relative h-96 overflow-hidden rounded-t-2xl">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>

          {/* Product Content */}
          <div className="p-8">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h2>
                <p className="text-lg text-gray-600 mb-4">by {product.artist}</p>
                
                <div className="flex items-center space-x-4 mb-4">
                  <span className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold">
                    {product.category}
                  </span>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
                      </svg>
                      <span>{product.likes} likes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                      </svg>
                      <span>{product.views || Math.floor(Math.random() * 100) + 20} views</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Section */}
              <div className="lg:text-right">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 mb-4">
                  ${product.price}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">About This Artwork</h3>
              <p className="text-gray-600 leading-relaxed text-lg">{product.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={generateReceipt}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl duration-300"
              >
                🛍️ Order Now - ${product.price}
              </button>
              
              <button
                onClick={onClose}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-4 px-8 rounded-xl font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
              >
                Continue Browsing
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-amber-600">{product.likes}</div>
                  <div className="text-sm text-gray-500">People liked this</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-600">100%</div>
                  <div className="text-sm text-gray-500">Authentic handmade</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ProductCard({ 
  id, 
  title, 
  artist, 
  category, 
  price, 
  image, 
  description, 
  likes,
  isFavorite: _isFavorite = false, // Unused but kept for interface compatibility
  isLiked: initialIsLiked = false,
  views = 0
}: ProductCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(likes);
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like products');
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      const response = await productAPI.likeProduct(id);
      
      if (response.success) {
        setIsLiked(response.data.liked);
        setLikeCount(response.data.likesCount);
        toast.success(response.data.liked ? 'Product liked!' : 'Product unliked!');
      }
    } catch (error: any) {
      console.error('Error liking product:', error);
      toast.error(error.message || 'Failed to like product');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    setShowModal(true);
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
            crossOrigin="anonymous"
            onError={(e) => {
              console.error('Image failed to load:', image);
              e.currentTarget.src = 'https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=500';
            }}
          />        {/* Overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-white text-sm line-clamp-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              {description}
            </p>
          </div>
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg transform -translate-x-2 group-hover:translate-x-0 transition-transform duration-300">
            {category}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleLike}
          disabled={loading}
          className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 disabled:opacity-50 ${
            isLiked 
              ? 'bg-red-500 text-white shadow-lg' 
              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
          }`}
        >
          <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-amber-700 transition-colors duration-300">
              {title}
            </h3>
            <p className="text-gray-600 text-sm">by {artist}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
              ${price}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1 hover:text-red-500 transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
              </svg>
              <span>{likeCount}</span>
            </div>
          </div>
          
          <button 
            onClick={handleViewDetails}
            className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-amber-700 hover:to-orange-700 transition-all transform hover:scale-105 shadow-md hover:shadow-lg duration-300"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Product Details Modal */}
      <ProductDetailsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        product={{
          id,
          title,
          artist,
          category,
          price,
          image,
          description,
          likes: likeCount,
          views
        }}
      />
    </div>
  );
}

export default ProductCard;