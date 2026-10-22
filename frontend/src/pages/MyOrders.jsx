import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import api from "../utils/api";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  let isMounted = true;

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders");

      if (isMounted) {
        setOrders(Array.isArray(data) ? data : data.orders ?? []);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (orders.length === 0) {
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
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString()}
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
                      ₹
                      {(
                        item.price * item.quantity
                      ).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}