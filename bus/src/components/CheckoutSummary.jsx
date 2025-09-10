import React, { useState, useEffect } from "react";

const CountdownTimer = ({ expiryTime }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(expiryTime) - +new Date();
    let timeLeft = {};
    if (difference > 0) {
      timeLeft = {
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  const timerComponents = [];
  if (timeLeft.minutes !== undefined) {
    timerComponents.push(
      <span key="1">
        {String(timeLeft.minutes).padStart(2, "0")}:
        {String(timeLeft.seconds).padStart(2, "0")}
      </span>
    );
  } else {
    return <span>Hold expired!</span>;
  }

  return (
    <div className="countdown-timer">
      Time left to purchase: {timerComponents}
    </div>
  );
};

const CheckoutSummary = ({ heldSeats, trip, onPurchase, isPurchasing }) => {
  if (heldSeats.length === 0) {
    return (
      <div className="checkout-box">
        <h3>Your Cart</h3>
        <p>Click on an available seat to add it to your cart.</p>
      </div>
    );
  }

  return (
    <div className="checkout-box">
      <h3>Your Cart</h3>
      {heldSeats.map((seat) => (
        <div key={seat.id} className="held-seat-item">
          <span>Seat {seat.seatNumber}</span>
          <span>${trip.seatPrice.toFixed(2)}</span>
        </div>
      ))}
      <hr />
      <div className="held-seat-item">
        <strong>Total</strong>
        <strong>${(trip.seatPrice * heldSeats.length).toFixed(2)}</strong>
      </div>
      <CountdownTimer expiryTime={heldSeats[0]?.holdExpiresAt} />
      <button
        className="purchase-button"
        onClick={onPurchase}
        disabled={isPurchasing}
      >
        {isPurchasing ? "Processing..." : "Purchase Now"}
      </button>
    </div>
  );
};

export default CheckoutSummary;
