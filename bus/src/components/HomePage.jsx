
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useNavigate ,Link } from "react-router-dom";
import "./HomePage.css";
const API_URL = import.meta.env.PROD ? "" : "http://localhost:3001";
const HomePage = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
     
    useEffect(()=>{
        const fetchTrips=async()=>{
            try {
              const response = await axios.get(`${API_URL}/api/trips`);
              setTrips(response.data);
            } catch (error) {
              console.error("Error fetching trips:", error);
            } finally {
              setLoading(false);
            }
        }
        fetchTrips();

    },[]);
    if(loading){
        return <div>Loading available trips...</div>;
    }

  return (
    <>
      <div className="header">
        <div className="left">
          <FontAwesomeIcon icon={faUser} size="3x" />
          <Link to="/admin" className="admin-link">
            ADD TRIPS
          </Link>
        </div>
        
      </div>
      <div className="homepage-container">
        <h1>Available Bus Trips</h1>
        <div className="trips-list">
          {trips.length > 0 ? (
            trips.map((trip) => (
              <div
                key={trip.id}
                className="trip-card"
                onClick={() => navigate(`/trip/${trip.id}`)}
              >
                <h2>{trip.routeName}</h2>
                <p>
                  <strong>Departure:</strong>{" "}
                  {new Date(trip.departureTime).toLocaleString()}
                </p>
                <p>
                  <strong>Price:</strong> ${trip.seatPrice.toFixed(2)}
                </p>
                <button>View Seats</button>
              </div>
            ))
          ) : (
            <p>No available trips at the moment.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default HomePage