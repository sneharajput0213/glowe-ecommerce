
import { useEffect, useState } from "react";
import { ShoppingBag, CalendarDays } from "lucide-react";
import api from "../../utils/api";

const nextStatus = {
  pending: "processing",
  processing: "shipped",
  shipped: "delivered",
};

function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchOrders = async () => {
    try {
      setError("");

      const { data } = await api.get("/orders/seller");

      setOrders(data.orders || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load seller orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, itemId, status) => {
    try {
      setUpdatingId(itemId);
      setError("");
      setSuccess("");

      await api.put(
        `/orders/${orderId}/items/${itemId}/status`,
        { fulfillmentStatus: status }
      );

      await fetchOrders();

      setSuccess("Fulfillment status updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update fulfillment status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;

    return order.items.some(
      (item) => item.fulfillmentStatus === filter
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif">
          Seller Orders
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage orders containing your products.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
        <ShoppingBag className="w-8 h-8 text-primary" />

        <div>
          <p className="text-sm text-muted-foreground">
            Total Orders
          </p>
          <h2 className="text-2xl font-semibold">
            {orders.length}
          </h2>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          "all",
          "pending",
          "processing",
          "shipped",
          "delivered",
        ].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm capitalize ${
              filter === status
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="text-red-500">
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="text-green-600">
          {success}
        </p>
      )}

      {loading ? (
        <p>Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center">
          <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">
            No orders found.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              <div className="p-5 bg-accent/30 flex flex-wrap justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </p>

                  <p className="text-sm text-muted-foreground mt-1">
                    Customer: {order.user?.name || "Customer"}
                  </p>

                  <p className="text-xs text-muted-foreground flex items-center gap-2 mt-2">
                    <CalendarDays size={14} />
                    {new Date(order.createdAt).toLocaleDateString(
                      "en-IN"
                    )}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-lg">
                    ₹{Number(order.sellerSubtotal).toLocaleString(
                      "en-IN"
                    )}
                  </p>

                  <p className="text-sm capitalize">
                    Payment: {order.paymentStatus}
                  </p>

                  <p className="text-sm capitalize">
                    Order: {order.orderStatus}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-border">
                {order.items
                  .filter(
                    (item) =>
                      filter === "all" ||
                      item.fulfillmentStatus === filter
                  )
                  .map((item) => {
                    const next = nextStatus[item.fulfillmentStatus];

                    const canUpdate =
                      next &&
                      order.paymentStatus === "paid" &&
                      order.orderStatus !== "cancelled";

                    return (
                      <div
                        key={item._id}
                        className="p-5 flex flex-wrap items-center justify-between gap-4"
                      >
                        <div>
                          <p className="font-medium">
                            {item.name}
                          </p>

                          <p className="text-sm text-muted-foreground mt-1">
                            Qty: {item.quantity} × ₹
                            {Number(item.price).toLocaleString(
                              "en-IN"
                            )}
                          </p>

                          <p className="text-sm capitalize mt-2">
                            Status: {item.fulfillmentStatus}
                          </p>
                        </div>

                        {canUpdate && (
                          <button
                            type="button"
                            disabled={updatingId !== null}
                            onClick={() =>
                              handleUpdateStatus(
                                order._id,
                                item._id,
                                next
                              )
                            }
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm disabled:opacity-50"
                          >
                            {updatingId === item._id
                              ? "Updating..."
                              : `Mark as ${next}`}
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SellerOrders;
