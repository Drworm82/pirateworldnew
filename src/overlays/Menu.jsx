import "./Menu.css";
import {
  overlayFSM,
  OVERLAY_TYPES,
} from "../controllers/overlayFSM";

export default function Menu() {
  function closeMenu() {
    overlayFSM.close();
  }

  function openProfile() {
    overlayFSM.open(OVERLAY_TYPES.PROFILE);
  }

  function noop(label) {
    console.log(`Menu item clicked (RO): ${label}`);
    closeMenu();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="menu-backdrop"
        onClick={closeMenu}
      />

      {/* Drawer */}
      <div className="menu-drawer">
        <div className="menu-header">
          Menú
        </div>

        <div className="menu-item" onClick={() => noop("Tripulación")}>
          Tripulación
        </div>

        <div className="menu-item" onClick={() => noop("Banco Mundial")}>
          Banco Mundial
        </div>

        <div className="menu-item" onClick={() => noop("Misiones")}>
          Misiones
        </div>

        <div className="menu-item" onClick={() => noop("Territorio")}>
          Territorio
        </div>

        <div className="menu-item" onClick={() => noop("Chat Local")}>
          Chat Local
        </div>

        <div className="menu-item" onClick={() => noop("Telégrafo")}>
          Telégrafo
        </div>

        <div className="menu-item" onClick={openProfile}>
          Perfil
        </div>

        <div className="menu-divider" />

        <div className="menu-item logout" onClick={() => noop("Logout")}>
          Logout
        </div>
      </div>
    </>
  );
}
