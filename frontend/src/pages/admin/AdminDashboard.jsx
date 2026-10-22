
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Store,
  Package,
  ShoppingBag,
  IndianRupee,
  Clock3,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import api from "../../utils/api";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/admin/dashboard");
        setStats(response.data.overview);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load dashboard statistics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const dashboardCards = [
    {
      title: "Total Customers",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-pink-50 text-pink-600",
    },
    {
      title: "Total Sellers",
      value: stats.totalSellers,
      icon: Store,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: "bg-orange-50 text-orange-600",
    },
    {
      title: "Total Revenue",
      value: `₹${Number(stats.totalRevenue || 0).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: Clock3,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#B76E79] mb-2">
            Glowé Administration
          </p>

          <h1 className="text-3xl font-serif text-gray-900">
            Dashboard Overview
          </h1>

          <p className="text-gray-500 mt-2 text-sm">
            Monitor and manage your entire Glowé platform.
          </p>
        </div>

        <Link
          to="/admin/products/add"
          className="inline-flex items-center gap-2 rounded-xl bg-[#B76E79] px-5 py-3 text-sm font-medium text-white hover:bg-[#A45F6B] transition"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {dashboardCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-[#F0E5E5] bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className={`rounded-xl p-3 ${card.color}`}>
                  <Icon size={22} />
                </div>

                <ArrowUpRight size={18} className="text-gray-300" />
              </div>

              <p className="mt-6 text-sm text-gray-500">
                {card.title}
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">
                {loading ? "..." : card.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Quick Management */}
      <div className="rounded-2xl border border-[#F0E5E5] bg-white p-6">
        <div className="mb-5">
          <h2 className="text-xl font-serif text-gray-900">
            Quick Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Access your most frequently used admin tools.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              title: "Manage Products",
              description: "View and manage platform products",
              path: "/admin/products",
              icon: Package,
            },
            {
              title: "Manage Orders",
              description: "Monitor customer orders",
              path: "/admin/orders",
              icon: ShoppingBag,
            },
            {
              title: "Manage Users",
              description: "Manage customer accounts",
              path: "/admin/users",
              icon: Users,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center justify-between gap-3 rounded-xl border border-[#F0E5E5] p-4 hover:bg-[#FAF3F4] transition"
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className="text-[#B76E79]" />

                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>

                <ArrowUpRight
                  size={17}
                  className="shrink-0 text-gray-400"
                />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
