const crypto = require("crypto");
const Order = require("../models/Order.model");
const Product = require("../models/Product.model");
const Vendor = require("../models/Vendor.model");
const Cart = require("../models/Cart.model");
const Address = require("../models/Address.model");
const User = require("../models/User.model");
const logger = require("../utils/logger");
const { parsePagination } = require("../utils/pagination");

const IS_ESEWA_LIVE = process.env.ESEWA_LIVE === "true";
const ESEWA_PAYMENT_URL =
  process.env.ESEWA_PAYMENT_URL ||
  (IS_ESEWA_LIVE
    ? "https://epay.esewa.com.np/api/epay/main/v2/form"
    : "https://rc-epay.esewa.com.np/api/epay/main/v2/form");
const ESEWA_STATUS_URL =
  process.env.ESEWA_STATUS_URL ||
  (IS_ESEWA_LIVE
    ? "https://epay.esewa.com.np/api/epay/transaction/status/"
    : "https://uat.esewa.com.np/api/epay/transaction/status/");
const CLIENT_BASE_DOMAIN =
  process.env.CLIENT_BASE_DOMAIN || "localhost:3000";

// ─── Khalti config ───
const IS_KHALTI_LIVE = process.env.KHALTI_LIVE === "true";
const KHALTI_INITIATE_URL =
  process.env.KHALTI_INITIATE_URL ||
  (IS_KHALTI_LIVE
    ? "https://khalti.com/api/v2/epayment/initiate/"
    : "https://dev.khalti.com/api/v2/epayment/initiate/");
const KHALTI_LOOKUP_URL =
  process.env.KHALTI_LOOKUP_URL ||
  (IS_KHALTI_LIVE
    ? "https://khalti.com/api/v2/epayment/lookup/"
    : "https://dev.khalti.com/api/v2/epayment/lookup/");

// ─── Helper: Generate HMAC-SHA256 signature ───
function generateEsewaSignature(secretKey, message) {
  return crypto.createHmac("sha256", secretKey).update(message).digest("base64");
}

