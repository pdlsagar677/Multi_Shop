const User = require("../models/User.model");
const Vendor = require("../models/Vendor.model");
const Order = require("../models/Order.model");
const { parsePagination } = require("../utils/pagination");

// ─────────────────────────────────────────
// @route   GET /api/vendor/customers
// @desc    Get all customers of the vendor's store
// @access  Private (vendor only)
// ─────────────────────────────────────────
const getVendorCustomers = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ ownerId: req.user.userId });
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Store not found." });
    }

    const { page, limit, skip } = parsePagination(req.query);
    const { search, status } = req.query;
    const query = { vendorId: vendor._id, role: "customer" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (status === "active") query.isActive = true;
    if (status === "inactive") query.isActive = false;

    const total = await User.countDocuments(query);
    const customers = await User.find(query)
      .select("-password -refreshToken -verificationToken -verificationTokenExpiry")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get order counts and totals for each customer
    const customerIds = customers.map((c) => c._id);
    const orderStats = await Order.aggregate([
      {
        $match: {
          vendorId: vendor._id,
          customerId: { $in: customerIds },
          "payment.status": "paid",
        },
      },
      {
        $group: {
          _id: "$customerId",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$summary.total" },
        },
      },
    ]);

    const statsMap = {};
    for (const stat of orderStats) {
      statsMap[stat._id.toString()] = {
        totalOrders: stat.totalOrders,
        totalSpent: stat.totalSpent,
      };
    }

    const customersWithStats = customers.map((c) => {
      const obj = c.toObject();
      const stats = statsMap[c._id.toString()] || { totalOrders: 0, totalSpent: 0 };
      return { ...obj, ...stats };
    });

    res.status(200).json({
      success: true,
      customers: customersWithStats,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   GET /api/vendor/customers/:id
// @desc    Get a single customer detail
// @access  Private (vendor only)
// ─────────────────────────────────────────
const getVendorCustomerById = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ ownerId: req.user.userId });
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Store not found." });
    }

    const customer = await User.findOne({
      _id: req.params.id,
      vendorId: vendor._id,
      role: "customer",
    }).select("-password -refreshToken -verificationToken -verificationTokenExpiry");

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found." });
    }

    // Get order history for this customer
    const orders = await Order.find({
      vendorId: vendor._id,
      customerId: customer._id,
    })
      .sort({ createdAt: -1 })
      .limit(10);

    const orderStats = await Order.aggregate([
      {
        $match: {
          vendorId: vendor._id,
          customerId: customer._id,
          "payment.status": "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$summary.total" },
        },
      },
    ]);

    const stats = orderStats[0] || { totalOrders: 0, totalSpent: 0 };

    res.status(200).json({
      success: true,
      customer: {
        ...customer.toObject(),
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
        recentOrders: orders,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   PUT /api/vendor/customers/:id
// @desc    Edit a customer (name, phone, isActive)
// @access  Private (vendor only)
// ─────────────────────────────────────────
const updateVendorCustomer = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ ownerId: req.user.userId });
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Store not found." });
    }

    const customer = await User.findOne({
      _id: req.params.id,
      vendorId: vendor._id,
      role: "customer",
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found." });
    }

    const { name, phone, isActive } = req.body;

    if (name !== undefined) customer.name = name;
    if (phone !== undefined) customer.phone = phone;
    if (isActive !== undefined) customer.isActive = isActive;

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Customer updated successfully.",
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        isActive: customer.isActive,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   DELETE /api/vendor/customers/:id
// @desc    Delete a customer from the store
// @access  Private (vendor only)
// ─────────────────────────────────────────
const deleteVendorCustomer = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ ownerId: req.user.userId });
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Store not found." });
    }

    const customer = await User.findOne({
      _id: req.params.id,
      vendorId: vendor._id,
      role: "customer",
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found." });
    }

    await User.findByIdAndDelete(customer._id);

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getVendorCustomers,
  getVendorCustomerById,
  updateVendorCustomer,
  deleteVendorCustomer,
};
