
import AdminSalesChart from "../../components/AdminSalesChart";
import AdminSellerPerformance from "../../components/AdminSellerPerformance";

function AdminAnalytics() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-[#B76E79] mb-2">
          Glowé Administration
        </p>

        <h1 className="text-3xl font-serif text-gray-900">
          Sales & Analytics
        </h1>

        <p className="text-sm text-gray-500 mt-2">
          Monitor platform revenue, sales trends,
          and business performance.
        </p>
      </div>

      <AdminSalesChart />
      <AdminSellerPerformance />
    </div>
  );
}

export default AdminAnalytics;
