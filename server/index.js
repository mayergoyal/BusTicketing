require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const sequelize = require("./db");
const redis = require("./redis");

// Models
require("./models/Trip");
require("./models/Seat");
require("./models/Booking");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Server Setup for Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Best to replace with your frontend URL in production
    methods: ["GET", "POST"],
  },
});

// --- CORRECT ORDER FOR ROUTES ---

// 1. API Routes (These must come BEFORE the static file serving)
const tripRoutes = require("./routes/trips");
const bookingRoutes = require("./routes/bookings")(io);
app.use("/api/trips", tripRoutes);
app.use("/api/bookings", bookingRoutes);

// 2. Production Frontend Serving (This must come AFTER API routes)
app.use(express.static(path.join(__dirname, "public")));

// The "catchall" handler: for any request that doesn't match one above,
// send back React's index.html file.
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// --- END OF ROUTES ---

// Database Sync
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("All models were synchronized successfully.");
  })
  .catch((err) => {
    console.error("Failed to sync database:", err);
  });

// WebSocket Logic
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinTripRoom", (tripId) => {
    socket.join(tripId);
    console.log(`User ${socket.id} joined room for trip ${tripId}`);
  });

  socket.on("holdSeat", async ({ tripId, seatId, userId }) => {
    const key = `trip:${tripId}:seat:${seatId}`;
    const HOLD_DURATION_SECONDS = 300;

    const result = await redis.set(
      key,
      userId,
      "EX",
      HOLD_DURATION_SECONDS,
      "NX"
    );

    if (result === "OK") {
      io.to(tripId).emit("seatStatusUpdate", {
        seatId,
        status: "held",
        userId,
      });
    } else {
      socket.emit("holdFailed", { seatId, message: "Seat is already held." });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the Server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
