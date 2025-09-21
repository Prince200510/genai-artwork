import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import CommentSection from '../components/CommentSection';
import { productAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('product');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState({
    description: false,
    price: false,
    tags: false
  });
  const [aiSuggestions, setAiSuggestions] = useState({
    description: '',
    price: '',
    tags: []
  });
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    images: [] as File[],
    contentType: 'post',
    content: '',
    techniques: '',
    materials: '',
    tags: ''
  });
  const [showPreview, setShowPreview] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const categories = ['Pottery', 'Textiles', 'Woodwork', 'Jewelry', 'Paintings', 'Sculptures', 'Metalwork', 'Ceramics'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      setFormData({
        ...formData,
        images: [...formData.images, ...files]
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData({
        ...formData,
        images: [...formData.images, ...files]
      });
    }
  };

  // AI Helper Functions
  const generateAIDescription = async () => {
    if (!formData.title || !formData.category) {
      toast.error('Please fill in title and category first');
      return;
    }

    setAiLoading(prev => ({ ...prev, description: true }));
    try {
      // Direct API call to avoid import issues
      const API_BASE_URL = 'https://genai-artowork-b.onrender.com/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/products/ai/generate-description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          description: formData.description,
          materials: formData.materials,
          techniques: formData.techniques
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate description');
      }

      setAiSuggestions(prev => ({ 
        ...prev, 
        description: data.data.description 
      }));
      toast.success('AI description generated!');
    } catch (error) {
      console.error('Error generating AI description:', error);
      toast.error('Failed to generate description');
    } finally {
      setAiLoading(prev => ({ ...prev, description: false }));
    }
  };

  const generateAIPrice = async () => {
    if (!formData.title || !formData.category) {
      toast.error('Please fill in title and category first');
      return;
    }

    setAiLoading(prev => ({ ...prev, price: true }));
    try {
      // Direct API call to avoid import issues
      const API_BASE_URL = 'https://genai-artowork-b.onrender.com/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/products/ai/generate-price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          description: formData.description,
          materials: formData.materials,
          techniques: formData.techniques
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate price');
      }

      setAiSuggestions(prev => ({ 
        ...prev, 
        price: data.data.price 
      }));
      toast.success('AI price generated!');
    } catch (error) {
      console.error('Error generating AI price:', error);
      toast.error('Failed to generate price');
    } finally {
      setAiLoading(prev => ({ ...prev, price: false }));
    }
  };  const generateAITags = async () => {
    if (!formData.title || !formData.category) {
      toast.error('Please fill in title and category first');
      return;
    }

    setAiLoading(prev => ({ ...prev, tags: true }));
    try {
      // Direct API call to avoid import issues
      const API_BASE_URL = 'https://genai-artowork-b.onrender.com/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/products/ai/generate-tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          description: formData.description
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate tags');
      }

      const tags = data.data.tags;
      setAiSuggestions(prev => ({ 
        ...prev, 
        tags: tags 
      }));
      setFormData(prev => ({
        ...prev,
        tags: tags.join(', ')
      }));
      toast.success('AI tags generated!');
    } catch (error) {
      console.error('Error generating AI tags:', error);
      toast.error('Failed to generate tags');
    } finally {
      setAiLoading(prev => ({ ...prev, tags: false }));
    }
  };

  const applyAISuggestion = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    toast.success(`AI suggestion applied to ${field}!`);
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      images: newImages
    });
  };

  const generateContent = (type: string) => {
    // Simulate AI content generation
    const templates = {
      post: `🎨 Excited to share my latest ${formData.category.toLowerCase()} creation: "${formData.title}"! 

This piece represents hours of careful craftsmanship using traditional techniques passed down through generations. Each detail tells a story of cultural heritage and artistic passion.

${formData.description}

What do you think? I'd love to hear your thoughts! 

#TraditionalArt #Handmade #${formData.category} #ArtisanCraft`,
      
      blog: `# The Story Behind "${formData.title}"

## Inspiration and Process

Creating this ${formData.category.toLowerCase()} piece was a journey that took me back to my roots in traditional craftsmanship. 

${formData.description}

## Traditional Techniques Used

The creation process involved several time-honored techniques:
- Hand-selected materials sourced locally
- Traditional tools passed down through generations  
- Careful attention to cultural authenticity
- Hours of patient, detailed work

## The Final Result

The finished piece represents not just an artwork, but a bridge between past and present, connecting modern art lovers with ancient traditions.

*What aspects of traditional art resonate most with you? Share your thoughts below!*`,
      
      video: `🎬 VIDEO SCRIPT: "Creating ${formData.title}"

[INTRO - 0:00-0:15]
"Welcome back to my studio! Today I'm excited to show you the creation process of my latest ${formData.category.toLowerCase()} piece..."

[MATERIALS SHOWCASE - 0:15-0:45]  
"Let me first show you the traditional materials I'll be using. Each one has been carefully selected..."

[PROCESS DEMONSTRATION - 0:45-3:00]
"Now let's dive into the actual creation process. This technique has been used for centuries..."

[DETAILED WORK - 3:00-5:00]
"Here's where the magic happens. Notice how I'm using this traditional tool..."

[FINAL REVEAL - 5:00-5:30]
"And here's the finished piece! ${formData.description}"

[OUTRO - 5:30-6:00]
"Thanks for watching! Don't forget to like and subscribe for more traditional art content!"

📝 Video Notes:
- Close-up shots of hands working
- Time-lapse sequences for longer processes  
- Good lighting to show texture and detail
- Background music: Traditional/ambient`
    };
    
    setFormData({
      ...formData,
      content: templates[type as keyof typeof templates] || ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to create a product');
      return;
    }

    if (!formData.title || !formData.category || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      toast.loading('Creating your product...', { id: 'create-product' });

      // Create FormData for file upload
      const productFormData = new FormData();
      productFormData.append('title', formData.title);
      productFormData.append('category', formData.category);
      productFormData.append('description', formData.description);
      
      if (formData.price) {
        productFormData.append('price', formData.price);
      }

      if (formData.techniques) {
        productFormData.append('techniques', JSON.stringify(formData.techniques.split(',').map(t => t.trim())));
      }

      if (formData.materials) {
        productFormData.append('materials', JSON.stringify(formData.materials.split(',').map(m => m.trim())));
      }

      // Add images
      formData.images.forEach((image, index) => {
        productFormData.append('productImages', image);
      });

      const response = await productAPI.createProduct(productFormData);
      
      if (response.success) {
        toast.success('Product created successfully!', { id: 'create-product' });
        
        // Emit custom event to refresh product listing
        window.dispatchEvent(new CustomEvent('productCreated'));
        
        navigate('/products');
      }
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error(error.message || 'Failed to create product', { id: 'create-product' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-800 via-orange-700 to-red-800 mb-4">
              Share Your Art
            </h1>
            <p className="text-xl text-gray-600">
              Showcase your traditional crafts and connect with art lovers worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="space-y-6">
              {/* Tab Navigation */}
              <div className="bg-white rounded-2xl shadow-xl p-2 transform hover:scale-105 transition-all duration-300">
                <div className="flex space-x-1">
                  {[
                    { id: 'product', label: 'Product Info', icon: '🏺' },
                    { id: 'content', label: 'Create Content', icon: '✍️' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                          : 'text-gray-600 hover:bg-amber-50 hover:text-amber-700'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Information Tab */}
              {activeTab === 'product' && (
                <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-all duration-300">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Product Details</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-amber-600 transition-colors">
                        Product Name *
                      </label>
                      <input
                        name="title"
                        type="text"
                        required
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all hover:border-amber-300 hover:shadow-md"
                        placeholder="Enter your artwork name"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-amber-600 transition-colors">
                        Category *
                      </label>
                      <select
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all hover:border-amber-300 hover:shadow-md"
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="group">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700 group-hover:text-amber-600 transition-colors">
                          Description *
                        </label>
                        <button
                          type="button"
                          onClick={generateAIDescription}
                          disabled={aiLoading.description}
                          className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-xs font-semibold hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105 disabled:opacity-50"
                        >
                          {aiLoading.description ? (
                            <>
                              <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></div>
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <span>🤖</span>
                              <span>AI Generate</span>
                            </>
                          )}
                        </button>
                      </div>
                      <textarea
                        name="description"
                        required
                        rows={4}
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all hover:border-amber-300 hover:shadow-md resize-none"
                        placeholder="Describe your artwork, techniques used, inspiration..."
                      />
                      {aiSuggestions.description && (
                        <div className="mt-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-purple-700">🤖 AI Suggestion:</span>
                            <button
                              type="button"
                              onClick={() => applyAISuggestion('description', aiSuggestions.description)}
                              className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 transition-colors"
                            >
                              Use This
                            </button>
                          </div>
                          <p className="text-sm text-gray-700">{aiSuggestions.description}</p>
                        </div>
                      )}
                    </div>

                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-amber-600 transition-colors">
                        Techniques Used
                      </label>
                      <input
                        name="techniques"
                        type="text"
                        value={formData.techniques}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all hover:border-amber-300 hover:shadow-md"
                        placeholder="e.g., Hand weaving, Glazing, Carving (comma separated)"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-amber-600 transition-colors">
                        Materials
                      </label>
                      <input
                        name="materials"
                        type="text"
                        value={formData.materials}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all hover:border-amber-300 hover:shadow-md"
                        placeholder="e.g., Silk, Clay, Wood (comma separated)"
                      />
                    </div>

                    <div className="group">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700 group-hover:text-amber-600 transition-colors">
                          Tags
                        </label>
                        <button
                          type="button"
                          onClick={generateAITags}
                          disabled={aiLoading.tags}
                          className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-xs font-semibold hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 disabled:opacity-50"
                        >
                          {aiLoading.tags ? (
                            <>
                              <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></div>
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <span>🏷️</span>
                              <span>AI Tags</span>
                            </>
                          )}
                        </button>
                      </div>
                      <input
                        name="tags"
                        type="text"
                        value={formData.tags}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all hover:border-amber-300 hover:shadow-md"
                        placeholder="e.g., handmade, traditional, vintage (comma separated)"
                      />
                      {aiSuggestions.tags.length > 0 && (
                        <div className="mt-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
                          <span className="text-sm font-semibold text-orange-700">🏷️ AI Generated Tags:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {aiSuggestions.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs border border-orange-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="group">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700 group-hover:text-amber-600 transition-colors">
                          Price ($)
                        </label>
                        <button
                          type="button"
                          onClick={generateAIPrice}
                          disabled={aiLoading.price}
                          className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-xs font-semibold hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 disabled:opacity-50"
                        >
                          {aiLoading.price ? (
                            <>
                              <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></div>
                              <span>Analyzing...</span>
                            </>
                          ) : (
                            <>
                              <span>💰</span>
                              <span>AI Price</span>
                            </>
                          )}
                        </button>
                      </div>
                      <input
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all hover:border-amber-300 hover:shadow-md"
                        placeholder="Enter price (optional)"
                      />
                      {aiSuggestions.price && (
                        <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-green-700">💰 AI Price Analysis:</span>
                          </div>
                          <div className="text-sm text-gray-700 whitespace-pre-wrap">{aiSuggestions.price}</div>
                        </div>
                      )}
                    </div>

                    {/* Image Upload */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-amber-600 transition-colors">
                        Product Images
                      </label>
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 hover:shadow-lg ${
                          dragActive 
                            ? 'border-amber-500 bg-amber-50 scale-105' 
                            : 'border-gray-300 hover:border-amber-300 hover:bg-amber-50'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <p className="text-gray-600 mb-2">Drag and drop images here, or</p>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileInput}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-amber-700 hover:to-orange-700 transition-all transform hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl duration-300"
                        >
                          Choose Files
                        </label>
                      </div>

                      {/* Image Preview */}
                      {formData.images.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                          {formData.images.map((file, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg shadow-md group-hover:shadow-xl transition-all duration-300"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors transform hover:scale-110 duration-300"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('content')}
                      className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-amber-700 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl duration-300"
                    >
                      Next: Create Content →
                    </button>
                  </form>
                </div>
              )}

              {/* Content Creation Tab */}
              {activeTab === 'content' && (
                <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-all duration-300">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Content</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Content Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Choose Content Type
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { type: 'post', label: 'Social Post', icon: '📱', desc: 'Share on social media' },
                          { type: 'blog', label: 'Blog Article', icon: '📝', desc: 'Detailed story' },
                          { type: 'video', label: 'Video Script', icon: '🎥', desc: 'Video content' }
                        ].map((option) => (
                          <button
                            key={option.type}
                            onClick={() => setFormData({ ...formData, contentType: option.type })}
                            className={`p-4 rounded-lg border-2 text-center transition-all duration-300 transform hover:scale-105 ${
                              formData.contentType === option.type
                                ? 'border-amber-500 bg-gradient-to-br from-amber-100 to-orange-100 shadow-lg'
                                : 'border-gray-300 hover:border-amber-300 hover:bg-amber-50'
                            }`}
                          >
                            <div className="text-2xl mb-2">{option.icon}</div>
                            <div className="font-semibold text-gray-800">{option.label}</div>
                            <div className="text-xs text-gray-600">{option.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* AI Generate Button */}
                    <button
                      type="button"
                      onClick={() => generateContent(formData.contentType)}
                      disabled={!formData.title || !formData.category}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      ✨ Generate AI Content
                    </button>

                    {/* Content Editor */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-amber-600 transition-colors">
                        Content
                      </label>
                      <textarea
                        name="content"
                        rows={12}
                        value={formData.content}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all hover:border-amber-300 hover:shadow-md resize-none font-mono text-sm"
                        placeholder="Your generated content will appear here, or write your own..."
                      />
                    </div>

                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setActiveTab('product')}
                        className="flex-1 border-2 border-amber-600 text-amber-700 py-3 px-6 rounded-lg font-semibold hover:bg-amber-600 hover:text-white transition-all transform hover:scale-105 duration-300"
                      >
                        ← Back to Product
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-amber-700 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Creating...' : 'Create Product'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Preview Section */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-amber-100 via-orange-100 to-red-100 rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Create Your Product</h3>
                <p className="text-gray-600 mb-4">Fill in the product details and submit to share your artwork with the community.</p>
                {formData.title && (
                  <div className="bg-white rounded-lg p-4 mt-4">
                    <h4 className="font-semibold text-gray-800">{formData.title}</h4>
                    <p className="text-sm text-gray-600">{formData.category}</p>
                    {formData.price && <p className="text-amber-600 font-bold">${formData.price}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default CreatePost;