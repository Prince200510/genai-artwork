const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;
    
    if (file.fieldname === 'productImages') {
      uploadPath = 'uploads/products';
    } else if (file.fieldname === 'postImages') {
      uploadPath = 'uploads/posts';
    } else if (file.fieldname === 'avatar') {
      uploadPath = 'uploads/avatars';
    } else {
      uploadPath = 'uploads/misc';
    }
    
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: process.env.UPLOAD_MAX_SIZE || 5 * 1024 * 1024
  },
  fileFilter: fileFilter
});

const uploadSingle = upload.single('image');
const uploadMultiple = upload.array('images', 5);
const uploadProductImages = upload.array('productImages', 5);
const uploadPostImages = upload.array('postImages', 3);
const uploadAvatar = upload.single('avatar');

const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum allowed is 5.'
      });
    }
  }
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next();
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadProductImages,
  uploadPostImages,
  uploadAvatar,
  handleUploadError
};