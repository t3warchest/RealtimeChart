const express = require("express");
const bodyParser = require("body-parser");
const csvParser = require("csv-parser");
const fs = require("fs");
const ws = require("ws");

const wss = new ws.WebSocketServer({ port: 8080 });

const app = express();

app.use(bodyParser.json());

// Function to read the CSV file and return its data
const readCSVData = () => {
  return new Promise((resolve, reject) => {
    const result = [];
    fs.createReadStream("../data-stream-generator/steps_record.csv")
      .pipe(csvParser())
      .on("data", (data) => {
        result.push(data);
      })
      .on("end", () => {
        resolve(result);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};

wss.on("connection", (socket) => {
  console.log("new connection");

  let time = 0;
  const intervalId = setInterval(() => {
    if (time < 100) {
      const level = Math.floor(Math.random() * (100 - 30 + 1)) + 30;
      const dataPoint = { time: ++time, steps: level };
      console.log(dataPoint);
      socket.send(JSON.stringify(dataPoint));
    }
  }, 200);

  socket.on("close", () => {
    console.log("client disconnected");
    clearInterval(intervalId);
  });
});

app.post("/", async (req, res, next) => {
  res.json({ message: "successful" });
});

const port = 8000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

// const express = require("express");
// const bodyParser = require("body-parser");
// const io = require("socket.io")(8080, {
//   cors: {
//     origin: ["http://localhost:3000"],
//   },
// });

// const app = express();

// app.use(bodyParser.json());

// let time = 0;
// io.on("connection", (socket) => {
//   console.log(`Client connected: ${socket.id}`);

//   const intervalId = setInterval(() => {
//     time++;
//     if (time < 1000) {
//       const level = Math.floor(Math.random() * (100 - 30 + 1)) + 30;
//       const dataPoint = { time: time, steps: level };
//       console.log(dataPoint);
//       socket.emit("Echo", JSON.stringify(dataPoint));
//     }
//   }, 1000);

//   socket.on("disconnect", () => {
//     console.log(`Client disconnected: ${socket.id}`);
//     clearInterval(intervalId);
//     time = 0;
//   });
// });

// app.post("/", async (req, res) => {
//   res.json({ message: "successful" });
// });

// const port = 8000;
// app.listen(port, () => {
//   console.log(`App listening on port ${port}`);
// });
