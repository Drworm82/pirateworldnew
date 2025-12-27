import "./NavBar.css";
import { supabase } from "../lib/supabaseClient";
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

  async function handleLogin() {
    const email = prompt("Ingresa tu email para iniciar sesión:");
    if (!email) return;

    const { error } = await supabase.auth.signInWithOtp({
      email,
    });

    if (error) {
      alert("Error enviando magic link");
      console.error(error);
    } else {
      alert("Revisa tu correo para iniciar sesión");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  return (
    <div className="navbar">
      {/* Izquierda */}
      <button
        className="hamburger-btn"
        onClick={toggleMenu}
        aria-label="Menu"
      >
        ☰
      </button>

      {/* Centro */}
      <div className="navbar-title">PirateWorld</div>

      {/* Derecha */}
      <div className="navbar-actions">
        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
