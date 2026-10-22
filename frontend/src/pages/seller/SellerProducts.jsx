
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import api from "../../utils/api";

function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/products/my-products");
        setProducts(data.products || []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load your products."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (productId, productName) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${productName}"?`
  );

  if (!confirmed) return;

  try {
    setDeletingId(productId);
    setError("");

    await api.delete(`/products/${productId}`);

    setProducts((prev) =>
      prev.filter((product) => product._id !== productId)
    );
  } catch (error) {
    setError(
      error.response?.data?.message ||
        "Failed to delete product."
    );
  } finally {
    setDeletingId(null);
  }
};

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif">My Products</h1>
          <p className="text-muted-foreground mt-2">
            Manage your store's products.
          </p>
        </div>

        <Link
          to="/seller/products/add"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          placeholder="Search your products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-border bg-card rounded-xl pl-11 pr-4 py-3 outline-none"
        />
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-muted-foreground">
          No products found.
        </p>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-accent/50">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product._id}
                  className="border-t border-border"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-14 h-14 object-cover rounded-lg"
                      />
                      <span className="font-medium">
                        {product.name}
                      </span>
                    </div>
                  </td>

                  <td className="p-4">{product.category}</td>

                  <td className="p-4">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </td>

                  <td className="p-4">{product.countInStock}</td>

                  <td className="p-4">
                    {product.isActive === false
                      ? "Inactive"
                      : product.countInStock === 0
                      ? "Out of Stock"
                      : "Active"}
                  </td>

                  <td className="p-4">
                    <div className="flex gap-3">
                      <Link
                        to={`/seller/products/${product._id}/edit`}
                        className="text-primary"
                        aria-label={`Edit ${product.name}`}
                      >
                        <Pencil size={18} />
                      </Link>

                      <button
                        type="button"
                        disabled={deletingId !== null}
                        className="text-red-500 disabled:opacity-50"
                        aria-label={`Delete ${product.name}`}
                        onClick={() =>
                           handleDelete(product._id, product.name)
                        }
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SellerProducts;
