const Address = require("../models/Address.model");

// @route   POST /api/addresses
// @desc    Add a new address (max 3 per user per vendor)
// @access  Private
const addAddress = async (req, res, next) => {
  try {
    if (!req.vendor) {
      return res.status(400).json({ success: false, message: "Address must be created on a store subdomain" });
    }

    const userId = req.user.userId;
    const vendorId = req.vendor._id;

    const count = await Address.countDocuments({ userId, vendorId });
    if (count >= 3) {
      return res.status(400).json({ success: false, message: "Maximum 3 addresses allowed per store" });
    }

    const { street, city, state, zipCode, country, phone, label, isDefault } = req.body;

    // If this is the first address or explicitly set as default, handle default logic
    if (isDefault || count === 0) {
      await Address.updateMany({ userId, vendorId }, { isDefault: false });
    }

    const address = await Address.create({
      userId,
      vendorId,
      street,
      city,
      state,
      zipCode,
      country,
      phone,
      label,
      isDefault: isDefault || count === 0,
    });

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      address,
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/addresses
// @desc    Get all addresses for current user + vendor
// @access  Private
const getAddresses = async (req, res, next) => {
  try {
    if (!req.vendor) {
      return res.status(400).json({ success: false, message: "Must be on a store subdomain" });
    }

    const addresses = await Address.find({
      userId: req.user.userId,
      vendorId: req.vendor._id,
    }).sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({ success: true, count: addresses.length, addresses });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/addresses/:id
// @desc    Update an address
// @access  Private
const updateAddress = async (req, res, next) => {
  try {
    if (!req.vendor) {
      return res.status(400).json({ success: false, message: "Must be on a store subdomain" });
    }

    const address = await Address.findOne({
      _id: req.params.id,
      userId: req.user.userId,
      vendorId: req.vendor._id,
    });

    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    const { street, city, state, zipCode, country, phone, label, isDefault } = req.body;

    if (isDefault && !address.isDefault) {
      await Address.updateMany(
        { userId: req.user.userId, vendorId: req.vendor._id },
        { isDefault: false }
      );
    }

    if (street !== undefined) address.street = street;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (zipCode !== undefined) address.zipCode = zipCode;
    if (country !== undefined) address.country = country;
    if (phone !== undefined) address.phone = phone;
    if (label !== undefined) address.label = label;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await address.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address,
    });
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /api/addresses/:id
// @desc    Delete an address
// @access  Private
const deleteAddress = async (req, res, next) => {
  try {
    if (!req.vendor) {
      return res.status(400).json({ success: false, message: "Must be on a store subdomain" });
    }

    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
      vendorId: req.vendor._id,
    });

    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    // If deleted address was default, make the most recent one default
    if (address.isDefault) {
      const nextDefault = await Address.findOne({
        userId: req.user.userId,
        vendorId: req.vendor._id,
      }).sort({ createdAt: -1 });

      if (nextDefault) {
        nextDefault.isDefault = true;
        await nextDefault.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { addAddress, getAddresses, updateAddress, deleteAddress };
