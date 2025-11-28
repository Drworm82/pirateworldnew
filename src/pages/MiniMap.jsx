function MiniMap({ lat, lng, heading }) {
  if (!lat || !lng) return null;

  const { x, y } = latLngToPixel(lat, lng);
  const size = WORLD.mapSize;

  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 2000 }}>
      <div style={{ position: "relative", width: 220, height: 220 }}>
        
        {/* Marco */}
        <img
          src="/ui/minimap-frame.svg"
          style={{
            position: "absolute",
            width: 220,
            height: 220,
            zIndex: 5,
            pointerEvents: "none",
          }}
        />

        {/* Clip circular */}
        <div
          style={{
            position: "absolute",
            width: 180,
            height: 180,
            top: 20,
            left: 20,
            borderRadius: "50%",
            overflow: "hidden",
          }}
        >
          <img
            src="/maps/world-real-2048.png"
            style={{
              position: "absolute",
              width: size,
              height: size,
              left: -x + 90,
              top: -y + 90,
              filter: "sepia(0.4) brightness(0.9)",
            }}
          />
        </div>

        {/* Barco */}
        <img
          src="/icons/ship-vintage.svg"
          style={{
            position: "absolute",
            top: 85,
            left: 85,
            width: 50,
            height: 50,
            zIndex: 6,
            transform: `rotate(${heading || 0}deg)`,
          }}
        />
      </div>
    </div>
  );
}
