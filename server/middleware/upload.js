// middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Create upload directories if they don't exist
const createDirectories = () => {
  const dirs = [
    path.join(__dirname, '../uploads'),
    path.join(__dirname, '../uploads/documents'),
    path.join(__dirname, '../uploads/profile')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Call once when the server starts
createDirectories();

// Storage configuration for documents
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/documents'));
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to prevent conflicts
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const extension = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uniqueSuffix}${extension}`);
  }
});

// Storage configuration for profile images
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/profile'));
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to prevent conflicts
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(file.originalname);
    cb(null, `profile-${req.user._id}-${uniqueSuffix}${extension}`);
  }
});

// File filter to check allowed file types
const fileFilter = (req, file, cb) => {
  // Define allowed MIME types
  const allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Text files
    'text/plain',
    'text/csv',
    // Medical imaging
    'application/dicom',
    'image/dicom'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Allowed types: images, PDFs, Office documents, text files, and DICOM files.'), false);
  }
};

// Profile image file filter
const profileFileFilter = (req, file, cb) => {
  // Only allow images for profile pictures
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF) are allowed for profile pictures.'), false);
  }
};

// Create multer instances
const uploadDocument = multer({ 
  storage: documentStorage,
  fileFilter: fileFilter,
  limits: { 
    fileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024 // 5MB default
  }
}).single('file');

const uploadProfileImage = multer({ 
  storage: profileStorage,
  fileFilter: profileFileFilter,
  limits: { 
    fileSize: 2 * 1024 * 1024 // 2MB limit for profile images
  }
}).single('profileImage');

// Middleware wrappers for better error handling
const documentUploadMiddleware = (req, res, next) => {
  uploadDocument(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      } else {
        // A custom error occurred
        return res.status(400).json({ message: err.message });
      }
    }
    next();
  });
};

const profileImageUploadMiddleware = (req, res, next) => {
  uploadProfileImage(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'Image too large. Maximum size is 2MB.' });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      } else {
        // A custom error occurred
        return res.status(400).json({ message: err.message });
      }
    }
    next();
  });
};

module.exports = {
  documentUploadMiddleware,
  profileImageUploadMiddleware
};