import React, { useEffect, useState, useContext } from "react";

import "../pagescss/Records.css";

import { AuthContext } from "../context/auth-context";
import SessionButton from "./RecordsTabComponents/SessionButton";
import SessionContent from "./RecordsTabComponents/SessionContent";
import Modal from "../util/Modal";

const Records = () => {
  const auth = useContext(AuthContext);

  const sessions = [
    { id: 1, label: "Session 1" },
    { id: 2, label: "Session 2" },
    { id: 3, label: "Session 3" },
    { id: 4, label: "Compare" },
  ];

  const [activeTab, setActiveTab] = useState(1);

  return (
    <div className="session-page">
      <Modal show={auth.isLoggedIn} header={"Stop!"}>
        Please Log in to view past Sessions
      </Modal>
      <div className="session-container">
        <SessionButton
          sessions={sessions}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <SessionContent sessions={sessions} activeTab={activeTab} />
      </div>
    </div>
  );
};

export default Records;
