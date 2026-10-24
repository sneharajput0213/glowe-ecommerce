import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  Power,
  RefreshCw,
} from "lucide-react";
import api from "../../utils/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/users");

      setUsers(response.data.users || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch customers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = (user) => {
  const nextStatus = !user.isActive;
  const action = nextStatus ? "Activate" : "Deactivate";

  toast(`${action} ${user.name}'s account?`, {
    description: `Are you sure you want to ${action.toLowerCase()} this account?`,
    duration: 15000,

    action: {
      label: action,
      onClick: async () => {
        try {
          setUpdatingId(user._id);
          setError("");

          await api.put(`/admin/users/${user._id}/status`, {
            isActive: nextStatus,
          });

          setUsers((prev) =>
            prev.map((account) =>
              account._id === user._id
                ? { ...account, isActive: nextStatus }
                : account
            )
          );

          toast.success(
            nextStatus
              ? `${user.name}'s account activated successfully!`
              : `${user.name}'s account deactivated successfully!`
          );
        } catch (err) {
          const message =
            err.response?.data?.message ||
            "Failed to update customer status.";

          setError(message);
          toast.error(message);
        } finally {
          setUpdatingId(null);
        }
      },
    },

    cancel: {
      label: "Cancel",
      onClick: () => {},
    },
  });
};

  const activeUsers = users.filter(
    (user) => user.isActive
  ).length;

  const inactiveUsers = users.filter(
    (user) => !user.isActive
  ).length;

  const filteredUsers = users.filter((user) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.phone?.includes(query);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive);

    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      label: "Total Customers",
      value: users.length,
      icon: Users,
      style: "bg-pink-50 text-[#B76E79]",
    },
    {
      label: "Active Customers",
      value: activeUsers,
      icon: UserCheck,
      style: "bg-green-50 text-green-600",
    },
    {
      label: "Inactive Customers",
      value: inactiveUsers,
      icon: UserX,
      style: "bg-red-50 text-red-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-[#B76E79]">
            Glowé Administration
          </p>

          <h1 className="font-serif text-3xl text-gray-900">
            Customer Management
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            View and manage registered customer accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-[#F0E5E5] bg-white px-4 py-2.5 text-sm text-gray-600 transition hover:bg-[#FAF3F4] disabled:opacity-50"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

      {/* Customer Table */}
      <div className="overflow-hidden rounded-2xl border border-[#F0E5E5] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0E5E5] p-5">
          <div className="relative w-full sm:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#F0E5E5] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#B76E79]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter customers by status"
            className="rounded-xl border border-[#F0E5E5] bg-white px-4 py-2.5 text-sm text-gray-600 outline-none focus:border-[#B76E79]"
          >
            <option value="all">All Customers</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
            Loading customers...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {users.length === 0
              ? "No registered customers found."
              : "No customers match your search or filter."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[#FAF8F7] text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-medium">
                    Customer
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Phone
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Joined
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Status
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="border-t border-[#F0E5E5] hover:bg-[#FAF8F7]/60"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FAE9EC] font-semibold text-[#B76E79]">
                          {user.name?.charAt(0).toUpperCase() || "?"}
                        </div>

                        <div>
                          <p className="font-medium text-gray-900">
                            {user.name || "Unknown"}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {user.email || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {user.phone || "—"}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {user.createdAt
                        ? new Date(
                            user.createdAt
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          user.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => toggleStatus(user)}
                        disabled={updatingId === user._id}
                        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition disabled:opacity-50 ${
                          user.isActive
                            ? "border-red-100 text-red-600 hover:bg-red-50"
                            : "border-green-100 text-green-700 hover:bg-green-50"
                        }`}
                      >
                        <Power size={15} />
                        {updatingId === user._id
                          ? "Updating..."
                          : user.isActive
                          ? "Deactivate"
                          : "Activate"}
                      </button>
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
