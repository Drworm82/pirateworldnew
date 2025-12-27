import "./NavBar.css";
import {
  overlayFSM,
  OVERLAY_TYPES,
} from "../controllers/overlayFSM";

export default function NavBar() {
  function isBlocked() {
    return overlayFSM.getState() === OVERLAY_TYPES.EVENT;
  }

  function toggleMenu() {
    if (isBlocked()) return;
    overlayFSM.toggle(OVERLAY_TYPES.MENU);
  }

  function handleWork() {
    if (isBlocked()) return;
    console.log("Trabajar (RO mock)");
  }

  return (
    <div className="navbar">
      {/* Izquierda: hamburguesa */}
      <button
        className="hamburger-btn"
        onClick={toggleMenu}
        aria-label="Menu"
      >
        ☰
      </button>

      {/* Centro: título */}
      <div className="navbar-title">
        PirateWorld
      </div>

      {/* Derecha: trabajar */}
      <button
        className="work-btn"
        onClick={handleWork}
      >
        Trabajar
      </button>
    </div>
  );
}
