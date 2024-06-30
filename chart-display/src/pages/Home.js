import React, { useEffect, useState } from "react";
import "../pagescss/Home.css";
import ChartViewer from "../components/ChartViewer";
import ChartDetail from "../components/ChartDetails";
import { saveAs } from "file-saver";

const socket = new WebSocket("ws://localhost:8080");

const Home = () => {
  const [dataStream, setDataStream] = useState([
    { time: new Date().getTime(), levels: 0 },
  ]); //{ time: 0, levels: 0 }

  useEffect(() => {
    socket.addEventListener("open", (event) => {
      // socket.send("Connection established");
    });

    const messageHandler = (event) => {
      if (event.data === "end") {
        // downloadCSV(dataStream);
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
        setDataStream((prevDataStream) => {
          const updatedDataStream = [...prevDataStream, newDataPoint];
          return updatedDataStream;
        });
      }
    };

    socket.addEventListener("message", messageHandler);

    return () => {
      socket.removeEventListener("message", messageHandler);
    };
  }, []);

  const downloadCSV = (data) => {
    const headers = ["time", "levels"];
    const csvData = [
      headers.join(","),
      ...data.map((row) => `${row.time},${row.levels}`),
    ].join("\n");

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "dataStream.csv");
  };

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
        </div>
        <div className="chart-info">
          <ChartDetail data={dataStream} />
        </div>
      </div>
    </div>
  );
};
export default Home;
