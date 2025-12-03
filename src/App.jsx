// src/App.jsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import AppRouter from "./router.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ padding: 20 }}>
        <AppRouter />
      </div>
    </BrowserRouter>
  );
}
