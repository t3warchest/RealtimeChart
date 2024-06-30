const express = require("express");
const bodyParser = require("body-parser");
const amqp = require("amqplib");

const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");
const ws = require("ws");
const e = require("express");

const wss = new ws.WebSocketServer({ port: 8080 });

const app = express();

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
let clientStates = new Map();

wss.on("connection", async (socket) => {
  console.log("new connection");
  sockets.push(socket);

  const { channel, qname } = await establishRmqChannel();

  clientStates.set(socket, { started: false });

  socket.on("message", (message) => {
    console.log(message);
    const data = message.toString();
    console.log(data);
    if (data === "start channel") {
      clientStates.get(socket).started = true;
    } else if (data === "end channel") {
      clientStates.get(socket).started = false;
    }
  });

  socket.on("close", () => {
    console.log("client disconnected");
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
        sockets.forEach((socket) => {
          if (socket.readyState === ws.OPEN) {
            socket.send("end");
          }
        });
      } else {
        const value = JSON.parse(data);
        const new_time = new Date(current_time.getTime() + value.time * 1000);
        value.time = new_time.getTime();

        // console.log(time);

        try {
          sockets.forEach((socket) => {
            if (clientStates.get(socket).started) {
              if (socket.readyState === ws.OPEN) {
                console.log("message sent");
                socket.send(JSON.stringify(value));
              }
            } else {
              console.log("data evaporated", value);
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
  const session = req.query.session;
  if (session === "all") {
    const sessions = [1, 2, 3]; // Assuming session numbers are 1, 2, and 3
    let allData = {};
    for (const sessionId of sessions) {
      const csvFilePath = path.join(__dirname, `./data/data_${sessionId}.csv`);
      let data = [];
      await new Promise((resolve, reject) => {
        fs.createReadStream(csvFilePath)
          .pipe(
            csv({
              delimiter: ",",
              columns: true,
              ltrim: true,
            })
          )
          .on("data", function (row) {
            const modified = {
              time: row.Time,
              levels: row.TSI,
            };
            data.push(modified);
          })
          .on("error", function (error) {
            console.log(error.message);
            reject(error);
          })
          .on("end", function () {
            allData[sessionId] = data;
            resolve();
          });
      });
    }
    console.log("all data sent");
    res.status(201).json(allData);
  } else {
    const csvFilePath = path.join(__dirname, `./data/data_${session}.csv`);
    let data = [];
    fs.createReadStream(csvFilePath)
      .pipe(
        csv({
          delimiter: ",",
          columns: "true",
          ltrim: "true",
        })
      )
      .on("data", function (row) {
        const modified = {
          time: row.Time,
          levels: row.TSI,
        };
        data.push(modified);
      })
      .on("error", function (error) {
        console.log(error.message);
      })
      .on("end", function () {
        // Here log the result array
        // console.log("parsed csv data:");
        // console.log(data);
        // const responsedata = data.slice(0, 100);
        console.log(`session ${session} data sent`);
        res.status(201).json(data);
      });
  }
});

const port = 8000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