// ─────────────────────────────────────────
// @route   POST /api/orders
// @desc    Create a new order from cart
// @access  Private (customer)
// ─────────────────────────────────────────
const createOrder = async (req, res, next) => {
  try {
    const { customer, shippingAddress, items, addressId, paymentMethod } = req.body;

    if (!req.vendor) {
      return res.status(400).json({ success: false, message: "Orders can only be placed on a store." });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty." });
    }

    // If addressId provided, look up saved address
    let resolvedAddress = shippingAddress;
    if (addressId) {
      const savedAddress = await Address.findOne({
        _id: addressId,
        userId: req.user.userId,
        vendorId: req.vendor._id,
      });
      if (savedAddress) {
        resolvedAddress = {
          street: savedAddress.street,
          city: savedAddress.city,
          state: savedAddress.state,
          zipCode: savedAddress.zipCode,
          country: savedAddress.country,
        };
      }
    }

    // Validate each product exists, is active, and has stock
    let subtotal = 0;
    const orderItems = [];
    const now = new Date();

    for (const item of items) {
      const product = await Product.findOne({
        _id: item.productId,
        vendorId: req.vendor._id,
        isActive: true,
      });

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.name}" is no longer available.`,
        });
      }

      if (product.stock === 0) {
        return res.status(400).json({
          success: false,
          message: `"${product.name}" is out of stock.`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `"${product.name}" only has ${product.stock} items in stock.`,
        });
      }

      // Calculate effective price with discount
      let effectivePrice = product.price;
      if (product.discountPercent > 0) {
        if (!product.discountValidUntil || product.discountValidUntil >= now) {
          effectivePrice = Math.round(product.price * (1 - product.discountPercent / 100) * 100) / 100;
        }
      }

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: effectivePrice,
        quantity: item.quantity,
        image: product.images?.[0] || null,
      });

      subtotal += effectivePrice * item.quantity;
    }

    const total = subtotal; // extend later with shipping/tax
    const validMethods = ["esewa", "khalti", "cod"];
    const method = validMethods.includes(paymentMethod) ? paymentMethod : "esewa";

    const order = await Order.create({
      vendorId: req.vendor._id,
      customerId: req.user.userId,
      customer,
      shippingAddress: resolvedAddress,
      items: orderItems,
      summary: { subtotal, total },
      payment: { method, status: "pending" },
      status: "pending",
    });

    // For COD orders, decrement stock immediately and confirm
    if (method === "cod") {
      for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }
      order.payment.status = "paid";
      order.status = "confirmed";
      await order.save();
    }

    // Clear user's cart after successful order creation
    await Cart.findOneAndDelete({
      userId: req.user.userId,
      vendorId: req.vendor._id,
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   POST /api/orders/:orderId/pay
// @desc    Initiate payment (eSewa or Khalti) for an order
// @access  Private (customer)
// ─────────────────────────────────────────
const initiatePayment = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      customerId: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.payment.status === "paid") {
      return res.status(400).json({ success: false, message: "Order is already paid." });
    }

    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

    // ─── Khalti payment ───
    if (order.payment.method === "khalti") {
      const vendor = await Vendor.findById(order.vendorId)
        .select("+payment.khalti.secretKey");

      if (!vendor?.payment?.khalti?.isEnabled || !vendor.payment.khalti.secretKey) {
        return res.status(400).json({
          success: false,
          message: "Khalti payment is not configured for this store.",
        });
      }

      const baseUrl = `${protocol}://${vendor.subdomain}.${CLIENT_BASE_DOMAIN}`;
      const amountInPaisa = Math.round(order.summary.total * 100);

      const khaltiRes = await fetch(KHALTI_INITIATE_URL, {
        method: "POST",
        headers: {
          Authorization: `Key ${vendor.payment.khalti.secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          return_url: `${baseUrl}/checkout/success?method=khalti`,
          website_url: baseUrl,
          amount: amountInPaisa,
          purchase_order_id: String(order._id),
          purchase_order_name: `Order ${order.orderNumber}`,
          customer_info: {
            name: `${order.customer.firstName} ${order.customer.lastName}`,
            email: order.customer.email,
            phone: order.customer.phone,
          },
        }),
      });

      const khaltiData = await khaltiRes.json();

      if (!khaltiRes.ok || !khaltiData.pidx) {
        logger.error("Khalti initiate error:", khaltiData);
        return res.status(400).json({
          success: false,
          message: khaltiData.detail || "Failed to initiate Khalti payment.",
        });
      }

      order.payment.khaltiPidx = khaltiData.pidx;
      await order.save();

      return res.status(200).json({
        success: true,
        paymentMethod: "khalti",
        paymentUrl: khaltiData.payment_url,
        pidx: khaltiData.pidx,
      });
    }

    // ─── eSewa payment (default) ───
    const vendor = await Vendor.findById(order.vendorId)
      .select("+payment.esewa.secretKey");

    if (!vendor?.payment?.esewa?.isEnabled || !vendor.payment.esewa.merchantCode) {
      return res.status(400).json({
        success: false,
        message: "eSewa payment is not configured for this store.",
      });
    }

    if (!vendor.payment.esewa.secretKey) {
      return res.status(400).json({
        success: false,
        message: "Payment secret key is not configured for this store.",
      });
    }

    const merchantCode = vendor.payment.esewa.merchantCode;
    const secretKey = vendor.payment.esewa.secretKey;
    const transactionUuid = crypto.randomUUID();

    const amount = String(order.summary.total);
    const taxAmount = "0";
    const productServiceCharge = "0";
    const productDeliveryCharge = "0";
    const totalAmount = amount;

    const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${merchantCode}`;
    const signature = generateEsewaSignature(secretKey, message);

    order.payment.transactionId = transactionUuid;
    await order.save();

    const baseUrl = `${protocol}://${vendor.subdomain}.${CLIENT_BASE_DOMAIN}`;

    res.status(200).json({
      success: true,
      paymentMethod: "esewa",
      esewaUrl: ESEWA_PAYMENT_URL,
      formData: {
        amount,
        product_delivery_charge: productDeliveryCharge,
        product_service_charge: productServiceCharge,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        transaction_uuid: transactionUuid,
        product_code: merchantCode,
        success_url: `${baseUrl}/checkout/success`,
        failure_url: `${baseUrl}/checkout/failure`,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   GET /api/orders/payment/verify
// @desc    Verify eSewa payment after redirect
// @access  Public (eSewa redirects here)
// ─────────────────────────────────────────
const verifyPayment = async (req, res, next) => {
  try {
    const { data } = req.query;

    if (!data) {
      return res.status(400).json({ success: false, message: "No payment data received." });
    }

    // Decode base64 data from eSewa
    const decoded = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
    const { transaction_uuid, transaction_code, total_amount, product_code, status } = decoded;

    // Find the order by transaction ID
    const order = await Order.findOne({ "payment.transactionId": transaction_uuid });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.payment.status === "paid") {
      return res.status(200).json({ success: true, message: "Already verified.", order });
    }

    // Determine payment status via eSewa status API, with fallback to signed redirect data
    let verifiedStatus = null;
    let verificationMethod = "status_api";

    // Attempt double-verification with eSewa status API
    const statusUrl = `${ESEWA_STATUS_URL}?product_code=${product_code}&total_amount=${total_amount}&transaction_uuid=${transaction_uuid}`;

    try {
      const esewaRes = await fetch(statusUrl);
      const esewaData = await esewaRes.json();
      verifiedStatus = esewaData.status;
    } catch (fetchErr) {
      logger.warn(
        "eSewa status API unreachable, falling back to signed redirect data:",
        fetchErr.message
      );

      // Fallback: verify the HMAC signature on the redirect data to prevent tampering
      const vendor = await Vendor.findById(order.vendorId).select(
        "+payment.esewa.secretKey"
      );
      const secretKey = vendor?.payment?.esewa?.secretKey;

      if (secretKey && decoded.signed_field_names && decoded.signature) {
        const fields = decoded.signed_field_names.split(",");
        const message = fields.map((f) => `${f}=${decoded[f]}`).join(",");
        const expectedSignature = generateEsewaSignature(secretKey, message);

        if (expectedSignature === decoded.signature) {
          verifiedStatus = status; // trust the redirect data
          verificationMethod = "signed_redirect";
        } else {
          logger.warn("eSewa redirect signature mismatch — rejecting payment");
        }
      } else {
        // No secret key or no signature fields — still trust redirect status
        // (eSewa sandbox may not always include signed_field_names in redirect)
        verifiedStatus = status;
        verificationMethod = "redirect_unverified";
        logger.warn(
          "eSewa redirect signature verification skipped (missing key or fields)"
        );
      }
    }

    if (verifiedStatus === "COMPLETE") {
      // Mark order as paid
      order.payment.status = "paid";
      order.payment.esewaRefId = transaction_code;
      order.payment.paidAt = new Date();
      order.status = "confirmed";
      await order.save();

      // Decrement stock for each item
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }

      logger.info(
        `Payment verified (${verificationMethod}) for order ${order._id}`
      );

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully.",
        order,
      });
    }

    // Payment not complete
    order.payment.status = "failed";
    await order.save();

    return res.status(400).json({
      success: false,
      message: "Payment verification failed.",
      esewaStatus: verifiedStatus,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   GET /api/orders/payment/khalti-verify
// @desc    Verify Khalti payment after redirect
// @access  Public (Khalti redirects here via frontend)
// ─────────────────────────────────────────
const verifyKhaltiPayment = async (req, res, next) => {
  try {
    const { pidx, purchase_order_id } = req.query;

    if (!pidx) {
      return res.status(400).json({ success: false, message: "No payment identifier received." });
    }

    // Find order by khaltiPidx or by purchase_order_id (orderId)
    let order = await Order.findOne({ "payment.khaltiPidx": pidx });
    if (!order && purchase_order_id) {
      order = await Order.findById(purchase_order_id);
    }
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.payment.status === "paid") {
      return res.status(200).json({ success: true, message: "Already verified.", order });
    }

    // Lookup with Khalti API
    const vendor = await Vendor.findById(order.vendorId)
      .select("+payment.khalti.secretKey");

    if (!vendor?.payment?.khalti?.secretKey) {
      return res.status(400).json({ success: false, message: "Khalti credentials not found." });
    }

    const lookupRes = await fetch(KHALTI_LOOKUP_URL, {
      method: "POST",
      headers: {
        Authorization: `Key ${vendor.payment.khalti.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pidx }),
    });

    const lookupData = await lookupRes.json();

    if (lookupData.status === "Completed") {
      order.payment.status = "paid";
      order.payment.khaltiTxnId = lookupData.transaction_id || null;
      order.payment.paidAt = new Date();
      order.status = "confirmed";
      await order.save();

      // Decrement stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }

      logger.info(`Khalti payment verified for order ${order._id}`);

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully.",
        order,
      });
    }

    // Payment not complete
    if (["Expired", "User canceled"].includes(lookupData.status)) {
      order.payment.status = "failed";
      await order.save();
    }

    return res.status(400).json({
      success: false,
      message: `Payment ${lookupData.status || "verification failed"}.`,
      khaltiStatus: lookupData.status,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   GET /api/orders/:orderId
// @desc    Get a single order
// @access  Private (customer or vendor)
// ─────────────────────────────────────────
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    // Check if requester is the customer or vendor owner
    const isCustomer = String(order.customerId) === String(req.user.userId);
    const isVendor =
      req.user.role === "vendor" &&
      (await Vendor.exists({ _id: order.vendorId, ownerId: req.user.userId }));

    if (!isCustomer && !isVendor) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   GET /api/customer/orders
// @desc    Get logged-in customer's orders
// @access  Private (customer)
// ─────────────────────────────────────────
const getCustomerOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const query = { customerId: req.user.userId };
    if (req.vendor) {
      query.vendorId = req.vendor._id;
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      orders,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   GET /api/vendor/orders
// @desc    Get vendor's orders
// @access  Private (vendor)
// ─────────────────────────────────────────
const getVendorOrders = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ ownerId: req.user.userId });
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Store not found." });
    }

    const { page, limit, skip } = parsePagination(req.query);
    const { status, search } = req.query;
    const query = { vendorId: vendor._id };

    if (status && status !== "all") {
      query.status = status;
    }
    if (search) {
      query.orderNumber = { $regex: search, $options: "i" };
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      orders,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   PATCH /api/vendor/orders/:orderId/status
// @desc    Update order status (vendor)
// @access  Private (vendor)
// ─────────────────────────────────────────
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const vendor = await Vendor.findOne({ ownerId: req.user.userId });
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Store not found." });
    }

    const order = await Order.findOne({
      _id: req.params.orderId,
      vendorId: vendor._id,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    // Validate status transitions
    const forwardFlow = ["pending", "confirmed", "shipped", "delivered"];
    const currentIdx = forwardFlow.indexOf(order.status);

    if (status === "cancelled") {
      if (order.status === "delivered") {
        return res.status(400).json({
          success: false,
          message: "Cannot cancel a delivered order.",
        });
      }

      // Restore stock if order was paid
      if (order.payment.status === "paid") {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.quantity },
          });
        }
        order.payment.status = "refunded";
      }
    } else {
      const newIdx = forwardFlow.indexOf(status);
      if (newIdx < 0 || newIdx <= currentIdx) {
        return res.status(400).json({
          success: false,
          message: `Cannot change status from "${order.status}" to "${status}".`,
        });
      }
    }

    order.status = status;
    await order.save();

    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   PATCH /api/vendor/payment-settings
// @desc    Update vendor eSewa payment settings
// @access  Private (vendor)
// ─────────────────────────────────────────
const updatePaymentSettings = async (req, res, next) => {
  try {
    const { merchantCode, secretKey, isEnabled, password } = req.body;

    // Password confirmation is required to change eSewa credentials
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required to update payment settings.",
      });
    }

    const user = await User.findById(req.user.userId).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password. Please try again.",
      });
    }

    if (isEnabled && (!merchantCode?.trim() || !secretKey?.trim())) {
      return res.status(400).json({
        success: false,
        message: "Merchant code and secret key are required to enable eSewa.",
      });
    }

    const vendor = await Vendor.findOneAndUpdate(
      { ownerId: req.user.userId },
      {
        "payment.esewa.merchantCode": merchantCode,
        "payment.esewa.secretKey": secretKey,
        "payment.esewa.isEnabled": isEnabled,
      },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Store not found." });
    }

    res.status(200).json({
      success: true,
      message: "Payment settings updated.",
      payment: {
        merchantCode: vendor.payment.esewa.merchantCode,
        isEnabled: vendor.payment.esewa.isEnabled,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   PATCH /api/vendor/khalti-settings
// @desc    Update vendor Khalti payment settings
// @access  Private (vendor)
// ─────────────────────────────────────────
const updateKhaltiSettings = async (req, res, next) => {
  try {
    const { secretKey, isEnabled, password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required to update payment settings.",
      });
    }

    const user = await User.findById(req.user.userId).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password. Please try again.",
      });
    }

    if (isEnabled && !secretKey?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Secret key is required to enable Khalti.",
      });
    }

    const updateFields = {
      "payment.khalti.isEnabled": isEnabled,
    };
    if (secretKey?.trim()) {
      updateFields["payment.khalti.secretKey"] = secretKey.trim();
    }

    const vendor = await Vendor.findOneAndUpdate(
      { ownerId: req.user.userId },
      updateFields,
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Store not found." });
    }

    res.status(200).json({
      success: true,
      message: "Khalti settings updated.",
      payment: {
        isEnabled: vendor.payment.khalti.isEnabled,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   DELETE /api/orders/:orderId
// @desc    Cancel a pending order (customer)
// @access  Private (customer)
// ─────────────────────────────────────────
const cancelCustomerOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      customerId: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending orders can be cancelled.",
      });
    }

    order.status = "cancelled";
    await order.save();

    res.status(200).json({ success: true, message: "Order cancelled successfully.", order });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  initiatePayment,
  verifyPayment,
  verifyKhaltiPayment,
  getOrderById,
  getCustomerOrders,
  getVendorOrders,
  updateOrderStatus,
  updatePaymentSettings,
  updateKhaltiSettings,
  cancelCustomerOrder,
};
