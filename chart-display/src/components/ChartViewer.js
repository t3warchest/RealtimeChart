import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import ApexCharts from "apexcharts";

function ChartViewer(props) {
  const [currentlyAt, setCurrentlyAt] = useState(null);
  console.log(props);

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
      data: [{ x: 0, y: 0 }], //[],
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
    xaxis: {
      range: 100,
      type: "numeric", //"datetime",
      // labels: {
      //   formatter: function (val) {
      //     const date = new Date(val);
      //     return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
      //   },
      // },
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 10,
    },
  };

  useEffect(() => {
    if (props.data !== "end") {
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
    } else {
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
    <div style={{ border: "2px solid black" }}>
      <div>
        <Chart
          options={options}
          series={series}
          type="line"
          width="100%"
          height="400"
        />
      </div>
      <div className="legend-container">
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
      </div>
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
