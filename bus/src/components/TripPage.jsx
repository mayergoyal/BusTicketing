import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import SeatMap from "./SeatMap";

const API_URL = "http://localhost:3001";
const socket = io(API_URL);

const TripPage = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  // FIX 1: Initialize seats state with an empty array.
  const [seats, setSeats] = useState([]);
  const [userId] = useState(`user_${Math.random().toString(36).substr(2, 9)}`);
  const [heldSeats, setHeldSeats] = useState([]);

  useEffect(() => {
    const fetchTripData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/trips/${tripId}`);
        if (response.data) {
          setTrip(response.data.trip);
          // FIX 2: Ensure you are setting the seats with response.data.seats.
          // And provide a fallback to an empty array if it's missing.
          setSeats(response.data.seats || []);
        }
      } catch (error) {
        console.error("Error fetching trip data:", error);
        // Set to empty array on error to prevent crash
        setSeats([]);
      }
    };

    fetchTripData();

    socket.emit("joinTripRoom", tripId);

    socket.on("seatStatusUpdate", (updatedSeat) => {
      setSeats((prevSeats) =>
        prevSeats.map((seat) =>
          seat.id === updatedSeat.seatId
            ? {
                ...seat,
                status: updatedSeat.status,
                userId: updatedSeat.userId,
              }
            : seat
        )
      );
    });

    socket.on("seatsSold", ({ seatIds, userId: purchaserId }) => {
      setSeats((prevSeats) =>
        prevSeats.map((seat) =>
          seatIds.includes(seat.id)
            ? { ...seat, status: "sold", userId: purchaserId }
            : seat
        )
      );
    });

    socket.on("holdFailed", ({ seatId, message }) => {
      alert(`Could not hold seat ${seatId}. Reason: ${message}`);
    });

    return () => {
      socket.off("seatStatusUpdate");
      socket.off("seatsSold");
      socket.off("holdFailed");
    };
  }, [tripId]);

  useEffect(() => {
    const currentlyHeld = seats.filter(
      (seat) => seat.status === "held" && seat.userId === userId
    );
    setHeldSeats(currentlyHeld);
  }, [seats, userId]);

  const handleSeatClick = (seat) => {
    if (seat.status === "available") {
      socket.emit("holdSeat", { tripId, seatId: seat.id, userId });
      setTimeout(()=>{
        const currentSeat=seats.find(s=>s.id===seat.id);
        if(currentSeat&&currentSeat.status==="held"&&currentSeat.userId==userId){
          alert(
            `Your hold on seat ${seat.seatNumber} will expire in 1 minute!`
          );
        }
      },(HOLD_DURATION_SECONDS-60)*1000);
    }
  };

  const handlePurchase = async () => {
    if (heldSeats.length === 0) return;
    const seatIds = heldSeats.map((seat) => seat.id);
    try {
      await axios.post(`${API_URL}/api/bookings/purchase`, {
        tripId,
        seatIds,
        userId,
      });
      alert("Purchase successful!");
    } catch (error) {
      console.error(
        "Purchase failed:",
        error.response?.data?.error || error.message
      );
      alert(
        `Purchase failed: ${error.response?.data?.error || "Please try again."}`
      );
    }
  };

  // Safer loading check
  if (!trip) {
    return <div>Loading Trip...</div>;
  }

  return (
    <div className="trip-container">
      <h1>{trip.routeName}</h1>
      <p>
        Your User ID for this session: <strong>{userId}</strong>
      </p>
      <h2>Select Your Seat</h2>
      <SeatMap
        seats={seats}
        onSeatClick={handleSeatClick}
        currentUserId={userId}
      />
      {heldSeats.length > 0 && (
        <div className="checkout-section">
          <h3>
            Your Held Seats: {heldSeats.map((s) => s.seatNumber).join(", ")}
          </h3>
          <p>Total Price: ${(trip.seatPrice * heldSeats.length).toFixed(2)}</p>
          <button onClick={handlePurchase}>Purchase Now</button>
        </div>
      )}
    </div>
  );
};

export default TripPage;
