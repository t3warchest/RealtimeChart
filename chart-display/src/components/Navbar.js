import React from "react";
import "./Navbar.css";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="nav_container">
      <nav>
        <NavLink
          to="/"
          style={{ textDecoration: "none" }}
          className="title-text"
        >
          Mihos<span>.</span>
        </NavLink>
      </nav>
    </nav>
  );
};

export default Navbar;
