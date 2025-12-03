// ======================================================================
// SoundPlayer.js — Sistema de Sonidos ULTRA PRO
// ======================================================================

// Cartera de sonidos por tipo de evento
const SOUND_MAP = {
  storm: "/sounds/storm.mp3",
  pirates: "/sounds/pirates.mp3",
  loot: "/sounds/loot.mp3",
  waves: "/sounds/waves.mp3",
  default: "/sounds/default.mp3",
};

// Volumen global (0.0 a 1.0)
export let GLOBAL_VOLUME = 0.9;

// Cooldown para evitar spam de sonidos (ms)
const SOUND_COOLDOWN = 800;
let lastPlayTime = 0;

// Cache para evitar re-cargar audio muchas veces
const audioCache = new Map();

// ===================================================
// Preload de todos los sonidos
// ===================================================
export function preloadSounds() {
  Object.entries(SOUND_MAP).forEach(([key, src]) => {
    const audio = new Audio(src);
    audio.volume = GLOBAL_VOLUME;
    audioCache.set(key, audio);

    // Precargar silenciosamente
    audio.load();
  });

  console.log("🔊 [SoundPlayer] Sounds preloaded:", [...audioCache.keys()]);
}

// Llamar preload automáticamente
preloadSounds();

// ===================================================
// Función principal
// ===================================================
export function playEventSound(type = "default") {
  const now = Date.now();

  // Anti-spam: evitar que dos sonidos se reproduzcan demasiado seguido
  if (now - lastPlayTime < SOUND_COOLDOWN) {
    return;
  }
  lastPlayTime = now;

  // Elegir sonido
  const key = SOUND_MAP[type] ? type : "default";

  let audio = audioCache.get(key);

  // Si no existe en cache, crearlo
  if (!audio) {
    audio = new Audio(SOUND_MAP[key]);
    audio.volume = GLOBAL_VOLUME;
    audioCache.set(key, audio);
  }

  // Intentar reproducir, y si falla, usar fallback
  audio
    .play()
    .catch((err) => {
      console.warn(`⚠️ sonido falló (${key}), usando default`, err);

      const fallback = audioCache.get("default");
      if (fallback) fallback.play().catch(() => {});
    });
}

// ===================================================
// Cambiar volumen global
// ===================================================
export function setGlobalVolume(v) {
  GLOBAL_VOLUME = Math.min(1, Math.max(0, v));

  // Aplicar a la cache
  audioCache.forEach((audio) => {
    audio.volume = GLOBAL_VOLUME;
  });

  console.log("🔊 Volumen global:", GLOBAL_VOLUME);
}
