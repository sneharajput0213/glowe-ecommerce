
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
import api from "../../../utils/api";

const periods = ["daily", "weekly", "monthly"];

function SalesChart() {
  const [period, setPeriod] = useState("daily");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get(
          "/seller/dashboard/analytics"
        );

        setAnalytics(data.analytics);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load sales analytics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const chartData = (analytics?.[period] || []).map(
    (item) => ({
      name:
        period === "daily"
          ? item.date
          : period === "weekly"
          ? item.weekStarting
          : item.month,
      revenue: item.revenue,
    })
  );

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Sales Revenue
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track your store's revenue over time
          </p>
        </div>

        <div className="flex gap-2">
          {periods.map((item) => (
            <button
              key={item}
              onClick={() => setPeriod(item)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                period === item
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-foreground hover:opacity-80"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">
          Loading sales chart...
        </p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : chartData.length === 0 ? (
        <div className="h-72 flex items-center justify-center text-muted-foreground">
          No sales data available yet.
        </div>
      ) : (
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                minTickGap={20}
              />

              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₹${value}`}
                width={75}
              />

              <Tooltip
                formatter={(value) => [
                  `₹${Number(value).toLocaleString("en-IN")}`,
                  "Revenue",
                ]}
              />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#b76e79"
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

export default SalesChart;
