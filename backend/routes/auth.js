const express = require('express');
const {
  register,
  login,
  getMe,
  getProfile,
  updateProfile,
  followUser,
  unfollowUser
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadAvatar, handleUploadError } = require('../config/upload');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/profile/avatar', protect, uploadAvatar, handleUploadError, updateProfile);
router.put('/profile/data/v2', protect, updateProfile);
router.post('/follow/:id', protect, followUser);
router.delete('/follow/:id', protect, unfollowUser);

module.exports = router;