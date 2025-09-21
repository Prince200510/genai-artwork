const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    enum: ['post', 'blog', 'video'],
    default: 'post'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  images: [{
    filename: String,
    originalname: String,
    mimetype: String,
    size: Number,
    path: String
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  tags: [String],
  isPublished: {
    type: Boolean,
    default: true
  },
  aiGenerated: {
    isAI: {
      type: Boolean,
      default: false
    },
    prompt: String,
    generatedAt: Date
  }
}, {
  timestamps: true
});

postSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

postSchema.virtual('commentsCount').get(function() {
  return this.comments.length;
});

postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ contentType: 1, isPublished: 1 });

module.exports = mongoose.model('Post', postSchema);