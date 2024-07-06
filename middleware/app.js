const express = require("express");
const bodyParser = require("body-parser");
const amqp = require("amqplib");
const redis = require("redis");
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");
const ws = require("ws");
const { INTEGER } = require("sequelize");

const wss = new ws.WebSocketServer({ port: 8080 });
const app = express();
const client = redis.createClient({
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

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "POST,GET,PATCH,DELETE");
  next();
});

let sockets = [];
// let clientStates = new Map();

wss.on("connection", async (socket) => {
  console.log("new connection");
  sockets.push(socket);
  await client.set("start-stop-notifier", "stop");
  const notifierState = await client.get("start-stop-notifier");
  console.log("current notifier state :", notifierState);

  const { channel, qname } = await establishRmqChannel();

  // clientStates.set(socket, { started: false });

  socket.on("message", async (message) => {
    const data = message.toString();
    console.log(data);
    if (data === "start channel") {
      // clientStates.get(socket).started = true;
      try {
        await client.set("start-stop-notifier", "start");
      } catch (err) {
        console.log("err in setting key", err);
      } finally {
        console.log("notifier key set to start");
      }
    } else if (data === "end channel") {
      // clientStates.get(socket).started = false;
      try {
        await client.set("start-stop-notifier", "stop");
      } catch (err) {
        console.log("err in setting key", err);
      } finally {
        console.log("notifier key set to stop");
      }
      sockets.forEach((socket) => {
        if (socket.readyState === ws.OPEN) {
          socket.send("end");
        }
      });
    }
  });

  socket.on("close", () => {
    console.log("client disconnected");
    // client.quit();
    sockets.filter((s) => {
      return s !== socket;
    });
  });

  sendThroughSocket(channel, qname);
});

async function establishRmqChannel() {
  let channel;
  const qname = "levels_data";
  try {
    const connection = await amqp.connect("amqp://localhost");
    channel = await connection.createChannel(); // Corrected to not pass `connection` as a parameter
    channel.assertQueue(qname, { durable: false });
    console.log("Channel created");
  } catch (error) {
    console.error("Error in establishRmqChannel:", error);
  }
  return { channel, qname };
}

async function sendThroughSocket(channel, qname) {
  channel.consume(qname, async (message) => {
    const current_time = new Date();
    try {
      const data = message.content.toString();

      if (data === "end") {
        console.log("end");
        try {
          await client.set("start-stop-notifier", "stop");
        } catch (err) {
          console.log("err in setting key", err);
        } finally {
          console.log("notifier key set to stop");
        }
        sockets.forEach((socket) => {
          if (socket.readyState === ws.OPEN) {
            socket.send("end");
          }
        });
      } else {
        const value = JSON.parse(data);
        // const new_time = new Date(current_time.getTime() + value.time * 1000);
        // value.time = new_time.getTime();

        // console.log(time);

        try {
          sockets.forEach((socket) => {
            if (socket.readyState === ws.OPEN) {
              console.log(value);
              socket.send(JSON.stringify(value));
            }
          });
        } catch (err) {
          console.log("err in sockert", err);
        }
      }
      channel.ack(message);
    } catch (err) {
      console.log("err in consuming ", err);
      throw err;
    }
  });
}

async function evaporateData(channel, qname) {
  channel.consume(qname, async (message) => {
    console.log(message.content.toString());
  });
}

app.post("/", async (req, res, next) => {
  res.json({ message: "successful" });
});

app.get("/sessiondata", async (req, res, next) => {
  console.log("inside server");
  const reqstdSession = req.query.session;
  const patientId = "p001"; //req.query.patientId
  const sessionSetsKey = `patients:${patientId}:sessions`;
  console.log(sessionSetsKey);
  const sessionsList = await client.zRange(sessionSetsKey, 0, -1);
  console.log(sessionsList);

  if (reqstdSession === "all") {
    res.send({});
  } else {
    const sessionNumber = parseInt(reqstdSession, 10);
    console.log(sessionNumber);
    const reqstdSessionId = sessionsList[sessionsList.length - sessionNumber];
    console.log(reqstdSessionId);
    const sessionKey = `patients:${patientId}:${reqstdSessionId}`;
    const sessionData = await client.ts.range(sessionKey, "-", "+");
    console.log(sessionData);
    res.send(sessionData);
  }
});

const port = 8000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
