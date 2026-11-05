function Admin() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.get("/analytics")
      .then(response => setData(response.data))
      .catch(error => {
        setErr(
          error.response?.data?.message ||
          "Admin access required"
        );
      });
  }, []);

  if (err) {
    return (
      <main className="panel">
        <h2>Admin Analytics</h2>
        <p className="error">{err}</p>
      </main>
    );
  }

  if (!data) {
    return <main className="panel">Loading dashboard...</main>;
  }

  return (
    <main className="panel">
      <h2>Admin Analytics Dashboard</h2>

      <div className="stats">
        <div>
          <small>Total Orders</small>
          <h2>{data.totalOrders}</h2>
        </div>

        <div>
          <small>Total Sales</small>
          <h2>{money(data.sales)}</h2>
        </div>

        <div>
          <small>Average Rating</small>
          <h2>{data.averageRating} / 5</h2>
        </div>
      </div>

      <h3>Popular Food Items</h3>
      {data.popular.length === 0 ? (
        <p>No sales data available.</p>
      ) : (
        data.popular.map(item => (
          <p key={item._id}>
            {item._id} — {item.quantity} sold
          </p>
        ))
      )}

      <h3>Peak Ordering Times</h3>
      {data.peakHours.map(item => (
        <p key={item.hour}>
          {String(item.hour).padStart(2, "0")}:00 — {item.orders} orders
        </p>
      ))}

      <h3>Daily Sales</h3>
      {data.dailySales.map(item => (
        <p key={item._id}>
          {item._id} — {money(item.sales)} ({item.orders} orders)
        </p>
      ))}

      <h3>Stock Information</h3>
      {data.stock.map(item => (
        <p key={item._id}>
          {item.name} — Stock: {item.stock}
          {!item.available && " (Unavailable)"}
        </p>
      ))}

      <h3>Customer Feedback</h3>
      {data.feedback.map(item => (
        <article className="order" key={item._id}>
          <b>{item.menuItem?.name || "Food item"}</b>
          <p>Rating: {item.rating} / 5</p>
          <p>{item.comment || "No comment"}</p>
        </article>
      ))}
    </main>
  );
}
