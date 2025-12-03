// src/lib/geo.js

// interpolación lineal
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

// interpolación de posiciones geográficas
export function interpolateLatLng(lat1, lng1, lat2, lng2, t) {
  return {
    lat: lerp(lat1, lat2, t),
    lng: lerp(lng1, lng2, t),
  };
}
