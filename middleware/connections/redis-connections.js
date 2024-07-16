const redis = require("redis");

const client = redis.createClient({
  password: "YiDuWXnAVoXV3YoXD7OiWkCbTVrAOZst",
  socket: {
    host: "redis-11660.c212.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 11660,
  },
  retry_strategy: function (options) {
    if (options.error && options.error.code === "ECONNREFUSED") {
      // End reconnecting on a specific error
      return new Error("The server refused the connection");
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      // End reconnecting after a specific timeout
      return new Error("Retry time exhausted");
    }
    if (options.attempt > 10) {
      // End reconnecting with built-in error
      return undefined;
    }
    // reconnect after
    return Math.min(options.attempt * 100, 3000);
  },
});

const redisSub = redis.createClient({
  password: "YiDuWXnAVoXV3YoXD7OiWkCbTVrAOZst",
  socket: {
    host: "redis-11660.c212.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 11660,
  },
});

client
  .connect()
  .then(() => console.log("Connected to Redis!"))
  .catch((err) => console.error("Failed to connect to Redis:", err));

redisSub
  .connect()
  .then(() => console.log("redis subscriber connected"))
  .catch((err) => console.error("Failed to connect to Redis sub:", err));

client.on("error", function (err) {
  console.error("Redis error:", err);
});

module.exports = { client, redisSub };
// exports.client = client;
// exports.redisSub = redisSub;
