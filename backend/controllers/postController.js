const Post = require('../models/Post');
const Comment = require('../models/Comment');
const aiService = require('../services/aiService');

const createPost = async (req, res, next) => {
  try {
    const { title, content, contentType, product, tags } = req.body;

    const postData = {
      title,
      content,
      contentType: contentType || 'post',
      author: req.user._id,
      authorName: req.user.name,
      tags: tags ? JSON.parse(tags) : []
    };

    if (product) {
      postData.product = product;
    }

    if (req.files && req.files.length > 0) {
      postData.images = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path
      }));
    }

    const post = await Post.create(postData);

    await post.populate('author', 'name avatar userType isVerified');
    if (post.product) {
      await post.populate('product', 'title images price category');
    }

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const queryObj = { isPublished: true };

    if (req.query.contentType) {
      queryObj.contentType = req.query.contentType;
    }

    if (req.query.author) {
      queryObj.author = req.query.author;
    }

    if (req.query.search) {
      queryObj.$text = { $search: req.query.search };
    }

    const posts = await Post.find(queryObj)
      .populate('author', 'name avatar userType isVerified')
      .populate('product', 'title images price category')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name avatar'
        },
        options: { limit: 3, sort: { createdAt: -1 } }
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await Post.countDocuments(queryObj);

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name avatar bio userType isVerified followers')
      .populate('product', 'title images price category artist')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name avatar userType'
        },
        options: { sort: { createdAt: -1 } }
      })
      .populate('likes.user', 'name avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    const updateData = { ...req.body };

    if (req.body.tags) {
      updateData.tags = JSON.parse(req.body.tags);
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path
      }));
      updateData.images = [...post.images, ...newImages];
    }

    post = await Post.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('author', 'name avatar userType');

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await Comment.deleteMany({ post: post._id });
    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const existingLike = post.likes.find(
      like => like.user.toString() === req.user._id.toString()
    );

    if (existingLike) {
      post.likes = post.likes.filter(
        like => like.user.toString() !== req.user._id.toString()
      );
    } else {
      post.likes.push({ user: req.user._id });
    }

    await post.save();

    res.status(200).json({
      success: true,
      data: {
        liked: !existingLike,
        likesCount: post.likes.length
      }
    });
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { content, parentComment } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const commentData = {
      content,
      author: req.user._id,
      authorName: req.user.name,
      post: post._id
    };

    if (parentComment) {
      commentData.parentComment = parentComment;
    }

    const comment = await Comment.create(commentData);

    await comment.populate('author', 'name avatar userType');

    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, {
        $push: { replies: comment._id }
      });
    } else {
      await Post.findByIdAndUpdate(post._id, {
        $push: { comments: comment._id }
      });
    }

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

const generateAIPostContent = async (req, res, next) => {
  try {
    const { productId, contentType, prompt } = req.body;

    let productData = {};

    if (productId) {
      const Product = require('../models/Product');
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

      productData = product;
    } else {
      productData = {
        title: req.body.title || 'My Artwork',
        category: req.body.category || 'Traditional Art',
        description: req.body.description || prompt,
        price: req.body.price || 0
      };
    }

    const aiContent = await aiService.generateMarketingContent(productData, contentType);

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
        contentType,
        aiGenerated: {
          isAI: true,
          prompt: prompt || `Generate ${contentType} content for ${productData.title}`,
          generatedAt: new Date()
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  generateAIPostContent
};