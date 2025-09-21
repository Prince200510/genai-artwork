const express = require('express');
const {
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
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { uploadProductImages, handleUploadError } = require('../config/upload');

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, authorize('artisan'), uploadProductImages, handleUploadError, createProduct);

router.get('/featured', getFeaturedProducts);
router.get('/artist/my-products', protect, authorize('artisan'), getArtistProducts);

router.route('/:id')
  .get(getProduct)
  .put(protect, authorize('artisan'), uploadProductImages, handleUploadError, updateProduct)
  .delete(protect, authorize('artisan'), deleteProduct);

router.post('/:id/like', protect, likeProduct);
router.post('/:id/favorite', protect, addToFavorites);

router.post('/ai/generate-content', protect, authorize('artisan'), generateAIContent);
router.post('/ai/generate-description', protect, authorize('artisan'), generateAIDescription);
router.post('/ai/generate-price', protect, authorize('artisan'), generateAIPriceSuggestion);
router.post('/ai/generate-tags', protect, authorize('artisan'), generateAITags);
router.get('/:id/analytics', protect, authorize('artisan'), getProductAnalytics);

module.exports = router;