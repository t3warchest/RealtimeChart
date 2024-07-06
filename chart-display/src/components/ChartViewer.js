import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import ApexCharts from "apexcharts";

function ChartViewer(props) {
  const [currentlyAt, setCurrentlyAt] = useState(null);
  // console.log(props);

  const generateColors = (data) => {
    if (data !== "end") {
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
    }
  };
  const time = new Date();
  const [series, setSeries] = useState([
    {
      name: "Level",
      data: [], //[],
    },
  ]);

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

    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        colorStops: generateColors(props.data),
      },
    },
    noData: {
      text: "Loading...",
    },
    xaxis: {
      type: "datetime", //"datetime",
      labels: {
        formatter: function (val) {
          const date = new Date(val);
          let hours = date.getHours();
          const minutes = date.getMinutes();
          const seconds = date.getSeconds();
          const milliseconds = date.getMilliseconds();
          const ampm = hours >= 12 ? "PM" : "AM";
          hours = hours % 12;
          hours = hours ? hours : 12; // the hour '0' should be '12'
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

  useEffect(() => {
    if (props.data.length !== 0 && props.data !== "end") {
      setSeries([
        {
          name: "Levels",
          data: props.data.map((point) => ({ x: point.time, y: point.levels })),
        },
      ]);

      const latestDataPoint = props.data[props.data.length - 1];
      if (latestDataPoint.levels > 70) {
        setCurrentlyAt("blue");
      } else if (latestDataPoint.levels >= 30 && latestDataPoint.levels <= 70) {
        setCurrentlyAt("green");
      } else {
        setCurrentlyAt("red");
      }
    } else if (props.data === "end") {
      console.log("inside else");
      ApexCharts.exec("realtime", "updateOptions", {
        xaxis: {
          range: undefined,
        },
      });
    }
  }, [props.data]);
  const getColorStyle = () => {
    switch (currentlyAt) {
      case "blue":
        return { color: "blue" };
      case "green":
        return { color: "green" };
      case "red":
        return { color: "red" };
      default:
        return {};
    }
  };

  return (
    <div className="chartviewer-container-component">
      <div>
        <Chart
          options={options}
          series={series}
          type="line"
          width="100%"
          height="400"
        />
      </div>
      {/* <div className="legend-container">
        <div className="legend">
          <div
            className="legend-color"
            style={{ backgroundColor: "#0000FF" }}
          ></div>
          Level &gt; 70
        </div>
        <div className="legend">
          <div
            className="legend-color"
            style={{ backgroundColor: "#87A96B" }}
          ></div>
          30 &lt; Level &lt; 70
        </div>
        <div className="legend">
          <div
            className="legend-color"
            style={{ backgroundColor: "#FF0000" }}
          ></div>
          Level &lt; 30
        </div>
      </div> */}
      {/* <div id="currently-at">
        Currently in: <br />
        <div style={{ display: "block" }}>
          <span style={getColorStyle()}>{currentlyAt} zone</span>
        </div>
      </div> */}
    </div>
  );
}

export default ChartViewer;
