import SalesChart from "./components/SalesChart";
import ProductPerformance from "./components/ProductPerformance";
import { useEffect, useState } from "react";
import {
  IndianRupee,
  ShoppingBag,
  Package,
  Boxes,
  Clock3,
  AlertTriangle,
} from "lucide-react";
import api from "../../utils/api";

const dashboardCards = [
  {
    title: "Total Revenue",
    key: "totalRevenue",
    icon: IndianRupee,
    currency: true,
  },
  {
    title: "Total Orders",
    key: "totalOrders",
    icon: ShoppingBag,
  },
  {
    title: "Total Products",
    key: "totalProducts",
    icon: Package,
  },
  {
    title: "Units Sold",
    key: "totalUnitsSold",
    icon: Boxes,
  },
  {
    title: "Pending Orders",
    key: "pendingOrders",
    icon: Clock3,
  },
  {
    title: "Low Stock Products",
    key: "lowStockProducts",
    icon: AlertTriangle,
  },
];

function SellerDashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get("/seller/dashboard");

        setOverview(data.overview);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load dashboard statistics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const formatValue = (card) => {
    const value = overview?.[card.key] ?? 0;

    if (card.currency) {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }).format(value);
    }

    return Number(value).toLocaleString("en-IN");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-foreground">
          Seller Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's an overview of your Glowé store.
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">
          Loading dashboard statistics...
        </p>
      ) : error ? (
        <div className="p-5 rounded-xl border border-red-200 bg-red-50 text-red-600">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {dashboardCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.key}
                className="bg-card border border-border rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm text-muted-foreground">
                    {card.title}
                  </p>

                  <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </div>

                <h2 className="text-3xl font-semibold text-foreground">
                  {formatValue(card)}
                </h2>
              </div>
            );
          })}
        </div>
      )}
      <SalesChart />
      <ProductPerformance />
    </div>
  );
}

export default SellerDashboard;
