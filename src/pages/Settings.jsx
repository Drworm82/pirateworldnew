import React, { useState } from 'react';

export default function Settings() {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState('es');

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      {/* Audio */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Audio</h2>
        
        <label className="flex items-center justify-between">
          <span className="text-gray-700">Activar audio</span>
          <input
            type="checkbox"
            checked={audioEnabled}
            onChange={(e) => setAudioEnabled(e.target.checked)}
            className="w-5 h-5"
          />
        </label>
      </div>

      {/* Notificaciones */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Notificaciones</h2>
        
        <label className="flex items-center justify-between">
          <span className="text-gray-700">Activar notificaciones</span>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
            className="w-5 h-5"
          />
        </label>
      </div>

      {/* Idioma */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Idioma</h2>
        
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="es">Español</option>
          <option value="en">English</option>
          <option value="pt">Português</option>
          <option value="fr">Français</option>
        </select>
      </div>

      {/* Logout */}
      <button className="w-full bg-red-600 text-white py-3 rounded font-semibold hover:bg-red-700">
        Logout
      </button>
    </div>
  );
}