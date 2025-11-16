// src/components/ConfettiOverlay.jsx
import { forwardRef, useImperativeHandle, useRef } from "react";
import confetti from "canvas-confetti";

/**
 * Overlay de confetti reutilizable.
 * Uso:
 *   const ref = useRef(null);
 *   <ConfettiOverlay ref={ref} />
 *   ref.current?.fire("mission"); // o "buy"
 */
const ConfettiOverlay = forwardRef(function ConfettiOverlay(_props, ref) {
  const canvasRef = useRef(null);

  useImperativeHandle(ref, () => ({
    fire(kind = "default") {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const myConfetti = confetti.create(canvas, {
        resize: true,
        useWorker: false,
      });

      let particleCount = 80;
      let spread = 70;
      let startVelocity = 45;

      if (kind === "buy") {
        particleCount = 120;
        spread = 80;
        startVelocity = 55;
      } else if (kind === "mission") {
        particleCount = 100;
        spread = 90;
        startVelocity = 50;
      }

      myConfetti({
        particleCount,
        spread,
        startVelocity,
        origin: { y: 0.6 },
      });
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 80,
        width: "100%",
        height: "100%",
      }}
    />
  );
});

export default ConfettiOverlay;
