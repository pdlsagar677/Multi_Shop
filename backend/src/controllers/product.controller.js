const Product = require("../models/Product.model");
const Vendor = require("../models/Vendor.model");
const cloudinary = require("../config/cloudinary");

// Helper — upload a single buffer to Cloudinary
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

// Helper — delete image from Cloudinary by public_id
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // Silently fail — image may already be deleted
  }
};

// Helper — extract public_id from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  // URL format: https://res.cloudinary.com/xxx/image/upload/v123/folder/filename.ext
  const parts = url.split("/upload/");
  if (parts.length < 2) return null;
  const path = parts[1].replace(/^v\d+\//, ""); // remove version
  return path.replace(/\.[^/.]+$/, ""); // remove extension
};

// ─────────────────────────────────────────
// VENDOR-SIDE CONTROLLERS (authenticated)
// ─────────────────────────────────────────

// @route   GET /api/vendor/products
// @desc    Get all products for the logged-in vendor
// @access  Private (vendor only)
const getVendorProducts = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ ownerId: req.user.userId });
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor store not found" });
    }

    const { search, page = 1, limit = 10 } = req.query;
    const query = { vendorId: vendor._id };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      products,
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/vendor/products/:id
// @desc    Get single product by ID (vendor only)
// @access  Private (vendor only)
const getVendorProductById = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ ownerId: req.user.userId });
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor store not found" });
    }

    const product = await Product.findOne({ _id: req.params.id, vendorId: vendor._id });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/vendor/products
// @desc    Create a new product with image uploads
// @access  Private (vendor only)
const createProduct = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ ownerId: req.user.userId });
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor store not found" });
    }

    const { name, description, price, compareAtPrice, category, stock, sku } = req.body;

    // Upload images to Cloudinary
    const images = [];
    if (req.files && req.files.length > 0) {
      const folder = `multi-tenant/${vendor.subdomain}/products`;
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, folder);
        images.push(result.url);
      }
    }

    const product = await Product.create({
      name,
      description,
      price,
      compareAtPrice: compareAtPrice || undefined,
      category,
      images,
      stock: stock || 0,
      sku,
      vendorId: vendor._id,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/vendor/products/:id
// @desc    Update a product (with optional new images)
// @access  Private (vendor only)
const updateProduct = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ ownerId: req.user.userId });
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor store not found" });
    }

    const product = await Product.findOne({ _id: req.params.id, vendorId: vendor._id });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const { name, description, price, compareAtPrice, category, stock, sku, existingImages } = req.body;

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (compareAtPrice !== undefined) product.compareAtPrice = compareAtPrice;
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (sku !== undefined) product.sku = sku;

    // Handle images: keep existing ones + add new uploads
    // existingImages = JSON array string of URLs to keep
    let keepImages = [];
    if (existingImages) {
      keepImages = typeof existingImages === "string" ? JSON.parse(existingImages) : existingImages;
    }

    // Delete removed images from Cloudinary
    const removedImages = product.images.filter((url) => !keepImages.includes(url));
    for (const url of removedImages) {
      const publicId = getPublicIdFromUrl(url);
      if (publicId) await deleteFromCloudinary(publicId);
    }

    // Upload new images
    const newImages = [];
    if (req.files && req.files.length > 0) {
      const folder = `multi-tenant/${vendor.subdomain}/products`;
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, folder);
        newImages.push(result.url);
      }
    }

    product.images = [...keepImages, ...newImages];
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /api/vendor/products/:id
// @desc    Delete a product and its images
// @access  Private (vendor only)
const deleteProduct = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ ownerId: req.user.userId });
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor store not found" });
    }

    const product = await Product.findOne({ _id: req.params.id, vendorId: vendor._id });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Delete all product images from Cloudinary
    for (const url of product.images) {
      const publicId = getPublicIdFromUrl(url);
      if (publicId) await deleteFromCloudinary(publicId);
    }

    await Product.findByIdAndDelete(product._id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

// @route   PATCH /api/vendor/products/:id/toggle
// @desc    Toggle product active status
// @access  Private (vendor only)
const toggleProductStatus = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ ownerId: req.user.userId });
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor store not found" });
    }

    const product = await Product.findOne({ _id: req.params.id, vendorId: vendor._id });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product ${product.isActive ? "activated" : "deactivated"} successfully`,
      isActive: product.isActive,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// STOREFRONT-SIDE CONTROLLERS (public)
// ─────────────────────────────────────────

// @route   GET /api/store/:subdomain/products
// @desc    Get active products for a store
// @access  Public
const getStoreProducts = async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;
    const query = { vendorId: req.vendor._id, isActive: true };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category) {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      products,
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/store/:subdomain/products/:id
// @desc    Get single active product from store
// @access  Public
const getStoreProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      vendorId: req.vendor._id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getVendorProducts,
  getVendorProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getStoreProducts,
  getStoreProductById,
};
