"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Package, DollarSign, Boxes, ImageIcon, Upload,
  Plus, X, AlertCircle, Loader2,
} from "lucide-react";
import api from "@/lib/axios";
import { useStore } from "@/components/providers/StoreProvider";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { themeColors: theme } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "", description: "", category: "",
    price: "", compareAtPrice: "", stock: "", sku: "",
  });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const totalImages = existingImages.length + newFiles.length;

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/vendor/products/${id}`);
      const p = data.product;
      setForm({
        name: p.name || "",
        description: p.description || "",
        category: p.category || "",
        price: p.price?.toString() || "",
        compareAtPrice: p.compareAtPrice?.toString() || "",
        stock: p.stock?.toString() || "",
        sku: p.sku || "",
      });
      setExistingImages(p.images || []);
    } catch (err: any) {
      setApiError(err.response?.data?.message || "Failed to load product.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: "" }));
    if (apiError) setApiError(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (totalImages + files.length > 5) {
      setApiError("Maximum 5 images allowed");
      return;
    }
    const previews = files.map(f => URL.createObjectURL(f));
    setNewFiles(prev => [...prev, ...files]);
    setNewPreviews(prev => [...prev, ...previews]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newPreviews[index]);
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Product name is required";
    if (!form.price.trim()) e.price = "Price is required";
    else if (Number(form.price) <= 0) e.price = "Price must be greater than 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setApiError(null);
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("category", form.category.trim());
      formData.append("price", form.price);
      if (form.compareAtPrice) formData.append("compareAtPrice", form.compareAtPrice);
      formData.append("stock", form.stock || "0");
      formData.append("sku", form.sku.trim());
      formData.append("existingImages", JSON.stringify(existingImages));
      newFiles.forEach(file => formData.append("images", file));

      await api.put(`/vendor/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.push("/dashboard/products");
    } catch (err: any) {
      setApiError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || "Failed to update product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <EditProductSkeleton />;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/products"
          className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:opacity-80 transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Edit Product</h1>
          <p className="text-gray-500 text-sm mt-0.5">Update your product details</p>
        </div>
      </div>

      {apiError && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-red-700 text-sm">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-black text-gray-900 flex items-center gap-2">
            <Package size={18} style={{ color: theme.primaryColor }} /> Basic Information
          </h2>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
            <input type="text" placeholder="e.g. Classic Cotton T-Shirt" value={form.name}
              onChange={e => handleChange("name", e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-gray-50 focus:bg-white transition-colors ${errors.name ? "border-red-300" : "border-gray-200"}`}
              onFocus={e => !errors.name && (e.target.style.borderColor = theme.primaryColor)}
              onBlur={e => !errors.name && (e.target.style.borderColor = "#e5e7eb")} />
            {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea placeholder="Describe your product..." value={form.description}
              onChange={e => handleChange("description", e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-gray-50 focus:bg-white transition-colors resize-none"
              onFocus={e => e.target.style.borderColor = theme.primaryColor}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="text" placeholder="e.g. Clothing, Electronics" value={form.category}
              onChange={e => handleChange("category", e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-gray-50 focus:bg-white transition-colors"
              onFocus={e => e.target.style.borderColor = theme.primaryColor}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-black text-gray-900 flex items-center gap-2">
            <DollarSign size={18} style={{ color: theme.primaryColor }} /> Pricing
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="number" step="0.01" min="0" placeholder="0.00" value={form.price}
                  onChange={e => handleChange("price", e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-gray-50 focus:bg-white transition-colors ${errors.price ? "border-red-300" : "border-gray-200"}`}
                  onFocus={e => !errors.price && (e.target.style.borderColor = theme.primaryColor)}
                  onBlur={e => !errors.price && (e.target.style.borderColor = "#e5e7eb")} />
              </div>
              {errors.price && <p className="mt-1.5 text-xs text-red-600">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Compare at Price <span className="text-gray-400 font-normal">(optional)</span></label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="number" step="0.01" min="0" placeholder="0.00" value={form.compareAtPrice}
                  onChange={e => handleChange("compareAtPrice", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-gray-50 focus:bg-white transition-colors"
                  onFocus={e => e.target.style.borderColor = theme.primaryColor}
                  onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
              </div>
              {form.compareAtPrice && Number(form.compareAtPrice) > Number(form.price) && Number(form.price) > 0 && (
                <p className="mt-1.5 text-xs text-green-600 font-medium">
                  {Math.round(((Number(form.compareAtPrice) - Number(form.price)) / Number(form.compareAtPrice)) * 100)}% discount
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-black text-gray-900 flex items-center gap-2">
            <Boxes size={18} style={{ color: theme.primaryColor }} /> Inventory
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity</label>
              <input type="number" min="0" placeholder="0" value={form.stock}
                onChange={e => handleChange("stock", e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-gray-50 focus:bg-white transition-colors"
                onFocus={e => e.target.style.borderColor = theme.primaryColor}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">SKU <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="text" placeholder="e.g. TSH-001" value={form.sku}
                onChange={e => handleChange("sku", e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-gray-50 focus:bg-white transition-colors"
                onFocus={e => e.target.style.borderColor = theme.primaryColor}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-black text-gray-900 flex items-center gap-2">
            <ImageIcon size={18} style={{ color: theme.primaryColor }} /> Images
            <span className="text-xs text-gray-400 font-normal ml-auto">{totalImages}/5</span>
          </h2>

          <input ref={fileInputRef} type="file" accept="image/*" multiple
            onChange={handleFileSelect} className="hidden" />

          {totalImages > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {existingImages.map((url, i) => (
                <div key={`existing-${i}`} className="relative group">
                  <img src={url} alt={`Product ${i + 1}`}
                    className="w-full h-24 object-cover rounded-xl border-2 border-gray-100" />
                  <button type="button" onClick={() => removeExistingImage(i)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    <X size={12} />
                  </button>
                </div>
              ))}
              {newPreviews.map((url, i) => (
                <div key={`new-${i}`} className="relative group">
                  <img src={url} alt={`New ${i + 1}`}
                    className="w-full h-24 object-cover rounded-xl border-2"
                    style={{ borderColor: theme.primaryColor }} />
                  <span className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded-md font-bold"
                    style={{ backgroundColor: theme.primaryColor, color: theme.buttonText }}>NEW</span>
                  <button type="button" onClick={() => removeNewImage(i)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    <X size={12} />
                  </button>
                </div>
              ))}
              {totalImages < 5 && (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 transition-all"
                  onMouseEnter={e => e.currentTarget.style.borderColor = theme.primaryColor}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#e5e7eb"}>
                  <Plus size={20} />
                  <span className="text-xs mt-1">Add more</span>
                </button>
              )}
            </div>
          )}

          {totalImages === 0 && (
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 rounded-xl p-8 text-center transition-colors cursor-pointer"
              onMouseEnter={e => e.currentTarget.style.borderColor = theme.primaryColor}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#e5e7eb"}>
              <Upload size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-semibold">Click to upload images</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB each. Max 5 images.</p>
            </button>
          )}
        </div>

        {/* Submit */}
        <button type="submit" disabled={isSubmitting}
          className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
          style={{ backgroundColor: isSubmitting ? "#e5e7eb" : theme.primaryColor, color: isSubmitting ? "#9ca3af" : theme.buttonText }}>
          {isSubmitting
            ? <><Loader2 size={18} className="animate-spin" />Updating Product...</>
            : <><Package size={18} />Update Product</>
          }
        </button>
      </form>
    </div>
  );
}

function EditProductSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-9 h-9 bg-gray-200 rounded-xl" />
        <div className="space-y-2">
          <div className="h-7 w-40 bg-gray-200 rounded-xl" />
          <div className="h-4 w-56 bg-gray-100 rounded-lg" />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div className="h-5 w-40 bg-gray-200 rounded-lg" />
        <div className="h-12 bg-gray-100 rounded-xl" />
        <div className="h-24 bg-gray-100 rounded-xl" />
        <div className="h-12 bg-gray-100 rounded-xl" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div className="h-5 w-24 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-2 gap-5">
          <div className="h-12 bg-gray-100 rounded-xl" />
          <div className="h-12 bg-gray-100 rounded-xl" />
        </div>
      </div>
      <div className="h-14 bg-gray-200 rounded-xl" />
    </div>
  );
}
