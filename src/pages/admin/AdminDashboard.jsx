import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    revenue: 0,
  });

  const fetchStats = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/dashboard/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error.message);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-5xl font-serif mb-10">
          Admin Dashboard
        </h1>

        {/* Analytics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">

          <div className="bg-card border border-border rounded-3xl p-6">
            <h3 className="text-lg text-gray-500">
              Users
            </h3>

            <p className="text-4xl font-bold mt-2">
              {stats.users}
            </p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6">
            <h3 className="text-lg text-gray-500">
              Products
            </h3>

            <p className="text-4xl font-bold mt-2">
              {stats.products}
            </p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6">
            <h3 className="text-lg text-gray-500">
              Orders
            </h3>

            <p className="text-4xl font-bold mt-2">
              {stats.orders}
            </p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6">
            <h3 className="text-lg text-gray-500">
              Revenue
            </h3>

            <p className="text-4xl font-bold mt-2">
              ₹{stats.revenue}
            </p>
          </div>

        </div>

        {/* Admin Actions */}
        <div className="grid md:grid-cols-2 gap-6">

          <Link
            to="/admin/products/add"
            className="p-8 bg-card border border-border rounded-3xl hover:shadow-lg transition"
          >
            <h2 className="text-2xl mb-2">
              Add Product
            </h2>

            <p>
              Add new products to the store
            </p>
          </Link>

          <Link
            to="/admin/products"
            className="p-8 bg-card border border-border rounded-3xl hover:shadow-lg transition"
          >
            <h2 className="text-2xl mb-2">
              Manage Products
            </h2>

            <p>
              View and delete products
            </p>
          </Link>

          <Link
            to="/admin/orders"
            className="p-8 bg-card border border-border rounded-3xl hover:shadow-lg transition"
          >
            <h2 className="text-2xl mb-2">
              Manage Orders
            </h2>

            <p>
              View and update order statuses
            </p>
          </Link>

          <Link
            to="/admin/users"
            className="p-8 bg-card border border-border rounded-3xl hover:shadow-lg transition"
          >
            <h2 className="text-2xl mb-2">
              User Management
            </h2>

            <p>
              View, delete and manage users
            </p>
          </Link>

        </div>

      </div>
    </div>
  );
}