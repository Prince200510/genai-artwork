import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import { productAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Product {
  _id: string;
  title: string;
  artistName: string;
  category: string;
  price: number;
  images: Array<{ filename: string; path: string }>;
  description: string;
  likes: Array<any>;
  views: number;
  createdAt: string;
  artist: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

function ProductListing() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const categories = ['All', 'Pottery', 'Textiles', 'Woodwork', 'Jewelry', 'Paintings', 'Sculptures', 'Metalwork', 'Ceramics'];

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy, searchTerm, page]);

  useEffect(() => {
    // Listen for product creation events
    const handleProductCreated = () => {
      setPage(1);
      fetchProducts();
    };

    window.addEventListener('productCreated', handleProductCreated);
    
    return () => {
      window.removeEventListener('productCreated', handleProductCreated);
    };
  }, []);

  // Listen for product creation events
  useEffect(() => {
    const handleProductCreated = () => {
      // Reset to first page and refetch
      setPage(1);
      fetchProducts();
    };

    // Listen for custom event
    window.addEventListener('productCreated', handleProductCreated);
    
    return () => {
      window.removeEventListener('productCreated', handleProductCreated);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {
        page: page.toString(),
        limit: '12'
      };

      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      // Map frontend sort options to backend parameters
      switch (sortBy) {
        case 'newest':
          params.sortBy = 'createdAt';
          params.sortOrder = 'desc';
          break;
        case 'price-low':
          params.sortBy = 'price';
          params.sortOrder = 'asc';
          break;
        case 'price-high':
          params.sortBy = 'price';
          params.sortOrder = 'desc';
          break;
        case 'popular':
          params.sortBy = 'views';
          params.sortOrder = 'desc';
          break;
      }

      const response = await productAPI.getProducts(params);
      
      if (response.success) {
        if (page === 1) {
          setProducts(response.data);
        } else {
          setProducts(prev => [...prev, ...response.data]);
        }
        setTotalProducts(response.data?.length || 0);
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setSearchTerm('');
    setPage(1);
  };

  // Transform backend product data to match ProductCard expected format
  const transformProduct = (product: Product) => ({
    id: product._id,
    title: product.title,
    artist: product.artistName || product.artist?.name,
    category: product.category,
    price: product.price,
    image: product.images?.[0] ? `https://genai-artowork-b.onrender.com/uploads/products/${product.images[0].filename}` : 'https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=500',
    description: product.description,
    likes: product.likes?.length || 0,
    views: product.views || 0,
    isLiked: user ? product.likes?.some((like: any) => like.user === user._id) : false
  });

  const filteredProducts = products;

  return (
    <Layout>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-800 via-orange-700 to-red-800 mb-4">
              Artisan Marketplace
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover unique handcrafted pieces from talented artisans around the world
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 transform hover:scale-105 transition-all duration-300">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              {/* Search Bar */}
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-hover:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search artworks or artists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all hover:border-amber-300 hover:shadow-md"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="group">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all hover:border-amber-300 hover:shadow-md group-hover:bg-amber-50"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Category Filters */}
            <div className="mt-6">
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-100 text-gray-700 hover:bg-amber-100 hover:text-amber-700 hover:shadow-md'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mb-8">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-amber-700">{filteredProducts.length}</span> artworks
              {selectedCategory !== 'All' && (
                <span> in <span className="font-semibold text-amber-700">{selectedCategory}</span></span>
              )}
            </p>
          </div>

          {/* Loading State */}
          {loading && page === 1 && (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading artworks...</p>
            </div>
          )}

          {/* Product Grid */}
          {!loading || page > 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product, index) => (
                <div
                  key={product._id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard {...transformProduct(product)} />
                </div>
              ))}
            </div>
          ) : null}

          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No artworks found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
              <button
                onClick={resetFilters}
                className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-amber-700 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl duration-300"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Load More Button */}
          {!loading && filteredProducts.length > 0 && products.length < totalProducts && (
            <div className="text-center mt-12">
              <button 
                onClick={handleLoadMore}
                disabled={loading}
                className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-amber-700 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Load More Artworks'}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </Layout>
  );
}

export default ProductListing;