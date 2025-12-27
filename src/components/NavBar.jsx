import "./NavBar.css";
import { supabase } from "../lib/supabaseClient";
import { overlayFSM, OVERLAY_TYPES } from "../controllers/overlayFSM";
import { useEffect, useState } from "react";

export default function NavBar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  function isBlocked() {
    return overlayFSM.getState() === OVERLAY_TYPES.EVENT;
  }

  function toggleMenu() {
    if (isBlocked()) return;
    overlayFSM.toggle(OVERLAY_TYPES.MENU);
  }

  async function handleLogin() {
    await supabase.auth.signInWithOtp({
      email: prompt("Email para login"),
    });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  function handleWork() {
    if (isBlocked()) return;
    console.log("Trabajar (RO mock)");
  }

  return (
    <div className="navbar">
      {/* Izquierda */}
      <button className="hamburger-btn" onClick={toggleMenu}>
        ☰
      </button>

      {/* Centro */}
      <div className="navbar-title">PirateWorld</div>

      {/* Derecha */}
      {user ? (
        <>
          <button className="work-btn" onClick={handleWork}>
            Trabajar
          </button>
          <button className="auth-btn" onClick={handleLogout}>
            Logout
          </button>
        </>
      ) : (
        <button className="auth-btn" onClick={handleLogin}>
          Login
        </button>
      )}
    </div>
  );
}
