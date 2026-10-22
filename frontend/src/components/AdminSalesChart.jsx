
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import api from "../utils/api";

function AdminSalesChart() {
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState("monthly");
  const [metric, setMetric] = useState("revenue");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get(
          "/admin/dashboard/analytics"
        );

        setAnalytics(data.analytics);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load sales analytics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const chartData = analytics?.[period] || [];

  const metrics = [
    { key: "revenue", label: "Revenue" },
    { key: "orders", label: "Orders" },
    { key: "unitsSold", label: "Units Sold" },
  ];

  const formatValue = (value) =>
    metric === "revenue"
      ? `₹${Number(value).toLocaleString("en-IN")}`
      : Number(value).toLocaleString("en-IN");

  return (
    <div className="rounded-2xl border border-[#F0E5E5] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-serif text-gray-900">
            Sales Analytics
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Track platform revenue and sales activity.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {["daily", "monthly"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setPeriod(option)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition ${
                period === option
                  ? "bg-[#B76E79] text-white"
                  : "bg-[#FAF3F4] text-gray-600 hover:bg-[#FBEDEF]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {metrics.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setMetric(item.key)}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              metric === item.key
                ? "bg-[#FBEDEF] text-[#B76E79] font-medium"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-80 flex items-center justify-center text-gray-500">
          Loading analytics...
        </div>
      ) : error ? (
        <div role="alert" className="h-80 flex items-center justify-center text-red-500">
          {error}
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-gray-500">
          No sales data available yet.
        </div>
      ) : (
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 5, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F0E5E5"
                vertical={false}
              />

              <XAxis
                dataKey={period === "daily" ? "date" : "month"}
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
                  formatValue(value),
                  metrics.find((item) => item.key === metric)?.label,
                ]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #F0E5E5",
                }}
              />

              <Line
                type="monotone"
                dataKey={metric}
                stroke="#B76E79"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default AdminSalesChart;
