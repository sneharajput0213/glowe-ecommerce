
import { useEffect, useState } from "react";
import { Package, AlertTriangle, Save } from "lucide-react";
import api from "../../utils/api";

function SellerInventory() {
  const [inventory, setInventory] = useState([]);
  const [stockValues, setStockValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const { data } = await api.get("/products/my-inventory");

        setInventory(data.inventory || []);

        const values = {};
        (data.inventory || []).forEach((product) => {
          values[product._id] = String(product.countInStock);
        });

        setStockValues(values);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load inventory."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const handleSave = async (productId) => {
    const rawValue = stockValues[productId];

    if (
      rawValue === undefined ||
      rawValue.trim() === "" ||
      !Number.isInteger(Number(rawValue)) ||
      Number(rawValue) < 0
    ) {
      setError("Stock must be a non-negative whole number.");
      return;
    }

    try {
      setSavingId(productId);
      setError("");
      setSuccess("");

      const countInStock = Number(rawValue);

      await api.put(`/products/my-inventory/${productId}`, {
        countInStock,
      });

      setInventory((prev) =>
        prev.map((product) =>
          product._id === productId
            ? { ...product, countInStock }
            : product
        )
      );

      setSuccess("Stock updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update stock."
      );
    } finally {
      setSavingId(null);
    }
  };

  const lowStockCount = inventory.filter(
    (product) => product.countInStock > 0 &&
      product.countInStock <= 5
  ).length;

  const outOfStockCount = inventory.filter(
    (product) => product.countInStock === 0
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif">
          Inventory Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitor stock levels and update product quantities.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          {
            label: "Total Products",
            value: inventory.length,
            icon: Package,
          },
          {
            label: "Low Stock",
            value: lowStockCount,
            icon: AlertTriangle,
          },
          {
            label: "Out of Stock",
            value: outOfStockCount,
            icon: Package,
          },
        ].map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="bg-card border border-border rounded-2xl p-5"
            >
              <Icon className="w-5 h-5 text-primary mb-3" />
              <p className="text-sm text-muted-foreground">
                {card.label}
              </p>
              <h2 className="text-3xl font-semibold mt-2">
                {card.value}
              </h2>
            </div>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="text-red-500">
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="text-green-600">
          {success}
        </p>
      )}

      {loading ? (
        <p>Loading inventory...</p>
      ) : inventory.length === 0 ? (
        <p className="text-muted-foreground">
          No products in your inventory.
        </p>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-accent/50">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4">Update Stock</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {inventory.map((product) => (
                <tr
                  key={product._id}
                  className="border-t border-border"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <span className="font-medium">
                        {product.name}
                      </span>
                    </div>
                  </td>

                  <td className="p-4">
                    {product.countInStock}
                  </td>

                  <td className="p-4">
                    {product.countInStock === 0
                      ? "Out of Stock"
                      : product.countInStock <= 5
                      ? "Low Stock"
                      : "In Stock"}
                  </td>

                  <td className="p-4">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={stockValues[product._id] ?? ""}
                      onChange={(e) => {
                        setStockValues((prev) => ({
                          ...prev,
                          [product._id]: e.target.value,
                        }));
                      }}
                      className="w-24 border border-border bg-background rounded-lg px-3 py-2"
                    />
                  </td>

                  <td className="p-4">
                    <button
                      type="button"
                      disabled={savingId !== null}
                      onClick={() => handleSave(product._id)}
                      className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg disabled:opacity-50"
                    >
                      <Save size={16} />
                      {savingId === product._id
                        ? "Saving..."
                        : "Save"}
                    </button>
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

export default SellerInventory;
