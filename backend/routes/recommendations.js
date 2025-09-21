const express = require('express');
const {
  getRecommendations,
  getSimilarProducts,
  getTrendingProducts,
  getTopArtists,
  getAIInsights,
  getPersonalizedFeed
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/products', protect, getRecommendations);
router.get('/products/:id/similar', getSimilarProducts);
router.get('/trending', getTrendingProducts);
router.get('/artists/top', getTopArtists);
router.get('/insights', getAIInsights);
router.get('/feed', protect, getPersonalizedFeed);

module.exports = router;