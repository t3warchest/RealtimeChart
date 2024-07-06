import React, { useEffect, useState } from "react";
import ProgressChart from "./ProgressChart";
import "./ChartDetail.css";

const ChartDetail = (props) => {
  const stream = props.data;
  const [peakValue, setPeakValue] = useState(0);
  const [minValue, setMinValue] = useState(100);
  const [timeInGreenZone, setTimeInGreenZone] = useState(0);
  const [timeInRedZone, setTimeInRedZone] = useState(0);
  const [timeInBlueZone, setTimeInBlueZone] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showDiv, setShowDiv] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const mountedStyle = { animationName: "inAnimation" };
  const unmountedStyle = { animationName: "outAnimation" };
  useEffect(() => {
    if (stream === "end") {
      setIsMounted(true);
      setShowDiv(true);
    } else if (stream.length > 1) {
      console.log("hi");
      const dataPoint = stream[stream.length - 1];

      setPeakValue((prev) =>
        dataPoint.levels > prev ? dataPoint.levels : prev
      );
      setMinValue((prev) =>
        dataPoint.levels < prev ? dataPoint.levels : prev
      );

      if (dataPoint.levels >= 70) {
        setTimeInBlueZone((prev) => prev + 1);
      } else if (dataPoint.levels < 70 && dataPoint.levels >= 40) {
        setTimeInGreenZone((prev) => prev + 1);
      } else {
        setTimeInRedZone((prev) => prev + 1);
      }

      setTotalPoints((prev) => prev + 1);
    }
  }, [stream]);

  const blueZonePercentage = ((timeInBlueZone / totalPoints) * 100).toFixed(2);
  const greenZonePercentage = ((timeInGreenZone / totalPoints) * 100).toFixed(
    2
  );
  const redZonePercentage = ((timeInRedZone / totalPoints) * 100).toFixed(2);

  return (
    <>
      {showDiv && (
        <div
          className="final-result"
          style={isMounted ? mountedStyle : unmountedStyle}
          onClick={() => setIsMounted(false)}
          onAnimationEnd={() => {
            if (!isMounted) {
              setShowDiv(false);
            }
          }}
        >
          <header className="time-text">Time in Green Zone</header>
          <div className="percentage">{greenZonePercentage}%</div>
        </div>
      )}
      <div className="current-chart-values">
        <div className="chart-values-header">Progress</div>
        <div className="chart-values-values">
          <div className="chart-values-section radial-chart">
            <ProgressChart />
          </div>
        </div>
      </div>
      <div className="current-chart-values">
        <div className="chart-values-header">Current Zone</div>
        <div className="chart-values-values">
          {/* {stream !== "end" ? stream[stream.length - 1] : 0} */}
        </div>
      </div>
      <div className="current-chart-values">
        <div className="chart-values-header">TSI values</div>
        <div className="chart-values-values">
          <div className="chart-values-section current">
            <div className="section-values-header">
              <p> Current:</p>
            </div>
            <div className="current-values-values">
              <p>
                {stream !== "end" && stream.length > 1
                  ? stream[stream.length - 1].levels
                  : 0}
              </p>
            </div>
          </div>
          <div className="chart-values-section predicted">
            <div className="section-values-header">
              <p>Predicted:</p>
            </div>
            <div className="current-values-values">
              <p>
                {stream !== "end" && stream.length > 1
                  ? stream[stream.length - 1].levels
                  : 0}
              </p>
            </div>
          </div>

          {/* {stream !== "end" ? stream[stream.length - 1] : 0} */}
        </div>
      </div>
      <div className="current-chart-values">
        <div className="chart-values-header">Time</div>
        <div className="chart-values-values time">
          <div className="chart-values-section time total-time">
            <div className="section-values-header">
              <p> Total:</p>
            </div>
            <div className="current-values-values">
              <p>{totalPoints}</p>
            </div>
          </div>
          <div className="chart-values-section time green-zone">
            <div className="section-values-header">
              <p>Green Zone:</p>
            </div>
            <div className="current-values-values">
              <p>{greenZonePercentage}</p>
            </div>
          </div>
          <div className="chart-values-section time red-zone">
            <div className="section-values-header">
              <p>Red Zone :</p>
            </div>
            <div className="current-values-values">
              <p>{redZonePercentage}</p>
            </div>
          </div>
          <div className="chart-values-section time blue-zone">
            <div className="section-values-header">
              <p>Blue Zone :</p>
            </div>
            <div className="current-values-values">
              <p>{blueZonePercentage}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChartDetail;
