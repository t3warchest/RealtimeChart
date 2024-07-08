import React, { useState, useEffect } from "react";

const SessionDetails = ({ dataForAnalytics }) => {
  const [timeInGreenZone, setTimeInGreenZone] = useState(0);
  const [timeInRedZone, setTimeInRedZone] = useState(0);
  const [timeInBlueZone, setTimeInBlueZone] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    let greenZoneTime = 0;
    let redZoneTime = 0;
    let blueZoneTime = 0;
    let points = 0;

    if (dataForAnalytics) {
      dataForAnalytics.forEach((latestDataPoint) => {
        if (latestDataPoint) {
          if (latestDataPoint.levels >= 70) {
            blueZoneTime += 1;
          } else if (
            latestDataPoint.levels < 70 &&
            latestDataPoint.levels >= 30
          ) {
            greenZoneTime += 1;
          } else {
            redZoneTime += 1;
          }
          points += 1;
        }
      });
    }

    setTimeInGreenZone(greenZoneTime);
    setTimeInRedZone(redZoneTime);
    setTimeInBlueZone(blueZoneTime);
    setTotalPoints(points);
  }, [dataForAnalytics]);

  const blueZonePercentage = ((timeInBlueZone / totalPoints) * 100).toFixed(2);
  const greenZonePercentage = ((timeInGreenZone / totalPoints) * 100).toFixed(
    2
  );
  const redZonePercentage = ((timeInRedZone / totalPoints) * 100).toFixed(2);

  return (
    <>
      <div className="records-chart-values">
        <div className="sessions-values-header">Total Time spent</div>
        <div className="sessions-values-values">
          <p>{totalPoints}</p>
        </div>
      </div>
      <div className="records-chart-values">
        <div className="sessions-values-header">Time in Green Zone</div>
        <div className="sessions-values-values">
          <p>{greenZonePercentage}</p>
        </div>
      </div>
      <div className="records-chart-values">
        <div className="sessions-values-header">Time in Blue Zone</div>
        <div className="sessions-values-values">
          <p>{blueZonePercentage}</p>
        </div>
      </div>
      <div className="records-chart-values">
        <div className="sessions-values-header">Time in Red Zone</div>
        <div className="sessions-values-values">
          <p>{redZonePercentage}</p>
        </div>
      </div>
    </>
  );
};

export default SessionDetails;
