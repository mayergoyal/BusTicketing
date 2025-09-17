import React, { useState } from "react";
import axios from "axios";
import "./AdminPage.css"; // Iske liye CSS banayenge

const API_URL = import.meta.env.PROD ? "" : "http://localhost:3001";

const AdminPage = () => {
  const [tripData, setTripData] = useState({
    routeName: "",
    departureTime: "",
    arrivalTime: "",
    seatLayout: { rows: 10, seatsPerRow: 4 },
    seatPrice: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "rows" || name === "seatsPerRow") {
      setTripData((prevState) => ({
        ...prevState,
        seatLayout: { ...prevState.seatLayout, [name]: parseInt(value) },
      }));
    } else {
      setTripData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !tripData.routeName ||
      !tripData.departureTime ||
      !tripData.arrivalTime ||
      !tripData.seatPrice
    ) {
      alert("Please fill all the fields");
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/api/trips`, tripData);
      alert(`Trip created successfully with ID: ${response.data.id}`);
      // Form reset kar sakte hain
      setTripData({
        routeName: "",
        departureTime: "",
        arrivalTime: "",
        seatLayout: { rows: 10, seatsPerRow: 4 },
        seatPrice: "",
      });
    } catch (error) {
      console.error("Error creating trip:", error);
      alert("Failed to create trip. Check console for details.");
    }
  };

  return (
    <div className="admin-container">
      <h1>Create a New Bus Trip</h1>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label>Route Name (e.g., Delhi to Mumbai)</label>
          <input
            type="text"
            name="routeName"
            value={tripData.routeName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Departure Time</label>
          <input
            type="datetime-local"
            name="departureTime"
            value={tripData.departureTime}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Arrival Time</label>
          <input
            type="datetime-local"
            name="arrivalTime"
            value={tripData.arrivalTime}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Seat Price ($)</label>
          <input
            type="number"
            name="seatPrice"
            value={tripData.seatPrice}
            onChange={handleChange}
            required
            step="0.01"
          />
        </div>
        <div className="form-group">
          <label>Total Rows</label>
          <input
            type="number"
            name="rows"
            value={tripData.seatLayout.rows}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Seats Per Row</label>
          <input
            type="number"
            name="seatsPerRow"
            value={tripData.seatLayout.seatsPerRow}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="submit-btn">
          Create Trip
        </button>
      </form>
    </div>
  );
};

export default AdminPage;
