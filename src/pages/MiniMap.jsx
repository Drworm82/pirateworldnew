function MiniMap({ x, y, heading }) {
  const size = WORLD.mapSize;

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 2000,
      }}
    >
      <div style={{ position: "relative", width: 160, height: 160 }}>
        <img
          src="/ui/minimap-frame.svg"
          style={{
            position: "absolute",
            width: 160,
            height: 160,
            zIndex: 5,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 130,
            height: 130,
            top: 15,
            left: 15,
            borderRadius: "50%",
            overflow: "hidden",
          }}
        >
          <img
            src="/maps/world-base-2048.png"
            style={{
              position: "absolute",
              width: size,
              height: size,
              left: -x + 65,
              top: -y + 65,
              filter: "sepia(0.4) brightness(0.9)",
            }}
          />
        </div>

        <img
          src="/icons/ship-vintage.svg"
          style={{
            position: "absolute",
            top: 55,
            left: 55,
            width: 50,
            height: 50,
            zIndex: 6,
            transform: `rotate(${heading}deg)`,
            transition: "transform 0.15s linear",
          }}
        />
      </div>
    </div>
  );
}
