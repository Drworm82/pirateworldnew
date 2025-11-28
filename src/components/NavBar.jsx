// src/components/NavBar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import "./navbar.css";

const LINKS = [
  { label: "Inicio", route: "/", icon: "🏠" },
  { label: "Explorar", route: "/explore", icon: "🧭" },
  { label: "Inventario", route: "/inventory", icon: "🎒" },
  { label: "Islas", route: "/islands", icon: "🏝️" },
  { label: "Misiones", route: "/missions", icon: "📜" },
];

export default function NavBar() {
  return (
    <nav className="bottom-nav">
      {LINKS.map((link) => (
        <NavLink
          key={link.route}
          to={link.route}
          className={({ isActive }) =>
            isActive ? "nav-btn active" : "nav-btn"
          }
        >
          <span className="nav-icon">{link.icon}</span>
          <span className="nav-text">{link.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
