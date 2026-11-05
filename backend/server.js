import menuRoutes from "./src/routes/menuRoutes.js";
import http from "http";
import { initializeSocket } from "./src/socket.js";
import orderStatusRoutes from "./src/routes/orderStatusRoutes.js";


app.use("/api/menu", menuRoutes);
// app = existing Express application
const server = http.createServer(app);

initializeSocket(server);

app.use("/api/order-status", orderStatusRoutes);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




