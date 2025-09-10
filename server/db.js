const { Sequelize } = require("sequelize");
require("dotenv").config();
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  host: "db.smbhmogewcuqwkfaeyme.supabase.co",
  port: 5432,
});


// Test the connection
sequelize
  .authenticate()
  .then(() =>
    console.log("Database connection has been established successfully.")
  )
  .catch((err) => console.error("Unable to connect to the database:", err));

module.exports = sequelize;
