// src/components/Navbar.jsx
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        gap: 20,
        padding: 12,
        background: "#0b0b0b",
        borderBottom: "1px solid #333",
        color: "white",
      }}
    >
      <Link to="/">Home</Link>
      <Link to="/explore">Explore</Link>
      <Link to="/ship">Ship</Link>
      <Link to="/missions">Missions</Link>
      <Link to="/inventory">Inventory</Link>
      <Link to="/store">Store</Link>
      <Link to="/crew">Crew</Link>
      <Link to="/map">Map</Link>
      <Link to="/leaderboard">Leaderboard</Link>
      <Link to="/profile">Profile</Link>
    </nav>
  );
}
