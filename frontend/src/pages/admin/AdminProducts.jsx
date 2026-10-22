
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Power,
  Package,
} from "lucide-react";
import api from "../../utils/api";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/products");
      setProducts(response.data.products || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load products. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleProductStatus = async (product) => {
    try {
      setUpdatingId(product._id);

      const response = await api.put(
        `/admin/products/${product._id}/status`,
        { isActive: !product.isActive }
      );

      setProducts((prev) =>
        prev.map((item) =>
          item._id === product._id
            ? {
                ...item,
                isActive: response.data.product.isActive,
              }
            : item
        )
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to update product status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteProduct = async (product) => {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(product._id);

      await api.delete(`/products/${product._id}`);

      setProducts((prev) =>
        prev.filter((item) => item._id !== product._id)
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to delete product."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredProducts = products.filter((product) => {
    const query = search.toLowerCase().trim();

    const matchesSearch =
      product.name?.toLowerCase().includes(query) ||
      product.brand?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query) ||
      product.seller?.name?.toLowerCase().includes(query);

    const matchesFilter =
      filter === "all" ||
      (filter === "active" && product.isActive) ||
      (filter === "inactive" && !product.isActive) ||
      (filter === "outOfStock" && product.countInStock === 0);

    return matchesSearch && matchesFilter;
  });

  const activeCount = products.filter((p) => p.isActive).length;
  const inactiveCount = products.filter((p) => !p.isActive).length;
  const outOfStockCount = products.filter(
    (p) => p.countInStock === 0
  ).length;

  const filters = [
    { key: "all", label: "All Products", count: products.length },
    { key: "active", label: "Active", count: activeCount },
    { key: "inactive", label: "Inactive", count: inactiveCount },
    {
      key: "outOfStock",
      label: "Out of Stock",
      count: outOfStockCount,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-[#B76E79]">
            Glowé Administration
          </p>

          <h1 className="text-3xl font-serif text-gray-900">
            Product Management
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage products across your entire marketplace.
          </p>
        </div>

        <Link
          to="/admin/products/add"
          className="inline-flex items-center gap-2 rounded-xl bg-[#B76E79] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#A45F6B]"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {/* Product Management */}
      <div className="overflow-hidden rounded-2xl border border-[#F0E5E5] bg-white shadow-sm">
        {/* Filters and Search */}
        <div className="border-b border-[#F0E5E5] p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {filters.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    filter === item.key
                      ? "bg-[#B76E79] text-white"
                      : "bg-[#FAF3F4] text-gray-600 hover:bg-[#FBEDEF]"
                  }`}
                >
                  {item.label} ({item.count})
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-[#F0E5E5] bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#B76E79]"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Loading products...
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p role="alert" className="text-red-500">{error}</p>

            <button
              onClick={fetchProducts}
              className="mt-4 rounded-lg border px-4 py-2 text-sm"
            >
              Try Again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-gray-500">
            <Package size={36} className="text-gray-300" />
            <p>
              {products.length === 0
                ? "No products have been added yet."
                : "No products match your search or filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-[#FAF8F7] text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Product</th>
                  <th className="px-5 py-4 font-medium">Seller</th>
                  <th className="px-5 py-4 font-medium">Category</th>
                  <th className="px-5 py-4 font-medium">Price</th>
                  <th className="px-5 py-4 font-medium">Stock</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product._id}
                    className="border-t border-[#F0E5E5] hover:bg-[#FAF8F7]/60"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-14 w-14 shrink-0 rounded-xl border border-[#F0E5E5] object-cover"
                        />

                        <div>
                          <p className="font-medium text-gray-900">
                            {product.name}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {product.brand || "No brand"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800">
                        {product.seller?.name || "Not assigned"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.seller?.email || ""}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {product.category}
                    </td>

                    <td className="px-5 py-4 font-medium text-gray-900">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          product.countInStock === 0
                            ? "font-medium text-red-600"
                            : product.countInStock <= 5
                            ? "font-medium text-amber-600"
                            : "text-gray-700"
                        }
                      >
                        {product.countInStock === 0
                          ? "Out of stock"
                          : product.countInStock}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          product.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/products/${product._id}`}
                          title="Edit product"
                          className="rounded-lg border border-[#F0E5E5] p-2 text-gray-600 transition hover:bg-[#FBEDEF] hover:text-[#B76E79]"
                        >
                          <Pencil size={17} />
                        </Link>

                        <button
                          type="button"
                          title={
                            product.isActive
                              ? "Deactivate product"
                              : "Activate product"
                          }
                          aria-label={
                            product.isActive
                              ? `Deactivate ${product.name}`
                              : `Activate ${product.name}`
                          }
                          disabled={updatingId === product._id}
                          onClick={() => toggleProductStatus(product)}
                          className="rounded-lg border border-[#F0E5E5] p-2 text-gray-600 transition hover:bg-amber-50 hover:text-amber-600 disabled:opacity-50"
                        >
                          <Power size={17} />
                        </button>

                        <button
                          type="button"
                          title="Delete product"
                          aria-label={`Delete ${product.name}`}
                          disabled={updatingId === product._id}
                          onClick={() => deleteProduct(product)}
                          className="rounded-lg border border-[#F0E5E5] p-2 text-gray-600 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 size={17} />
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
    </div>
  );
}
