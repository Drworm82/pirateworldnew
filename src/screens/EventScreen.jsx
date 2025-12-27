// src/screens/EventScreen.jsx
import React from 'react';

export default function EventScreen() {
  // Event logic would go here (fetching RPC, etc.)
  return (
    <div className="screen event-screen" style={{ border: '2px solid red' }}>
      <h1 style={{ color: 'red' }}>¡EVENTO!</h1>
      <p>¡Algo ha ocurrido en alta mar!</p>
      <div className="placeholder-art">[ART: Kraken / Storm / Battle]</div>
    </div>
  );
}
