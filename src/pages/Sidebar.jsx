// src/components/Sidebar.jsx
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div style={{
      width: 200,
      background: "#111",
      height: "100vh",
      padding: 20,
      color: "white",
      position: "fixed",
      left: 0,
      top: 0
    }}>
      <h3>PirateWorld</h3>
      <Link to="/" style={{ color: "white" }}>Home</Link><br />
      <Link to="/explore" style={{ color: "white" }}>Explore</Link><br />
      <Link to="/ship" style={{ color: "white" }}>Ship</Link><br />
      <Link to="/profile" style={{ color: "white" }}>Profile</Link><br />
    </div>
  );
}
