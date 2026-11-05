import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "../api";

const SOCKET_URL = "http://localhost:3000";

export default function OrderTracking({ orderId }) {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    api.get(`/orders/${orderId}`)
      .then(response => setOrder(response.data))
      .catch(error => console.error(error));

    const socket = io(SOCKET_URL);

    socket.emit("joinOrder", orderId);

    socket.on("orderStatusUpdated", data => {
      if (data.orderId === orderId) {
        setOrder(current =>
          current ? { ...current, status: data.status } : current
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  if (!order) {
    return <p>Loading order...</p>;
  }

  return (
    <section>
      <h2>Track Your Order</h2>
      <p>Order ID: {order._id}</p>
      <p>Current Status: {order.status}</p>
      <p>Pickup Time: {new Date(order.pickupTime).toLocaleString()}</p>
    </section>
  );
}
