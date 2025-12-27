// true = usa mocks | false = usa backend
const USE_MOCKS = false;

/* MOCKS */
import { mockGetPlayerSummary } from "./mock/player.mock";

/* API */
import { apiGetPlayerSummary } from "./api/player.api";

/**
 * Player Summary
 * - Si backend falla → fallback a mock
 * - No lanza excepciones
 */
export async function getPlayerSummary() {
  if (USE_MOCKS) {
    return mockGetPlayerSummary();
  }

  const real = await apiGetPlayerSummary();
  if (real) return real;

  console.warn("Falling back to mockGetPlayerSummary()");
  return mockGetPlayerSummary();
}
