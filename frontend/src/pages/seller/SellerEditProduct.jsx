
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import api from "../../utils/api";

const initialForm = {
  name: "",
  image: "",
  brand: "",
  category: "",
  description: "",
  price: "",
  countInStock: "",
};

function SellerEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);

        const product = data.product;

        setForm({
          name: product.name || "",
          image: product.image || "",
          brand: product.brand || "",
          category: product.category || "",
          description: product.description || "",
          price: String(product.price ?? ""),
          countInStock: String(product.countInStock ?? ""),
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load product details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      setError("Please enter a valid price.");
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

    try {
      setSaving(true);

      await api.put(`/products/${id}`, {
        name: form.name.trim(),
        image: form.image.trim(),
        brand: form.brand.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        price,
        countInStock,
      });

      navigate("/seller/products");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update product."
      );
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { name: "name", label: "Product Name", type: "text" },
    { name: "image", label: "Image URL", type: "url" },
    { name: "brand", label: "Brand", type: "text" },
    { name: "category", label: "Category", type: "text" },
    { name: "price", label: "Price (₹)", type: "number" },
    { name: "countInStock", label: "Stock Quantity", type: "number" },
  ];

  if (loading) {
    return <p>Loading product details...</p>;
  }

  if (error && !form.name) {
    return <p className="text-red-500">{error}</p>;
  }

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
          Edit Product
        </h1>
        <p className="text-muted-foreground mt-2">
          Update your product information.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6"
      >
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
                name={field.name}
                type={field.type}
                value={form[field.name]}
                onChange={handleChange}
                min={field.type === "number" ? "0" : undefined}
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
            className="w-full border border-border bg-background rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {form.image && (
          <div>
            <p className="text-sm font-medium mb-2">
              Image Preview
            </p>
            <img
              src={form.image}
              alt="Product preview"
              className="w-40 h-40 object-cover rounded-xl border border-border"
            />
          </div>
        )}

        {error && (
          <p role="alert" className="text-red-500 text-sm">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Link
            to="/seller/products"
            className="px-6 py-3 border border-border rounded-xl"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SellerEditProduct;
