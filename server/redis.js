const Redis = require("ioredis");
require("dotenv").config();
const redis = new Redis(process.env.REDIS_URL);
redis.on("connect", () => console.log("redis connected"));
redis.on("error", (err) => console.log(err));

module.exports = redis;
