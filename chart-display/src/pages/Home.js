import React, { useEffect, useState } from "react";
import "../pagescss/Home.css";
import ChartViewer from "../components/ChartViewer";
import ChartDetail from "../components/ChartDetails";

// const socket = new WebSocket("ws://16.170.202.169:8000/ws");
const socket = new WebSocket("ws://16.170.202.169:8000/ws");

const Home = () => {
  const [latestDataPoint, setLatestDataPoint] = useState(null);
  const [startDisabled, setStartDisabled] = useState(false);
  const [endDisabled, setEndDisabled] = useState(false);

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
        // const newDataPoint = {
        //   time: data.time,
        //   levels: parseFloat(data.levels),
        // };
        setLatestDataPoint(data);
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
    setStartDisabled(true);
  };

  const handleEndButton = () => {
    socket.send("end channel");
    setEndDisabled(true);
  };
  const handleRefreshButton = () => {
    window.location.reload();
  };

  return (
    <div className="graph-display-container">
      <div className="start-end-button-container">
        <div
          className={`start start-end-button ${
            startDisabled ? "disabled" : ""
          }`}
          onClick={startDisabled ? null : handleStartButton}
        >
          Start
        </div>
        <div
          className={`end start-end-button ${endDisabled ? "disabled" : ""}`}
          onClick={endDisabled ? null : handleEndButton}
        >
          End
        </div>
        <div className="refresh-button" onClick={handleRefreshButton}>
          Refresh
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
