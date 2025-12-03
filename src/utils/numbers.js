// utils/numbers.js

export function round2(x) {
  return Math.round(x * 100) / 100;
}

export function clamp(num, min, max) {
  return Math.max(min, Math.min(num, max));
}
