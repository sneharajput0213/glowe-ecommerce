import { useState } from "react";

export default function AdminAddProduct() {
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    brand: "",
    category: "",
    description: "",
    price: "",
    countInStock: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            price: Number(formData.price),
            countInStock: Number(
              formData.countInStock
            ),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add product"
        );
      }

      alert("Product Added Successfully");

      setFormData({
        name: "",
        image: "",
        brand: "",
        category: "",
        description: "",
        price: "",
        countInStock: "",
      });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-5xl font-serif text-foreground mb-8">
          Add Product
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-3xl p-8 space-y-5"
        >
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-border bg-input-background"
          />

          <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={formData.image}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-border bg-input-background"
          />

          <input
            type="text"
            name="brand"
            placeholder="Brand"
            value={formData.brand}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-border bg-input-background"
          />

          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-border bg-input-background"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={5}
            className="w-full px-4 py-3 rounded-xl border border-border bg-input-background"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-border bg-input-background"
            />

            <input
              type="number"
              name="countInStock"
              placeholder="Stock"
              value={formData.countInStock}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-border bg-input-background"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-4 rounded-full hover:bg-primary/90 transition-colors"
          >
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
}