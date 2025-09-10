const router = require("express").Router();
const sequelize = require("../db");
const redis = require("../redis");
const Seat = require("../models/Seat");
const Booking = require("../models/Booking");
const Trip = require("../models/Trip");
const { sendBookingConfirmation } = require("../emailService");

// FIX 1: Poori file ko ek function mein wrap kiya hai jo 'io' leta hai
module.exports = (io) => {
  // FIX 2: Sirf ek hi baar '/purchase' route define kiya hai
  router.post("/purchase", async (req, res) => {
    const { tripId, seatIds, userId, userEmail } = req.body; // Assuming userEmail comes from frontend

    if (!tripId || !seatIds || !seatIds.length || !userId) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const t = await sequelize.transaction();

    try {
      // 1. Verify holds in Redis for all requested seats
      for (const seatId of seatIds) {
        const key = `trip:${tripId}:seat:${seatId}`;
        const heldByUserId = await redis.get(key);

        if (heldByUserId !== userId) {
          throw new Error(
            `Seat ${seatId} is not held by you or your hold has expired. Purchase aborted.`
          );
        }
      }

      // 2. Update the seats in the database
      // This is a critical check to prevent double booking if Redis fails
      const [affectedCount, updatedSeats] = await Seat.update(
        { status: "sold", userId: userId },
        {
          where: {
            id: seatIds,
            status: "available", // Ensures we don't re-sell a seat
          },
          transaction: t,
          returning: true,
        }
      );

      if (affectedCount !== seatIds.length) {
        throw new Error(
          "One or more seats were already sold or are not available. Purchase aborted."
        );
      }

      // 3. Create a booking record
      const trip = await Trip.findByPk(tripId, { transaction: t });
      if (!trip) {
        throw new Error("Trip not found.");
      }

      // FIX 3: Nayi booking ko ek variable mein save kiya
      const newBooking = await Booking.create(
        {
          tripId,
          userId,
          seatIds,
          totalPrice: trip.seatPrice * seatIds.length,
        },
        { transaction: t }
      );

      // 4. Commit the transaction
      await t.commit();

      // --- Post-Commit Actions ---

      // 5. Delete holds from Redis
      for (const seatId of seatIds) {
        const key = `trip:${tripId}:seat:${seatId}`;
        await redis.del(key);
      }

      // Send response to user immediately for a better experience
      res.status(200).json({ success: true, message: "Purchase successful!" });

      // 6. Broadcast the update to all clients in the room
      io.to(tripId.toString()).emit("seatsSold", { seatIds, userId });

      // 7. Trigger email and PDF generation in the background (fire and forget)
      // Pass the created booking object to the email service
      sendBookingConfirmation(
        newBooking.toJSON(),
        userEmail || "passenger@example.com"
      ); // Use real email
    } catch (error) {
      await t.rollback();
      console.error("Purchase failed:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
