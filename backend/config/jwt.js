const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
      isVerified: user.isVerified
    }
  });
};

module.exports = { generateToken, sendTokenResponse };