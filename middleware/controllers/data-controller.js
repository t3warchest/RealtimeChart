const express = require("express");

const { client } = require("../connections/redis-connections");
// const redisClient = require('../connections/redis-connections')
// const client = redisClient.client

const getSessionData = async (req, res, next) => {
  console.log("inside server");
  const reqstdSession = req.query.session;
  const patientId = "p001"; //req.query.patientId
  const sessionSetsKey = `patients:${patientId}:sessions`;
  const sessionsList = await client.zRange(sessionSetsKey, 0, -1);
  console.log(reqstdSession);

  function findXaxis(dataobj) {
    let maxlength = 0;

    for (const key in dataobj) {
      if (dataobj.hasOwnProperty(key)) {
        const currentLength = dataobj[key].length;
        if (currentLength > maxlength) {
          maxlength = currentLength;
        }
      }
    }
    const maxTimeArray = Array(maxlength)
      .fill()
      .map((_, index) => index + 1);

    return { maxTimeArray, maxlength };
  }
  function createLevelsArray(data) {
    const { maxTimeArray, maxlength } = findXaxis(data);
    const levelsArray = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const levels = data[key].map((item) => item.value);
        while (levels.length !== maxlength) {
          levels.push(null);
        }
        levelsArray[key] = levels;
      }
    }
    return levelsArray;
  }

  if (reqstdSession === "all") {
    const allData = {};
    console.log("sessionlist length", sessionsList.length);
    // if (sessionsList.length !== 3) {
    //   res.status(300).json(allData);
    //   return;
    // }
    for (let sessionIndex in sessionsList) {
      const sessionKey = `patients:${patientId}:${sessionsList[sessionIndex]}`;
      console.log(sessionKey);
      const sessionData = await client.ts.range(sessionKey, "-", "+");

      allData[sessionIndex] = sessionData;
    }
    console.log("allData");
    const { maxTimeArray, maxlength } = findXaxis(allData);
    console.log("maxTimeArray");
    const levelsArray = createLevelsArray(allData);
    const responsePackage = {
      xaxisPoints: maxTimeArray,
      levelsArray: levelsArray,
    };
    res.status(201).json(responsePackage);
  } else {
    const sessionNumber = parseInt(reqstdSession, 10);
    console.log(sessionNumber);
    const reqstdSessionId = sessionsList[sessionsList.length - sessionNumber];
    console.log(reqstdSessionId);
    const sessionKey = `patients:${patientId}:${reqstdSessionId}`;
    let sessionData, levels, timestamps;
    try {
      sessionData = await client.ts.range(sessionKey, "-", "+");
      levels = sessionData.map((point) => point.value);
      timestamps = sessionData.map((point) => point.timestamp);
    } catch (err) {
      console.log(err);
      res.status(404).json([]);
    }
    const responseObj = {
      levels: levels,
      timestamps: timestamps,
    };
    console.log(responseObj);
    res.status(201).json(responseObj);
  }
};

exports.getSessionData = getSessionData;
