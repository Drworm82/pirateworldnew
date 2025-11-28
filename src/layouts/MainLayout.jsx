// ============================
// MainLayout.jsx — HUD + NavBar con ocultación inteligente
// ============================

import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import HudPirata from "../components/HudPirata.jsx";
import NavBar from "../components/NavBar.jsx";

export default function MainLayout() {
  const location = useLocation();

  const isSplash = location.pathname === "/";

  return (
    <>
      {/* HUD — solo si NO estamos en el splash */}
      <AnimatePresence mode="wait">
        {!isSplash && (
          <motion.div
            key="hud-pirata"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              delay: 0.4,
              duration: 0.45,
              ease: [0.25, 0.8, 0.25, 1],
            }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              zIndex: 5000,
            }}
          >
            <HudPirata coins={120} energy={80} shipStatus="idle" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTENIDO (páginas) */}
      <Outlet />

      {/* NAV BAR inferior — igualmente oculto en Splash */}
      <AnimatePresence mode="wait">
        {!isSplash && (
          <motion.div
            key="navbar-pirata"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{
              delay: 0.5,
              duration: 0.40,
              ease: [0.25, 0.8, 0.25, 1],
            }}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              width: "100%",
              zIndex: 4000,
            }}
          >
            <NavBar />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
