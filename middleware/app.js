const bodyParser = require("body-parser");
const amqp = require("amqplib");
const redis = require("redis");
const path = require("path");
const express = require("express");
const ws = require("ws");
const http = require("http");

const app = express();
const server = http.createServer(app);
const wss = new ws.Server({ server: server });
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

client
  .connect()
  .then(() => console.log("Connected to Redis!"))
  .catch((err) => console.error("Failed to connect to Redis:", err));

client.on("error", function (err) {
  console.error("Redis error:", err);
});

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

const _dirname = path.dirname("");
const buildpath = path.join(_dirname, "../chart-display/build");

app.use(express.static(buildpath));

app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../chart-display/build/index.html"),
    function (err) {
      if (err) {
        res.status(500).send(err);
      }
    }
  );
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
  const sessionsList = await client.zRange(sessionSetsKey, 0, -1);
  console.log(reqstdSession);

  function findXaxis(dataobj) {
    let maxlength = 0;

    for (const key in dataobj) {
      if (dataobj.hasOwnProperty(key)) {
        const currentLength = dataobj[key].length;
        if (currentLength > maxlength) {
          maxlength = currentLength;
        }
      }
    }
    const maxTimeArray = Array(maxlength)
      .fill()
      .map((_, index) => index + 1);

    return { maxTimeArray, maxlength };
  }
  function createLevelsArray(data) {
    const { maxTimeArray, maxlength } = findXaxis(data);
    const levelsArray = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const levels = data[key].map((item) => item.value);
        while (levels.length !== maxlength) {
          levels.push(null);
        }
        levelsArray[key] = levels;
      }
    }
    return levelsArray;
  }

  if (reqstdSession === "all") {
    const allData = {};
    console.log("sessionlist length", sessionsList.length);
    // if (sessionsList.length !== 3) {
    //   res.status(300).json(allData);
    //   return;
    // }
    for (let sessionIndex in sessionsList) {
      const sessionKey = `patients:${patientId}:${sessionsList[sessionIndex]}`;
      console.log(sessionKey);
      const sessionData = await client.ts.range(sessionKey, "-", "+");

      allData[sessionIndex] = sessionData;
    }
    console.log("allData");
    const { maxTimeArray, maxlength } = findXaxis(allData);
    console.log("maxTimeArray");
    const levelsArray = createLevelsArray(allData);
    const responsePackage = {
      xaxisPoints: maxTimeArray,
      levelsArray: levelsArray,
    };
    res.status(201).json(responsePackage);
  } else {
    const sessionNumber = parseInt(reqstdSession, 10);
    console.log(sessionNumber);
    const reqstdSessionId = sessionsList[sessionsList.length - sessionNumber];
    console.log(reqstdSessionId);
    const sessionKey = `patients:${patientId}:${reqstdSessionId}`;
    let sessionData;
    try {
      sessionData = await client.ts.range(sessionKey, "-", "+");
    } catch (err) {
      console.log(err);
      res.status(404).json([]);
    }
    console.log("sessionData");
    res.status(201).json(sessionData);
  }
});

const port = 8000;
server.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
