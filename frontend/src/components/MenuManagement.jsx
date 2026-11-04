import { useEffect, useState } from "react";
import api from "../api";

const emptyForm = {
  name: "",
  category: "",
  description: "",
  price: "",
  stock: "",
};

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  async function loadItems() {
    try {
      const response = await api.get("/menu");
      setItems(response.data);
    } catch (error) {
      setMessage("Could not load menu items");
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function addItem(event) {
    event.preventDefault();
    setMessage("");

    try {
      await api.post("/menu", {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      });

      setForm(emptyForm);
      setMessage("Menu item added successfully");
      loadItems();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not add menu item");
    }
  }

  async function updateStock(id, stock) {
    try {
      await api.put(`/menu/${id}`, {
        stock: Number(stock),
      });

      loadItems();
    } catch (error) {
      setMessage("Could not update stock");
    }
  }

  async function toggleAvailability(item) {
    try {
      await api.put(`/menu/${item._id}`, {
        available: !item.available,
      });

      loadItems();
    } catch (error) {
      setMessage("Could not update availability");
    }
  }

  async function deleteItem(id) {
    if (!window.confirm("Delete this menu item?")) return;

    try {
      await api.delete(`/menu/${id}`);
      setMessage("Menu item deleted");
      loadItems();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not delete item");
    }
  }

  return (
    <section>
      <h2>Menu & Inventory Management</h2>

      <form onSubmit={addItem}>
        <input
          placeholder="Food name"
          value={form.name}
          required
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Category"
          value={form.category}
          required
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />

        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <input
          type="number"
          placeholder="Price"
          min="0"
          value={form.price}
          required
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        <input
          type="number"
          placeholder="Stock quantity"
          min="0"
          value={form.stock}
          required
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
        />

        <button type="submit">Add Menu Item</button>
      </form>

      {message && <p>{message}</p>}

      <h3>Current Menu</h3>

      {items.map((item) => (
        <article key={item._id}>
          <h4>{item.name}</h4>
          <p>Category: {item.category}</p>
          <p>Price: Rs. {item.price}</p>
          <p>Stock: {item.stock}</p>
          <p>Availability: {item.available ? "Available" : "Unavailable"}</p>

          <button onClick={() => updateStock(item._id, item.stock + 10)}>
            Add 10 Stock
          </button>

          <button onClick={() => toggleAvailability(item)}>
            {item.available ? "Mark Unavailable" : "Mark Available"}
          </button>

          <button onClick={() => deleteItem(item._id)}>Delete</button>
        </article>
      ))}
    </section>
  );
}
