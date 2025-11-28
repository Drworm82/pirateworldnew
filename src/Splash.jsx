// ============================
// Splash.jsx — PirateWorld
// ============================

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/explore");
    }, 1800); // 1.8s total antes de entrar al juego

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 1.5,
        ease: [0.25, 0.8, 0.25, 1],
      }}
      style={{
        width: "100vw",
        height: "100vh",
        background: "black",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        fontSize: 32,
        fontFamily: "Cinzel, serif",
      }}
    >
      PirateWorld
    </motion.div>
  );
}
