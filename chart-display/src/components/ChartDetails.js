import React, { useEffect, useState } from "react";
import ProgressChart from "./ProgressChart";
import "./ChartDetail.css";

const ChartDetail = (props) => {
  const latestDataPoint = props.latestDataPoint;
  const [currentZone, setCurrentZone] = useState("Green");
  const [timeInGreenZone, setTimeInGreenZone] = useState(0);
  const [timeInRedZone, setTimeInRedZone] = useState(0);
  const [timeInBlueZone, setTimeInBlueZone] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showDiv, setShowDiv] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const mountedStyle = { animationName: "inAnimation" };
  const unmountedStyle = { animationName: "outAnimation" };

  useEffect(() => {
    if (latestDataPoint === "end") {
      setIsMounted(true);
      setShowDiv(true);
    } else if (latestDataPoint) {
      if (latestDataPoint.levels >= 70) {
        setCurrentZone("Blue");
        setTimeInBlueZone((prev) => prev + 1);
      } else if (latestDataPoint.levels < 70 && latestDataPoint.levels >= 30) {
        setCurrentZone("Green");
        setTimeInGreenZone((prev) => prev + 1);
      } else {
        setCurrentZone("Red");
        setTimeInRedZone((prev) => prev + 1);
      }

      setTotalPoints((prev) => prev + 1);
    }
  }, [latestDataPoint]);

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
      <div className="current-chart-values progress">
        <div className="chart-values-header">Progress</div>
        <div className="chart-values-values">
          <p>Target:3000</p>
          <ProgressChart timeInGreenZone={timeInGreenZone} />
        </div>
      </div>
      <div className="current-chart-values current-zone">
        <div className="chart-values-header">Current Zone</div>
        <div className="chart-values-values">{currentZone}</div>
      </div>
      <div className="current-chart-values current-tsi">
        <div className="chart-values-header">Current TSI</div>
        <div className="chart-values-values">
          {latestDataPoint && latestDataPoint !== "end"
            ? latestDataPoint.levels
            : 0}
        </div>
      </div>
      <div className="current-chart-values predicted-tsi">
        <div className="chart-values-header">Predicted TSI</div>
        <div className="chart-values-values">
          {latestDataPoint && latestDataPoint !== "end"
            ? latestDataPoint.levels
            : 0}
        </div>
      </div>
      <div className="current-chart-values total-time">
        <div className="chart-values-header">Total Time</div>
        <div className="chart-values-values">{totalPoints}</div>
      </div>
      <div className="current-chart-values green-zone">
        <div className="chart-values-header">Green Zone</div>
        <div className="chart-values-values">{greenZonePercentage}%</div>
      </div>
      <div className="current-chart-values red-zone">
        <div className="chart-values-header">Red Zone</div>
        <div className="chart-values-values">{redZonePercentage}%</div>
      </div>
      <div className="current-chart-values  blue-zone">
        <div className="chart-values-header">Blue Zone</div>
        <div className="chart-values-values">{blueZonePercentage}%</div>
      </div>
      {/* <div className="current-chart-values">
        <div className="chart-values-header">TSI values</div>
        <div className="chart-values-values">
          <div className="chart-values-section current">
            <div className="section-values-header">
              <p> Current:</p>
            </div>
            <div className="current-values-values">
              <p>
                {latestDataPoint && latestDataPoint !== "end"
                  ? latestDataPoint.levels
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
                {latestDataPoint && latestDataPoint !== "end"
                  ? latestDataPoint.levels
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="current-chart-values time">
        <div className="chart-values-values time">
          <div className="chart-values-header">Time</div>
          <div className="chart-values-section time total-time">
            <div className="section-values-header">
              <p> Total:</p>
            </div>
            <div className="current-values-values">
              <p>{totalPoints}</p>
            </div>
          </div>
          <div></div>
          <div className="chart-values-section time green-zone">
            <div className="section-values-header">
              <p>Green Zone:</p>
            </div>
            <div className="current-values-values">
              <p>{greenZonePercentage}%</p>
            </div>
          </div>
          <div className="chart-values-section time red-zone">
            <div className="section-values-header">
              <p>Red Zone :</p>
            </div>
            <div className="current-values-values">
              <p>{redZonePercentage}%</p>
            </div>
          </div>
          <div className="chart-values-section time blue-zone">
            <div className="section-values-header">
              <p>Blue Zone :</p>
            </div>
            <div className="current-values-values">
              <p>{blueZonePercentage}%</p>
            </div>
          </div>
        </div>
      </div> */}
    </>
  );
};

export default ChartDetail;
