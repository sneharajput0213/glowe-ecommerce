
import { useEffect, useState } from "react";
import api from "../../utils/api";

const initialFormData = {
  name: "",
  image: "",
  brand: "",
  category: "",
  description: "",
  price: "",
  countInStock: "",
  seller: "",
};

export default function AdminAddProduct() {
  const [formData, setFormData] = useState(initialFormData);
  const [sellers, setSellers] = useState([]);
  const [loadingSellers, setLoadingSellers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const response = await api.get("/admin/sellers");
        setSellers(response.data.sellers || []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load sellers. Please try again."
        );
      } finally {
        setLoadingSellers(false);
      }
    };

    fetchSellers();
  }, []);

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
      await api.post("/products", {
        ...formData,
        price: Number(formData.price),
        countInStock: Number(formData.countInStock),
      });

      alert("Product Added Successfully");
      setFormData({ ...initialFormData });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to add product."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 font-serif text-5xl text-foreground">
          Add Product
        </h1>

        {error && (
          <p className="mb-4 text-red-500">{error}</p>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl border border-border bg-card p-8"
        >
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleChange}
            minLength={2}
            required
            className="w-full rounded-xl border border-border bg-input-background px-4 py-3"
          />

          <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={formData.image}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-border bg-input-background px-4 py-3"
          />

          <input
            type="text"
            name="brand"
            placeholder="Brand"
            value={formData.brand}
            onChange={handleChange}
            minLength={2}
            required
            className="w-full rounded-xl border border-border bg-input-background px-4 py-3"
          />

          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            minLength={2}
            required
            className="w-full rounded-xl border border-border bg-input-background px-4 py-3"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            required
            className="w-full rounded-xl border border-border bg-input-background px-4 py-3"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              className="w-full rounded-xl border border-border bg-input-background px-4 py-3"
            />

            <input
              type="number"
              name="countInStock"
              placeholder="Stock"
              value={formData.countInStock}
              onChange={handleChange}
              min="0"
              step="1"
              required
              className="w-full rounded-xl border border-border bg-input-background px-4 py-3"
            />
          </div>

          <div>
            <label
              htmlFor="seller"
              className="mb-2 block text-sm font-medium"
            >
              Assign Seller
            </label>

            <select
              id="seller"
              name="seller"
              value={formData.seller}
              onChange={handleChange}
              required
              disabled={loadingSellers || sellers.length === 0}
              className="w-full rounded-xl border border-border bg-input-background px-4 py-3"
            >
              <option value="">
                {loadingSellers
                  ? "Loading sellers..."
                  : sellers.length === 0
                    ? "No sellers available"
                    : "Select a seller"}
              </option>

              {sellers.map((seller) => (
                <option key={seller._id} value={seller._id}>
                  {seller.name} ({seller.email})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={saving || loadingSellers || sellers.length === 0}
            className="w-full rounded-full bg-primary py-4 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? "Adding Product..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
