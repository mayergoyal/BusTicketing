import React from "react";
import Seat from "./Seat";

// Make sure you are passing all needed props in the function signature
const SeatMap = ({ seats, onSeatClick, currentUserId }) => {
  return (
    <div className="seat-map">
      {/* Use parentheses for an implicit return */}
      {seats.map((seat) => (
        <Seat
          key={seat.id}
          seat={seat}
          onSeatClick={onSeatClick}
          // The prop should probably be named isHeldByMe or similar
          isMyHold={seat.status === "held" && seat.userId === currentUserId}
        />
      ))}
    </div>
  );
};

export default SeatMap;
