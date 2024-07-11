import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";

const ProgressChart = ({ timeInGreenZone }) => {
  const target = 3000;
  const [percentageAchieved, setPercentageAchieved] = useState(0);

  useEffect(() => {
    const percentage = (timeInGreenZone / target) * 100;
    setPercentageAchieved(percentage > 100 ? 100 : percentage.toFixed(2));
  }, [timeInGreenZone]);

  const options = {
    chart: {
      height: 100,
      type: "radialBar",
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: "50%",
        },
        dataLabels: {
          show: true,
          name: {
            // offsetY: -10,
            show: false,
          },
          value: {
            offsetY: 0,
            offsetX: 10,
            color: "#111",
            fontSize: "15px",
            show: true,
            // formatter: function (val) {
            //   return parseInt(val) + "%";
            // },
          },
        },
      },
    },
    labels: ["target:3000"],
  };

  const series = [percentageAchieved];

  return (
    <div>
      <Chart
        type="radialBar"
        options={options}
        series={series}
        height="500px"
        width="100%"
      />
    </div>
  );
};

export default ProgressChart;
