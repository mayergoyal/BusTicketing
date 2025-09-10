require("dotenv").config();
const express = require("express");
const cors = require("cors");
const TripRoutes = require("./routes/Trip");
const http=require("http");
const {Server}=require("socket.io");
const redis=require("./redis");
const Booking =require('./models/Booking')
const path=require("path");
const Trip = require("./models/Trip");
const sequelize = require("./db");

const Seat = require("./models/Seat");
const app = express();
app.use(cors()); // Allow requests from our frontend
app.use(express.json()); // Allow server to accept JSON data
const server=http.createServer(app);//creating an http server from our express app
const io=new Server(server,{ //attaching socket.io with this server that i just made
   cors:{
    origin:"*",
    methods:["GET","POST"]
   }
})
const bookingRoutes = require("./routes/bookings")(io);
const PORT = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, 'public')));
app.use("/api/trips", TripRoutes);
app.use("/api/bookings", bookingRoutes);
app.get("/", (req, res) => {
  res.send("Bus Ticketing API is running!");
});
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});



// Sync database
sequelize.sync({ alter: true }).then(() => {
  console.log("All models were synchronized successfully.");
});

//ab logic build krte hain
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // When a user views a trip page, they join a 'room' for that trip
  socket.on("joinTripRoom", (tripId) => {
    socket.join(tripId);
    console.log(`User ${socket.id} joined room for trip ${tripId}`);
  });

  // Handle seat holds
  socket.on("holdSeat", async ({ tripId, seatId, userId }) => {
    const key = `trip:${tripId}:seat:${seatId}`;
    const HOLD_DURATION_SECONDS = 300; // 5 minutes

    // 'NX' means set only if the key does not already exist.
    // 'EX' sets the expiration time in seconds.
    // This is an atomic operation, preventing race conditions.
    const result = await redis.set(
      key,
      userId,
      "EX",
      HOLD_DURATION_SECONDS,
      "NX"
    );

    if (result === "OK") {
      // Hold was successful!
      const holdExpiresAt = new Date(Date.now() + HOLD_DURATION_SECONDS * 1000);
      // Broadcast the update to everyone in the trip room
      io.to(tripId).emit("seatStatusUpdate", {
        seatId,
        status: "held",
        userId,
        holdExpiresAt:holdExpiresAt.toISOString()
      });
    } else {
      // Seat is already held
      socket.emit("holdFailed", { seatId, message: "Seat is already held." });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
