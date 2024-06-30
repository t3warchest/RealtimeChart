import React from "react";
import "./SideBar.css";
import { NavLink } from "react-router-dom";
import { SideBarPages } from "./SideBarPages";
import Navbar from "./Navbar";

const SideBar = () => {
  return (
    <div className="sidebar">
      <Navbar />
      <ul className="sidebar-nav-options">
        {SideBarPages.map((val, key) => {
          return (
            <li
              key={key}
              //   className={`nav-item ${
              //     window.location.pathname === val.link ? "active" : ""
              //   }`}
            >
              <div>
                <NavLink
                  className="nav-item"
                  to={val.link}
                  style={{ textDecoration: "none", color: "white" }}
                >
                  <div id="li-item-icon">{val.icon}</div>
                  <div className="nav-link">{val.title}</div>
                </NavLink>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SideBar;
