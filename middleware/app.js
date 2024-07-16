const bodyParser = require("body-parser");
const path = require("path");
const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);

const userRoutes = require("./routes/user-routes");
const dataRoutes = require("./routes/data-routes");
const setUpWebSocket = require("./connections/websocket-connection");

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

setUpWebSocket(server);

app.use("/api/users", userRoutes);

app.use("/api/data", dataRoutes);

const port = 8000;
server.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
