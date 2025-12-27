import "./CentralCTA.css";

/* FSM */
import { fsmController } from "../controllers/fsmController";

/* Overlay FSM */
import {
  overlayFSM,
  OVERLAY_TYPES,
} from "../controllers/overlayFSM";

export default function CentralCTA() {
  function isBlocked() {
    return overlayFSM.getState() === OVERLAY_TYPES.EVENT;
  }

  function handleCentralCTA() {
    if (isBlocked()) return;

    if (typeof fsmController.cta === "function") {
      fsmController.cta();
      return;
    }
    if (typeof fsmController.advance === "function") {
      fsmController.advance();
      return;
    }
    if (typeof fsmController.next === "function") {
      fsmController.next();
      return;
    }
    if (typeof fsmController.send === "function") {
      fsmController.send("CTA");
      return;
    }

    console.warn("[CentralCTA] No CTA handler found");
  }

  function handleInventory() {
    if (isBlocked()) return;
    overlayFSM.toggle(OVERLAY_TYPES.INVENTORY);
  }

  function handleMap() {
    if (isBlocked()) return;
    overlayFSM.toggle(OVERLAY_TYPES.MAP_RPG);
  }

  return (
    <>
      {/* Barra inferior */}
      <div className="cta-bar">
        <button
          className="cta-btn secondary"
          onClick={handleInventory}
        >
          Inventario
        </button>

        <button
          className="cta-btn secondary"
          onClick={handleMap}
        >
          Mapa
        </button>
      </div>

      {/* CTA flotante */}
      <div className="cta-fab">
        <button
          className="cta-btn primary cta-main"
          onClick={handleCentralCTA}
        >
          <span className="cta-ring" />
          <span className="cta-label">
            INICIAR AVENTURA
          </span>
        </button>
      </div>
    </>
  );
}
