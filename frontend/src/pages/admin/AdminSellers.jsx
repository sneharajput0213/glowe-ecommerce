
import { useEffect, useState } from "react";
import {
  Search,
  Store,
  Clock3,
  CheckCircle2,
  XCircle,
  Power,
  RefreshCw,
  Check,
  X,
} from "lucide-react";
import api from "../../utils/api";

export default function AdminSellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchSellers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/sellers");
      setSellers(response.data.sellers || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch sellers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  // Approve or reject a pending seller
  const handleApproval = async (seller, sellerStatus) => {
    const action =
      sellerStatus === "approved" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${seller.name}'s seller application?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(seller._id);
      setError("");

      const response = await api.patch(
        `/admin/dashboard/sellers/${seller._id}/approval`,
        { sellerStatus }
      );

      setSellers((prev) =>
        prev.map((account) =>
          account._id === seller._id
            ? { ...account, ...response.data.seller }
            : account
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update seller approval."
      );

      await fetchSellers();
    } finally {
      setUpdatingId(null);
    }
  };

  // Activate or deactivate an approved seller
  const toggleStatus = async (seller) => {
    if (seller.sellerStatus !== "approved") return;

    const nextStatus = !seller.isActive;

    const confirmed = window.confirm(
      `${nextStatus ? "Activate" : "Deactivate"} ${seller.name}'s seller account?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(seller._id);
      setError("");

      await api.put(`/admin/sellers/${seller._id}/status`, {
        isActive: nextStatus,
      });

      setSellers((prev) =>
        prev.map((account) =>
          account._id === seller._id
            ? { ...account, isActive: nextStatus }
            : account
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update seller status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingSellers = sellers.filter(
    (seller) => seller.sellerStatus === "pending"
  ).length;

  const approvedSellers = sellers.filter(
    (seller) => seller.sellerStatus === "approved"
  ).length;

  const rejectedSellers = sellers.filter(
    (seller) => seller.sellerStatus === "rejected"
  ).length;

  const filteredSellers = sellers.filter((seller) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      seller.name?.toLowerCase().includes(query) ||
      seller.email?.toLowerCase().includes(query) ||
      seller.phone?.includes(query) ||
      seller.storeName?.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" &&
        seller.sellerStatus === "pending") ||
      (statusFilter === "approved" &&
        seller.sellerStatus === "approved") ||
      (statusFilter === "rejected" &&
        seller.sellerStatus === "rejected") ||
      (statusFilter === "legacy" &&
        !seller.sellerStatus) ||
      (statusFilter === "active" && seller.isActive) ||
      (statusFilter === "inactive" && !seller.isActive);

    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      label: "Total Sellers",
      value: sellers.length,
      icon: Store,
      style: "bg-pink-50 text-[#B76E79]",
    },
    {
      label: "Pending Applications",
      value: pendingSellers,
      icon: Clock3,
      style: "bg-amber-50 text-amber-600",
    },
    {
      label: "Approved Sellers",
      value: approvedSellers,
      icon: CheckCircle2,
      style: "bg-green-50 text-green-600",
    },
    {
      label: "Rejected Applications",
      value: rejectedSellers,
      icon: XCircle,
      style: "bg-red-50 text-red-600",
    },
  ];

  const getApprovalBadge = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700";
      case "approved":
        return "bg-green-50 text-green-700";
      case "rejected":
        return "bg-red-50 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-[#B76E79]">
            Glowé Administration
          </p>

          <h1 className="font-serif text-3xl text-gray-900">
            Seller Management
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Review seller applications and manage marketplace accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSellers}
          disabled={loading || updatingId !== null}
          className="inline-flex items-center gap-2 rounded-xl border border-[#F0E5E5] bg-white px-4 py-2.5 text-sm text-gray-600 transition hover:bg-[#FAF3F4] disabled:opacity-50"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-[#F0E5E5] bg-white p-5 shadow-sm"
            >
              <div
                className={`inline-flex rounded-xl p-3 ${stat.style}`}
              >
                <Icon size={21} />
              </div>

              <p className="mt-4 text-sm text-gray-500">
                {stat.label}
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                {loading ? "..." : stat.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Seller Table */}
      <div className="overflow-hidden rounded-2xl border border-[#F0E5E5] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0E5E5] p-5">
          <div className="relative w-full sm:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search name, email or store..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#F0E5E5] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#B76E79]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter sellers"
            className="rounded-xl border border-[#F0E5E5] bg-white px-4 py-2.5 text-sm text-gray-600 outline-none focus:border-[#B76E79]"
          >
            <option value="all">All Sellers</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="legacy">Needs Migration</option>
            <option value="active">Active Accounts</option>
            <option value="inactive">Inactive Accounts</option>
          </select>
        </div>

        {error && (
          <div
            role="alert"
            className="border-b border-red-200 bg-red-50 p-4 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Loading sellers...
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {sellers.length === 0
              ? "No registered sellers found."
              : "No sellers match your search or filter."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-[#FAF8F7] text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Seller</th>
                  <th className="px-5 py-4 font-medium">Store</th>
                  <th className="px-5 py-4 font-medium">Phone</th>
                  <th className="px-5 py-4 font-medium">Joined</th>
                  <th className="px-5 py-4 font-medium">Approval</th>
                  <th className="px-5 py-4 font-medium">Account</th>
                  <th className="px-5 py-4 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredSellers.map((seller) => (
                  <tr
                    key={seller._id}
                    className="border-t border-[#F0E5E5] hover:bg-[#FAF8F7]/60"
                  >
                    {/* Seller */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FAE9EC] font-semibold text-[#B76E79]">
                          {seller.name?.charAt(0).toUpperCase() || "?"}
                        </div>

                        <div>
                          <p className="font-medium text-gray-900">
                            {seller.name || "Unknown"}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {seller.email || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Store */}
                    <td className="px-5 py-4 font-medium text-gray-700">
                      {seller.storeName || "—"}
                    </td>

                    {/* Phone */}
                    <td className="px-5 py-4 text-gray-600">
                      {seller.phone || "—"}
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-4 text-gray-600">
                      {seller.createdAt
                        ? new Date(seller.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "—"}
                    </td>

                    {/* Approval Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getApprovalBadge(
                          seller.sellerStatus
                        )}`}
                      >
                        {seller.sellerStatus
                          ? seller.sellerStatus.charAt(0).toUpperCase() +
                            seller.sellerStatus.slice(1)
                          : "Needs Migration"}
                      </span>
                    </td>

                    {/* Account Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          seller.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {seller.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      {seller.sellerStatus === "pending" ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleApproval(seller, "approved")
                            }
                            disabled={updatingId !== null}
                            className="inline-flex items-center gap-1 rounded-lg border border-green-100 px-3 py-2 text-xs font-medium text-green-700 transition hover:bg-green-50 disabled:opacity-50"
                          >
                            <Check size={15} />
                            Approve
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleApproval(seller, "rejected")
                            }
                            disabled={updatingId !== null}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-100 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            <X size={15} />
                            Reject
                          </button>
                        </div>
                      ) : seller.sellerStatus === "approved" ? (
                        <button
                          type="button"
                          onClick={() => toggleStatus(seller)}
                          disabled={updatingId !== null}
                          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition disabled:opacity-50 ${
                            seller.isActive
                              ? "border-red-100 text-red-600 hover:bg-red-50"
                              : "border-green-100 text-green-700 hover:bg-green-50"
                          }`}
                        >
                          <Power size={15} />
                          {updatingId === seller._id
                            ? "Updating..."
                            : seller.isActive
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">
                          No actions available
                        </span>
                      )}
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
