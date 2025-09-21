const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Pottery', 'Textiles', 'Woodwork', 'Jewelry', 'Paintings', 'Sculptures', 'Metalwork', 'Ceramics']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    filename: String,
    originalname: String,
    mimetype: String,
    size: Number,
    path: String
  }],
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  artistName: {
    type: String,
    required: true
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  aiGenerated: {
    description: String,
    tags: [String],
    suggestedPrice: Number,
    marketingContent: String
  },
  techniques: [String],
  materials: [String],
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'in', 'mm'],
      default: 'cm'
    }
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['g', 'kg', 'oz', 'lb'],
      default: 'kg'
    }
  }
}, {
  timestamps: true
});

productSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

productSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

productSchema.index({ title: 'text', description: 'text', category: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ artist: 1, createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);