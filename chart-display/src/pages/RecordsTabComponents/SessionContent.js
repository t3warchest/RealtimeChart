import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import ApexCharts from "apexcharts";
import SessionDetails from "./SessionDetails";

const SessionContent = ({ activeTab }) => {
  const [dataForAnalytics, setDataForAnalytics] = useState([]);
  const [callFinish, setCallFinish] = useState(false);
  const [noData, setNoData] = useState(false);
  const series = [
    {
      name: "Session Data",
      data: [{ x: 0, y: 0 }],
    },
  ];

  const options = {
    chart: {
      id: "realtime",
      type: "line",
      animations: {
        enabled: false,
      },
    },
    fill: {
      colors: ["#C6011F"],
      opacity: 1,
      type: "solid",
    },
    annotations: {
      yaxis: [
        {
          y: 30,
          y2: 70,
          fillColor: "#006A4E",
          opacity: 0.25,
        },
        {
          y: 0,
          y2: 30,
          fillColor: "#fd5c63",
          opacity: 0.25,
        },
        {
          y: 70,
          y2: 100,
          fillColor: "#4B9CD3",
          opacity: 0.25,
        },
      ],
    },
    stroke: {
      width: 3,
    },
    yaxis: {
      min: 0,
      max: 100,
    },
    xaxis: {
      type: "numeric",
      tickAmount: 7,
      labels: {
        formatter: function (val) {
          const date = new Date(val);
          let hours = date.getHours();
          const minutes = date.getMinutes();
          const seconds = date.getSeconds();
          const milliseconds = date.getMilliseconds();
          const ampm = hours >= 12 ? "PM" : "AM";
          hours = hours % 12;
          hours = hours ? hours : 12;
          const strMinutes = minutes < 10 ? "0" + minutes : minutes;
          const strSeconds = seconds < 10 ? "0" + seconds : seconds;
          const strMilliseconds =
            milliseconds < 100
              ? milliseconds < 10
                ? "00" + milliseconds
                : "0" + milliseconds
              : milliseconds;
          return `${hours}:${strMinutes}:${strSeconds}.${strMilliseconds}`;
        },
      },
    },
  };

  useEffect(() => {
    setNoData(false);
    console.log(activeTab);
    if (activeTab === 4) {
      fetch(`http://localhost:8000/sessiondata?session=all`)
        .then((response) => {
          console.log(response);
          return response.json();
        })
        .then((data) => {
          if (Object.keys(data).length === 0) {
            console.log(data);
            setNoData(true);
          } else {
            console.log("thisi si data in sessiondata all", data);
            const xaxisPoints = data.xaxisPoints;
            const levelsArray = data.levelsArray;

            const newSeries = [
              {
                name: "Session 1",
                data: levelsArray["0"],
              },
              {
                name: "Session 2",
                data: levelsArray["1"],
              },
              {
                name: "Session 3",
                data: levelsArray["2"],
              },
            ];
            console.log("after new series set");
            ApexCharts.exec("realtime", "updateOptions", {
              xaxis: { categories: xaxisPoints },
            });
            ApexCharts.exec("realtime", "updateSeries", newSeries);
          }
          setCallFinish(true);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      setNoData(false);
      fetch(`http://localhost:8000/sessiondata?session=${activeTab}`)
        .then((response) => {
          console.log(response);
          return response.json();
        })
        .then((data) => {
          console.log(data);
          if (data.length === 0) {
            setNoData(true);
            console.log(noData);
          } else {
            ApexCharts.exec("realtime", "updateSeries", [
              {
                data: data.map((point) => ({
                  x: point.timestamp,
                  y: point.value,
                })),
              },
            ]);
            // setDataForAnalytics(data);
          }
          setCallFinish(true);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [activeTab]);

  return (
    <div className="session-content-container">
      <div className="session-content">
        {callFinish ? (
          noData ? (
            <div className="no-data-placeholder">
              <p>No session data available</p>
            </div>
          ) : (
            <div className="session-detail-chart-container">
              <Chart
                options={options}
                series={series}
                type="line"
                width="100%"
                height="400"
              />
            </div>
          )
        ) : (
          <div className="no-data-placeholder">
            <p>loading...</p>
          </div>
        )}
        <SessionDetails dataForAnalytics={dataForAnalytics} />
      </div>
    </div>
  );
};

export default SessionContent;
