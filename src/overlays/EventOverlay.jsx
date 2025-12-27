import "./EventOverlay.css";
import {
  overlayFSM,
  OVERLAY_TYPES,
} from "../controllers/overlayFSM";

export default function EventOverlay() {
  function closeEvent() {
    overlayFSM.open(OVERLAY_TYPES.NONE);
  }

  return (
    <div className="event-overlay">
      <div className="event-card">
        <h2>Evento</h2>
        <p>Algo importante está ocurriendo…</p>

        <button onClick={closeEvent}>
          Continuar
        </button>
      </div>
    </div>
  );
}
