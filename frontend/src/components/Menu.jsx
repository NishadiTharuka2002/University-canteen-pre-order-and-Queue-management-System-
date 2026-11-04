import { useEffect, useState } from "react";
import api from "../api";

export default function Menu() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api
      .get("/menu")
      .then((response) => setItems(response.data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <main>
      <h2>Today's Menu</h2>

      {items.map((item) => (
        <article key={item._id}>
          <h3>{item.name}</h3>
          <p>Category: {item.category}</p>
          <p>{item.description}</p>
          <p>Price: Rs. {item.price}</p>

          {item.available && item.stock > 0 ? (
            <p>Available</p>
          ) : (
            <p>Out of stock</p>
          )}
        </article>
      ))}
    </main>
  );
}
