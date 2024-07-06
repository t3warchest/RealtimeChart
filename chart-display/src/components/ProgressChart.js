import React from "react";
import Chart from "react-apexcharts";

const ProgressChart = () => {
  const series = [70];
  const options = {
    chart: {
      height: 250,
      type: "radialBar",
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: "70%",
        },
      },
    },
    labels: ["Cricket"],
  };
  return (
    <div>
      <Chart
        type="radialBar"
        options={options}
        series={series}
        height="100%"
        width="100%"
      />
    </div>
  );
};

export default ProgressChart;
