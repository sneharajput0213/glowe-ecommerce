import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function AdminEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    brand: "",
    category: "",
    description: "",
    price: "",
    countInStock: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setError("");

        // Use the existing product endpoint to retrieve the product.
        const response = await api.get(`/products/${id}`);
        const product = response.data.product || response.data;

        setFormData({
          name: product.name || "",
          image: product.image || "",
          brand: product.brand || "",
          category: product.category || "",
          description: product.description || "",
          price: product.price ?? "",
          countInStock: product.countInStock ?? "",
        });
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load this product."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);
  setError("");

  try {
    await api.put(`/products/${id}`, {
      ...formData,
      price: Number(formData.price),
      countInStock: Number(formData.countInStock),
    });

    toast.success("Product updated successfully!");

    navigate("/admin/products");
  } catch (error) {
    const message =
      error.response?.data?.message || "Product update failed.";

    setError(message);
    toast.error(message);
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return <p className="p-6">Loading product...</p>;
  }

  if (error && !formData.name) {
    return (
      <div className="p-6">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => navigate("/admin/products")}
          className="mt-4 rounded-lg border px-4 py-2"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-5xl">Edit Product</h1>

        {error && (
          <p className="mb-4 text-red-500">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            required
            className="w-full rounded-xl border p-3"
          />

          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="Image URL"
            required
            className="w-full rounded-xl border p-3"
          />

          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="Brand"
            required
            className="w-full rounded-xl border p-3"
          />

          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Category"
            required
            className="w-full rounded-xl border p-3"
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            required
            className="w-full rounded-xl border p-3"
          />

          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Price"
            min="0"
            step="0.01"
            required
            className="w-full rounded-xl border p-3"
          />

          <input
            type="number"
            name="countInStock"
            value={formData.countInStock}
            onChange={handleChange}
            placeholder="Stock"
            min="0"
            step="1"
            required
            className="w-full rounded-xl border p-3"
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-primary py-4 text-white disabled:opacity-60"
          >
            {saving ? "Updating..." : "Update Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
