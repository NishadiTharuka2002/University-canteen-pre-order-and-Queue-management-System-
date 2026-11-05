import { useEffect, useState } from "react";
import api from "../api";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/orders/my")
      .then(response => setOrders(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <section>
      <h2>My Orders</h2>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map(order => (
          <article key={order._id}>
            <h3>Order ID: {order._id}</h3>
            <p>Status: {order.status}</p>
            <p>Pickup: {new Date(order.pickupTime).toLocaleString()}</p>
            <p>Total: Rs. {order.totalAmount}</p>

            <ul>
              {order.items.map((item, index) => (
                <li key={index}>
                  {item.name} × {item.quantity}
                </li>
              ))}
            </ul>
          </article>
        ))
      )}
    </section>
  );
}
