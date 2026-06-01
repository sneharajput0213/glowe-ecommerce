import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/products"
      );

      const data = await response.json();

      setProducts(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this product?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setProducts((prev) =>
        prev.filter((product) => product._id !== id)
      );

      alert("Product Deleted");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-5xl font-serif mb-8">
          Product Management
        </h1>

        <div className="overflow-x-auto bg-card border border-border rounded-3xl">

          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left">Image</th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-left">Price</th>
                <th className="p-4 text-left">Stock</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr
                  key={product._id}
                  className="border-b border-border"
                >
                  <td className="p-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  </td>

                  <td className="p-4">
                    {product.name}
                  </td>

                  <td className="p-4">
                    {product.category}
                  </td>

                  <td className="p-4">
                    ₹{product.price}
                  </td>

                  <td className="p-4">
                    {product.countInStock}
                  </td>

                  <td className="p-4">
                    <Link
                      to={`/admin/products/${product._id}`}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-2"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() =>
                        deleteProduct(product._id)
                      }
                      className="bg-red-500 text-white px-4 py-2 rounded-lg"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>
      </div>
    </div>
  );
}