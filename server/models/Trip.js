const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Trip = sequelize.define("Trip", {
  routeName: { type: DataTypes.STRING, allowNull: false },
  departureTime: { type: DataTypes.DATE, allowNull: false },
  arrivalTime: { type: DataTypes.DATE, allowNull: false },
  busType: { type: DataTypes.STRING, defaultValue: "Sleeper" },
  // e.g., { rows: 10, seatsPerRow: 4 }
  seatLayout: { type: DataTypes.JSONB, allowNull: false },
  seatPrice: { type: DataTypes.FLOAT, allowNull: false },
});

module.exports = Trip;
