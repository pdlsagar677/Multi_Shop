const Vendor = require("../models/Vendor.model");
const User = require("../models/User.model");
const { generateTempPassword } = require("../utils/generateTokens");
const { sendVendorWelcomeEmail } = require("../utils/sendEmail");
const THEMES = require("../config/themes");

// ─────────────────────────────────────────
// @route   POST /api/admin/vendors
// @desc    Super admin creates a new vendor
// @access  Private (superadmin only)
// ─────────────────────────────────────────
const createVendor = async (req, res, next) => {
  try {
    const { name, email, storeName, subdomain, plan, phone, theme, template } = req.body;

    // Validate theme
    const selectedTheme = THEMES[theme] || THEMES["sunrise"];

    // Check email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    // Check subdomain already taken
    const existingVendor = await Vendor.findOne({ subdomain: subdomain.toLowerCase() });
    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: "This subdomain is already taken. Please choose another.",
      });
    }

    // Generate temp password
    const tempPassword = generateTempPassword();

    // Create vendor user account
    const vendorUser = await User.create({
      name,
      email,
      phone: phone || null,
      password: tempPassword,
      role: "vendor",
      isVerified: true,    // superadmin created them — no email verify needed
      isFirstLogin: true,  // force password change on first login
      isActive: true,
    });

    // Create vendor store with selected theme
    const vendor = await Vendor.create({
      storeName,
      subdomain: subdomain.toLowerCase(),
      ownerId: vendorUser._id,
      theme: theme || "sunrise",
      template: template || "template1",
      contact: { email, phone: phone || null },
      subscription: { plan: plan || "basic", status: "active" },
      createdBy: req.user.userId,
    });

    // Link vendorId back to the user
    vendorUser.vendorId = vendor._id;
    await vendorUser.save();

    // Send welcome email with temp password + store URL + theme
    await sendVendorWelcomeEmail({
      name,
      email,
      tempPassword,
      storeName,
      subdomain: subdomain.toLowerCase(),
      theme: theme || "sunrise",
    });

    res.status(201).json({
      success: true,
      message: `Vendor "${storeName}" created successfully. Credentials sent to ${email}.`,
      vendor: {
        _id: vendor._id,
        storeName: vendor.storeName,
        subdomain: vendor.subdomain,
        storeUrl: `http://${vendor.subdomain}.localhost:3000`,
        plan: vendor.subscription.plan,
        theme: vendor.theme,
        ownerEmail: email,
        ownerName: name,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   GET /api/admin/vendors
// @desc    Get all vendors
// @access  Private (superadmin only)
// ─────────────────────────────────────────
const getAllVendors = async (req, res, next) => {
  try {
    const vendors = await Vendor.find()
      .populate("ownerId", "name email phone lastLogin isActive")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vendors.length,
      vendors,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   GET /api/admin/vendors/:id
// @desc    Get single vendor details
// @access  Private (superadmin only)
// ─────────────────────────────────────────
const getVendorById = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate("ownerId", "name email phone lastLogin isActive")
      .populate("createdBy", "name email");

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    res.status(200).json({
      success: true,
      vendor: {
        ...vendor.toObject(),
        storeUrl: `http://${vendor.subdomain}.localhost:3000`,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   PATCH /api/admin/vendors/:id/toggle
// @desc    Activate or deactivate a vendor
// @access  Private (superadmin only)
// ─────────────────────────────────────────
const toggleVendorStatus = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    vendor.isActive = !vendor.isActive;
    await vendor.save();

    // Also toggle vendor user account
    await User.findByIdAndUpdate(vendor.ownerId, { isActive: vendor.isActive });

    res.status(200).json({
      success: true,
      message: `Vendor ${vendor.isActive ? "activated" : "deactivated"} successfully`,
      isActive: vendor.isActive,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   DELETE /api/admin/vendors/:id
// @desc    Delete vendor and their account
// @access  Private (superadmin only)
// ─────────────────────────────────────────
const deleteVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    await User.findByIdAndDelete(vendor.ownerId);
    await Vendor.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Vendor and associated account deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   GET /api/store/:subdomain
// @desc    Public — get vendor store config by subdomain
// @access  Public (storefront use)
// ─────────────────────────────────────────
const getStoreBySubdomain = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({
      subdomain: req.params.subdomain,
      isActive: true,
    }).select("storeName subdomain branding contact subscription.plan theme template payment.esewa.merchantCode payment.esewa.isEnabled payment.khalti.isEnabled");

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Store not found or inactive" });
    }

    // Merge theme colors into branding so the storefront can use them directly
    const themeColors = THEMES[vendor.theme] || THEMES["sunrise"];
    const store = vendor.toObject();
    store.branding = {
      ...store.branding,
      primaryColor: themeColors.primaryColor,
      secondaryColor: themeColors.secondaryColor,
      accentColor: themeColors.accentColor,
      bgColor: themeColors.bgColor,
      navBg: themeColors.navBg,
      navText: themeColors.navText,
      buttonBg: themeColors.buttonBg,
      buttonText: themeColors.buttonText,
      borderColor: themeColors.borderColor,
    };

    res.status(200).json({ success: true, store });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createVendor,
  getAllVendors,
  getVendorById,
  toggleVendorStatus,
  deleteVendor,
  getStoreBySubdomain,
};