"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart,
  Check, Package, Truck, Shield, RotateCcw, ImageIcon,
  AlertCircle, Loader2, Heart,
} from "lucide-react";
import api from "@/lib/axios";
import { useStore } from "@/components/providers/StoreProvider";
import { useCartStore } from "@/store/cartStore";
import StoreNavbar from "@/components/store/StoreNavbar";
import StoreFooter from "@/components/store/StoreFooter";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  images: string[];
  stock: number;
  sku: string;
  createdAt: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { store, themeColors: theme, loading: storeLoading } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const inCart = cartItems.find((i) => i._id === id);

  useEffect(() => {
    if (!store) return;
    fetchProduct();
  }, [store, id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(
        `/store/${store!.subdomain}/products/${id}`
      );
      setProduct(data.product);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product || !store) return;
    addItem(
      {
        _id: product._id,
        name: product.name,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        image: product.images?.[0] || null,
        stock: product.stock,
        vendorSubdomain: store.subdomain,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const hasDiscount =
    product?.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product!.compareAtPrice! - product!.price) /
          product!.compareAtPrice!) *
          100
      )
    : 0;

  if (storeLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.bgColor }}>
        <StoreNavbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin" style={{ color: theme.primaryColor }} />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.bgColor }}>
        <StoreNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Package size={56} className="text-gray-200 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
            <p className="text-gray-500 mb-6">This product doesn&apos;t exist or is no longer available.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all"
              style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
            >
              <ChevronLeft size={16} /> Back to Shop
            </Link>
          </div>
        </div>
        <StoreFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.bgColor }}>
      <StoreNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:underline" style={{ color: theme.accentColor }}>
            Shop
          </Link>
          <ChevronRight size={14} />
          {product.category && (
            <>
              <Link href={`/?category=${product.category}`} className="hover:underline" style={{ color: theme.accentColor }}>
                {product.category}
              </Link>
              <ChevronRight size={14} />
            </>
          )}
          <span className="text-gray-600 truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* ── Image Gallery ── */}
          <div className="space-y-4">
            {/* Main image */}
            <div
              className="relative aspect-square rounded-2xl overflow-hidden"
              style={{ backgroundColor: theme.secondaryColor, border: `1px solid ${theme.borderColor}` }}
            >
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={80} className="text-gray-200" />
                </div>
              )}

              {hasDiscount && (
                <span
                  className="absolute top-4 left-4 px-3 py-1.5 rounded-xl text-sm font-bold shadow-md"
                  style={{ backgroundColor: theme.primaryColor, color: theme.buttonText }}
                >
                  -{discountPercent}% OFF
                </span>
              )}

              {product.stock <= 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold">
                    Out of Stock
                  </span>
                </div>
              )}

              {/* Image nav arrows */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage((p) =>
                        p === 0 ? product.images.length - 1 : p - 1
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:bg-white transition-all shadow-md"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage((p) =>
                        p === product.images.length - 1 ? 0 : p + 1
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:bg-white transition-all shadow-md"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all"
                    style={{
                      borderColor:
                        selectedImage === i ? theme.primaryColor : theme.borderColor,
                      opacity: selectedImage === i ? 1 : 0.6,
                    }}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ── */}
          <div className="flex flex-col">
            {/* Category */}
            {product.category && (
              <span
                className="text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: theme.accentColor }}
              >
                {product.category}
              </span>
            )}

            {/* Name */}
            <h1 className="text-2xl sm:text-3xl font-black leading-tight mb-4" style={{ color: theme.textColor }}>
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-black" style={{ color: theme.textColor }}>
                ${product.price.toFixed(2)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    ${product.compareAtPrice!.toFixed(2)}
                  </span>
                  <span
                    className="text-sm font-bold px-2.5 py-1 rounded-lg"
                    style={{ backgroundColor: theme.secondaryColor, color: theme.accentColor }}
                  >
                    Save ${(product.compareAtPrice! - product.price).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2 mb-6">
              {product.stock > 0 ? (
                <>
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: product.stock <= 5 ? "#f59e0b" : "#10b981" }}
                  />
                  <span className="text-sm font-semibold" style={{ color: product.stock <= 5 ? "#f59e0b" : "#10b981" }}>
                    {product.stock <= 5
                      ? `Only ${product.stock} left in stock`
                      : "In Stock"}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-sm font-semibold text-red-500">Out of Stock</span>
                </>
              )}
              {product.sku && (
                <span className="text-xs text-gray-400 ml-auto">SKU: {product.sku}</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-700 mb-2">Description</h3>
                <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            {product.stock > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                {/* Quantity selector */}
                <div
                  className="flex items-center border-2 rounded-xl overflow-hidden"
                  style={{ borderColor: theme.borderColor }}
                >
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span
                    className="w-14 h-12 flex items-center justify-center text-sm font-bold border-x-2"
                    style={{ borderColor: theme.borderColor, color: theme.textColor }}
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    disabled={quantity >= product.stock}
                    className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Add to cart button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:-translate-y-0.5"
                  style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
                >
                  {added ? (
                    <>
                      <Check size={18} /> Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      {inCart ? "Add More to Cart" : "Add to Cart"}
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Go to cart link */}
            {inCart && (
              <Link
                href="/cart"
                className="text-sm font-semibold mb-6 inline-flex items-center gap-1 hover:underline"
                style={{ color: theme.primaryColor }}
              >
                <ShoppingCart size={14} />
                View Cart ({inCart.quantity} {inCart.quantity === 1 ? "item" : "items"})
              </Link>
            )}

            {/* Trust badges */}
            <div
              className="rounded-2xl p-5 mt-auto space-y-3"
              style={{ backgroundColor: theme.secondaryColor, border: `1px solid ${theme.borderColor}` }}
            >
              {[
                { icon: Truck, text: "Fast & reliable shipping" },
                { icon: Shield, text: "Secure checkout" },
                { icon: RotateCcw, text: "Easy returns" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: theme.cardBg }}
                  >
                    <Icon size={16} style={{ color: theme.primaryColor }} />
                  </div>
                  <span className="text-sm text-gray-600">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
