const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const aiService = require('../services/aiService');

const createProduct = async (req, res, next) => {
  try {
    const { title, description, category, price, techniques, materials, dimensions, weight } = req.body;

    const productData = {
      title,
      description,
      category,
      price: parseFloat(price),
      artist: req.user._id,
      artistName: req.user.name,
      techniques: techniques ? JSON.parse(techniques) : [],
      materials: materials ? JSON.parse(materials) : [],
      dimensions: dimensions ? JSON.parse(dimensions) : null,
      weight: weight ? JSON.parse(weight) : null
    };

    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path
      }));
    }

    const aiDescription = await aiService.generateProductDescription(productData);
    const aiTags = await aiService.generateTags(productData);

    if (aiDescription || aiTags.length > 0) {
      productData.aiGenerated = {
        description: aiDescription,
        tags: aiTags
      };
    }

    const product = await Product.create(productData);

    await product.populate('artist', 'name email userType avatar');

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;

    const queryObj = { isAvailable: true };

    if (req.query.category) {
      queryObj.category = req.query.category;
    }

    if (req.query.search) {
      queryObj.$text = { $search: req.query.search };
    }

    if (req.query.minPrice || req.query.maxPrice) {
      queryObj.price = {};
      if (req.query.minPrice) queryObj.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) queryObj.price.$lte = parseFloat(req.query.maxPrice);
    }

    if (req.query.artist) {
      queryObj.artist = req.query.artist;
    }

    let sortBy = {};
    if (req.query.sortBy) {
      const sortField = req.query.sortBy;
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sortBy[sortField] = sortOrder;
    } else {
      sortBy = { createdAt: -1 };
    }

    const products = await Product.find(queryObj)
      .populate('artist', 'name avatar userType isVerified')
      .sort(sortBy)
      .limit(limit)
      .skip(startIndex);

    const total = await Product.countDocuments(queryObj);

    const pagination = {};
    if (startIndex + limit < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pagination,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('artist', 'name email avatar bio location userType isVerified followers')
      .populate('likes.user', 'name avatar');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.incrementViews();

    const similarProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isAvailable: true
    })
      .limit(4)
      .populate('artist', 'name avatar');

    res.status(200).json({
      success: true,
      data: {
        product,
        similarProducts
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.artist.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    const updateData = { ...req.body };

    if (req.body.techniques) {
      updateData.techniques = JSON.parse(req.body.techniques);
    }
    if (req.body.materials) {
      updateData.materials = JSON.parse(req.body.materials);
    }
    if (req.body.dimensions) {
      updateData.dimensions = JSON.parse(req.body.dimensions);
    }
    if (req.body.weight) {
      updateData.weight = JSON.parse(req.body.weight);
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path
      }));
      updateData.images = [...product.images, ...newImages];
    }

    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('artist', 'name email avatar userType');

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.artist.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const likeProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const existingLike = product.likes.find(
      like => like.user.toString() === req.user._id.toString()
    );

    if (existingLike) {
      product.likes = product.likes.filter(
        like => like.user.toString() !== req.user._id.toString()
      );
    } else {
      product.likes.push({ user: req.user._id });
    }

    await product.save();

    res.status(200).json({
      success: true,
      data: {
        liked: !existingLike,
        likesCount: product.likes.length
      }
    });
  } catch (error) {
    next(error);
  }
};

const addToFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const existingFavorite = user.favorites.find(
      fav => fav.toString() === product._id.toString()
    );

    if (existingFavorite) {
      user.favorites = user.favorites.filter(
        fav => fav.toString() !== product._id.toString()
      );
    } else {
      user.favorites.push(product._id);
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        favorited: !existingFavorite,
        message: existingFavorite ? 'Removed from favorites' : 'Added to favorites'
      }
    });
  } catch (error) {
    next(error);
  }
};

const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true, isAvailable: true })
      .populate('artist', 'name avatar userType')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

const generateAIContent = async (req, res, next) => {
  try {
    const { productId, contentType } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.artist.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to generate content for this product'
      });
    }

    const aiContent = await aiService.generateMarketingContent(product, contentType);

    if (!aiContent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate AI content'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        content: aiContent,
        contentType
      }
    });
  } catch (error) {
    next(error);
  }
};

const getProductAnalytics = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.artist.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view analytics for this product'
      });
    }

    const analytics = {
      views: product.views,
      likes: product.likes.length,
      daysSincePosted: Math.floor((Date.now() - product.createdAt) / (1000 * 60 * 60 * 24))
    };

    const aiAnalysis = await aiService.analyzeProductPerformance(product, analytics);

    res.status(200).json({
      success: true,
      data: {
        analytics,
        aiAnalysis
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get artist products with order counts
const getArtistProducts = async (req, res, next) => {
  try {
    const artistId = req.user._id;
    
    // Get all products for the artist
    const products = await Product.find({ artist: artistId })
      .populate('artist', 'name email')
      .sort({ createdAt: -1 });

    // Get order counts for each product
    const productsWithOrderCounts = await Promise.all(
      products.map(async (product) => {
        const orderCount = await Order.countDocuments({ product: product._id });
        return {
          ...product.toObject(),
          orderCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: productsWithOrderCounts,
      count: productsWithOrderCounts.length
    });
  } catch (error) {
    next(error);
  }
};

// Generate AI product description
const generateAIDescription = async (req, res, next) => {
  try {
    const { title, category, description, materials, techniques } = req.body;
    
    const productData = {
      title,
      category, 
      description,
      materials: materials ? (Array.isArray(materials) ? materials : materials.split(',')) : [],
      techniques: techniques ? (Array.isArray(techniques) ? techniques : techniques.split(',')) : []
    };

    const aiDescription = await aiService.generateProductDescription(productData);
    
    if (!aiDescription) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate AI description'
      });
    }

    res.status(200).json({
      success: true,
      data: { description: aiDescription }
    });
  } catch (error) {
    next(error);
  }
};

// Generate AI price suggestion
const generateAIPriceSuggestion = async (req, res, next) => {
  try {
    const { title, category, description, materials, dimensions } = req.body;
    
    // Get similar products for comparison
    const similarProducts = await Product.find({ 
      category: category,
      _id: { $ne: req.body.excludeId } 
    }).limit(5);

    const productData = {
      title,
      category,
      description,
      materials: materials ? (Array.isArray(materials) ? materials : materials.split(',')) : [],
      dimensions
    };

    const priceSuggestion = await aiService.suggestPrice(productData, similarProducts);
    
    if (!priceSuggestion) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate price suggestion'
      });
    }

    res.status(200).json({
      success: true,
      data: { priceSuggestion }
    });
  } catch (error) {
    next(error);
  }
};

// Generate AI tags
const generateAITags = async (req, res, next) => {
  try {
    const { title, category, description } = req.body;
    
    const productData = { title, category, description };
    const tags = await aiService.generateTags(productData);
    
    res.status(200).json({
      success: true,
      data: { tags }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  likeProduct,
  addToFavorites,
  getFeaturedProducts,
  generateAIContent,
  generateAIDescription,
  generateAIPriceSuggestion,
  generateAITags,
  getProductAnalytics,
  getArtistProducts
};