const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Seat = sequelize.define("Seat", {
  seatNumber: { type: DataTypes.STRING, allowNull: false }, // e.g., 'A1', 'B2'
  status: {
    type: DataTypes.ENUM("available", "held", "sold"),
    defaultValue: "available",
  },
  tripId: {
    type: DataTypes.INTEGER,
    references: { model: "Trips", key: "id" },
  },
  userId: { type: DataTypes.STRING, allowNull: true }, // To track who holds/bought it
});

module.exports = Seat;
