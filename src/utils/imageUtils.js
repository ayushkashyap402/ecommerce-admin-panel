/**
 * Convert file to base64 string
 * @param {File} file - Image file from input
 * @returns {Promise<string>} - Base64 encoded string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result);
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Convert multiple files to base64 strings
 * @param {FileList|Array<File>} files - Array of image files
 * @returns {Promise<Array<string>>} - Array of base64 encoded strings
 */
export const filesToBase64 = async (files) => {
  const fileArray = Array.from(files);
  const base64Promises = fileArray.map(file => fileToBase64(file));
  return Promise.all(base64Promises);
};

/**
 * Validate image file
 * @param {File} file - Image file
 * @param {number} maxSizeMB - Maximum file size in MB (default: 5MB)
 * @returns {Object} - { valid: boolean, error: string }
 */
export const validateImageFile = (file, maxSizeMB = 5) => {
  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' };
  }

  // Check file size
  const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
  if (file.size > maxSize) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  return { valid: true, error: null };
};

/**
 * Validate multiple image files
 * @param {FileList|Array<File>} files - Array of image files
 * @param {number} maxSizeMB - Maximum file size in MB
 * @returns {Object} - { valid: boolean, errors: Array<string> }
 */
export const validateImageFiles = (files, maxSizeMB = 5) => {
  const fileArray = Array.from(files);
  const errors = [];

  fileArray.forEach((file, index) => {
    const validation = validateImageFile(file, maxSizeMB);
    if (!validation.valid) {
      errors.push(`File ${index + 1}: ${validation.error}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Compress and convert image to base64
 * @param {File} file - Image file
 * @param {number} maxWidth - Maximum width (default: 1920)
 * @param {number} maxHeight - Maximum height (default: 1920)
 * @param {number} quality - Image quality 0-1 (default: 0.8)
 * @returns {Promise<string>} - Compressed base64 string
 */
export const compressImageToBase64 = (file, maxWidth = 1920, maxHeight = 1920, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64
        const base64 = canvas.toDataURL(file.type, quality);
        resolve(base64);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target.result;
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Compress multiple images to base64
 * @param {FileList|Array<File>} files - Array of image files
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @param {number} quality - Image quality 0-1
 * @returns {Promise<Array<string>>} - Array of compressed base64 strings
 */
export const compressImagesToBase64 = async (files, maxWidth = 1920, maxHeight = 1920, quality = 0.8) => {
  const fileArray = Array.from(files);
  const compressPromises = fileArray.map(file => 
    compressImageToBase64(file, maxWidth, maxHeight, quality)
  );
  return Promise.all(compressPromises);
};

/**
 * Create image preview URL from file
 * @param {File} file - Image file
 * @returns {string} - Object URL for preview
 */
export const createPreviewUrl = (file) => {
  return URL.createObjectURL(file);
};

/**
 * Revoke image preview URL to free memory
 * @param {string} url - Object URL to revoke
 */
export const revokePreviewUrl = (url) => {
  URL.revokeObjectURL(url);
};
