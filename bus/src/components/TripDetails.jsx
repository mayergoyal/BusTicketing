import React from "react";
import { FaBus, FaClock, FaMoneyBillWave } from "react-icons/fa";

const TripDetails = ({ trip }) => {
  return (
    <div className="trip-details-box">
      <h3>Trip Details</h3>
      <div className="detail-item">
        <FaBus size="1.2em" color="#007bff" />
        <span>{trip.routeName}</span>
      </div>
      <div className="detail-item">
        <FaClock size="1.2em" color="#5cb85c" />
        <span>{new Date(trip.departureTime).toLocaleString()}</span>
      </div>
      <div className="detail-item">
        <FaMoneyBillWave size="1.2em" color="#f0ad4e" />
        <span>${trip.seatPrice.toFixed(2)} per seat</span>
      </div>
    </div>
  );
};

export default TripDetails;
