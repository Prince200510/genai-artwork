const Product = require('../models/Product');
const User = require('../models/User');
const aiService = require('../services/aiService');

const getRecommendations = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    
    const userPreferences = {
      categories: user.favorites.map(fav => fav.category),
      likedProducts: user.favorites.map(fav => fav._id.toString()),
      priceRange: req.query.priceRange || 'all'
    };

    const allProducts = await Product.find({ 
      isAvailable: true,
      artist: { $ne: req.user._id }
    })
      .populate('artist', 'name avatar')
      .sort({ likes: -1, views: -1 })
      .limit(50);

    const aiSuggestions = await aiService.generateArtworkSuggestions(userPreferences, allProducts);

    const recommendedProducts = allProducts.slice(0, 8);

    res.status(200).json({
      success: true,
      data: {
        products: recommendedProducts,
        aiSuggestions,
        userPreferences
      }
    });
  } catch (error) {
    next(error);
  }
};

const getSimilarProducts = async (req, res, next) => {
  try {
    const currentProduct = await Product.findById(req.params.id);
    
    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const allProducts = await Product.find({
      _id: { $ne: currentProduct._id },
      isAvailable: true
    }).populate('artist', 'name avatar');

    const similarIds = await aiService.recommendSimilarProducts(currentProduct, allProducts);

    const similarProducts = allProducts.filter(product => 
      similarIds.includes(product._id.toString())
    ).slice(0, 4);

    if (similarProducts.length < 4) {
      const additionalProducts = await Product.find({
        category: currentProduct.category,
        _id: { $ne: currentProduct._id, $nin: similarProducts.map(p => p._id) },
        isAvailable: true
      })
        .populate('artist', 'name avatar')
        .limit(4 - similarProducts.length);
      
      similarProducts.push(...additionalProducts);
    }

    res.status(200).json({
      success: true,
      data: similarProducts
    });
  } catch (error) {
    next(error);
  }
};

const getTrendingProducts = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const trendingProducts = await Product.find({
      createdAt: { $gte: thirtyDaysAgo },
      isAvailable: true
    })
      .populate('artist', 'name avatar userType')
      .sort({ 
        likes: -1, 
        views: -1,
        createdAt: -1 
      })
      .limit(12);

    res.status(200).json({
      success: true,
      data: trendingProducts
    });
  } catch (error) {
    next(error);
  }
};

const getTopArtists = async (req, res, next) => {
  try {
    const topArtists = await User.aggregate([
      {
        $match: { 
          userType: 'artisan'
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'artist',
          as: 'products'
        }
      },
      {
        $addFields: {
          totalLikes: {
            $sum: {
              $map: {
                input: '$products',
                as: 'product',
                in: { $size: '$$product.likes' }
              }
            }
          },
          totalViews: {
            $sum: '$products.views'
          },
          totalProducts: { $size: '$products' }
        }
      },
      {
        $match: {
          totalProducts: { $gte: 1 }
        }
      },
      {
        $sort: {
          totalLikes: -1,
          totalViews: -1,
          'followers.length': -1
        }
      },
      {
        $limit: 10
      },
      {
        $project: {
          name: 1,
          avatar: 1,
          bio: 1,
          location: 1,
          isVerified: 1,
          totalLikes: 1,
          totalViews: 1,
          totalProducts: 1,
          followersCount: { $size: '$followers' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: topArtists
    });
  } catch (error) {
    next(error);
  }
};

const getAIInsights = async (req, res, next) => {
  try {
    const { category, priceRange, timeframe } = req.query;

    const matchConditions = { isAvailable: true };
    
    if (category && category !== 'all') {
      matchConditions.category = category;
    }
    
    if (priceRange && priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      matchConditions.price = { $gte: min, $lte: max };
    }

    let dateFilter = {};
    if (timeframe) {
      const now = new Date();
      switch (timeframe) {
        case 'week':
          dateFilter = { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) };
          break;
        case 'month':
          dateFilter = { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) };
          break;
        case 'year':
          dateFilter = { $gte: new Date(now - 365 * 24 * 60 * 60 * 1000) };
          break;
      }
      if (Object.keys(dateFilter).length > 0) {
        matchConditions.createdAt = dateFilter;
      }
    }

    const insights = await Product.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          averagePrice: { $avg: '$price' },
          totalLikes: { $sum: { $size: '$likes' } },
          totalViews: { $sum: '$views' },
          categories: { $addToSet: '$category' },
          priceRange: {
            $push: {
              min: { $min: '$price' },
              max: { $max: '$price' }
            }
          }
        }
      }
    ]);

    const categoryStats = await Product.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averagePrice: { $avg: '$price' },
          totalLikes: { $sum: { $size: '$likes' } },
          averageLikes: { $avg: { $size: '$likes' } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const marketInsights = insights[0] || {};
    
    const aiAnalysis = `
      Market Analysis Summary:
      - Total Products: ${marketInsights.totalProducts || 0}
      - Average Price: $${(marketInsights.averagePrice || 0).toFixed(2)}
      - Most Popular Category: ${categoryStats[0]?._id || 'N/A'}
      - Total Engagement: ${(marketInsights.totalLikes || 0) + (marketInsights.totalViews || 0)} interactions
      
      Trending Categories: ${categoryStats.slice(0, 3).map(cat => cat._id).join(', ')}
      
      Price Recommendations: Based on current market trends, products in the $${Math.floor(marketInsights.averagePrice * 0.8)}-$${Math.floor(marketInsights.averagePrice * 1.2)} range show optimal engagement.
    `;

    res.status(200).json({
      success: true,
      data: {
        marketInsights,
        categoryStats,
        aiAnalysis,
        filters: { category, priceRange, timeframe }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getPersonalizedFeed = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites following');
    
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const followingIds = user.following.map(f => f._id);
    const likedCategories = [...new Set(user.favorites.map(fav => fav.category))];

    const scoringPipeline = [
      {
        $match: {
          isAvailable: true,
          artist: { $ne: req.user._id }
        }
      },
      {
        $addFields: {
          score: {
            $add: [
              { $cond: [{ $in: ['$artist', followingIds] }, 10, 0] },
              { $cond: [{ $in: ['$category', likedCategories] }, 5, 0] },
              { $multiply: [{ $size: '$likes' }, 0.1] },
              { $multiply: ['$views', 0.01] },
              {
                $cond: [
                  { $gte: ['$createdAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                  2,
                  0
                ]
              }
            ]
          }
        }
      },
      { $sort: { score: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'artist',
          foreignField: '_id',
          as: 'artist'
        }
      },
      {
        $unwind: '$artist'
      },
      {
        $project: {
          title: 1,
          description: 1,
          category: 1,
          price: 1,
          images: 1,
          likes: 1,
          views: 1,
          createdAt: 1,
          score: 1,
          'artist.name': 1,
          'artist.avatar': 1,
          'artist.userType': 1,
          'artist.isVerified': 1
        }
      }
    ];

    const personalizedProducts = await Product.aggregate(scoringPipeline);

    res.status(200).json({
      success: true,
      data: personalizedProducts,
      meta: {
        page,
        limit,
        userPreferences: {
          followingCount: followingIds.length,
          favoriteCategories: likedCategories
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
  getSimilarProducts,
  getTrendingProducts,
  getTopArtists,
  getAIInsights,
  getPersonalizedFeed
};