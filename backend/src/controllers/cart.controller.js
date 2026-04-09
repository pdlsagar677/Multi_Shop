const Cart = require("../models/Cart.model");
const Product = require("../models/Product.model");

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    if (!req.vendor) {
      return res.status(400).json({ success: false, message: "Must be on a store subdomain" });
    }

    if (req.user.role !== "customer") {
      return res.status(403).json({ success: false, message: "Only customers can add items to cart" });
    }

    const { productId, quantity = 1 } = req.body;
    const userId = req.user.userId;
    const vendorId = req.vendor._id;

    const product = await Product.findOne({ _id: productId, vendorId, isActive: true });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (product.stock === 0) {
      return res.status(400).json({ success: false, message: `"${product.name}" is out of stock` });
    }

    let cart = await Cart.findOne({ userId, vendorId });

    if (!cart) {
      const qty = Math.min(quantity, product.stock);
      cart = await Cart.create({ userId, vendorId, items: [{ productId, quantity: qty }] });
    } else {
      const existingItem = cart.items.find((i) => i.productId.toString() === productId);
      if (existingItem) {
        const newQty = Math.min(existingItem.quantity + quantity, product.stock);
        existingItem.quantity = newQty;
      } else {
        cart.items.push({ productId, quantity: Math.min(quantity, product.stock) });
      }
      await cart.save();
    }

    // Return populated cart
    cart = await Cart.findById(cart._id).populate({
      path: "items.productId",
      select: "name price compareAtPrice images stock discountPercent discountValidUntil isActive isFeatured",
    });

    res.status(200).json({ success: true, message: "Item added to cart", cart });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/cart
// @desc    Get user's cart for current vendor
// @access  Private
const getCart = async (req, res, next) => {
  try {
    if (!req.vendor) {
      return res.status(400).json({ success: false, message: "Must be on a store subdomain" });
    }

    let cart = await Cart.findOne({
      userId: req.user.userId,
      vendorId: req.vendor._id,
    }).populate({
      path: "items.productId",
      select: "name price compareAtPrice images stock discountPercent discountValidUntil isActive isFeatured",
    });

    if (!cart) {
      return res.status(200).json({ success: true, cart: { items: [] } });
    }

    // Filter out items whose products are deleted or inactive
    const validItems = cart.items.filter((i) => i.productId && i.productId.isActive);
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    res.status(200).json({ success: true, cart });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/cart
// @desc    Update item quantity in cart
// @access  Private
const updateQuantity = async (req, res, next) => {
  try {
    if (!req.vendor) {
      return res.status(400).json({ success: false, message: "Must be on a store subdomain" });
    }

    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({
      userId: req.user.userId,
      vendorId: req.vendor._id,
    });

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const item = cart.items.find((i) => i.productId.toString() === productId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not in cart" });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.productId.toString() !== productId);
    } else {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      item.quantity = Math.min(quantity, product.stock);
    }

    await cart.save();

    const populated = await Cart.findById(cart._id).populate({
      path: "items.productId",
      select: "name price compareAtPrice images stock discountPercent discountValidUntil isActive isFeatured",
    });

    res.status(200).json({ success: true, cart: populated });
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /api/cart/item/:productId
// @desc    Remove an item from cart
// @access  Private
const removeItem = async (req, res, next) => {
  try {
    if (!req.vendor) {
      return res.status(400).json({ success: false, message: "Must be on a store subdomain" });
    }

    const cart = await Cart.findOne({
      userId: req.user.userId,
      vendorId: req.vendor._id,
    });

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    cart.items = cart.items.filter((i) => i.productId.toString() !== req.params.productId);
    await cart.save();

    const populated = await Cart.findById(cart._id).populate({
      path: "items.productId",
      select: "name price compareAtPrice images stock discountPercent discountValidUntil isActive isFeatured",
    });

    res.status(200).json({ success: true, message: "Item removed", cart: populated });
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    if (!req.vendor) {
      return res.status(400).json({ success: false, message: "Must be on a store subdomain" });
    }

    await Cart.findOneAndDelete({
      userId: req.user.userId,
      vendorId: req.vendor._id,
    });

    res.status(200).json({ success: true, message: "Cart cleared" });
  } catch (err) {
    next(err);
  }
};

module.exports = { addToCart, getCart, updateQuantity, removeItem, clearCart };
