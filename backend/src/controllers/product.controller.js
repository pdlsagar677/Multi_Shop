const Product = require("../models/Product.model");
const Vendor = require("../models/Vendor.model");
const { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } = require("../utils/cloudinary");
const { parsePagination } = require("../utils/pagination");

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

    const { page, limit, skip } = parsePagination(req.query);
    const { search } = req.query;
    const query = { vendorId: vendor._id };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
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

    const { discountPercent, discountValidUntil } = req.body;

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (compareAtPrice !== undefined) product.compareAtPrice = compareAtPrice;
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (sku !== undefined) product.sku = sku;
    if (discountPercent !== undefined) product.discountPercent = Number(discountPercent);
    if (discountValidUntil !== undefined) product.discountValidUntil = discountValidUntil || null;

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

// @route   PATCH /api/vendor/products/:id/feature
// @desc    Toggle featured status (max 10 per vendor)
// @access  Private (vendor only)
const toggleFeatured = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ ownerId: req.user.userId });
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor store not found" });
    }

    const product = await Product.findOne({ _id: req.params.id, vendorId: vendor._id });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (!product.isFeatured) {
      const featuredCount = await Product.countDocuments({ vendorId: vendor._id, isFeatured: true });
      if (featuredCount >= 10) {
        return res.status(400).json({ success: false, message: "Maximum 10 featured products allowed" });
      }
    }

    product.isFeatured = !product.isFeatured;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product ${product.isFeatured ? "marked as featured" : "removed from featured"}`,
      isFeatured: product.isFeatured,
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/vendor/products/low-stock
// @desc    Get products with stock <= 5
// @access  Private (vendor only)
const getLowStockProducts = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ ownerId: req.user.userId });
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor store not found" });
    }

    const products = await Product.find({
      vendorId: vendor._id,
      stock: { $lte: 5 },
      isActive: true,
    }).sort({ stock: 1 });

    res.status(200).json({ success: true, count: products.length, products });
  } catch (err) {
    next(err);
  }
};

// @route   PATCH /api/vendor/products/:id/stock
// @desc    Add stock to a product (increments existing stock)
// @access  Private (vendor only)
const addStock = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ ownerId: req.user.userId });
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor store not found" });
    }

    const product = await Product.findOne({ _id: req.params.id, vendorId: vendor._id });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const { quantity } = req.body;
    const qty = parseInt(quantity);
    if (!qty || qty < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    product.stock += qty;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Added ${qty} units. New stock: ${product.stock}`,
      stock: product.stock,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// STOREFRONT-SIDE CONTROLLERS (public)
// ─────────────────────────────────────────

// @route   GET /api/store/:subdomain/products
// @desc    Get active products for a store (with advanced filters)
// @access  Public
const getStoreProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, category, featured, onSale, minPrice, maxPrice, inStock, sort } = req.query;
    const query = { vendorId: req.vendor._id, isActive: true };

    if (search) {
      const regex = { $regex: search, $options: "i" };
      query.$or = [{ name: regex }, { description: regex }, { category: regex }];
    }

    if (category) query.category = category;

    if (featured === "true") query.isFeatured = true;

    if (onSale === "true") {
      query.discountPercent = { $gt: 0 };
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { discountValidUntil: null },
          { discountValidUntil: { $gte: new Date() } },
        ],
      });
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (inStock === "true") query.stock = { $gt: 0 };

    // Sort options
    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    else if (sort === "price_desc") sortOption = { price: -1 };
    else if (sort === "name_asc") sortOption = { name: 1 };
    else if (sort === "newest") sortOption = { createdAt: -1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
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

// @route   GET /api/store/:subdomain/products/featured
// @desc    Get featured products for a store
// @access  Public
const getStoreFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      vendorId: req.vendor._id,
      isActive: true,
      isFeatured: true,
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({ success: true, count: products.length, products });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/store/:subdomain/categories
// @desc    Get distinct categories for a store
// @access  Public
const getStoreCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct("category", {
      vendorId: req.vendor._id,
      isActive: true,
      category: { $ne: null, $nin: [""] },
    });

    res.status(200).json({ success: true, categories: categories.sort() });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/store/:subdomain/products/search
// @desc    Search products by keyword
// @access  Public
const searchStoreProducts = async (req, res, next) => {
  try {
    const { q } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    if (!q || !q.trim()) {
      return res.status(400).json({ success: false, message: "Search keyword is required" });
    }

    const regex = { $regex: q.trim(), $options: "i" };
    const query = {
      vendorId: req.vendor._id,
      isActive: true,
      $or: [{ name: regex }, { description: regex }, { category: regex }],
    };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      products,
    });
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
  toggleFeatured,
  getLowStockProducts,
  addStock,
  getStoreProducts,
  getStoreProductById,
  getStoreFeaturedProducts,
  getStoreCategories,
  searchStoreProducts,
};
