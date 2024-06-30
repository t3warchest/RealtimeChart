import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import ApexCharts from "apexcharts";

const SessionContent = ({ sessions, activeTab }) => {
  const [sessionData, setSessionData] = useState([]);
  const [series, setSeries] = useState([
    {
      name: "Session Data",
      data: [{ x: 0, y: 0 }],
    },
  ]);
  const [callFinish, setCallFinish] = useState(false);

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
    },
    // toolbar: {
    //   show: true,
    // },
  };

  function findXaxis(dataobj) {
    let maxtime = [];
    let maxlength = 0;

    for (const key in dataobj) {
      if (dataobj.hasOwnProperty(key)) {
        const currentLength = dataobj[key].length;
        if (currentLength > maxlength) {
          maxlength = currentLength;
          maxtime = dataobj[key].map((item) => item.time);
        }
      }
    }
    return { maxtime, maxlength };
  }

  function createLevelsArray(data) {
    const { maxtime, maxlength } = findXaxis(data);
    const levelsArray = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const levels = data[key].map((item) => item.levels);
        while (levels.length !== maxlength) {
          levels.push(null);
        }
        levelsArray[key] = levels;
      }
    }
    return levelsArray;
  }

  useEffect(() => {
    console.log(activeTab);
    if (activeTab === 4) {
      console.log(activeTab);
      fetch(`http://localhost:8000/sessiondata?session=all`)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              data[key] = data[key].map((point) => ({
                time: Number(point.time),
                levels: Number(point.levels),
              }));
            }
          }
          const { maxtime, maxlength } = findXaxis(data);
          const levelsArray = createLevelsArray(data);
          console.log(maxtime);
          console.log(levelsArray);

          const newSeries = [
            {
              name: "Session 1",
              data: levelsArray["1"],
            },
            {
              name: "Session 2",
              data: levelsArray["2"],
            },
            {
              name: "Session 3",
              data: levelsArray["3"],
            },
          ];
          ApexCharts.exec("realtime", "updateOptions", {
            xaxis: {},
            labels: maxtime,
          });
          // console.log(newSeries);
          setSeries(newSeries);
          setCallFinish(true);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      fetch(`http://localhost:8000/sessiondata?session=${activeTab}`)
        .then((response) => response.json())
        .then((data) => {
          const convertedData = data.map((point) => ({
            time: Number(point.time),
            levels: Number(point.levels),
          }));
          setSeries([
            {
              name: "Session Data",
              data: convertedData.map((point) => ({
                x: point.time,
                y: point.levels,
              })),
            },
          ]);
          setSessionData(convertedData);
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
        <p>Session {activeTab} content</p>
        {callFinish ? (
          <div>
            <Chart
              options={options}
              series={series}
              type="line"
              width="100%"
              height="400"
            />
          </div>
        ) : (
          <p>loading...</p>
        )}
      </div>
    </div>
  );
};

export default SessionContent;
