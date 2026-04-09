require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const connectDB = require("../config/mongodb");
const Product = require("../models/Product.model");
const Vendor = require("../models/Vendor.model");

// ─────────────────────────────────────────
// USAGE:
//   node src/seeds/products.seed.js <vendor-subdomain>
//   e.g.: node src/seeds/products.seed.js test
//
// This seeds 50 electronics products (featured, discounted, regular, out-of-stock mix)
// Uses free online placeholder images — no Cloudinary needed
// ─────────────────────────────────────────

const IMG = (id) => `https://picsum.photos/seed/prod${id}/600/600`;

const PRODUCTS = [
  // ── FEATURED + DISCOUNT (8 items) ──
  { name: "MacBook Pro 16\" M3 Max", description: "Apple M3 Max chip, 36GB RAM, 1TB SSD. Stunning Liquid Retina XDR display with ProMotion. Up to 22 hours battery life.", price: 249999, compareAtPrice: 279999, category: "Laptops", stock: 12, sku: "LAP-001", isFeatured: true, discountPercent: 10 },
  { name: "Sony WH-1000XM5 Headphones", description: "Industry-leading noise cancellation with Auto NC Optimizer. Crystal clear hands-free calling. 30-hour battery life.", price: 29999, compareAtPrice: 34999, category: "Audio", stock: 45, sku: "AUD-001", isFeatured: true, discountPercent: 15 },
  { name: "Samsung Galaxy S24 Ultra", description: "6.8\" QHD+ Dynamic AMOLED 2X, Snapdragon 8 Gen 3, 200MP camera, built-in S Pen, titanium frame.", price: 134999, compareAtPrice: 149999, category: "Smartphones", stock: 30, sku: "PHN-001", isFeatured: true, discountPercent: 10 },
  { name: "iPad Pro 13\" M4", description: "Ultra Retina XDR OLED display, M4 chip, 256GB. Thinnest Apple product ever. Works with Apple Pencil Pro.", price: 129999, compareAtPrice: 139999, category: "Tablets", stock: 20, sku: "TAB-001", isFeatured: true, discountPercent: 7 },
  { name: "Sony A7 IV Mirrorless Camera", description: "33MP full-frame Exmor R CMOS sensor, 4K 60p video, real-time Eye AF, 10fps burst shooting.", price: 198999, compareAtPrice: 219999, category: "Cameras", stock: 8, sku: "CAM-001", isFeatured: true, discountPercent: 12 },
  { name: "LG C4 65\" OLED TV", description: "4K OLED evo with self-lit pixels, a9 AI Processor Gen7, Dolby Vision & Atmos, webOS 24, 120Hz.", price: 179999, compareAtPrice: 199999, category: "TVs", stock: 6, sku: "TV-001", isFeatured: true, discountPercent: 10 },
  { name: "DJI Mini 4 Pro Drone", description: "Under 249g, 4K/60fps HDR video, omnidirectional obstacle sensing, 34-min flight time, 20km range.", price: 89999, compareAtPrice: 99999, category: "Drones", stock: 15, sku: "DRN-001", isFeatured: true, discountPercent: 10 },
  { name: "Apple Watch Ultra 2", description: "49mm titanium case, precision dual-frequency GPS, 100m water resistance, 36-hour battery, S9 SiP chip.", price: 89999, compareAtPrice: 99999, category: "Wearables", stock: 25, sku: "WRB-001", isFeatured: true, discountPercent: 10 },

  // ── DISCOUNT ONLY — no featured (12 items) ──
  { name: "Bose QuietComfort Ultra Earbuds", description: "Immersive spatial audio, world-class noise cancellation, CustomTune technology, 6-hour battery.", price: 24999, compareAtPrice: 29999, category: "Audio", stock: 60, sku: "AUD-002", discountPercent: 20 },
  { name: "Logitech MX Master 3S Mouse", description: "8K DPI optical sensor, quiet clicks, MagSpeed scroll wheel, USB-C, works on any surface including glass.", price: 8999, compareAtPrice: 10999, category: "Accessories", stock: 100, sku: "ACC-001", discountPercent: 15 },
  { name: "Samsung 980 Pro 2TB SSD", description: "PCIe 4.0 NVMe M.2, read up to 7,000 MB/s, Samsung V-NAND 3-bit MLC. Ideal for gaming and creative work.", price: 14999, compareAtPrice: 18999, category: "Storage", stock: 75, sku: "STR-001", discountPercent: 20 },
  { name: "Anker 737 Power Bank 24000mAh", description: "140W bi-directional charging, smart digital display, PowerIQ 3.0, charges MacBook Pro to 50% in 30min.", price: 9999, compareAtPrice: 12999, category: "Accessories", stock: 40, sku: "ACC-002", discountPercent: 25 },
  { name: "Google Pixel 8a", description: "6.1\" OLED 120Hz, Tensor G3 chip, 64MP camera with Magic Eraser, 7 years of OS updates.", price: 49999, compareAtPrice: 54999, category: "Smartphones", stock: 35, sku: "PHN-002", discountPercent: 10 },
  { name: "Razer BlackWidow V4 Keyboard", description: "Mechanical gaming keyboard, Razer Green switches, Chroma RGB, magnetic wrist rest, media keys.", price: 14999, compareAtPrice: 17999, category: "Gaming", stock: 55, sku: "GMG-001", discountPercent: 15 },
  { name: "JBL Charge 5 Speaker", description: "Portable Bluetooth speaker, IP67 waterproof, 20-hour playtime, built-in powerbank, PartyBoost.", price: 12999, compareAtPrice: 15999, category: "Audio", stock: 70, sku: "AUD-003", discountPercent: 18 },
  { name: "Kindle Paperwhite Signature", description: "6.8\" display, 32GB, wireless charging, auto-adjusting front light, 10 weeks battery, IPX8.", price: 14999, compareAtPrice: 16999, category: "Tablets", stock: 50, sku: "TAB-002", discountPercent: 12 },
  { name: "TP-Link Deco XE75 Mesh WiFi 6E", description: "Tri-band WiFi 6E, 5400 Mbps, covers 5,500 sq ft, AI-driven mesh, 200+ device support.", price: 24999, compareAtPrice: 29999, category: "Networking", stock: 25, sku: "NET-001", discountPercent: 15 },
  { name: "GoPro HERO12 Black", description: "5.3K60 video, HyperSmooth 6.0, HDR photo+video, waterproof to 33ft, Bluetooth & WiFi.", price: 39999, compareAtPrice: 44999, category: "Cameras", stock: 18, sku: "CAM-002", discountPercent: 10 },
  { name: "Corsair Vengeance DDR5 32GB", description: "DDR5-5600MHz, dual-channel kit (2x16GB), Intel XMP 3.0, compact low-profile design.", price: 8999, compareAtPrice: 11999, category: "Components", stock: 90, sku: "CMP-001", discountPercent: 25 },
  { name: "Elgato Stream Deck MK.2", description: "15 customizable LCD keys, drag-and-drop actions, multi-platform support, detachable USB-C cable.", price: 12999, compareAtPrice: 14999, category: "Accessories", stock: 30, sku: "ACC-003", discountPercent: 13 },

  // ── REGULAR — no discount, no featured (20 items) ──
  { name: "Dell UltraSharp 27\" 4K Monitor", description: "27\" IPS 4K UHD, USB-C hub, 98% DCI-P3, factory calibrated, pivot/swivel/tilt, KVM switch.", price: 44999, category: "Monitors", stock: 22, sku: "MON-001" },
  { name: "Keychron Q1 Pro Mechanical Keyboard", description: "75% layout, wireless, hot-swappable Gateron Jupiter switches, QMK/VIA, aluminum CNC body.", price: 17999, category: "Accessories", stock: 40, sku: "ACC-004" },
  { name: "Samsung Galaxy Tab S9 FE", description: "10.9\" TFT display, Exynos 1380, 128GB, IP68 water resistance, S Pen included, One UI 5.1.", price: 44999, category: "Tablets", stock: 28, sku: "TAB-003" },
  { name: "Nvidia GeForce RTX 4070 Super", description: "12GB GDDR6X, DLSS 3.5, ray tracing, Ada Lovelace architecture. Ideal for 1440p gaming.", price: 59999, category: "Components", stock: 10, sku: "CMP-002" },
  { name: "AirPods Pro 2nd Gen (USB-C)", description: "Active Noise Cancellation, Adaptive Transparency, Personalized Spatial Audio, MagSafe case.", price: 24999, category: "Audio", stock: 80, sku: "AUD-004" },
  { name: "WD Black SN850X 1TB NVMe SSD", description: "PCIe Gen4 x4, up to 7,300 MB/s read, Game Mode 2.0, heatsink included.", price: 9999, category: "Storage", stock: 65, sku: "STR-002" },
  { name: "Logitech C920 HD Pro Webcam", description: "1080p 30fps, dual stereo microphones, auto light correction, universal clip mount, USB-A.", price: 6999, category: "Accessories", stock: 55, sku: "ACC-005" },
  { name: "Nothing Phone (2a)", description: "6.7\" AMOLED 120Hz, Dimensity 7200, Glyph Interface, 50MP dual camera, 5000mAh, Nothing OS 2.5.", price: 24999, category: "Smartphones", stock: 40, sku: "PHN-003" },
  { name: "Xiaomi Robot Vacuum X10+", description: "4000Pa suction, LDS navigation, auto-empty dock, mopping, smart obstacle avoidance, app control.", price: 34999, category: "Smart Home", stock: 12, sku: "SMH-001" },
  { name: "Marshall Emberton II Speaker", description: "Portable Bluetooth 5.1 speaker, 360° sound, IP67, 30+ hours battery, iconic Marshall design.", price: 14999, category: "Audio", stock: 35, sku: "AUD-005" },
  { name: "ASUS ROG Ally X Handheld", description: "7\" 120Hz FHD, AMD Ryzen Z1 Extreme, 24GB RAM, 1TB SSD, Windows 11, 80Wh battery.", price: 79999, category: "Gaming", stock: 7, sku: "GMG-002" },
  { name: "Philips Hue Starter Kit (3 Bulbs)", description: "Smart LED bulbs + Bridge, 16 million colors, voice control, scheduling, energy efficient.", price: 12999, category: "Smart Home", stock: 50, sku: "SMH-002" },
  { name: "Rode NT-USB+ Microphone", description: "Studio-quality condenser USB mic, internal DSP, headphone amp, pop filter included.", price: 15999, category: "Audio", stock: 25, sku: "AUD-006" },
  { name: "Canon PIXMA G3020 Printer", description: "Wireless ink tank printer, print/scan/copy, high yield ink bottles, mobile printing.", price: 12999, category: "Printers", stock: 18, sku: "PRT-001" },
  { name: "Raspberry Pi 5 (8GB)", description: "Broadcom BCM2712 quad-core Arm Cortex-A76 @ 2.4GHz, 8GB LPDDR4X, dual 4K display.", price: 7499, category: "Components", stock: 100, sku: "CMP-003" },
  { name: "Belkin 3-in-1 MagSafe Charger", description: "Charges iPhone, Apple Watch, AirPods simultaneously, 15W MagSafe, premium design.", price: 11999, category: "Accessories", stock: 45, sku: "ACC-006" },
  { name: "Ring Video Doorbell Pro 2", description: "1536p HD video, 3D motion detection, Bird's Eye View, Alexa compatible, hardwired.", price: 18999, category: "Smart Home", stock: 20, sku: "SMH-003" },
  { name: "Lenovo ThinkPad X1 Carbon Gen 11", description: "14\" 2.8K OLED, Intel Core i7-1365U, 16GB RAM, 512GB SSD, 1.12kg, Thunderbolt 4.", price: 154999, category: "Laptops", stock: 8, sku: "LAP-002" },
  { name: "SteelSeries Arctis Nova Pro Headset", description: "Premium hi-fi gaming headset, active noise cancellation, hot-swappable battery, GameDAC Gen 2.", price: 29999, category: "Gaming", stock: 20, sku: "GMG-003" },
  { name: "Anker USB-C Hub 8-in-1", description: "4K HDMI, 100W PD passthrough, 2x USB-A, SD/microSD, Ethernet, USB-C data.", price: 4999, category: "Accessories", stock: 120, sku: "ACC-007" },

  // ── OUT OF STOCK items (5 items) ──
  { name: "PlayStation 5 Pro", description: "Enhanced GPU, 2TB SSD, 8K support, ray tracing, backward compatible, DualSense controller included.", price: 59999, category: "Gaming", stock: 0, sku: "GMG-004" },
  { name: "Apple Vision Pro", description: "Spatial computing headset, M2 + R1 chips, micro-OLED displays, eye/hand tracking, visionOS.", price: 349999, category: "Wearables", stock: 0, sku: "WRB-002", isFeatured: true, discountPercent: 5 },
  { name: "Framework Laptop 16", description: "Modular 16\" laptop, AMD Ryzen 9 7940HS, user-upgradeable GPU, 64GB RAM support.", price: 139999, category: "Laptops", stock: 0, sku: "LAP-003" },
  { name: "Sonos Era 300 Speaker", description: "Spatial audio with Dolby Atmos, WiFi 6, Bluetooth, Trueplay tuning, voice control.", price: 44999, category: "Audio", stock: 0, sku: "AUD-007", discountPercent: 10 },
  { name: "Meta Quest 3 512GB", description: "Mixed reality headset, Snapdragon XR2 Gen 2, full-color passthrough, 4K+ per eye.", price: 54999, category: "Gaming", stock: 0, sku: "GMG-005" },

  // ── LOW STOCK items (5 items) ──
  { name: "Dyson V15 Detect Vacuum", description: "Laser dust detection, piezo sensor, 60-min runtime, LCD screen, HEPA filtration.", price: 59999, category: "Smart Home", stock: 3, sku: "SMH-004" },
  { name: "Garmin Fenix 8 Solar", description: "Solar-powered GPS smartwatch, AMOLED display, multi-band GPS, 48-day battery, titanium.", price: 79999, category: "Wearables", stock: 2, sku: "WRB-003", isFeatured: true, discountPercent: 8 },
  { name: "Fujifilm X100VI Camera", description: "40MP X-Trans CMOS 5 HR sensor, fixed 23mm f/2 lens, 6.2K video, IBIS, retro design.", price: 169999, category: "Cameras", stock: 1, sku: "CAM-003" },
  { name: "Samsung Odyssey G9 49\" Monitor", description: "49\" DQHD 5120x1440, 240Hz, Mini LED, 1ms, HDR 2000, 1000R curve, quantum dot.", price: 149999, category: "Monitors", stock: 4, sku: "MON-002", discountPercent: 5 },
  { name: "Teenage Engineering EP-133 K.O. II", description: "Portable sampler and drum machine, built-in mic, effects, 64-step sequencer, battery powered.", price: 19999, category: "Audio", stock: 5, sku: "AUD-008" },
];

