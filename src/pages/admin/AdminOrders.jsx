import { useEffect, useState } from "react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

const fetchOrders = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:5000/api/orders/allorders",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to fetch orders"
      );
    }

    setOrders(data);
  } catch (error) {
    console.log(error);
  }
};

useEffect(() => {
  fetchOrders();
}, []);

const updateStatus = async (
  orderId,
  status
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:5000/api/orders/${orderId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to update status"
      );
    }

    fetchOrders();
  } catch (error) {
    console.log(error);
  }
};

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-5xl mb-8">
          Orders
        </h1>

        <div className="bg-card rounded-3xl border border-border overflow-hidden">

          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left">
                  Customer
                </th>

                <th className="p-4 text-left">
                  Email
                </th>

                <th className="p-4 text-left">
                  Total
                </th>

                <th className="p-4 text-left">
                  Status
                </th>

                <th className="p-4 text-left">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b"
                >
                  <td className="p-4">
                    {order.user?.name}
                  </td>

                  <td className="p-4">
                    {order.user?.email}
                  </td>

                  <td className="p-4">
                    ₹{order.totalPrice}
                  </td>

                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateStatus(
                          order._id,
                          e.target.value
                        )
                      }
                      className="border rounded-lg p-2"
                    >
                      <option>
                        Pending
                      </option>

                      <option>
                        Processing
                      </option>

                      <option>
                        Shipped
                      </option>

                      <option>
                        Delivered
                      </option>
                    </select>
                  </td>

                  <td className="p-4">
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>
      </div>
    </div>
  );
}