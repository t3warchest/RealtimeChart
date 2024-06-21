const express = require("express");
const bodyParser = require("body-parser");
const amqp = require("amqplib/callback_api");

const fs = require("fs");
const ws = require("ws");
const internal = require("stream");
const { valueFromRemoteObject } = require("puppeteer");

const wss = new ws.WebSocketServer({ port: 8080 });

const app = express();

app.use(bodyParser.json());

let sockets = [];

wss.on("connection", (socket) => {
  console.log("new connection");
  sockets.push(socket);

  socket.on("close", () => {
    console.log("client disconnected");
    sockets.filter((s) => {
      return s !== socket;
    });
  });
});

amqp.connect("amqp://localhost", (err, connection) => {
  if (err) {
    console.log(err);
    throw err;
  }
  connection.createChannel(async (err, channel) => {
    console.log("channel created");
    if (err) {
      console.log(err);
      throw err;
    }
    const qname = "levels_data";

    channel.assertQueue(qname, { durable: false });

    channel.consume(qname, async (message) => {
      const current_time = new Date();
      try {
        const data = message.content.toString();

        // const new_time = new Date(current_time.getTime() + value.time * 1000);

        // // console.log(new_time.getMilliseconds());

        // value.time = new_time;

        if (data === "end") {
          console.log("end");
          sockets.forEach((socket) => {
            if (socket.readyState === ws.OPEN) {
              socket.send("end");
            }
          });
        } else {
          const value = JSON.parse(data);
          // console.log(time);
          try {
            sockets.forEach((socket) => {
              if (socket.readyState === ws.OPEN) {
                console.log("message sent");
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
  });
});

app.post("/", async (req, res, next) => {
  res.json({ message: "successful" });
});

const port = 8000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
