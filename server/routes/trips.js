const router = require("express").Router();
const Trip = require("../models/Trip");
const Seat = require("../models/Seat");


//get all trips
router.get('/',async(req,res)=>{
  try{
    const trips=await Trip.findAll({
      order:[['departureTime','ASC']]

    });
    res.status(200).json(trips);

  }
  catch(error){
    res.status(500).json({error:error.message});
  }
})
// Create a new Bus Trip
router.post("/", async (req, res) => {
  try {
    const { routeName, departureTime, arrivalTime, seatLayout, seatPrice } =
      req.body;
    const newTrip = await Trip.create({
      routeName,
      departureTime,
      arrivalTime,
      seatLayout,
      seatPrice,
    });

    // When a trip is created, let's auto-generate its seats
    const seats = [];
    for (let row = 1; row <= seatLayout.rows; row++) {
      for (let seatNum = 1; seatNum <= seatLayout.seatsPerRow; seatNum++) {
        seats.push({
          seatNumber: `${String.fromCharCode(64 + row)}${seatNum}`, // A1, A2, B1, B2...
          status: "available",
          tripId: newTrip.id,
        });
      }
    }
    await Seat.bulkCreate(seats);

    res.status(201).json(newTrip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific trip with its seats
router.get("/:id", async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    const seats = await Seat.findAll({ where: { tripId: req.params.id } });
    res.status(200).json({ trip, seats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
