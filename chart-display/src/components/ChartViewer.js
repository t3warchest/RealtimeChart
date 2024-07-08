import React, { useEffect, useRef } from "react";
import Chart from "react-apexcharts";
import ApexCharts from "apexcharts";

function ChartViewer({ latestDataPoint }) {
  const dataRef = useRef([]);
  const chartRef = useRef(null);

  const options = {
    chart: {
      id: "realtime",
      type: "line",
      animations: {
        enabled: false,
        easing: "linear",
        dynamicAnimation: {
          speed: 200,
        },
      },
      toolbar: {
        show: true,
        offsetX: 0,
        offsetY: 0,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
        },
      },
      zoom: {
        type: "x",
        autoScaleYaxis: true,
        enabled: true,
      },
    },
    annotations: {
      yaxis: [
        {
          y: 30,
          y2: 70,
          fillColor: "#006A4E",
        },
        {
          y: 0,
          y2: 30,
          fillColor: "#fd5c63",
        },
        {
          y: 70,
          y2: 100,
          fillColor: "#4B9CD3",
        },
      ],
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    tooltip: {
      enabled: true,
    },
    title: {
      text: "Dynamic Updating Chart",
      align: "left",
    },
    markers: {
      size: 0,
    },
    colors: ["#4B0082"],
    noData: {
      text: "Loading...",
    },
    xaxis: {
      type: "datetime",
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
          return `${hours}:${strMinutes}:${strSeconds}.${milliseconds}`;
        },
      },
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 10,
    },
  };

  const generateColors = (data) => {
    return data.map((d) => {
      let color;
      if (d.levels > 60) {
        color = "#0000FF";
      } else if (d.levels > 30 && d.levels <= 70) {
        color = "#87A96B";
      } else {
        color = "#FF0000";
      }
      return {
        color,
      };
    });
  };

  useEffect(() => {
    if (latestDataPoint && latestDataPoint !== "end") {
      dataRef.current.push(latestDataPoint);
      ApexCharts.exec("realtime", "updateSeries", [
        {
          name: "Levels",
          data: dataRef.current.map((point) => ({
            x: point.time,
            y: point.levels,
          })),
        },
      ]);
    } else if (latestDataPoint === "end") {
      console.log("inside else");
      ApexCharts.exec("realtime", "updateOptions", {
        xaxis: {
          range: undefined,
        },
      });
    }
  }, [latestDataPoint]);

  return (
    <div className="chartviewer-container-component">
      <Chart
        options={options}
        series={[
          {
            name: "Levels",
            data: dataRef.current.map((point) => ({
              x: point.time,
              y: point.levels,
            })),
          },
        ]}
        type="line"
        width="100%"
        height="400"
        ref={chartRef}
      />
    </div>
  );
}

export default ChartViewer;
