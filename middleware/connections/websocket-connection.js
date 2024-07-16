const { client, redisSub } = require("./redis-connections");
const WebSocket = require("ws");

const setUpWebSocket = (server) => {
  const wss = new WebSocket.Server({ server: server });
  let sockets = [];
  wss.on("connection", async (socket) => {
    console.log("new connection");
    sockets.push(socket);
    await client.set("start-stop-notifier", "stop");
    const notifierState = await client.get("start-stop-notifier");
    console.log("current notifier state :", notifierState);

    socket.on("message", async (message) => {
      const data = message.toString();
      console.log(data);
      if (data === "start channel") {
        try {
          await client.set("start-stop-notifier", "start");
        } catch (err) {
          console.log("err in setting key", err);
        } finally {
          console.log("notifier key set to start");
        }
      } else if (data === "end channel") {
        try {
          await client.set("start-stop-notifier", "stop");
        } catch (err) {
          console.log("err in setting key", err);
        } finally {
          console.log("notifier key set to stop");
        }
        sockets.forEach((socket) => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send("end");
          }
        });
      }
    });

    socket.on("close", () => {
      console.log("client disconnected");
      sockets = sockets.filter((s) => s !== socket);
    });
  });

  redisSub.subscribe("levels_data", (message) => {
    const data = message;
    console.log("Received message:", data);

    if (data === "end") {
      console.log("end");
      try {
        client.set("start-stop-notifier", "stop");
      } catch (err) {
        console.log("err in setting key", err);
      } finally {
        console.log("notifier key set to stop");
      }
      sockets.forEach((socket) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send("end");
        }
      });
    } else {
      const value = JSON.parse(data);

      sockets.forEach((socket) => {
        if (socket.readyState === WebSocket.OPEN) {
          console.log(value);
          socket.send(JSON.stringify(value));
        }
      });
    }
  });
};

module.exports = setUpWebSocket;
