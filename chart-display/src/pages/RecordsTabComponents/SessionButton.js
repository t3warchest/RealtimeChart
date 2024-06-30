import React from "react";

export default function SessionButton({ sessions, activeTab, setActiveTab }) {
  // console.log(sessions);
  return (
    <div className="tabs_container">
      {sessions.map((item, index) => (
        <li
          className={`tab_button ${activeTab === item.id ? "active" : ""}`}
          key={item.id}
          onClick={() => setActiveTab(item.id)}
        >
          {item.label}
        </li>
      ))}
    </div>
  );
}
