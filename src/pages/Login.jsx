// ============================
// Login.jsx — PirateWorld
// ============================

import React, { useState } from "react";
import { supabase } from "../lib/supaApi.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Credenciales incorrectas");
      console.error(error);
      setLoading(false);
      return;
    }

    toast.success("Bienvenido capitán ⚓");
    navigate("/explore");
  }

  return (
    <div className="page-container" style={{ padding: 30 }}>
      <h1 className="big">Iniciar Sesión</h1>

      <form onSubmit={handleLogin} style={{ marginTop: 20 }}>
        <label>Email</label>
        <input
          type="email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label style={{ marginTop: 20 }}>Contraseña</label>
        <input
          type="password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="btn btn-primary"
          style={{ marginTop: 25 }}
          disabled={loading}
        >
          {loading ? "Ingresando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
