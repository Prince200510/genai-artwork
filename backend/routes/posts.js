const express = require('express');
const {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  generateAIPostContent
} = require('../controllers/postController');
const { protect, authorize } = require('../middleware/auth');
const { uploadPostImages, handleUploadError } = require('../config/upload');

const router = express.Router();

router.route('/')
  .get(getPosts)
  .post(protect, uploadPostImages, handleUploadError, createPost);

router.route('/:id')
  .get(getPost)
  .put(protect, uploadPostImages, handleUploadError, updatePost)
  .delete(protect, deletePost);

router.post('/:id/like', protect, likePost);
router.post('/:id/comments', protect, addComment);

router.post('/ai/generate-content', protect, authorize('artisan'), generateAIPostContent);

module.exports = router;