require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const sequelize = require("./db");
const redis = require("./redis");

// Models (yeh sure karein ki models sync hone se pehle import ho gaye hain)
const Trip = require("./models/Trip");
const Seat = require("./models/Seat");
const Booking = require("./models/Booking");

const app = express();

// Basic Middleware
app.use(cors());
app.use(express.json());

// Server Setup for Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Production mein ise apne frontend URL se replace karein
    methods: ["GET", "POST"],
  },
});

// --- CORRECT ORDER FOR ROUTES ---

// 1. API Routes
// Note: File ka naam 'trips.js' hona behtar hai, 'Trip.js' ki jagah
const tripRoutes = require("./routes/trips");
const bookingRoutes = require("./routes/bookings")(io);
app.use("/api/trips", tripRoutes);
app.use("/api/bookings", bookingRoutes);

// 2. Serve Static Files (React App)
// Yeh API routes ke baad aana chahiye
app.use(express.static(path.join(__dirname, "public")));

// 3. The "Catch-all" handler for Single Page Aplication (SPA)
// Yeh sabse aakhir mein hona chahiye
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Database Sync
sequelize.sync({ alter: true }).then(() => {
  console.log("All models were synchronized successfully.");
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
    const HOLD_DURATION_SECONDS = 300; // 5 minutes

    const result = await redis.set(
      key,
      userId,
      "EX",
      HOLD_DURATION_SECONDS,
      "NX"
    );

    if (result === "OK") {
      const holdExpiresAt = new Date(Date.now() + HOLD_DURATION_SECONDS * 1000);
      io.to(tripId).emit("seatStatusUpdate", {
        seatId,
        status: "held",
        userId,
        holdExpiresAt: holdExpiresAt.toISOString(),
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
