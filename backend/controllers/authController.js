const User = require('../models/User');
const { sendTokenResponse } = require('../config/jwt');

const register = async (req, res, next) => {
  try {
    const { name, email, password, userType } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      userType
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    console.log('updateProfile called with body:', req.body);
    console.log('User ID:', req.user.id);
    // If body arrived as a raw string (e.g. due to text/plain header), parse it
    if (typeof req.body === 'string') {
      try {
        const parsed = JSON.parse(req.body);
        req.body = parsed;
        console.log('Parsed raw string body -> JSON object:', parsed);
      } catch (err) {
        console.log('ERROR parsing raw string body as JSON');
        return res.status(400).json({ success: false, message: 'Invalid JSON payload' });
      }
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('WARNING: Empty (or unparsable) req.body detected. Headers:', req.headers);
      return res.status(400).json({ success: false, message: 'No profile data received by server' });
    }
    
    const fieldsToUpdate = {
      name: req.body.name,
      bio: req.body.bio,
      location: req.body.location,
      fullName: req.body.fullName,
      age: typeof req.body.age === 'string' ? parseInt(req.body.age) : req.body.age,
      skills: req.body.skills,
      experienceLevel: req.body.experienceLevel,
      aiProfileSummary: req.body.aiProfileSummary
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    // Check if profile is being completed - require all essential fields
    if (req.body.fullName && req.body.age && req.body.skills && req.body.experienceLevel) {
      fieldsToUpdate.profileCompleted = true;
      console.log('Setting profileCompleted to true');
    } else {
      console.log('Profile not complete. Missing fields:', {
        fullName: !!req.body.fullName,
        age: !!req.body.age,
        skills: !!req.body.skills,
        experienceLevel: !!req.body.experienceLevel
      });
    }

    const updatableKeys = Object.keys(fieldsToUpdate);
    if (updatableKeys.length === 0) {
      return res.status(400).json({ success: false, message: 'No updatable profile fields found in request' });
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    console.log('Updated user:', user);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const followUser = async (req, res, next) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (userToFollow._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already following this user'
      });
    }

    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({
      success: true,
      message: 'User followed successfully'
    });
  } catch (error) {
    next(error);
  }
};

const unfollowUser = async (req, res, next) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!currentUser.following.includes(userToUnfollow._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not following this user'
      });
    }

    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userToUnfollow._id.toString()
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== currentUser._id.toString()
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.status(200).json({
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  getProfile,
  updateProfile,
  followUser,
  unfollowUser
};