// src/components/NavBar.jsx
import React from "react";

const LINKS = [
  { label: "Usuario DEMO 🚀", href: "#/", route: "/" },
  { label: "Ledger", href: "#/ledger", route: "/ledger" },
  { label: "Tienda", href: "#/store", route: "/store" },
  { label: "Inventario", href: "#/inventory", route: "/inventory" },
  { label: "Tiles", href: "#/tiles", route: "/tiles" },
  { label: "Mapa", href: "#/map", route: "/map" },
  { label: "Misiones", href: "#/missions", route: "/missions" },
  { label: "Perfil (X)", href: "#/profile", route: "/profile" },

  { label: "Explorar 🌊", href: "#/explore", route: "/explore" },

  { label: "Tripulación ⚓", href: "#/crew", route: "/crew" },

  { label: "Leaderboard", href: "#/leaderboard", route: "/leaderboard" },
];

export default function NavBar({ currentRoute }) {
  return (
    <nav className="nav">
      {LINKS.map((link) => {
        const isActive =
          currentRoute === link.route ||
          (link.route === "/" &&
            (currentRoute === "/" ||
              currentRoute === "" ||
              currentRoute === "/demo"));

        return (
          <a
            key={link.href}
            href={link.href}
            className={isActive ? "active" : ""}
          >
            {link.label}
          </a>
        );
      })}
    </nav>
  );
}
