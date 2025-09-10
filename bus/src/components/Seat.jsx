import React from "react";

const Seat = ({ seat, onSeatClick, isMyHold }) => {
  const isClickable = seat.status === "available";

  const getSeatClass = () => {
    if (isMyHold) return "my-hold";
    return seat.status;
  };

  const handleClick = () => {
    if (isClickable) {
      onSeatClick(seat);
    }
  };

  return (
    <div
      className={`seat ${getSeatClass()}`}
      onClick={handleClick}
      title={`Seat ${seat.seatNumber} - ${seat.status}`}
    >
      {seat.seatNumber}
    </div>
  );
};

export default Seat;
