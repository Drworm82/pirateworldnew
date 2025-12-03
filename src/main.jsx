// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// ===========================
// EXPOSE SUPABASE FOR DEBUG
// ===========================
import { supabase } from "./lib/supaClient.js";
window.supabase = supabase;
// ===========================

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
