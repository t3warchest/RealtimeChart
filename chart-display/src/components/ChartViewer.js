import React from "react";

import Chart from "react-apexcharts";

function ChartViewer(props) {
  console.log("this is ptoips", props.data);
  const generateColors = (data) => {
    return data.map((d, idx) => {
      console.log("Data value:", d);
      let color;
      if (d.steps > 60) {
        color = "#0000FF";
      } else if (d.steps > 40 && d.steps <= 60) {
        color = "#00FF00";
      } else {
        color = "#FF0000";
      }

      return {
        // offset: (idx / data.length) * 100,
        color,
        opacity: 1,
      };
    });
  };
  const series = [
    {
      name: "Computer Sales",
      data: props.data.map((point) => ({ x: point.time, y: point.steps })),
    },
  ];

  const options = {
    chart: {
      id: "realtime",
      type: "line",
      animations: {
        enabled: true,
        easing: "linear",
        dynamicAnimation: {
          speed: 1000,
        },
      },
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
    },
    title: {
      text: "Dynamic Updating Chart",
      align: "left",
    },
    markers: {
      size: 0,
    },
    // fill: {
    //   type: "gradient",
    //   gradient: {
    //     shadeIntensity: 1,
    //     opacityFrom: 0.7,
    //     opacityTo: 0.9,
    //     colorStops: generateColors(props.data),
    //   },
    // },
    xaxis: {
      type: "numeric",
      range: 10,
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 10, // Set the number of ticks on the y-axis
      labels: {
        formatter: function (val) {
          return parseInt(val, 10); // Format the y-axis labels to be integers
        },
      },
    },
  };

  return (
    <div>
      ChartViewer
      <Chart
        options={options}
        series={series}
        type="line"
        width="1000"
        height="500"
      />
    </div>
  );
}

export default ChartViewer;
