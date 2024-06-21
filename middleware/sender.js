const amqp = require("amqplib");

const publishData = async () => {
  let connection;
  try {
    connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    let qname = "levels_data";

    await channel.assertQueue(qname, {
      durable: false,
    });

    let i = 0;
    const endMessage = "end";

    await new Promise((resolve, reject) => {
      const intervalId = setInterval(async () => {
        if (i === 100) {
          clearInterval(intervalId);
          channel.sendToQueue(qname, Buffer.from(endMessage), {}, (err, ok) => {
            if (err) {
              reject(err);
            }
          });
          resolve();
          return;
        }
        const level = Math.floor(Math.random() * (100 - 1 + 1)) + 1;
        const dataPoint = { time: i, levels: level };
        channel.sendToQueue(
          qname,
          Buffer.from(JSON.stringify(dataPoint)),
          {},
          (err, ok) => {
            if (err) {
              reject(err);
            }
          }
        );
        i++;
      }, 200);
    });

    // Wait for all sent messages to be confirmed
  } catch (error) {
    console.error("Error in sendData:", error);
  } finally {
    if (connection) {
      try {
        setTimeout(function () {
          connection.close();
          process.exit(0);
        }, 500);
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
    }
  }
};

publishData();
