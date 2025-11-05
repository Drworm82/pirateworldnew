export default function UpdateToast({ onReload }) {
  return (
    <div className="toast" role="status" aria-live="polite">
      <span>Hay una nueva versión</span>
      <button className="action" onClick={onReload}>
        Actualizar
      </button>
    </div>
  );
}
