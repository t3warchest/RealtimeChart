import React, { useEffect, useState, useRef } from "react";
import "../pagescss/Home.css";
import ChartViewer from "../components/ChartViewer";
import ChartDetail from "../components/ChartDetails";
import { saveAs } from "file-saver";

const socket = new WebSocket("ws://localhost:8080");

const Home = () => {
  const [dataStream, setDataStream] = useState([]);
  const messageHandlerRef = useRef(null);

  useEffect(() => {
    socket.addEventListener("open", (event) => {
      // socket.send("Connection established");
    });

    messageHandlerRef.current = (event) => {
      if (event.data === "end") {
        setDataStream("end");
        return;
      }
      const data = JSON.parse(event.data);
      if (!data) {
        console.error(data.error);
      } else {
        const newDataPoint = {
          time: data.time, //parseInt(data.time, 10),
          levels: parseFloat(data.levels),
        };
        setDataStream((prevDataStream) => [...prevDataStream, newDataPoint]);
      }
    };

    socket.addEventListener("message", messageHandlerRef.current);

    return () => {
      socket.removeEventListener("message", messageHandlerRef.current);
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
          <ChartViewer data={dataStream} />
          <ChartDetail data={dataStream} />
        </div>
        {/* <div className="chart-info"> */}
        {/* </div> */}
      </div>
    </div>
  );
};
export default Home;
