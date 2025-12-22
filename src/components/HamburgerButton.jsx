import React, { useState } from "react";
import HamburgerMenu from "./HamburgerMenu";

export default function HamburgerButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button style={styles.button} onClick={() => setOpen(true)}>
        ☰
      </button>

      <HamburgerMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}

const styles = {
  button: {
    position: "fixed",
    top: "12px",
    left: "12px",
    zIndex: 900,
    background: "#1e1e1e",
    color: "#fff",
    border: "1px solid #444",
    padding: "6px 10px",
    cursor: "pointer",
  },
};
