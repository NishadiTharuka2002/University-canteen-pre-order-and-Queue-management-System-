import { useState } from "react";
import api from "../api";

export default function Cart({ cart, setCart }) {
  const [pickupTime, setPickupTime] = useState("");
  const [message, setMessage] = useState("");

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  function updateQuantity(id, quantity) {
    if (quantity < 1) return;

    setCart(currentCart =>
      currentCart.map(item =>
        item._id === id
          ? { ...item, quantity: Math.min(quantity, item.stock) }
          : item
      )
    );
  }

  function removeItem(id) {
    setCart(currentCart =>
      currentCart.filter(item => item._id !== id)
    );
  }

  async function placeOrder(event) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await api.post("/orders", {
        items: cart.map(item => ({
          menuItem: item._id,
          quantity: item.quantity
        })),
        pickupTime
      });

      setMessage(`Order placed! Order ID: ${response.data._id}`);
      setCart([]);
      setPickupTime("");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not place order"
      );
    }
  }

  return (
    <section>
      <h2>Your Cart</h2>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cart.map(item => (
            <article key={item._id}>
              <h3>{item.name}</h3>
              <p>Rs. {item.price}</p>

              <button
                onClick={() =>
                  updateQuantity(item._id, item.quantity - 1)
                }
                disabled={item.quantity <= 1}
              >
                -
              </button>

              <span> {item.quantity} </span>

              <button
                onClick={() =>
                  updateQuantity(item._id, item.quantity + 1)
                }
                disabled={item.quantity >= item.stock}
              >
                +
              </button>

              <button onClick={() => removeItem(item._id)}>
                Remove
              </button>
            </article>
          ))}

          <h3>Total: Rs. {total}</h3>

          <form onSubmit={placeOrder}>
            <label>
              Pickup time:
              <input
                type="datetime-local"
                value={pickupTime}
                min={new Date(Date.now() + 60000)
                  .toISOString()
                  .slice(0, 16)}
                required
                onChange={event =>
                  setPickupTime(event.target.value)
                }
              />
            </label>

            <button type="submit">Place Pre-Order</button>
          </form>
        </>
      )}

      {message && <p>{message}</p>}
    </section>
  );
}
