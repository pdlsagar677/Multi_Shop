const cloudinary = require("../config/cloudinary");

// Upload a single buffer to Cloudinary
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

// Delete image from Cloudinary by public_id
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // Silently fail — image may already be deleted
  }
};

// Extract public_id from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  // URL format: https://res.cloudinary.com/xxx/image/upload/v123/folder/filename.ext
  const parts = url.split("/upload/");
  if (parts.length < 2) return null;
  const path = parts[1].replace(/^v\d+\//, ""); // remove version
  return path.replace(/\.[^/.]+$/, ""); // remove extension
};

module.exports = { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl };
