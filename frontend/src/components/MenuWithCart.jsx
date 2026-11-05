import { useEffect, useState } from "react";
import api from "../api";
import Cart from "./Cart";

export default function MenuWithCart() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    api.get("/menu")
      .then(response => setMenuItems(response.data))
      .catch(error => console.error(error));
  }, []);

  function addToCart(item) {
    setCart(currentCart => {
      const existingItem = currentCart.find(
        cartItem => cartItem._id === item._id
      );

      if (existingItem) {
        return currentCart.map(cartItem =>
          cartItem._id === item._id
            ? {
                ...cartItem,
                quantity: Math.min(
                  cartItem.quantity + 1,
                  item.stock
                )
              }
            : cartItem
        );
      }

      return [
        ...currentCart,
        { ...item, quantity: 1 }
      ];
    });
  }

  return (
    <main>
      <h2>Menu</h2>

      {menuItems.map(item => (
        <article key={item._id}>
          <h3>{item.name}</h3>
          <p>{item.description}</p>
          <p>Price: Rs. {item.price}</p>

          {item.available && item.stock > 0 ? (
            <button onClick={() => addToCart(item)}>
              Add to Cart
            </button>
          ) : (
            <p>Out of stock</p>
          )}
        </article>
      ))}

      <Cart cart={cart} setCart={setCart} />
    </main>
  );
}
