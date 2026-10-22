
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Upload,
  X,
  ImagePlus,
} from "lucide-react";
import api from "../../utils/api";

const initialForm = {
  name: "",
  brand: "",
  category: "",
  description: "",
  price: "",
  countInStock: "",
};

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function SellerAddProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const urls = images.map((file) =>
      URL.createObjectURL(file)
    );

    setPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    setError("");

    if (images.length + selectedFiles.length > MAX_IMAGES) {
      setError("You can upload a maximum of 5 images.");
      e.target.value = "";
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        setError("Only JPEG, PNG, and WebP images are allowed.");
        e.target.value = "";
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError("Each image must be smaller than 5 MB.");
        e.target.value = "";
        return;
      }
    }

    setImages((prev) => [...prev, ...selectedFiles]);

    // Allows selecting the same file again after removing it
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const price = Number(form.price);
    const countInStock = Number(form.countInStock);

    if (
      form.price.trim() === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      setError("Please enter a valid product price.");
      return;
    }

    if (
      form.countInStock.trim() === "" ||
      !Number.isInteger(countInStock) ||
      countInStock < 0
    ) {
      setError("Stock must be a non-negative whole number.");
      return;
    }

    if (images.length === 0) {
      setError("Please upload at least one product image.");
      return;
    }

    const formData = new FormData();

    formData.append("name", form.name.trim());
    formData.append("brand", form.brand.trim());
    formData.append("category", form.category.trim());
    formData.append("description", form.description.trim());
    formData.append("price", String(price));
    formData.append("countInStock", String(countInStock));

    // Field name must match upload.array("images", 5)
    images.forEach((file) => {
      formData.append("images", file);
    });

    try {
      setLoading(true);

      await api.post("/products", formData);

      navigate("/seller/products");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create product. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "name", label: "Product Name", type: "text" },
    { name: "brand", label: "Brand", type: "text" },
    { name: "price", label: "Price (₹)", type: "number" },
    {
      name: "countInStock",
      label: "Stock Quantity",
      type: "number",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/seller/products"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary"
      >
        <ArrowLeft size={18} />
        Back to My Products
      </Link>

      <div>
        <h1 className="text-3xl font-serif">
          Add New Product
        </h1>

        <p className="text-muted-foreground mt-2">
          Add a new product to your Glowé store.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6"
      >
        {/* Product Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <label
                htmlFor={field.name}
                className="block text-sm font-medium"
              >
                {field.label}
              </label>

              <input
                id={field.name}
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                min={
                  field.type === "number" ? "0" : undefined
                }
                step={
                  field.name === "price"
                    ? "0.01"
                    : field.name === "countInStock"
                    ? "1"
                    : undefined
                }
                required
                className="w-full border border-border bg-background rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          ))}
        </div>

        {/* Category Dropdown */}
<div className="space-y-2">
  <label
    htmlFor="category"
    className="block text-sm font-medium"
  >
    Category
  </label>

  <select
    id="category"
    name="category"
    value={form.category}
    onChange={handleChange}
    required
    className="w-full border border-border bg-background rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
  >
    <option value="">Select Category</option>
    <option value="Serums">Serums</option>
    <option value="Moisturizers">Moisturizers</option>
    <option value="Cleansers">Cleansers</option>
    <option value="Sunscreens">Sunscreens</option>
    <option value="Face Masks">Face Masks</option>
    <option value="Lip Care">Lip Care</option>
    <option value="Toners">Toners</option>
    <option value="Exfoliants">Exfoliants</option>
  </select>
</div>

        {/* Description */}
        <div className="space-y-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium"
          >
            Product Description
          </label>

          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            required
            className="w-full border border-border bg-background rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-3">
          <div>
            <label
              htmlFor="product-images"
              className="block text-sm font-medium"
            >
              Product Images
            </label>

            <p className="text-xs text-muted-foreground mt-1">
              Upload up to 5 images. JPEG, PNG, or WebP.
              Maximum 5 MB each.
            </p>
          </div>

          <label
            htmlFor="product-images"
            className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-2xl p-8 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <ImagePlus className="w-7 h-7 text-primary" />
            </div>

            <span className="text-sm font-medium">
              Click to upload product images
            </span>

            <span className="text-xs text-muted-foreground">
              {images.length} of 5 images selected
            </span>

            <div className="flex items-center gap-2 text-primary text-sm">
              <Upload size={16} />
              Choose Files
            </div>
          </label>

          <input
            id="product-images"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleImageChange}
            disabled={loading || images.length >= MAX_IMAGES}
            className="sr-only"
          />

          {/* Image Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
              {previews.map((url, index) => (
                <div
                  key={url}
                  className="relative aspect-square rounded-xl overflow-hidden border border-border"
                >
                  <img
                    src={url}
                    alt={`Product preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md">
                      Main
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    disabled={loading}
                    aria-label={`Remove image ${index + 1}`}
                    className="absolute top-2 right-2 bg-white text-red-500 rounded-full p-1 shadow-sm hover:bg-red-50 disabled:opacity-50"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            to="/seller/products"
            className="px-6 py-3 border border-border rounded-xl"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl disabled:opacity-50"
          >
            <Plus size={18} />
            {loading ? "Uploading..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SellerAddProduct;
