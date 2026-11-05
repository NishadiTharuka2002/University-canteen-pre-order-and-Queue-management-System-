import { useEffect, useState } from "react";
import api from "../api";

const statuses = [
  "Confirmed",
  "Preparing",
  "Ready",
  "Collected",
  "Cancelled"
];

export default function StaffOrderQueue() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");

  async function loadOrders() {
    try {
      const response = await api.get("/order-status");
      setOrders(response.data);
    } catch (error) {
      setMessage("Could not load orders");
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateStatus(orderId, status) {
    try {
      await api.patch(`/order-status/${orderId}/status`, {
        status
      });

      setMessage("Order status updated");
      loadOrders();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Could not update order status"
      );
    }
  }

  return (
    <section>
      <h2>Order Queue</h2>

      {message && <p>{message}</p>}

      {orders.map(order => (
        <article key={order._id}>
          <h3>Order: {order._id}</h3>
          <p>Student: {order.user?.name}</p>
          <p>Pickup: {new Date(order.pickupTime).toLocaleString()}</p>
          <p>Status: {order.status}</p>

          {order.items.map((item, index) => (
            <p key={index}>
              {item.name} × {item.quantity}
            </p>
          ))}

          <select
            value={order.status}
            onChange={event =>
              updateStatus(order._id, event.target.value)
            }
          >
            <option value={order.status}>{order.status}</option>

            {statuses
              .filter(status => status !== order.status)
              .map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
          </select>
        </article>
      ))}
    </section>
  );
}
