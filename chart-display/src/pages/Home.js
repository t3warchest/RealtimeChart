import React, { useEffect, useState } from "react";
import "../pagescss/Home.css";
import ChartViewer from "../components/ChartViewer";
import ChartDetail from "../components/ChartDetails";

const socket = new WebSocket("ws://localhost:8000/ws");

const Home = () => {
  const [latestDataPoint, setLatestDataPoint] = useState(null);

  useEffect(() => {
    const handleOpen = (event) => {
      // socket.send("Connection established");
    };

    const handleMessage = (event) => {
      if (event.data === "end") {
        setLatestDataPoint("end");
        return;
      }
      const data = JSON.parse(event.data);
      if (!data) {
        console.error(data.error);
      } else {
        const newDataPoint = {
          time: data.time,
          levels: parseFloat(data.levels),
        };
        setLatestDataPoint(newDataPoint);
      }
    };

    socket.addEventListener("open", handleOpen);
    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("open", handleOpen);
      socket.removeEventListener("message", handleMessage);
    };
  }, []);

  const handleStartButton = () => {
    socket.send("start channel");
  };

  const handleEndButton = () => {
    socket.send("end channel");
  };

  return (
    <div className="graph-display-container">
      <div className="start-end-button-container">
        <div className="start start-end-button" onClick={handleStartButton}>
          Start
        </div>
        <div className="end start-end-button" onClick={handleEndButton}>
          End
        </div>
      </div>
      <div className="graph-display">
        <div className="chart">
          <ChartViewer latestDataPoint={latestDataPoint} />
          <ChartDetail latestDataPoint={latestDataPoint} />
        </div>
      </div>
    </div>
  );
};

export default Home;
