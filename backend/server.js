import menuRoutes from "./src/routes/menuRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";

app.use("/api/orders", orderRoutes);
app.use("/api/menu", menuRoutes);
