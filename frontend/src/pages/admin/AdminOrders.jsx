
import { useEffect, useState } from "react";
import {
  Search,
  ShoppingBag,
  Clock3,
  CheckCircle2,
  CreditCard,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import api from "../../utils/api";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  processing: "bg-purple-50 text-purple-700",
  shipped: "bg-indigo-50 text-indigo-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
  paid: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-700",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${
        statusStyles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      setError("");

      const response = await api.get("/admin/orders");
      setOrders(response.data.orders || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, orderStatus) => {
    const previousOrder = orders.find(
      (order) => order._id === orderId
    );

    if (!previousOrder || previousOrder.orderStatus === orderStatus) {
      return;
    }

    const confirmed = window.confirm(
      `Change order status to "${orderStatus}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setUpdatingOrderId(orderId);

      await api.put(`/admin/orders/${orderId}/status`, {
        orderStatus,
      });

      await fetchOrders();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update order status."
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      order._id?.toLowerCase().includes(query) ||
      order.user?.name?.toLowerCase().includes(query) ||
      order.user?.email?.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "all" ||
      order.orderStatus === statusFilter;

    const matchesPayment =
      paymentFilter === "all" ||
      order.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const summaryCards = [
    {
      title: "Total Orders",
      value: orders.length,
      icon: ShoppingBag,
      color: "bg-pink-50 text-pink-600",
    },
    {
      title: "Paid Orders",
      value: orders.filter(
        (order) => order.paymentStatus === "paid"
      ).length,
      icon: CreditCard,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Pending Orders",
      value: orders.filter(
        (order) =>
          order.paymentStatus === "paid" &&
          !["delivered", "cancelled"].includes(
            order.orderStatus
          )
      ).length,
      icon: Clock3,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Delivered Orders",
      value: orders.filter(
        (order) => order.orderStatus === "delivered"
      ).length,
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="mb-2 text-sm font-medium text-[#B76E79]">
          Glowé Administration
        </p>

        <h1 className="text-3xl font-serif text-gray-900">
          Order Management
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Monitor orders, payments, and seller fulfillment.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-[#F0E5E5] bg-white p-5 shadow-sm"
            >
              <div className={`inline-flex rounded-xl p-3 ${card.color}`}>
                <Icon size={21} />
              </div>

              <p className="mt-4 text-sm text-gray-500">
                {card.title}
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                {loading ? "..." : card.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-2xl border border-[#F0E5E5] bg-white shadow-sm">
        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-3 border-b border-[#F0E5E5] p-5">
          <div className="relative min-w-[220px] flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search order ID, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#F0E5E5] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#B76E79]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by order status"
            className="rounded-xl border border-[#F0E5E5] bg-white px-4 py-2.5 text-sm text-gray-600"
          >
            <option value="all">All Statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            aria-label="Filter by payment status"
            className="rounded-xl border border-[#F0E5E5] bg-white px-4 py-2.5 text-sm text-gray-600"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {error && (
          <div role="alert" className="border-b border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Loading orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No orders match your search or filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-[#FAF8F7] text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Order</th>
                  <th className="px-5 py-4 font-medium">Customer</th>
                  <th className="px-5 py-4 font-medium">Total</th>
                  <th className="px-5 py-4 font-medium">Payment</th>
                  <th className="px-5 py-4 font-medium">Order Status</th>
                  <th className="px-5 py-4 font-medium">Date</th>
                  <th className="px-5 py-4 font-medium">Details</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => {
                  const isFinalStatus = [
                    "delivered",
                    "cancelled",
                  ].includes(order.orderStatus);

                  const isExpanded =
                    expandedOrderId === order._id;

                  return (
                    <FragmentOrder
                      key={order._id}
                      order={order}
                      isFinalStatus={isFinalStatus}
                      isExpanded={isExpanded}
                      updating={updatingOrderId === order._id}
                      onUpdate={updateStatus}
                      onToggle={() =>
                        setExpandedOrderId(
                          isExpanded ? null : order._id
                        )
                      }
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function FragmentOrder({
  order,
  isFinalStatus,
  isExpanded,
  updating,
  onUpdate,
  onToggle,
}) {
  return (
    <>
      <tr className="border-t border-[#F0E5E5] hover:bg-[#FAF8F7]/60">
        <td className="px-5 py-4">
          <p className="font-medium text-gray-900">
            #{order._id?.slice(-8).toUpperCase()}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {order.items?.length || 0} items
          </p>
        </td>

        <td className="px-5 py-4">
          <p className="font-medium text-gray-900">
            {order.user?.name || "Unknown"}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {order.user?.email || "—"}
          </p>
        </td>

        <td className="px-5 py-4 font-medium text-gray-900">
          {formatCurrency(order.totalPrice)}
        </td>

        <td className="px-5 py-4">
          <StatusBadge status={order.paymentStatus} />
        </td>

        <td className="px-5 py-4">
          <select
            value={order.orderStatus || "pending"}
            disabled={updating || isFinalStatus}
            onChange={(e) =>
              onUpdate(order._id, e.target.value)
            }
            aria-label={`Status for order ${order._id}`}
            className="rounded-lg border border-[#F0E5E5] bg-white px-3 py-2 text-sm capitalize disabled:cursor-not-allowed disabled:opacity-60"
          >
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>

          {updating && (
            <p className="mt-1 text-xs text-gray-500">
              Updating...
            </p>
          )}
        </td>

        <td className="px-5 py-4 text-gray-600">
          {formatDate(order.createdAt)}
        </td>

        <td className="px-5 py-4">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isExpanded}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-[#B76E79] hover:bg-[#FBEDEF]"
          >
            {isExpanded ? (
              <>
                Hide <ChevronUp size={16} />
              </>
            ) : (
              <>
                View <ChevronDown size={16} />
              </>
            )}
          </button>
        </td>
      </tr>

      {isExpanded && (
        <tr className="bg-[#FAF8F7]">
          <td colSpan={7} className="px-6 py-6">
            <h3 className="mb-4 font-medium text-gray-900">
              Order Items
            </h3>

            <div className="space-y-3">
              {(order.items || []).map((item) => (
                <div
                  key={item._id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#F0E5E5] bg-white p-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Seller: {item.seller?.name || "Unknown"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>

                    <div className="mt-2">
                      <StatusBadge
                        status={item.fulfillmentStatus}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
