
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import api from "../../../utils/api";

function ProductPerformance() {
  const [bestSelling, setBestSelling] = useState([]);
  const [leastSelling, setLeastSelling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const [bestResponse, leastResponse] =
          await Promise.all([
            api.get("/seller/dashboard/best-selling"),
            api.get("/seller/dashboard/least-selling"),
          ]);

        setBestSelling(bestResponse.data.products || []);
        setLeastSelling(leastResponse.data.products || []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load product performance."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const renderProducts = (products, showRevenue) => {
    if (products.length === 0) {
      return (
        <p className="text-sm text-muted-foreground py-6 text-center">
          No products available yet.
        </p>
      );
    }

    return (
      <div className="space-y-3">
        {products.map((product, index) => (
          <div
            key={product.product || index}
            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-accent/40"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-sm font-semibold text-muted-foreground">
                {index + 1}.
              </span>

              <div className="min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  {product.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {product.unitsSold} units sold
                </p>
              </div>
            </div>

            {showRevenue && (
              <span className="text-sm font-semibold text-primary whitespace-nowrap">
                ₹{Number(product.revenue || 0).toLocaleString("en-IN")}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold">
            Best-Selling Products
          </h2>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          renderProducts(bestSelling, true)
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <TrendingDown className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-semibold">
            Least-Selling Products
          </h2>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          renderProducts(leastSelling, false)
        )}
      </div>
    </div>
  );
}

export default ProductPerformance;
