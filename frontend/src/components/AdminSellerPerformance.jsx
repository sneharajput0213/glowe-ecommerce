
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../utils/api";

function AdminSellerPerformance() {
  const [sellers, setSellers] = useState([]);
  const [metric, setMetric] = useState("totalRevenue");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const { data } = await api.get(
          "/admin/dashboard/seller-performance"
        );

        setSellers(data.performance || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load seller performance."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  const metrics = [
    { key: "totalRevenue", label: "Revenue" },
    { key: "totalOrders", label: "Orders" },
    { key: "unitsSold", label: "Units Sold" },
    { key: "totalProducts", label: "Products" },
  ];

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString("en-IN");

  const formatMetric = (value) =>
    metric === "totalRevenue"
      ? `₹${formatNumber(value)}`
      : formatNumber(value);

  const chartData = [...sellers]
    .sort((a, b) => b[metric] - a[metric])
    .slice(0, 10)
    .map((seller) => ({
      ...seller,
      displayName:
        seller.name.length > 15
          ? `${seller.name.slice(0, 15)}...`
          : seller.name,
    }));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#F0E5E5] bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-serif text-gray-900">
            Seller Performance
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Compare sales and activity across Glowé sellers.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {metrics.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setMetric(item.key)}
              className={`rounded-lg px-4 py-2 text-sm transition ${
                metric === item.key
                  ? "bg-[#B76E79] text-white"
                  : "bg-[#FAF3F4] text-gray-600 hover:bg-[#FBEDEF]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="h-80 flex items-center justify-center text-gray-500">
            Loading seller performance...
          </div>
        ) : error ? (
          <div role="alert" className="h-80 flex items-center justify-center text-red-500">
            {error}
          </div>
        ) : sellers.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-gray-500">
            No sellers available yet.
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 15, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F0E5E5"
                />

                <XAxis
                  dataKey="displayName"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={65}
                />

                <Tooltip
                  formatter={(value) => [
                    formatMetric(value),
                    metrics.find((item) => item.key === metric)?.label,
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #F0E5E5",
                  }}
                />

                <Bar
                  dataKey={metric}
                  fill="#B76E79"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={55}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <p className="mt-4 text-xs text-gray-400">
          Showing up to 10 sellers, ranked by the selected metric.
        </p>
      </div>

      {!loading && !error && sellers.length > 0 && (
        <div className="rounded-2xl border border-[#F0E5E5] bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-serif text-gray-900">
            Seller Breakdown
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#F0E5E5] text-gray-500">
                  <th className="pb-4 pr-4 font-medium">Seller</th>
                  <th className="pb-4 pr-4 font-medium">Revenue</th>
                  <th className="pb-4 pr-4 font-medium">Orders</th>
                  <th className="pb-4 pr-4 font-medium">Units Sold</th>
                  <th className="pb-4 font-medium">Products</th>
                </tr>
              </thead>

              <tbody>
                {sellers.map((seller) => (
                  <tr
                    key={seller.sellerId}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="py-4 pr-4">
                      <p className="font-medium text-gray-900">
                        {seller.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {seller.email}
                      </p>
                    </td>

                    <td className="py-4 pr-4 font-medium">
                      ₹{formatNumber(seller.totalRevenue)}
                    </td>

                    <td className="py-4 pr-4">
                      {formatNumber(seller.totalOrders)}
                    </td>

                    <td className="py-4 pr-4">
                      {formatNumber(seller.unitsSold)}
                    </td>

                    <td className="py-4">
                      {formatNumber(seller.totalProducts)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSellerPerformance;
