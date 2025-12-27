import { supabase } from "../lib/supabaseClient";

export default function LoginDev() {
  async function login() {
    const email = prompt("Email para login DEV:");
    if (!email) return;

    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      alert(error.message);
    } else {
      alert("Revisa tu email (magic link)");
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    alert("Sesión cerrada");
  }

  return (
    <div style={{
      position: "fixed",
      top: 12,
      right: 12,
      zIndex: 9999,
      background: "#111",
      padding: "8px 12px",
      borderRadius: 8,
      color: "#fff"
    }}>
      <button onClick={login}>Login DEV</button>
      <button onClick={logout} style={{ marginLeft: 8 }}>
        Logout
      </button>
    </div>
  );
}
