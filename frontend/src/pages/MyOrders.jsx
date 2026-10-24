import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import api from "../utils/api";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failedPayments, setFailedPayments] = useState([]);
  const [retryingOrderId, setRetryingOrderId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      try {
        const [ordersResponse, failedResponse] = await Promise.all([
          api.get("/orders"),
          api.get("/payments/failed"),
        ]);

        if (isMounted) {
          const ordersData = ordersResponse.data;

          setOrders(
            Array.isArray(ordersData)
              ? ordersData
              : ordersData.orders ?? []
          );

          setFailedPayments(failedResponse.data.orders ?? []);
        }
      } catch (error) {
        console.error(
          "Error fetching orders:",
          error.response?.data?.message || error.message
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get("payment") !== "failed" || loading) {
      return;
    }

    toast.error("Payment failed. You can retry your payment below.");

    if (failedPayments.length > 0) {
      document.getElementById("payment-issues")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    navigate("/my-orders", { replace: true });
  }, [location.search, loading, failedPayments.length, navigate]);

  const handleRetryPayment = async (orderId) => {
    if (retryingOrderId) return;

    setRetryingOrderId(orderId);

    try {
      const { data: payment } = await api.post("/payments", {
        orderId,
      });

      if (!payment.action || !payment.paymentData) {
        throw new Error("Unable to initiate payment.");
      }

      const paymentForm = document.createElement("form");
      paymentForm.method = "POST";
      paymentForm.action = payment.action;

      Object.entries(payment.paymentData).forEach(([name, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = String(value ?? "");

        paymentForm.appendChild(input);
      });

      document.body.appendChild(paymentForm);
      paymentForm.submit();
    } catch (error) {
      alert(
        error.response?.data?.message ||
        error.message ||
        "Unable to retry payment."
      );

      setRetryingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

const handleCancelOrder = (orderId) => {
  const toastId = toast(
    <div className="space-y-3">
      <p className="font-medium">
        Are you sure you want to cancel this order?
      </p>

      <p className="text-sm text-muted-foreground">
        If payment was completed, a refund will be requested.
      </p>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => toast.dismiss(toastId)}
          className="px-4 py-2 rounded-lg border border-border text-sm"
        >
          Keep Order
        </button>

        <button
          type="button"
          onClick={async () => {
            toast.dismiss(toastId);

            const loadingId = toast.loading(
              "Processing cancellation..."
            );

            try {
              const { data } = await api.put(
                `/orders/${orderId}/cancel`
              );

              toast.success(
                data.message || "Cancellation request submitted",
                { id: loadingId }
              );

              const response = await api.get("/orders");
              setOrders(response.data.orders || []);
            } catch (error) {
              toast.error(
                error.response?.data?.message ||
                  "Unable to cancel order",
                { id: loadingId }
              );
            }
          }}
          className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600"
        >
          Yes, Cancel
        </button>
      </div>
    </div>,
    { duration: Infinity }
  );
};

  if (orders.length === 0 && failedPayments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />

          <h2 className="text-3xl font-serif text-foreground">
            No Orders Yet
          </h2>

          <p className="text-muted-foreground mt-2">
            Your placed orders will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-serif text-foreground mb-8">
          My Orders
        </h1>

        
      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-card border border-border rounded-3xl p-6"
          >
            {/* TOP */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-5">
              <div>
                <p className="text-sm text-muted-foreground">
                  Order ID
                </p>

                <p className="font-mono text-primary">
                  {order._id}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Date
                </p>

                <p>
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Total
                </p>

                <p className="text-xl text-primary font-semibold">
                  ₹{order.totalPrice}
                </p>
              </div>
            </div>

            {/* ITEMS */}
            <div className="mt-6 space-y-4">
              {(order.items || []).map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 items-center"
                >
                  <img
                    src={item.product?.image || item.image || ""}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl bg-accent"
                  />

                  <div className="flex-1">
                    <h3 className="text-foreground">
                      {item.name}
                    </h3>

                    <p className="text-muted-foreground text-sm">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <div className="text-primary font-medium">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* ORDER STATUS AND CANCELLATION */}
            <div className="mt-6 pt-5 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Order Status:{" "}
                  <span className="font-medium text-foreground capitalize">
                    {order.orderStatus?.replaceAll("_", " ")}
                  </span>
                </p>

                {order.orderStatus === "cancellation_requested" && (
                  <p className="text-amber-600 text-sm">
                    Cancellation requested — refund processing or review pending.
                  </p>
                )}

                {order.refundStatus === "pending" && (
                  <p className="text-amber-600 text-sm">
                    Refund pending confirmation from PayU.
                  </p>
                )}

                {order.refundStatus === "refunded" && (
                  <p className="text-green-600 text-sm">
                    Refund confirmed.
                  </p>
                )}

                {order.refundStatus === "failed" && (
                  <p className="text-red-500 text-sm">
                    Refund could not be completed. Please contact support.
                  </p>
                )}
              </div>

              {/* CANCEL ORDER BUTTON */}
              {["confirmed", "processing"].includes(order.orderStatus) &&
                order.refundStatus === "none" &&
                (order.items || []).every(
                  (item) =>
                    !["shipped", "delivered"].includes(
                      item.fulfillmentStatus
                    )
                ) && (
                  <button
                    type="button"
                    onClick={() => handleCancelOrder(order._id)}
                    className="px-5 py-2 rounded-full border border-red-500 text-red-500 hover:bg-red-50 transition whitespace-nowrap"
                  >
                    Cancel Order
                  </button>
                )}
            </div>
          </div>
        ))}
      </div>

        {/* PAYMENT ISSUES */}
        {failedPayments.length > 0 && (
          <section className="mt-12">
            <h2
              id="payment-issues"
              className="text-xl font-semibold"
            >
              Payment Issues
            </h2>

            <p className="text-muted-foreground mb-6">
              These payments were unsuccessful and are not counted
              as confirmed orders.
            </p>

            <div className="space-y-4">
              {failedPayments.map((order) => (
                <div
                  key={order._id}
                  className="bg-card border border-border rounded-2xl p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Payment unsuccessful
                      </p>

                      <p className="font-mono text-sm break-all mt-1">
                        {order._id}
                      </p>

                      <p className="text-sm text-muted-foreground mt-2">
                        {order.items?.map((item) => item.name).join(", ")}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-xl font-semibold text-foreground">
                        ₹{Number(order.totalPrice).toFixed(2)}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleRetryPayment(order._id)}
                        disabled={retryingOrderId !== null}
                        className="mt-3 px-5 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {retryingOrderId === order._id
                          ? "Processing..."
                          : "Retry Payment"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}