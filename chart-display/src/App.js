import React, { useEffect, useState } from "react";
import "./App.css";
import ChartViewer from "./components/ChartViewer";

const socket = new WebSocket("ws://localhost:8080");

function App() {
  const [dataStream, setDataStream] = useState([{ time: 0, steps: 0 }]);

  socket.addEventListener("open", (event) => {
    socket.send("Connection established");
  });
  let newDataPoint;
  useEffect(() => {
    console.log("working");

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      // console.log(data);
      if (data.error) {
        console.error(data.error);
      } else {
        newDataPoint = {
          time: parseInt(data.time, 10),
          steps: parseInt(data.steps, 10),
        };
        // if (dataStream.length > 10) {
        //   dataStream.reverse().pop();
        //   dataStream.reverse();
        // }
        // setDataStream([{ x: newDataPoint.time, y: newDataPoint.steps }]);
        setDataStream((prevDataStream) => {
          const updatedDataStream = [...prevDataStream, newDataPoint];
          return updatedDataStream;
        });
      }
    });
  }, []);
  console.log(dataStream);

  return (
    <div className="app">
      <header className="header">Walking Steps Chart</header>
      <div className="graph-display-container">
        <div className="graph-display">
          <ChartViewer data={dataStream} />
        </div>
      </div>
    </div>
  );
}

export default App;
