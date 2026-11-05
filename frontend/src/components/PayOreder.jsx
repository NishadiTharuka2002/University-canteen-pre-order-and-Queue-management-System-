import { useState } from "react";
import api from "../api";

export default function PayOrder({ orderId }) {
  const [message, setMessage] = useState("");

  async function payNow() {
    setMessage("");

    try {
      const response = await api.post(`/wallet/pay/${orderId}`);

      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Payment failed");
    }
  }

  return (
    <section>
      <button onClick={payNow}>Pay with Wallet</button>

      {message && <p>{message}</p>}
    </section>
  );
}
