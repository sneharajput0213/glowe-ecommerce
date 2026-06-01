import { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
} from "react-router-dom";

export default function AdminEditProduct() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      name: "",
      image: "",
      brand: "",
      category: "",
      description: "",
      price: "",
      countInStock: "",
    });

  useEffect(() => {
    const fetchProduct = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/${id}`
      );

      const data =
        await response.json();

      setFormData({
        name: data.name,
        image: data.image,
        brand: data.brand,
        category: data.category,
        description:
          data.description,
        price: data.price,
        countInStock:
          data.countInStock,
      });
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.value,
    }));
  };

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            ...formData,
            price: Number(
              formData.price
            ),
            countInStock: Number(
              formData.countInStock
            ),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Update Failed"
        );
      }

      alert(
        "Product Updated Successfully"
      );

      navigate(
        "/admin/products"
      );
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-5xl mb-8">
          Edit Product
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full p-3 border rounded-xl"
          />

          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="Image URL"
            className="w-full p-3 border rounded-xl"
          />

          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="Brand"
            className="w-full p-3 border rounded-xl"
          />

          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Category"
            className="w-full p-3 border rounded-xl"
          />

          <textarea
            name="description"
            value={
              formData.description
            }
            onChange={handleChange}
            placeholder="Description"
            className="w-full p-3 border rounded-xl"
          />

          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Price"
            className="w-full p-3 border rounded-xl"
          />

          <input
            type="number"
            name="countInStock"
            value={
              formData.countInStock
            }
            onChange={handleChange}
            placeholder="Stock"
            className="w-full p-3 border rounded-xl"
          />

          <button
            type="submit"
            className="w-full bg-primary text-white py-4 rounded-xl"
          >
            Update Product
          </button>

        </form>

      </div>
    </div>
  );
}