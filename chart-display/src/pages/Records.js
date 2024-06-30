import React, { useEffect, useState } from "react";
import SessionButton from "./RecordsTabComponents/SessionButton";
import SessionContent from "./RecordsTabComponents/SessionContent";
import "../pagescss/Records.css";

const Records = () => {
  const sessions = [
    { id: 1, label: "Session 1" },
    { id: 2, label: "Session 2" },
    { id: 3, label: "Session 3" },
    { id: 4, label: "Compare" },
  ];
  const [activeTab, setActiveTab] = useState(1);

  return (
    <div className="session-container">
      <SessionButton
        sessions={sessions}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <SessionContent sessions={sessions} activeTab={activeTab} />
    </div>
  );
};

export default Records;