const seed = async () => {
  const subdomain = process.argv[2];
  if (!subdomain) {
    console.error("Usage: node src/seeds/products.seed.js <vendor-subdomain>");
    console.error("Example: node src/seeds/products.seed.js test");
    process.exit(1);
  }

  try {
    await connectDB();

    const vendor = await Vendor.findOne({ subdomain });
    if (!vendor) {
      console.error(`Vendor with subdomain "${subdomain}" not found.`);
      process.exit(1);
    }

    console.log(`\nSeeding products for "${vendor.storeName}" (${subdomain})...\n`);

    // Delete existing products for this vendor
    const deleted = await Product.deleteMany({ vendorId: vendor._id });
    console.log(`  Deleted ${deleted.deletedCount} existing products`);

    // Create products with images and vendor reference
    const products = PRODUCTS.map((p, i) => ({
      ...p,
      vendorId: vendor._id,
      images: [IMG(i + 1), IMG(i + 100)], // 2 images per product
      discountPercent: p.discountPercent || 0,
      isFeatured: p.isFeatured || false,
      compareAtPrice: p.compareAtPrice || null,
    }));

    const created = await Product.insertMany(products);

    // Stats
    const featured = created.filter(p => p.isFeatured).length;
    const discounted = created.filter(p => p.discountPercent > 0).length;
    const outOfStock = created.filter(p => p.stock === 0).length;
    const lowStock = created.filter(p => p.stock > 0 && p.stock <= 5).length;
    const categories = [...new Set(created.map(p => p.category))];

    console.log(`  Created ${created.length} products`);
    console.log(`\n  Breakdown:`);
    console.log(`    Featured:     ${featured}`);
    console.log(`    Discounted:   ${discounted}`);
    console.log(`    Out of stock: ${outOfStock}`);
    console.log(`    Low stock:    ${lowStock}`);
    console.log(`    Regular:      ${created.length - featured - outOfStock - lowStock}`);
    console.log(`    Categories:   ${categories.join(", ")}`);
    console.log(`\n  Done!`);

    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
};

seed();
